-- Church System Migration
-- Version: 006
-- Description: Add church membership, local content, and multi-church support

-- ============================================================================
-- CHURCHES
-- ============================================================================

CREATE TABLE church (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  cover_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  timezone TEXT DEFAULT 'Africa/Harare',
  is_active BOOLEAN DEFAULT TRUE,
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_slug ON church(slug);
CREATE INDEX idx_church_city ON church(city);
CREATE INDEX idx_church_is_active ON church(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_church_location ON church(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================================================
-- USERS (Add church-related fields)
-- ============================================================================

-- Note: Assuming users table exists or will be created
CREATE TABLE IF NOT EXISTS app_user (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  primary_church_id BIGINT REFERENCES church(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add primary_church_id if users table already exists
-- ALTER TABLE app_user ADD COLUMN IF NOT EXISTS primary_church_id BIGINT REFERENCES church(id) ON DELETE SET NULL;

CREATE INDEX idx_user_email ON app_user(email);
CREATE INDEX idx_user_primary_church ON app_user(primary_church_id);

-- ============================================================================
-- CHURCH MEMBERSHIP (Many-to-Many)
-- ============================================================================

CREATE TABLE church_member (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'elder', 'deacon', 'pastor', 'admin')) DEFAULT 'member',
  is_primary BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, church_id)
);

CREATE INDEX idx_church_member_user ON church_member(user_id);
CREATE INDEX idx_church_member_church ON church_member(church_id);
CREATE INDEX idx_church_member_role ON church_member(role);

-- ============================================================================
-- CHURCH DEVOTIONALS (Local messages from leadership)
-- ============================================================================

CREATE TABLE church_devotional (
  id BIGSERIAL PRIMARY KEY,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  scripture_refs TEXT[],
  audio_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_devotional_church ON church_devotional(church_id);
CREATE INDEX idx_church_devotional_date ON church_devotional(date DESC);
CREATE INDEX idx_church_devotional_author ON church_devotional(author_id);
CREATE INDEX idx_church_devotional_published ON church_devotional(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- CHURCH EVENTS (Local church events)
-- ============================================================================

CREATE TABLE church_event (
  id BIGSERIAL PRIMARY KEY,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  end_time TIME,
  location TEXT,
  speaker_id BIGINT REFERENCES speaker(id) ON DELETE SET NULL,
  thumbnail_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  event_type TEXT CHECK (event_type IN ('worship', 'prayer', 'study', 'social', 'outreach', 'youth', 'other')) DEFAULT 'other',
  max_attendees INT,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_event_church ON church_event(church_id);
CREATE INDEX idx_church_event_date ON church_event(event_date DESC);
CREATE INDEX idx_church_event_type ON church_event(event_type);
CREATE INDEX idx_church_event_published ON church_event(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- CHURCH PROJECTS/CAUSES (Local church initiatives)
-- ============================================================================

CREATE TABLE church_project (
  id BIGSERIAL PRIMARY KEY,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12, 2),
  raised_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  thumbnail_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  project_type TEXT CHECK (project_type IN ('fundraising', 'volunteer', 'mission', 'building', 'community', 'other')) DEFAULT 'other',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_project_church ON church_project(church_id);
CREATE INDEX idx_church_project_active ON church_project(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_church_project_type ON church_project(project_type);

-- ============================================================================
-- CHURCH ANNOUNCEMENTS (Bulletin/notices)
-- ============================================================================

CREATE TABLE church_announcement (
  id BIGSERIAL PRIMARY KEY,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  created_by BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_announcement_church ON church_announcement(church_id);
CREATE INDEX idx_church_announcement_expires ON church_announcement(expires_at);
CREATE INDEX idx_church_announcement_published ON church_announcement(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- EVENT REGISTRATIONS (Track who's attending)
-- ============================================================================

CREATE TABLE event_registration (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES church_event(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'confirmed', 'cancelled')) DEFAULT 'registered',
  guests_count INT DEFAULT 0,
  notes TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registration_event ON event_registration(event_id);
CREATE INDEX idx_event_registration_user ON event_registration(user_id);
CREATE INDEX idx_event_registration_status ON event_registration(status);

-- ============================================================================
-- PROJECT CONTRIBUTIONS (Track donations/volunteer hours)
-- ============================================================================

CREATE TABLE project_contribution (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES church_project(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  contribution_type TEXT CHECK (contribution_type IN ('monetary', 'volunteer', 'material')) NOT NULL,
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  hours DECIMAL(5, 2),
  description TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  contributed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_contribution_project ON project_contribution(project_id);
CREATE INDEX idx_project_contribution_user ON project_contribution(user_id);
CREATE INDEX idx_project_contribution_type ON project_contribution(contribution_type);

-- ============================================================================
-- CHURCH INVITATIONS (Invite codes for joining)
-- ============================================================================

CREATE TABLE church_invitation (
  id BIGSERIAL PRIMARY KEY,
  church_id BIGINT NOT NULL REFERENCES church(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  max_uses INT,
  uses_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_church_invitation_code ON church_invitation(code);
CREATE INDEX idx_church_invitation_church ON church_invitation(church_id);
CREATE INDEX idx_church_invitation_active ON church_invitation(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update church member count
CREATE OR REPLACE FUNCTION update_church_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE church SET member_count = member_count + 1 WHERE id = NEW.church_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE church SET member_count = member_count - 1 WHERE id = OLD.church_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_church_member_count
AFTER INSERT OR DELETE ON church_member
FOR EACH ROW EXECUTE FUNCTION update_church_member_count();

-- Update project raised amount
CREATE OR REPLACE FUNCTION update_project_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.contribution_type = 'monetary' THEN
    UPDATE church_project 
    SET raised_amount = raised_amount + NEW.amount 
    WHERE id = NEW.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_raised_amount
AFTER INSERT ON project_contribution
FOR EACH ROW EXECUTE FUNCTION update_project_raised_amount();

-- Update invitation uses count
CREATE OR REPLACE FUNCTION update_invitation_uses()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE church_invitation 
  SET uses_count = uses_count + 1 
  WHERE code = NEW.invitation_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be on church_member if we add invitation_code field
-- ALTER TABLE church_member ADD COLUMN invitation_code TEXT;

-- ============================================================================
-- SAMPLE DATA (Optional - for development)
-- ============================================================================

-- Insert sample church
INSERT INTO church (name, slug, description, city, country, timezone) VALUES
('Harare Central SDA Church', 'harare-central', 'Welcome to Harare Central Seventh-day Adventist Church', 'Harare', 'Zimbabwe', 'Africa/Harare'),
('Bulawayo SDA Church', 'bulawayo', 'Bulawayo Seventh-day Adventist Church', 'Bulawayo', 'Zimbabwe', 'Africa/Harare'),
('Mutare SDA Church', 'mutare', 'Mutare Seventh-day Adventist Church', 'Mutare', 'Zimbabwe', 'Africa/Harare');

COMMENT ON TABLE church IS 'Local SDA churches';
COMMENT ON TABLE church_member IS 'Church membership with roles';
COMMENT ON TABLE church_devotional IS 'Devotionals from local church leadership';
COMMENT ON TABLE church_event IS 'Local church events and programs';
COMMENT ON TABLE church_project IS 'Church projects, fundraising, and initiatives';
COMMENT ON TABLE church_announcement IS 'Church bulletins and announcements';
