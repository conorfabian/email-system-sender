-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS email_confirmation;

-- Use the database
USE email_confirmation;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP NULL,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- Display table structure
DESCRIBE users;