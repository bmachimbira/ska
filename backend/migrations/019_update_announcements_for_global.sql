-- Update Announcements for Global Support
-- Version: 019
-- Description: Allow announcements to be church-specific or global (organization-wide)

-- ============================================================================
-- UPDATE CHURCH_ANNOUNCEMENT TABLE
-- ============================================================================

-- Make church_id nullable to support global announcements
ALTER TABLE church_announcement 
  ALTER COLUMN church_id DROP NOT NULL;

-- Add a scope field to easily distinguish between church and global announcements
ALTER TABLE church_announcement
  ADD COLUMN scope TEXT CHECK (scope IN ('church', 'global')) DEFAULT 'church';

-- Update existing records to have 'church' scope
UPDATE church_announcement SET scope = 'church' WHERE church_id IS NOT NULL;

-- Update existing records with null church_id to be 'global'
UPDATE church_announcement SET scope = 'global' WHERE church_id IS NULL;

-- Add constraint: global announcements must have null church_id, church announcements must have church_id
ALTER TABLE church_announcement
  ADD CONSTRAINT check_announcement_scope 
  CHECK (
    (scope = 'global' AND church_id IS NULL) OR
    (scope = 'church' AND church_id IS NOT NULL)
  );

-- Update index to include scope
CREATE INDEX idx_church_announcement_scope ON church_announcement(scope);

-- Add index for querying published announcements by scope
CREATE INDEX idx_church_announcement_scope_published 
  ON church_announcement(scope, is_published) 
  WHERE is_published = TRUE;

COMMENT ON COLUMN church_announcement.scope IS 'Scope of announcement: church-specific or global organization-wide';
