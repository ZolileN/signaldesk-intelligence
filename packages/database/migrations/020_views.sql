-- 020_views.sql
SET search_path TO signaldesk, public;

CREATE VIEW situation_intelligence AS
SELECT
    s.id AS situation_id,
    s.title,
    s.summary,
    s.situation_type,
    s.status,
    s.trajectory,
    s.severity,
    s.confidence_score,
    s.start_time,
    s.last_activity_at,
    s.geographic_scope,
    s.drivers,
    s.potential_outcomes,
    s.created_at,
    s.updated_at
FROM situations s;
