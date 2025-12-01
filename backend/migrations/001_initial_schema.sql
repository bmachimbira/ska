-- SKA Content App - Initial Schema Migration
-- Version: 001
-- Description: Create core tables for content management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For trigram similarity search
CREATE EXTENSION IF NOT EXISTS "vector";   -- For pgvector embeddings

-- ============================================================================
-- TAGS
-- ============================================================================

CREATE TABLE tag (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tag_slug ON tag(slug);

-- ============================================================================
-- MEDIA ASSETS
-- ============================================================================

CREATE TABLE media_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT CHECK (kind IN ('video', 'audio', 'image', 'doc')) NOT NULL,
  hls_url TEXT,
  dash_url TEXT,
  download_url TEXT,
  width INT,
  height INT,
  duration_seconds INT,
  mime TEXT,
  size_bytes BIGINT,
  cdn_public BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_asset_kind ON media_asset(kind);
CREATE INDEX idx_media_asset_created_at ON media_asset(created_at DESC);

-- ============================================================================
-- SPEAKERS
-- ============================================================================

CREATE TABLE speaker (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_speaker_name ON speaker(name);

-- ============================================================================
-- SERMON SERIES
-- ============================================================================

CREATE TABLE series (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  hero_image UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_series_title ON series(title);

-- ============================================================================
-- SERMONS
-- ============================================================================

CREATE TABLE sermon (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scripture_refs TEXT[],
  speaker_id BIGINT REFERENCES speaker(id) ON DELETE SET NULL,
  series_id BIGINT REFERENCES series(id) ON DELETE SET NULL,
  video_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  audio_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  thumbnail_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sermon_published_at ON sermon(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_sermon_is_featured ON sermon(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_sermon_speaker_id ON sermon(speaker_id);
CREATE INDEX idx_sermon_series_id ON sermon(series_id);
CREATE INDEX idx_sermon_title_trgm ON sermon USING gin(title gin_trgm_ops);

-- ============================================================================
-- SERMON TAGS (Many-to-Many)
-- ============================================================================

CREATE TABLE sermon_tag (
  sermon_id BIGINT REFERENCES sermon(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (sermon_id, tag_id)
);

CREATE INDEX idx_sermon_tag_tag_id ON sermon_tag(tag_id);

-- ============================================================================
-- DEVOTIONALS
-- ============================================================================

CREATE TABLE devotional (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  body_md TEXT NOT NULL,
  audio_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  lang TEXT DEFAULT 'en',
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_devotional_date_lang ON devotional(date, lang);
CREATE INDEX idx_devotional_slug ON devotional(slug);
CREATE INDEX idx_devotional_date ON devotional(date DESC);
CREATE INDEX idx_devotional_title_trgm ON devotional USING gin(title gin_trgm_ops);

-- ============================================================================
-- QUARTERLIES
-- ============================================================================

CREATE TABLE quarterly (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT CHECK (kind IN ('adult', 'youth', 'kids')) NOT NULL,
  year INT NOT NULL,
  quarter INT CHECK (quarter BETWEEN 1 AND 4) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lang TEXT DEFAULT 'en',
  hero_image UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kind, year, quarter, lang)
);

CREATE INDEX idx_quarterly_kind_year_quarter ON quarterly(kind, year DESC, quarter DESC);

-- ============================================================================
-- LESSONS
-- ============================================================================

CREATE TABLE lesson (
  id BIGSERIAL PRIMARY KEY,
  quarterly_id BIGINT REFERENCES quarterly(id) ON DELETE CASCADE,
  index_in_quarter INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quarterly_id, index_in_quarter)
);

CREATE INDEX idx_lesson_quarterly_id ON lesson(quarterly_id);

-- ============================================================================
-- LESSON DAYS
-- ============================================================================

CREATE TABLE lesson_day (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT REFERENCES lesson(id) ON DELETE CASCADE,
  day_index INT CHECK (day_index BETWEEN 1 AND 7) NOT NULL,
  date DATE,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  memory_verse TEXT,
  audio_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, day_index)
);

CREATE INDEX idx_lesson_day_lesson_id ON lesson_day(lesson_id);
CREATE INDEX idx_lesson_day_date ON lesson_day(date);
CREATE INDEX idx_lesson_day_title_trgm ON lesson_day USING gin(title gin_trgm_ops);

-- ============================================================================
-- RAG DOCUMENTS (for AI Study Chat)
-- ============================================================================

CREATE TABLE rag_document (
  id BIGSERIAL PRIMARY KEY,
  source_kind TEXT CHECK (source_kind IN ('quarterly_day', 'devotional', 'sermon_transcript', 'bible')) NOT NULL,
  source_ref TEXT NOT NULL,  -- e.g., 'lesson_day:123' or 'bible:John.3.16'
  lang TEXT DEFAULT 'en',
  title TEXT,
  body_plain TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-large dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_document_source_kind ON rag_document(source_kind);
CREATE INDEX idx_rag_document_source_ref ON rag_document(source_ref);
CREATE INDEX idx_rag_document_embedding ON rag_document USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- For BM25-style full-text search
CREATE INDEX idx_rag_document_body_fts ON rag_document USING gin(to_tsvector('english', body_plain));

-- ============================================================================
-- ADMIN USERS (for authentication)
-- ============================================================================

CREATE TABLE admin_user (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'editor', 'uploader', 'reader')) NOT NULL DEFAULT 'reader',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_user_email ON admin_user(email);
CREATE INDEX idx_admin_user_role ON admin_user(role);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES admin_user(id) ON DELETE SET NULL,
  action TEXT NOT NULL,  -- e.g., 'sermon.create', 'devotional.update'
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================================
-- OFFLINE PACKS
-- ============================================================================

CREATE TABLE offline_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_type TEXT CHECK (pack_type IN ('lesson', 'quarterly')) NOT NULL,
  entity_id BIGINT NOT NULL,  -- lesson_id or quarterly_id
  version TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  manifest JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offline_pack_type_entity ON offline_pack(pack_type, entity_id);
CREATE INDEX idx_offline_pack_version ON offline_pack(version);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE feature_flag (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flag_key ON feature_flag(key);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_tag_updated_at BEFORE UPDATE ON tag FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_asset_updated_at BEFORE UPDATE ON media_asset FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_speaker_updated_at BEFORE UPDATE ON speaker FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sermon_updated_at BEFORE UPDATE ON sermon FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devotional_updated_at BEFORE UPDATE ON devotional FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quarterly_updated_at BEFORE UPDATE ON quarterly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_updated_at BEFORE UPDATE ON lesson FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_day_updated_at BEFORE UPDATE ON lesson_day FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rag_document_updated_at BEFORE UPDATE ON rag_document FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_user_updated_at BEFORE UPDATE ON admin_user FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flag_updated_at BEFORE UPDATE ON feature_flag FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO feature_flag (key, enabled, description) VALUES
  ('enableChat', FALSE, 'Enable AI study chat feature'),
  ('enableDownloads', TRUE, 'Enable offline downloads'),
  ('enableKids', TRUE, 'Enable kids quarterlies'),
  ('enableYouTubeImport', TRUE, 'Enable YouTube video import');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Initial schema migration completed successfully';
END $$;
