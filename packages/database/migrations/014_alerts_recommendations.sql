-- 014_alerts_recommendations.sql
SET search_path TO signaldesk, public;

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    exposure_id UUID REFERENCES exposures(id) ON DELETE SET NULL,
    recommendation_type TEXT NOT NULL,
    recommendation_text TEXT NOT NULL,
    urgency alert_level,
    confidence_score NUMERIC(5,4),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    situation_id UUID NOT NULL REFERENCES situations(id) ON DELETE CASCADE,
    alert_level alert_level NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reason TEXT,
    read_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
