-- Link Speakers to Users Migration
-- Version: 010
-- Description: Connect speaker table to app_user (church members) with support for guest speakers

-- ============================================================================
-- ADD USER REFERENCE AND GUEST SPEAKER FIELDS TO SPEAKER TABLE
-- ============================================================================

-- Add user_id column to speaker table (nullable for guest speakers)
ALTER TABLE speaker ADD COLUMN user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL;

-- Add fields to identify guest speakers and their church affiliation
ALTER TABLE speaker ADD COLUMN is_guest BOOLEAN DEFAULT FALSE;
ALTER TABLE speaker ADD COLUMN guest_church_name TEXT;
ALTER TABLE speaker ADD COLUMN guest_church_location TEXT;
ALTER TABLE speaker ADD COLUMN contact_email TEXT;
ALTER TABLE speaker ADD COLUMN contact_phone TEXT;

-- Create indexes
CREATE INDEX idx_speaker_user_id ON speaker(user_id);
CREATE INDEX idx_speaker_is_guest ON speaker(is_guest);

-- ============================================================================
-- MIGRATE EXISTING SPEAKERS TO USERS
-- ============================================================================

-- For each existing speaker, create a corresponding user if they don't exist
-- This handles the existing speakers in the database

-- Insert speakers as users if they don't already exist
-- Generate unique emails by appending speaker ID
INSERT INTO app_user (name, email, is_active)
SELECT 
  s.name,
  LOWER(REPLACE(s.name, ' ', '.')) || '.' || s.id || '@ska.org.zw' as email,
  true
FROM speaker s
WHERE NOT EXISTS (
  SELECT 1 FROM app_user u WHERE u.name = s.name
)
ON CONFLICT (email) DO NOTHING;

-- Link existing speakers to their corresponding users
UPDATE speaker s
SET user_id = u.id
FROM app_user u
WHERE s.name = u.name AND s.user_id IS NULL;

-- ============================================================================
-- CREATE VIEW FOR SPEAKERS (BACKWARD COMPATIBILITY)
-- ============================================================================

-- Create a view that combines speaker and user data
-- This maintains backward compatibility with existing queries
CREATE OR REPLACE VIEW speaker_with_user AS
SELECT 
  s.id,
  s.name,
  s.bio,
  s.photo_asset,
  s.user_id,
  s.created_at,
  s.updated_at,
  u.email,
  u.primary_church_id,
  CASE WHEN cm.id IS NOT NULL THEN
    json_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'city', c.city
    )
  ELSE NULL END as primary_church
FROM speaker s
LEFT JOIN app_user u ON s.user_id = u.id
LEFT JOIN church_member cm ON u.id = cm.user_id AND cm.is_primary = true
LEFT JOIN church c ON cm.church_id = c.id;

-- ============================================================================
-- HELPER FUNCTION: GET SPEAKERS FROM CHURCH
-- ============================================================================

-- Function to get all speakers (pastors/elders) from a specific church
CREATE OR REPLACE FUNCTION get_church_speakers(church_id_param BIGINT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  bio TEXT,
  photo_asset UUID,
  email TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.bio,
    s.photo_asset,
    u.email,
    cm.role
  FROM public.speaker s
  JOIN public.app_user u ON s.user_id = u.id
  JOIN public.church_member cm ON u.id = cm.user_id
  WHERE cm.church_id = church_id_param
    AND cm.role IN ('pastor', 'elder', 'admin')
  ORDER BY
    CASE cm.role
      WHEN 'pastor' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'elder' THEN 3
      ELSE 4
    END,
    s.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: CREATE SPEAKER FROM USER
-- ============================================================================

-- Function to automatically create a speaker entry when a user becomes a pastor/elder
CREATE OR REPLACE FUNCTION create_speaker_for_leader()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is being promoted to pastor or elder, create speaker entry if it doesn't exist
  IF NEW.role IN ('pastor', 'elder') THEN
    INSERT INTO public.speaker (name, user_id, is_guest)
    SELECT u.name, u.id, false
    FROM public.app_user u
    WHERE u.id = NEW.user_id
      AND NOT EXISTS (SELECT 1 FROM public.speaker WHERE user_id = u.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create speaker when user becomes pastor/elder
CREATE TRIGGER trigger_create_speaker_for_leader
AFTER INSERT OR UPDATE OF role ON church_member
FOR EACH ROW
EXECUTE FUNCTION create_speaker_for_leader();

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add check constraint: guest speakers must have guest info OR be linked to a user
ALTER TABLE speaker ADD CONSTRAINT check_speaker_type 
  CHECK (
    (is_guest = false AND user_id IS NOT NULL) OR 
    (is_guest = true AND (guest_church_name IS NOT NULL OR user_id IS NOT NULL))
  );

-- ============================================================================
-- UPDATE EXISTING CHURCH MEMBERS WHO ARE PASTORS/ELDERS
-- ============================================================================

-- Create speaker entries for existing pastors and elders who don't have one
INSERT INTO speaker (name, user_id, bio, is_guest)
SELECT 
  u.name,
  u.id,
  'Church leader at ' || c.name,
  false
FROM app_user u
JOIN church_member cm ON u.id = cm.user_id
JOIN church c ON cm.church_id = c.id
WHERE cm.role IN ('pastor', 'elder')
  AND NOT EXISTS (SELECT 1 FROM speaker WHERE user_id = u.id);

-- Mark existing speakers without user_id as guest speakers
UPDATE speaker 
SET is_guest = true 
WHERE user_id IS NULL;

COMMENT ON COLUMN speaker.user_id IS 'Reference to app_user - NULL for guest speakers';
COMMENT ON COLUMN speaker.is_guest IS 'TRUE if speaker is a guest from another church or external';
COMMENT ON COLUMN speaker.guest_church_name IS 'Name of guest speakers church (if applicable)';
COMMENT ON COLUMN speaker.guest_church_location IS 'Location of guest speakers church';
COMMENT ON COLUMN speaker.contact_email IS 'Contact email for guest speakers';
COMMENT ON COLUMN speaker.contact_phone IS 'Contact phone for guest speakers';
COMMENT ON VIEW speaker_with_user IS 'Combined view of speaker and user data for backward compatibility';
COMMENT ON FUNCTION get_church_speakers IS 'Get all speakers (pastors/elders) from a specific church';
COMMENT ON FUNCTION create_speaker_for_leader IS 'Automatically create speaker entry when user becomes pastor/elder';
