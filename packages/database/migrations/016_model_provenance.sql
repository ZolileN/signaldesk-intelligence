-- 016_model_provenance.sql
SET search_path TO signaldesk, public;

CREATE TABLE model_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    input_type TEXT NOT NULL,
    input_id UUID,
    output JSONB NOT NULL,
    confidence_score NUMERIC(5,4),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
