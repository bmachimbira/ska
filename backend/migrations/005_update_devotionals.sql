-- Migration: Update Devotionals Schema
-- Description: Adds speaker reference, video asset, and content type to devotionals

-- Add speaker_id column (reference to speaker table)
ALTER TABLE devotional
  ADD COLUMN speaker_id BIGINT REFERENCES speaker(id) ON DELETE SET NULL;

-- Add video_asset column (for video devotionals)
ALTER TABLE devotional
  ADD COLUMN video_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL;

-- Add content_type to indicate devotional format
ALTER TABLE devotional
  ADD COLUMN content_type TEXT CHECK (content_type IN ('text', 'audio', 'video')) DEFAULT 'text';

-- Create index on speaker_id for performance
CREATE INDEX idx_devotional_speaker_id ON devotional(speaker_id);

-- Create index on content_type for filtering
CREATE INDEX idx_devotional_content_type ON devotional(content_type);

-- Add comments for documentation
COMMENT ON COLUMN devotional.speaker_id IS 'Reference to the speaker/author of the devotional';
COMMENT ON COLUMN devotional.video_asset IS 'Video asset for video devotionals';
COMMENT ON COLUMN devotional.content_type IS 'Type of devotional content: text, audio, or video';

-- Update existing devotionals to set content_type based on audio_asset
UPDATE devotional
SET content_type = CASE
  WHEN audio_asset IS NOT NULL THEN 'audio'
  ELSE 'text'
END;
