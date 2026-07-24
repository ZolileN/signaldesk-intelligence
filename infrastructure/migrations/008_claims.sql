-- 008_claims.sql
SET search_path TO signaldesk, public;

CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    claim_type claim_type NOT NULL,
    claimant_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    temporal_reference JSONB,
    geographic_reference JSONB,
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
