-- 005_sources.sql
SET search_path TO signaldesk, public;

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_type source_type NOT NULL,
    country_code CHAR(2),
    language_codes TEXT[] NOT NULL DEFAULT '{}',
    url TEXT,
    reliability_score NUMERIC(5,4) CHECK (reliability_score BETWEEN 0 AND 1),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE radio_stations (
    source_id UUID PRIMARY KEY REFERENCES sources(id) ON DELETE CASCADE,
    call_sign TEXT,
    stream_url TEXT NOT NULL,
    stream_format TEXT,
    timezone TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    schedule JSONB NOT NULL DEFAULT '{}',
    monitoring_priority INTEGER NOT NULL DEFAULT 50,
    stream_status TEXT,
    last_heartbeat_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'
);
