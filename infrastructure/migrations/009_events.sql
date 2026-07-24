-- 009_events.sql
SET search_path TO signaldesk, public;

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    location GEOGRAPHY(POINT, 4326),
    severity severity_level,
    confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
    status event_status NOT NULL DEFAULT 'DETECTED',
    embedding vector(1536),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_observations (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5,4),
    PRIMARY KEY (event_id, observation_id)
);

CREATE TABLE event_claims (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5,4),
    PRIMARY KEY (event_id, claim_id)
);

CREATE TABLE event_entities (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    confidence_score NUMERIC(5,4),
    PRIMARY KEY (event_id, entity_id, role)
);

CREATE TABLE event_relationships (
    source_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    target_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    confidence_score NUMERIC(5,4),
    metadata JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (source_event_id, target_event_id, relationship_type),
    CHECK (source_event_id <> target_event_id)
);
