-- Migration: Remove unique constraint on devotional date/lang
-- Allows multiple devotionals per day from different speakers

DROP INDEX IF EXISTS idx_devotional_date_lang;

-- Add a non-unique index for performance when querying by date/lang
CREATE INDEX IF NOT EXISTS idx_devotional_date_lang_lookup ON devotional(date, lang);

-- Add comment explaining the change
COMMENT ON TABLE devotional IS 'Devotionals can have multiple entries per day from different speakers';
