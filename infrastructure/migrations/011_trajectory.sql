-- 011_trajectory.sql
SET search_path TO signaldesk, public;

CREATE TABLE situation_trajectory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    trajectory trajectory_direction NOT NULL,
    trajectory_score NUMERIC(8,4),
    event_frequency NUMERIC(8,4),
    severity_score NUMERIC(8,4),
    actor_expansion_score NUMERIC(8,4),
    geographic_expansion_score NUMERIC(8,4),
    narrative_intensity_score NUMERIC(8,4),
    institutional_response_score NUMERIC(8,4),
    explanation TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
