-- Event Registration Table
-- Allows users to register for church events

CREATE TABLE IF NOT EXISTS event_registration (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES church_event(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registration_event ON event_registration(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registration_user ON event_registration(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registration_date ON event_registration(registered_at);

COMMENT ON TABLE event_registration IS 'Tracks user registrations for church events';
COMMENT ON COLUMN event_registration.attended IS 'Whether the user attended the event (marked by admin)';
