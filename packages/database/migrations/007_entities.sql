-- 007_entities.sql
SET search_path TO signaldesk, public;

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL,
    entity_type entity_type NOT NULL,
    description TEXT,
    country_code CHAR(2),
    aliases TEXT[] NOT NULL DEFAULT '{}',
    external_identifiers JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entity_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    language_code TEXT,
    alias_type TEXT,
    UNIQUE (entity_id, alias)
);

CREATE TABLE entity_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    mention_text TEXT NOT NULL,
    entity_type entity_type,
    start_offset INTEGER,
    end_offset INTEGER,
    resolution_confidence NUMERIC(5,4),
    resolution_status resolution_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
