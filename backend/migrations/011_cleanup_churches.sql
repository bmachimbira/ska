-- Cleanup Churches Migration
-- Version: 011
-- Description: Remove churches not in locations.txt and keep only the 8 real churches

-- ============================================================================
-- DELETE CHURCHES NOT IN LOCATIONS.TXT
-- ============================================================================

-- Delete churches that are not in the locations.txt file
DELETE FROM church 
WHERE slug NOT IN (
  'ebenezer-bulawayo',
  'bethel-zvishavane',
  'maranatha-shurugwi',
  'mount-of-olives-zvishavane',
  'mutare-city-centre',
  'ray-of-light-harare',
  'remnant-gweru',
  'thorngrove-bulawayo'
);

-- ============================================================================
-- VERIFY REMAINING CHURCHES
-- ============================================================================

-- Should have exactly 8 churches
DO $$
DECLARE
  church_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO church_count FROM church;
  
  IF church_count != 8 THEN
    RAISE EXCEPTION 'Expected 8 churches, but found %', church_count;
  END IF;
  
  RAISE NOTICE 'Successfully cleaned up churches. % churches remaining.', church_count;
END $$;

COMMENT ON TABLE church IS 'SDA Churches in Zimbabwe - only churches from locations.txt';
