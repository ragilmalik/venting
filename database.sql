-- Venting Platform Database Schema
-- Anonymous platform with admin management

CREATE DATABASE IF NOT EXISTS venting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE venting_db;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT NOT NULL,
    user_agent_hash VARCHAR(64) NOT NULL,
    posted_at DATETIME NOT NULL,
    posted_at_utc7 DATETIME NOT NULL,
    browser_timezone VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC),
    INDEX idx_posted_at (posted_at DESC),
    INDEX idx_ip_address (ip_address),
    FULLTEXT INDEX idx_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2y$10$Eh7OuF8eqLtFKh6r6P5vGexQNr7oWGPNqp8E7zqI5.kQNMz8ZxH3W')
ON DUPLICATE KEY UPDATE username = username;
