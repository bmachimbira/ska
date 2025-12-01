-- Seed Churches Migration
-- Version: 007
-- Description: Seed real church data from Zimbabwe

-- ============================================================================
-- INSERT CHURCHES
-- ============================================================================

INSERT INTO church (name, slug, description, address, city, country, timezone, is_active) VALUES
('Ebenezer SDA Church', 'ebenezer-bulawayo', 'Ebenezer Seventh-day Adventist Church', '25 Kirkland Rd, Greenhill', 'Bulawayo', 'Zimbabwe', 'Africa/Harare', true),
('Bethel SDA Church', 'bethel-zvishavane', 'Bethel Seventh-day Adventist Church', 'Stand 1431, Drinkwater Ave', 'Zvishavane', 'Zimbabwe', 'Africa/Harare', true),
('Maranatha SDA Church', 'maranatha-shurugwi', 'Maranatha Seventh-day Adventist Church', '399 Musgrave Rd', 'Shurugwi', 'Zimbabwe', 'Africa/Harare', true),
('Mount of Olives SDA Church', 'mount-of-olives-zvishavane', 'Mount of Olives Seventh-day Adventist Church', 'Cheshire Ranch', 'Zvishavane', 'Zimbabwe', 'Africa/Harare', true),
('Mutare City Centre SDA Church', 'mutare-city-centre', 'Mutare City Centre Seventh-day Adventist Church', '77 First St', 'Mutare', 'Zimbabwe', 'Africa/Harare', true),
('Ray of Light SDA Church', 'ray-of-light-harare', 'Ray of Light Seventh-day Adventist Church', '3 Jessop Rd, Cranborne', 'Harare', 'Zimbabwe', 'Africa/Harare', true),
('Remnant SDA Church', 'remnant-gweru', 'Remnant Seventh-day Adventist Church', '8 Boundary Rd, Clonsilla', 'Gweru', 'Zimbabwe', 'Africa/Harare', true),
('Thorngrove SDA Church', 'thorngrove-bulawayo', 'Thorngrove Seventh-day Adventist Church', '18 Woolwich Rd, Thorngrove', 'Bulawayo', 'Zimbabwe', 'Africa/Harare', true);

-- ============================================================================
-- INSERT SAMPLE USERS (Pastors)
-- ============================================================================

INSERT INTO app_user (name, email, is_active) VALUES
('Pastor S Oliphant', 'pastor.oliphant@ska.org.zw', true),
('Pastor D Hall', 'pastor.hall@ska.org.zw', true),
('Pastor S Jerias', 'pastor.jerias@ska.org.zw', true),
('Pastor E Z Mukubwa', 'pastor.mukubwa@ska.org.zw', true),
('Pastor John Connick', 'pastor.connick@ska.org.zw', true);

-- ============================================================================
-- ASSIGN PASTORS TO CHURCHES
-- ============================================================================

-- Pastor S Oliphant - Ebenezer and Thorngrove
INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', true
FROM app_user u, church c
WHERE u.email = 'pastor.oliphant@ska.org.zw' AND c.slug = 'ebenezer-bulawayo';

INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', false
FROM app_user u, church c
WHERE u.email = 'pastor.oliphant@ska.org.zw' AND c.slug = 'thorngrove-bulawayo';

-- Pastor D Hall - Bethel
INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', true
FROM app_user u, church c
WHERE u.email = 'pastor.hall@ska.org.zw' AND c.slug = 'bethel-zvishavane';

-- Pastor S Jerias - Maranatha and Remnant
INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', true
FROM app_user u, church c
WHERE u.email = 'pastor.jerias@ska.org.zw' AND c.slug = 'maranatha-shurugwi';

INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', false
FROM app_user u, church c
WHERE u.email = 'pastor.jerias@ska.org.zw' AND c.slug = 'remnant-gweru';

-- Pastor E Z Mukubwa - Mount of Olives
INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', true
FROM app_user u, church c
WHERE u.email = 'pastor.mukubwa@ska.org.zw' AND c.slug = 'mount-of-olives-zvishavane';

-- Pastor John Connick - Ray of Light
INSERT INTO church_member (user_id, church_id, role, is_primary)
SELECT u.id, c.id, 'pastor', true
FROM app_user u, church c
WHERE u.email = 'pastor.connick@ska.org.zw' AND c.slug = 'ray-of-light-harare';

-- Update primary church for pastors
UPDATE app_user u
SET primary_church_id = cm.church_id
FROM church_member cm
WHERE u.id = cm.user_id AND cm.is_primary = true;

-- ============================================================================
-- CREATE SAMPLE INVITATION CODES
-- ============================================================================

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.oliphant@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'ebenezer-bulawayo';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.hall@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'bethel-zvishavane';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.jerias@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'maranatha-shurugwi';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.mukubwa@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'mount-of-olives-zvishavane';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.connick@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'ray-of-light-harare';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.jerias@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'remnant-gweru';

INSERT INTO church_invitation (church_id, code, created_by, is_active)
SELECT c.id, UPPER(REPLACE(c.slug, '-', '')), 
       (SELECT id FROM app_user WHERE email = 'pastor.oliphant@ska.org.zw' LIMIT 1),
       true
FROM church c WHERE c.slug = 'thorngrove-bulawayo';

COMMENT ON TABLE church IS 'SDA Churches in Zimbabwe';
COMMENT ON TABLE church_invitation IS 'Invitation codes for joining churches';
