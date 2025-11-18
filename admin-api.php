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

/**
 * Get online users count
 */
function getOnlineUsers() {
    try {
        $db = getDBConnection();

        // Clean up inactive users first
        $db->exec("DELETE FROM online_users WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");

        // Count active users
        $stmt = $db->query("SELECT COUNT(DISTINCT ip_address) as count FROM online_users");
        $result = $stmt->fetch();

        return [
            'success' => true,
            'count' => $result['count']
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to get online users'];
    }
}

/**
 * Export posts to XLSX
 */
function exportPostsToXLSX($postIds = []) {
    try {
        $db = getDBConnection();

        // Build query
        if (empty($postIds)) {
            // Export all posts
            $stmt = $db->query("
                SELECT id, content, ip_address, user_agent, posted_at_utc7, created_at
                FROM posts
                ORDER BY created_at DESC
            ");
        } else {
            // Export selected posts
            $placeholders = implode(',', array_fill(0, count($postIds), '?'));
            $stmt = $db->prepare("
                SELECT id, content, ip_address, user_agent, posted_at_utc7, created_at
                FROM posts
                WHERE id IN ($placeholders)
                ORDER BY created_at DESC
            ");
            $stmt->execute($postIds);
        }

        $posts = $stmt->fetchAll();

        if (empty($posts)) {
            return ['success' => false, 'error' => 'No posts to export'];
        }

        // Generate filename
        $filename = 'venting_posts_export_' . date('Y-m-d_His') . '.xlsx';
        $filepath = sys_get_temp_dir() . '/' . $filename;

        // Create XLSX file using simple XML-based format
        createXLSX($filepath, $posts);

        return [
            'success' => true,
            'filename' => $filename,
            'filepath' => $filepath,
            'count' => count($posts)
        ];
    } catch (Exception $e) {
        if (DEBUG_MODE) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
        return ['success' => false, 'error' => 'Failed to export posts'];
    }
}

/**
 * Create XLSX file from posts data
 */
function createXLSX($filepath, $posts) {
    // Create a simple XLSX file using XML format
    $zip = new ZipArchive();

    if ($zip->open($filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new Exception('Cannot create XLSX file');
    }

    // [Content_Types].xml
    $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>';
    $zip->addFromString('[Content_Types].xml', $contentTypes);

    // _rels/.rels
    $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>';
    $zip->addFromString('_rels/.rels', $rels);

    // xl/_rels/workbook.xml.rels
    $workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>';
    $zip->addFromString('xl/_rels/workbook.xml.rels', $workbookRels);

    // xl/workbook.xml
    $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheets>
        <sheet name="Posts" sheetId="1" r:id="rId1"/>
    </sheets>
</workbook>';
    $zip->addFromString('xl/workbook.xml', $workbook);

    // xl/styles.xml
    $styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
    <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
    <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
    <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellXfs>
</styleSheet>';
    $zip->addFromString('xl/styles.xml', $styles);

    // xl/worksheets/sheet1.xml - Build the sheet data
    $sheetData = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheetData>';

    // Header row
    $sheetData .= '<row r="1">
        <c t="inlineStr" r="A1"><is><t>ID</t></is></c>
        <c t="inlineStr" r="B1"><is><t>Content</t></is></c>
        <c t="inlineStr" r="C1"><is><t>IP Address</t></is></c>
        <c t="inlineStr" r="D1"><is><t>User Agent</t></is></c>
        <c t="inlineStr" r="E1"><is><t>Posted At (UTC+7)</t></is></c>
        <c t="inlineStr" r="F1"><is><t>Created At</t></is></c>
    </row>';

    // Data rows
    $rowNum = 2;
    foreach ($posts as $post) {
        $sheetData .= '<row r="' . $rowNum . '">';
        $sheetData .= '<c t="inlineStr" r="A' . $rowNum . '"><is><t>' . xmlEscape($post['id']) . '</t></is></c>';
        $sheetData .= '<c t="inlineStr" r="B' . $rowNum . '"><is><t>' . xmlEscape($post['content']) . '</t></is></c>';
        $sheetData .= '<c t="inlineStr" r="C' . $rowNum . '"><is><t>' . xmlEscape($post['ip_address']) . '</t></is></c>';
        $sheetData .= '<c t="inlineStr" r="D' . $rowNum . '"><is><t>' . xmlEscape($post['user_agent']) . '</t></is></c>';
        $sheetData .= '<c t="inlineStr" r="E' . $rowNum . '"><is><t>' . xmlEscape($post['posted_at_utc7']) . '</t></is></c>';
        $sheetData .= '<c t="inlineStr" r="F' . $rowNum . '"><is><t>' . xmlEscape($post['created_at']) . '</t></is></c>';
        $sheetData .= '</row>';
        $rowNum++;
    }

    $sheetData .= '</sheetData></worksheet>';
    $zip->addFromString('xl/worksheets/sheet1.xml', $sheetData);

    $zip->close();
}

/**
 * XML escape helper
 */
function xmlEscape($text) {
    return htmlspecialchars($text, ENT_XML1 | ENT_QUOTES, 'UTF-8');
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

    case 'get_online_users':
        echo json_encode(getOnlineUsers());
        break;

    case 'export_xlsx':
        $postIds = $data['post_ids'] ?? [];
        $result = exportPostsToXLSX($postIds);

        if ($result['success']) {
            // Send file for download
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="' . $result['filename'] . '"');
            header('Content-Length: ' . filesize($result['filepath']));
            readfile($result['filepath']);
            unlink($result['filepath']); // Delete temp file
            exit;
        } else {
            echo json_encode($result);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
