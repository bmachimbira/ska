-- User Authentication Enhancement
-- Add password_hash and authentication fields to app_user table

-- Add password hash column for authentication
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add first_name and last_name columns (keeping name for backward compatibility)
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Create index on email for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);

-- Add comments
COMMENT ON COLUMN app_user.password_hash IS 'Bcrypt hashed password for user authentication';
COMMENT ON COLUMN app_user.first_name IS 'User first name';
COMMENT ON COLUMN app_user.last_name IS 'User last name';
COMMENT ON COLUMN app_user.phone IS 'User phone number for contact';

-- Note: Existing users without password_hash will need to reset their password
-- or use social authentication when implemented
