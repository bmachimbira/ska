-- Migration: Add Transcript to Sermons
-- Description: Adds transcript field to sermon table

-- Add transcript column to sermon table
ALTER TABLE sermon 
  ADD COLUMN transcript TEXT;

-- Add comment for documentation
COMMENT ON COLUMN sermon.transcript IS 'Full text transcript of the sermon';
