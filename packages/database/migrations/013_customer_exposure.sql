-- 013_customer_exposure.sql
SET search_path TO signaldesk, public;

CREATE TABLE customer_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exposures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES customer_assets(id) ON DELETE SET NULL,
    exposure_type exposure_type NOT NULL,
    exposure_score NUMERIC(5,4),
    impact_score NUMERIC(5,4),
    probability_score NUMERIC(5,4),
    time_horizon TEXT,
    explanation TEXT,
    confidence_score NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, situation_id, asset_id, exposure_type)
);
