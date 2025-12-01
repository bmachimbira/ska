-- Update Church Details Migration
-- Version: 012
-- Description: Update church descriptions with pastor information from locations.txt

-- ============================================================================
-- UPDATE CHURCH DESCRIPTIONS WITH PASTOR INFO
-- ============================================================================

-- Ebenezer Church: Pastor S Oliphant
UPDATE church 
SET description = 'Ebenezer Seventh-day Adventist Church. Pastor: S Oliphant'
WHERE slug = 'ebenezer-bulawayo';

-- Bethel Church: Pastor D Hall
UPDATE church 
SET description = 'Bethel Seventh-day Adventist Church. Pastor: D Hall'
WHERE slug = 'bethel-zvishavane';

-- Maranatha Church: Pastor S Jerias
UPDATE church 
SET description = 'Maranatha Seventh-day Adventist Church. Pastor: S Jerias'
WHERE slug = 'maranatha-shurugwi';

-- Mount of Olives Church: Pastor E Z Mukubwa
UPDATE church 
SET description = 'Mount of Olives Seventh-day Adventist Church. Pastor: E Z Mukubwa'
WHERE slug = 'mount-of-olives-zvishavane';

-- Mutare City Centre Church: No pastor listed
UPDATE church 
SET description = 'Mutare City Centre Seventh-day Adventist Church'
WHERE slug = 'mutare-city-centre';

-- Ray of Light Church: Pastor John Connick
UPDATE church 
SET description = 'Ray of Light Seventh-day Adventist Church. Pastor: John Connick'
WHERE slug = 'ray-of-light-harare';

-- Remnant Church: Pastor S Jerias
UPDATE church 
SET description = 'Remnant Seventh-day Adventist Church. Pastor: S Jerias'
WHERE slug = 'remnant-gweru';

-- Thorngrove Church: Pastor S Oliphant
UPDATE church 
SET description = 'Thorngrove Seventh-day Adventist Church. Pastor: S Oliphant'
WHERE slug = 'thorngrove-bulawayo';

COMMENT ON TABLE church IS 'SDA Churches in Zimbabwe with complete information from locations.txt';
