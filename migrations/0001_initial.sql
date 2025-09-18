-- Migration: Initial user table creation for Cloudflare D1
-- Date: 2025-09-18

-- Create users table with password hashing support
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL -- Stores hashed password (PBKDF2)
);

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- Add a note about password security
-- Passwords are hashed using PBKDF2 with 100,000 iterations
-- Salt is included in the hash stored in the password field