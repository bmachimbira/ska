-- Update Events for Global Support
-- Version: 020
-- Description: Allow events to be church-specific or global (organization-wide / "All Churches")

-- ============================================================================
-- UPDATE EVENT TABLE
-- ============================================================================

-- Add church_id to link events to specific churches (nullable for global events)
ALTER TABLE event
  ADD COLUMN IF NOT EXISTS church_id BIGINT REFERENCES church(id) ON DELETE CASCADE;

-- Add a scope field to easily distinguish between church and global events
ALTER TABLE event
  ADD COLUMN IF NOT EXISTS scope TEXT CHECK (scope IN ('church', 'global')) DEFAULT 'global';

-- Update existing records to have 'global' scope (backward compatibility)
UPDATE event SET scope = 'global' WHERE scope IS NULL;

-- Add constraint: global events must have null church_id, church events must have church_id
ALTER TABLE event
  ADD CONSTRAINT IF NOT EXISTS check_event_scope 
  CHECK (
    (scope = 'global' AND church_id IS NULL) OR
    (scope = 'church' AND church_id IS NOT NULL)
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_church ON event(church_id);
CREATE INDEX IF NOT EXISTS idx_event_scope ON event(scope);
CREATE INDEX IF NOT EXISTS idx_event_scope_published 
  ON event(scope, is_published) 
  WHERE is_published = TRUE;

COMMENT ON COLUMN event.scope IS 'Scope of event: church-specific or global ("All Churches")';
COMMENT ON COLUMN event.church_id IS 'Church ID for church-specific events, NULL for global events';
