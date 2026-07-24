-- 012_evidence.sql
SET search_path TO signaldesk, public;

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    situation_id UUID REFERENCES situations(id) ON DELETE CASCADE,
    evidence_type evidence_type NOT NULL,
    relevance_score NUMERIC(5,4),
    reliability_score NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        observation_id IS NOT NULL
        OR claim_id IS NOT NULL
        OR event_id IS NOT NULL
        OR situation_id IS NOT NULL
    )
);
