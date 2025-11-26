-- Migration: Add Study Fields to Lesson Days
-- Description: Adds study_aim, study_help, and introduction fields to lesson_day table

-- Add new columns to lesson_day table
ALTER TABLE lesson_day 
  ADD COLUMN study_aim TEXT,
  ADD COLUMN study_help TEXT,
  ADD COLUMN introduction TEXT;

-- Add comment for documentation
COMMENT ON COLUMN lesson_day.study_aim IS 'Learning objectives or aims for the study day';
COMMENT ON COLUMN lesson_day.study_help IS 'Additional study resources or helps';
COMMENT ON COLUMN lesson_day.introduction IS 'Introduction or overview for the study day';
