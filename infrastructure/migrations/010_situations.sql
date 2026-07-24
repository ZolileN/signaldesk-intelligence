-- 010_situations.sql
SET search_path TO signaldesk, public;

CREATE TABLE situations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    situation_type situation_type NOT NULL,
    status situation_status NOT NULL DEFAULT 'EMERGING',
    trajectory trajectory_direction,
    severity severity_level,
    confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
    start_time TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    geographic_scope JSONB NOT NULL DEFAULT '{}',
    drivers JSONB NOT NULL DEFAULT '[]',
    potential_outcomes JSONB NOT NULL DEFAULT '[]',
    embedding vector(1536),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE situation_events (
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    relationship_type TEXT,
    relevance_score NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (situation_id, event_id)
);

CREATE TABLE situation_entities (
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    influence_score NUMERIC(5,4),
    involvement_score NUMERIC(5,4),
    PRIMARY KEY (situation_id, entity_id, role)
);
