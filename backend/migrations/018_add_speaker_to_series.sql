-- Migration 018: Add Speaker to Series
-- Adds speaker_id to series table to bind series to a primary speaker

-- Add speaker_id column to series table
ALTER TABLE series
ADD COLUMN IF NOT EXISTS speaker_id BIGINT REFERENCES speaker(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_series_speaker ON series(speaker_id);

-- Update existing series to have NULL speaker (optional)
-- You can manually update these later through the admin panel
