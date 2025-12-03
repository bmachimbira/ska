-- Migration 017: Add Default Series
-- Creates a default "Standalone Sermons" series for sermons without a specific series

-- Insert default series if it doesn't exist
INSERT INTO series (
  id,
  title,
  description,
  created_at,
  updated_at
)
SELECT
  1,
  'Standalone Sermons',
  'Individual sermons that are not part of a specific series',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM series WHERE id = 1
);

-- Reset the series ID sequence to start after the default series
-- This ensures new series get IDs starting from 2
SELECT setval('series_id_seq', GREATEST(1, (SELECT MAX(id) FROM series)), true);
