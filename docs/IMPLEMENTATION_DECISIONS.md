# SignalDesk Africa — Architecture & Engineering Implementation Decisions

## Overview
This document records key architectural, schema, and implementation decisions made in accordance with the SignalDesk master prompt and foundational specification documents in `/docs`.

---

## 1. Document Precedence & Conflict Resolution Matrix
When specifications differ across documents, decisions are resolved following the master prompt hierarchy:
1. Master Prompt
2. Technical System Design and Implementation Roadmap
3. Buildable Engineering Specification
4. Canonical Database Schema & PostgreSQL Implementation
5. Event/Situation Ontology
6. AI/ML Architecture
7. Radio Sensor Architecture
8. VectaNews Integration Architecture
9. PRD
10. Business Plan

### Resolved Conflicts:
* **Architecture Boundary (Modular Monolith vs Microservices)**:
  * *Conflict*: PRD and early docs refer to independent microservices; Technical Design & Engineering Specs recommend a modular monolith for Phase 1.
  * *Decision*: Use a modular monolith architecture with clean internal boundaries (`services/ingestion`, `services/entity-resolution`, `services/event-detection`, `services/situation-engine`, `services/trajectory-engine`, `services/exposure-engine`, `services/recommendation-engine`). All services run within the same Python/FastAPI async environment, making future service extraction trivial without premature network overhead.

* **Vector Embedding Dimensions**:
  * *Decision*: Default to `vector(1536)` across `entities`, `events`, and `situations` tables as defined in canonical database schema (`007_entities.sql`, `009_events.sql`, `010_situations.sql`).

* **Database Migration Sequence**:
  * *Decision*: Adopt the exact 20-migration SQL breakdown specified in Section 23 of the PostgreSQL Database Implementation doc, using the `signaldesk` schema namespace.

---

## 2. Technical Stack Decisions

| Layer | Technology Choice | Rationale |
|---|---|---|
| **Database** | PostgreSQL 16+ (PostGIS, pgvector, citext, pgcrypto) | Canonical database requirement for spatial intelligence, vector embeddings, case-insensitive text, and UUID generation. |
| **API Backend** | Python 3.12 + FastAPI + AsyncPG / SQLAlchemy | High-performance async Python backend suited for ML/NLP pipelines, vector search, and structured API delivery. |
| **Frontend Web App** | React / Vite / Tailwind CSS + Modern UI System | Fast, vibrant, responsive web application centered around the Situation-centric 8-Question Intelligence UI. |
| **Queue / Outbox** | Transactional Outbox pattern (`outbox_events` table) + Async Background Task Runner | Ensures idempotent processing, zero loss of event triggers, and auditability without immediate external queue broker dependency for local dev. |
| **AI / NLP Pipeline** | Layered Rule + Embeddings/NER + LLM Synthesis | Deterministic hashing/deduplication -> Entity Resolution -> Claim Extraction -> Event Clustering -> LLM Summarization & 8-Question Synthesis. |

---

## 3. Core Intelligence Model Hierarchy
Every piece of data flows through the canonical intelligence hierarchy:
```
Sources -> Observations -> Claims / Entities -> Events -> Situations -> Trajectory -> Customer Exposure -> Recommendations
```

* **Observation Immutability**: Raw observations are stored as immutable records (`observations` table). AI extraction results, entity mentions, and event bindings are stored in downstream relational tables.
* **The 8 Core Intelligence Questions**:
  1. What is happening? (Situation Summary, Status, Key Events)
  2. Is it getting worse or better? (Trajectory Snapshot, Event Frequency, Severity, Geographic & Actor Expansion)
  3. Where is it happening? (PostGIS spatial geometry, Country, Province, City, Facilities)
  4. Who is involved? (Entities, Roles: Actor, Target, Responder, Beneficiary, Opponent, Regulator)
  5. What is driving it? (Triggers, Structural, Economic, Political, Social drivers)
  6. What happens next? (Scenario Analysis, Observed Fact vs Inference vs Forecast)
  7. How am I exposed? (Customer Assets, Exposure Types: Financial, Operational, Security, Regulatory, etc.)
  8. What should I do? (Actionable Recommendations with Urgency, Reason, and Confidence Score)

---

## 4. Initial Vertical Slice Scope (Phase 1 MVP)
1. Ingest News/Radio Content as immutable `Observation` records.
2. Extract Entities (`PERSON`, `ORGANISATION`, `LOCATION`, `ASSET`, `COMPANY`, etc.) & Claims (`FACTUAL_ASSERTION`, `ALLEGATION`, `WARNING`).
3. Detect discrete `Events` and associate with observations and entities.
4. Cluster related events into an evolving `Situation`.
5. Calculate deterministic `Trajectory Snapshots` (frequency, severity, geographic expansion).
6. Expose the Eight-Question Intelligence API (`GET /api/v1/situations/{id}/intelligence`).
7. Deliver a premium, interactive web interface built around Situations.
