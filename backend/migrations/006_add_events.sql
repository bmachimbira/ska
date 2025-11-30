-- Migration 006: Add Events Table
-- Creates the event table for managing church events

-- Create event table
CREATE TABLE IF NOT EXISTS event (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time VARCHAR(100), -- e.g., "8:00 AM to 11:00 AM"
  location TEXT,
  speaker_id INTEGER REFERENCES speaker(id) ON DELETE SET NULL,
  thumbnail_asset UUID,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on event_date for efficient queries
CREATE INDEX idx_event_date ON event(event_date DESC);
CREATE INDEX idx_event_featured ON event(is_featured) WHERE is_featured = true;
CREATE INDEX idx_event_published ON event(is_published) WHERE is_published = true;

-- Insert sample event
INSERT INTO event (
  title,
  description,
  event_date,
  event_time,
  location,
  is_featured,
  is_published
) VALUES (
  'Sabbath Worship Service',
  'Join us for our weekly Sabbath worship service. Experience uplifting worship, inspiring messages, and fellowship with believers.',
  CURRENT_DATE + INTERVAL '7 days',
  '9:00 AM to 12:00 PM',
  'Main Church Sanctuary, 123 Church Street, Harare, Zimbabwe',
  true,
  true
);

-- Add comment
COMMENT ON TABLE event IS 'Stores church events and activities';
