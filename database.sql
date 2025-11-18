-- Venting Platform Database Schema
-- Anonymous Twitter-like platform

CREATE DATABASE IF NOT EXISTS venting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE venting_db;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent_hash VARCHAR(64) NOT NULL,
    posted_at DATETIME NOT NULL,
    browser_timezone VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC),
    INDEX idx_posted_at (posted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
