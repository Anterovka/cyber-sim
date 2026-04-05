-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Set first user as admin (optional, can be changed manually)
-- UPDATE users SET role = 'admin' WHERE username = 'admin';
