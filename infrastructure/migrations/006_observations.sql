-- 006_observations.sql
SET search_path TO signaldesk, public;

CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    content_type content_type NOT NULL,
    title TEXT,
    raw_content TEXT,
    transcript TEXT,
    source_url TEXT,
    published_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    language_code TEXT,
    country_code CHAR(2),
    location GEOGRAPHY(POINT, 4326),
    content_hash TEXT NOT NULL UNIQUE,
    storage_reference TEXT,
    processing_status processing_status NOT NULL DEFAULT 'PENDING',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    segment_start TIMESTAMPTZ NOT NULL,
    segment_end TIMESTAMPTZ NOT NULL,
    audio_reference TEXT NOT NULL,
    duration_seconds NUMERIC(10,3),
    codec TEXT,
    sample_rate INTEGER,
    channels INTEGER,
    content_classification TEXT,
    classification_confidence NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (segment_end > segment_start)
);
