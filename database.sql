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

-- Insert default admin user (username: ragilmalik, password: 21Desember1994)
INSERT INTO admin_users (username, password_hash) VALUES
('ragilmalik', '$2y$12$wxHIcbIXD06TlX5nyZKmZ.tnjJ0ld6tbZVD7pdAxBZKXKF2R2XMM.')
ON DUPLICATE KEY UPDATE username = username;

-- Online users tracking table
CREATE TABLE IF NOT EXISTS online_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    page_url VARCHAR(255) DEFAULT '/',
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_last_activity (last_activity),
    INDEX idx_ip_hash (ip_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
