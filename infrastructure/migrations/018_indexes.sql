-- 018_indexes.sql
SET search_path TO signaldesk, public;

CREATE INDEX idx_sources_type ON sources(source_type);
CREATE INDEX idx_sources_country ON sources(country_code);
CREATE INDEX idx_sources_active ON sources(active);

CREATE INDEX idx_observations_source ON observations(source_id);
CREATE INDEX idx_observations_published_at ON observations(published_at DESC);
CREATE INDEX idx_observations_captured_at ON observations(captured_at DESC);
CREATE INDEX idx_observations_processing_status ON observations(processing_status);
CREATE INDEX idx_observations_location ON observations USING GIST(location);

CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_country ON entities(country_code);

CREATE INDEX idx_entities_embedding ON entities USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_events_embedding ON events USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_situations_embedding ON situations USING hnsw (embedding vector_cosine_ops);
