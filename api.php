<?php
/**
 * API Endpoint for Venting Platform
 * Handles POST creation and retrieval
 */

require_once 'config.php';

/**
 * Hash IP address for privacy
 */
function hashIP($ip) {
    return hash('sha256', $ip . 'venting_salt_2024');
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

/**
 * Create a new post
 */
function createPost($data) {
    try {
        // Validate input
        if (!isset($data['content']) || empty(trim($data['content']))) {
            return ['success' => false, 'error' => 'Content cannot be empty'];
        }

        $content = trim($data['content']);

        if (mb_strlen($content) > MAX_POST_LENGTH) {
            return ['success' => false, 'error' => 'Content exceeds maximum length of ' . MAX_POST_LENGTH . ' characters'];
        }

        // Get client info
        $ip = getClientIP();
        $ipHash = hashIP($ip);
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $userAgentHash = hash('sha256', $userAgent);

        // Get posted_at timestamp from client
        $postedAt = $data['posted_at'] ?? date('Y-m-d H:i:s');
        $timezone = $data['timezone'] ?? null;

        // Calculate UTC+7 time
        $postedAtUtc7 = date('Y-m-d H:i:s', strtotime($postedAt) + (7 * 3600));

        // Insert into database
        $db = getDBConnection();
        $stmt = $db->prepare("
            INSERT INTO posts (content, ip_address, ip_hash, user_agent, user_agent_hash, posted_at, posted_at_utc7, browser_timezone)
            VALUES (:content, :ip_address, :ip_hash, :user_agent, :user_agent_hash, :posted_at, :posted_at_utc7, :timezone)
        ");

        $stmt->execute([
            ':content' => $content,
            ':ip_address' => $ip,
            ':ip_hash' => $ipHash,
            ':user_agent' => $userAgent,
            ':user_agent_hash' => $userAgentHash,
            ':posted_at' => $postedAt,
            ':posted_at_utc7' => $postedAtUtc7,
            ':timezone' => $timezone
        ]);

        return [
            'success' => true,
            'message' => 'Post created successfully',
            'post_id' => $db->lastInsertId()
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to create post'];
    }
}

/**
 * Get posts with pagination
 */
function getPosts($page = 1) {
    try {
        $page = max(1, intval($page));
        $offset = ($page - 1) * POSTS_PER_PAGE;

        $db = getDBConnection();

        // Get total count
        $countStmt = $db->query("SELECT COUNT(*) as total FROM posts");
        $totalPosts = $countStmt->fetch()['total'];
        $totalPages = ceil($totalPosts / POSTS_PER_PAGE);

        // Get posts
        $stmt = $db->prepare("
            SELECT id, content, posted_at, browser_timezone, created_at
            FROM posts
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        ");

        $stmt->bindValue(':limit', POSTS_PER_PAGE, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $posts = $stmt->fetchAll();

        return [
            'success' => true,
            'posts' => $posts,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_posts' => $totalPosts,
                'posts_per_page' => POSTS_PER_PAGE
            ]
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to retrieve posts'];
    }
}

/**
 * Get latest posts since a given timestamp (for auto-refresh)
 */
function getLatestPosts($since) {
    try {
        $db = getDBConnection();

        $stmt = $db->prepare("
            SELECT id, content, posted_at, browser_timezone, created_at
            FROM posts
            WHERE created_at > :since
            ORDER BY created_at DESC
        ");

        $stmt->execute([':since' => $since]);
        $posts = $stmt->fetchAll();

        return [
            'success' => true,
            'posts' => $posts,
            'count' => count($posts)
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to retrieve latest posts'];
    }
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'create':
            echo json_encode(createPost($data));
            break;
        case 'latest':
            $since = $data['since'] ?? date('Y-m-d H:i:s', strtotime('-1 day'));
            echo json_encode(getLatestPosts($since));
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} elseif ($method === 'GET') {
    $page = $_GET['page'] ?? 1;
    echo json_encode(getPosts($page));
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
