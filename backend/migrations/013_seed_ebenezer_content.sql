-- Seed Ebenezer Church Content
-- Version: 013
-- Description: Add sample events, projects, and announcements for Ebenezer SDA Church

-- ============================================================================
-- SEED CHURCH EVENTS
-- ============================================================================

-- Get Ebenezer church ID and Pastor S Oliphant's user ID
DO $$
DECLARE
  ebenezer_id BIGINT;
  pastor_id BIGINT;
BEGIN
  -- Get church ID
  SELECT id INTO ebenezer_id FROM church WHERE slug = 'ebenezer-bulawayo';
  
  -- Get pastor ID
  SELECT id INTO pastor_id FROM app_user WHERE email = 'pastor.oliphant@ska.org.zw';

  -- Insert sample events
  INSERT INTO church_event (
    church_id, title, description, event_date, event_time, 
    location, event_type, is_published, created_by
  ) VALUES
  (
    ebenezer_id,
    'Sabbath School',
    'Weekly Sabbath School for all ages. Join us for Bible study and fellowship.',
    CURRENT_DATE + INTERVAL '7 days',
    '09:30:00',
    'Main Sanctuary',
    'worship',
    true,
    pastor_id
  ),
  (
    ebenezer_id,
    'Youth Bible Study',
    'Interactive Bible study session for youth aged 13-25. Bring your questions and join the discussion!',
    CURRENT_DATE + INTERVAL '3 days',
    '18:00:00',
    'Youth Hall',
    'study',
    true,
    pastor_id
  ),
  (
    ebenezer_id,
    'Community Outreach',
    'Join us as we serve our community. We will be distributing food and clothing to those in need.',
    CURRENT_DATE + INTERVAL '14 days',
    '10:00:00',
    'City Center',
    'outreach',
    true,
    pastor_id
  ),
  (
    ebenezer_id,
    'Prayer Meeting',
    'Mid-week prayer meeting. Come and lift up your prayers with fellow believers.',
    CURRENT_DATE + INTERVAL '4 days',
    '19:00:00',
    'Prayer Room',
    'prayer',
    true,
    pastor_id
  );

END $$;

-- ============================================================================
-- SEED CHURCH PROJECTS
-- ============================================================================

DO $$
DECLARE
  ebenezer_id BIGINT;
  pastor_id BIGINT;
BEGIN
  -- Get church ID
  SELECT id INTO ebenezer_id FROM church WHERE slug = 'ebenezer-bulawayo';
  
  -- Get pastor ID
  SELECT id INTO pastor_id FROM app_user WHERE email = 'pastor.oliphant@ska.org.zw';

  -- Insert sample projects
  INSERT INTO church_project (
    church_id, title, description, goal_amount, raised_amount,
    currency, project_type, is_active, created_by
  ) VALUES
  (
    ebenezer_id,
    'Church Roof Repair',
    'Our church roof needs urgent repairs to prevent water damage during the rainy season. Your contributions will help us maintain our place of worship.',
    5000.00,
    2350.00,
    'USD',
    'building',
    true,
    pastor_id
  ),
  (
    ebenezer_id,
    'Youth Camp 2025',
    'Annual youth camp for spiritual growth and fellowship. Funds will cover transportation, accommodation, and activities for 50 youth.',
    3000.00,
    1200.00,
    'USD',
    'mission',
    true,
    pastor_id
  ),
  (
    ebenezer_id,
    'Community Food Bank',
    'Establishing a food bank to support families in need within our community. Monthly distribution of essential food items.',
    2000.00,
    800.00,
    'USD',
    'community',
    true,
    pastor_id
  );

END $$;

-- ============================================================================
-- SEED CHURCH ANNOUNCEMENTS
-- ============================================================================

DO $$
DECLARE
  ebenezer_id BIGINT;
  pastor_id BIGINT;
BEGIN
  -- Get church ID
  SELECT id INTO ebenezer_id FROM church WHERE slug = 'ebenezer-bulawayo';
  
  -- Get pastor ID
  SELECT id INTO pastor_id FROM app_user WHERE email = 'pastor.oliphant@ska.org.zw';

  -- Insert sample announcements
  INSERT INTO church_announcement (
    church_id, title, content, priority, is_published, 
    expires_at, created_by
  ) VALUES
  (
    ebenezer_id,
    'Sabbath Service Time Change',
    'Please note that this Sabbath, our worship service will start at 10:00 AM instead of the usual 9:30 AM due to a special program.',
    'urgent',
    true,
    CURRENT_DATE + INTERVAL '7 days',
    pastor_id
  ),
  (
    ebenezer_id,
    'Baptism Class Starting',
    'Baptism preparation classes will begin next month. If you or someone you know is interested in baptism, please contact Pastor Oliphant.',
    'high',
    true,
    CURRENT_DATE + INTERVAL '30 days',
    pastor_id
  ),
  (
    ebenezer_id,
    'Church Potluck Fellowship',
    'Join us for a fellowship potluck after the service this Sabbath. Please bring a dish to share. All are welcome!',
    'normal',
    true,
    CURRENT_DATE + INTERVAL '7 days',
    pastor_id
  ),
  (
    ebenezer_id,
    'Weekly Bulletin Available',
    'The weekly church bulletin is now available at the entrance. Pick up your copy to stay informed about church activities.',
    'low',
    true,
    CURRENT_DATE + INTERVAL '7 days',
    pastor_id
  );

END $$;

COMMENT ON TABLE church_event IS 'Church events with sample data for Ebenezer SDA Church';
COMMENT ON TABLE church_project IS 'Church projects with sample data for Ebenezer SDA Church';
COMMENT ON TABLE church_announcement IS 'Church announcements with sample data for Ebenezer SDA Church';
