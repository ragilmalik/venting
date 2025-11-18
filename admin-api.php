<?php
/**
 * Admin API for Venting Platform
 * Handles authentication and admin operations
 */

session_start();
require_once 'config.php';

/**
 * Get client IP
 */
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
        return false;
    }

    // Check session token
    if (!isset($_SESSION['admin_token'])) {
        return false;
    }

    try {
        $db = getDBConnection();
        $stmt = $db->prepare("
            SELECT id FROM admin_sessions
            WHERE session_token = :token
            AND expires_at > NOW()
        ");
        $stmt->execute([':token' => $_SESSION['admin_token']]);

        return $stmt->fetch() !== false;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Handle login
 */
function handleLogin($data) {
    if (!isset($data['username']) || !isset($data['password'])) {
        return ['success' => false, 'error' => 'Username and password required'];
    }

    try {
        $db = getDBConnection();
        $stmt = $db->prepare("SELECT id, password_hash FROM admin_users WHERE username = :username");
        $stmt->execute([':username' => $data['username']]);

        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            return ['success' => false, 'error' => 'Invalid credentials'];
        }

        // Create session
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $stmt = $db->prepare("
            INSERT INTO admin_sessions (admin_id, session_token, ip_address, user_agent, expires_at)
            VALUES (:admin_id, :token, :ip, :ua, :expires)
        ");

        $stmt->execute([
            ':admin_id' => $user['id'],
            ':token' => $sessionToken,
            ':ip' => getClientIP(),
            ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            ':expires' => $expiresAt
        ]);

        // Update last login
        $stmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
        $stmt->execute([':id' => $user['id']]);

        // Set session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_token'] = $sessionToken;

        return ['success' => true];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Login failed'];
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (isset($_SESSION['admin_token'])) {
        try {
            $db = getDBConnection();
            $stmt = $db->prepare("DELETE FROM admin_sessions WHERE session_token = :token");
            $stmt->execute([':token' => $_SESSION['admin_token']]);
        } catch (Exception $e) {
            // Ignore errors
        }
    }

    session_destroy();
    return ['success' => true];
}

/**
 * Get statistics
 */
function getStats() {
    try {
        $db = getDBConnection();

        // Total posts
        $stmt = $db->query("SELECT COUNT(*) as total FROM posts");
        $totalPosts = $stmt->fetch()['total'];

        // Today's posts
        $stmt = $db->query("SELECT COUNT(*) as today FROM posts WHERE DATE(created_at) = CURDATE()");
        $todayPosts = $stmt->fetch()['today'];

        // Unique IPs
        $stmt = $db->query("SELECT COUNT(DISTINCT ip_address) as unique_ips FROM posts");
        $uniqueIPs = $stmt->fetch()['unique_ips'];

        // Last 24 hours
        $stmt = $db->query("SELECT COUNT(*) as last_24h FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $last24h = $stmt->fetch()['last_24h'];

        return [
            'success' => true,
            'stats' => [
                'total_posts' => $totalPosts,
                'today_posts' => $todayPosts,
                'unique_ips' => $uniqueIPs,
                'last_24h' => $last24h
            ]
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to get stats'];
    }
}

/**
 * Get all posts with admin data
 */
function getAllPosts($search = '') {
    try {
        $db = getDBConnection();

        $sql = "
            SELECT id, content, ip_address, user_agent, posted_at_utc7, created_at
            FROM posts
        ";

        if (!empty($search)) {
            $sql .= " WHERE
                content LIKE :search OR
                ip_address LIKE :search OR
                user_agent LIKE :search
            ";
        }

        $sql .= " ORDER BY created_at DESC LIMIT 1000";

        $stmt = $db->prepare($sql);

        if (!empty($search)) {
            $searchParam = '%' . $search . '%';
            $stmt->bindValue(':search', $searchParam);
        }

        $stmt->execute();
        $posts = $stmt->fetchAll();

        return [
            'success' => true,
            'posts' => $posts
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to get posts'];
    }
}

/**
 * Delete single post
 */
function deletePost($postId) {
    try {
        $db = getDBConnection();
        $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
        $stmt->execute([':id' => $postId]);

        return ['success' => true];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to delete post'];
    }
}

/**
 * Delete multiple posts
 */
function deleteMultiplePosts($postIds) {
    try {
        $db = getDBConnection();

        $placeholders = implode(',', array_fill(0, count($postIds), '?'));
        $stmt = $db->prepare("DELETE FROM posts WHERE id IN ($placeholders)");
        $stmt->execute($postIds);

        return ['success' => true];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to delete posts'];
    }
}

// Handle request
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

// Public actions
if ($action === 'login') {
    echo json_encode(handleLogin($data));
    exit;
}

if ($action === 'logout') {
    echo json_encode(handleLogout());
    exit;
}

if ($action === 'check_session') {
    echo json_encode([
        'success' => true,
        'logged_in' => isLoggedIn()
    ]);
    exit;
}

// Protected actions - require login
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

switch ($action) {
    case 'get_stats':
        echo json_encode(getStats());
        break;

    case 'get_all_posts':
        $search = $data['search'] ?? '';
        echo json_encode(getAllPosts($search));
        break;

    case 'delete_post':
        $postId = $data['post_id'] ?? 0;
        echo json_encode(deletePost($postId));
        break;

    case 'delete_multiple':
        $postIds = $data['post_ids'] ?? [];
        echo json_encode(deleteMultiplePosts($postIds));
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
