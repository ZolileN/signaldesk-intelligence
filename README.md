# SignalDesk Africa — Intelligence Infrastructure Platform

> **An African-First Situation Intelligence Infrastructure Platform** continuously monitoring information, detecting events, connecting events into evolving situations, analyzing trajectory and impact, identifying organizational exposure, and providing decision-support intelligence.

---

## 🌟 The Core Product Promise

SignalDesk answers **eight canonical questions** about any important situation:

1. **What is happening?** *(Situation summary, status, key events timeline, latest developments)*
2. **Is it getting worse or better?** *(Calculated trajectory: STABLE, IMPROVING, DETERIORATING, ESCALATING, VOLATILE, UNCERTAIN)*
3. **Where is it happening?** *(Country, province, municipality, city, coordinates, facility spatial scope via PostGIS)*
4. **Who is involved?** *(Entities & assigned roles: ACTOR, TARGET, RESPONDER, REGULATOR, BENEFICIARY, OPPONENT)*
5. **What is driving it?** *(Immediate triggers, structural, economic, political drivers vs hypotheses)*
6. **What happens next?** *(Observed facts, analytical inferences, forecasts, scenario analysis)*
7. **How am I exposed?** *(Customer asset mapping: operational, financial, security, regulatory exposure scores)*
8. **What should I do?** *(Actionable decision-support recommendations with urgency, rationale, and confidence scores)*

---

## 🏗️ Intelligence Hierarchy & System Architecture

SignalDesk is built around the **Situation** as the primary intelligence asset. Articles, radio broadcasts, social posts, and government notices are sensors and evidence.

```
       RADIO / NEWS / SOCIAL / GOVT / OPEN DATA SENSORS
                              │
                              ▼
                     INGESTION LAYER
           (VectaNews Adapter / Radio Sensor)
                              │
                              ▼
                        OBSERVATIONS
                (Immutable Captured Content)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
            ENTITIES                       CLAIMS
        (Entity Resolution)          (Claim Extraction)
               │                             │
               └──────────────┬──────────────┘
                              ▼
                            EVENTS
                     (Event Detection & Roles)
                              │
                              ▼
                          SITUATIONS
                   (Event Clustering Engine)
                              │
                              ▼
                          TRAJECTORY
               (Deterministic Metric Snapshots)
                              │
                              ▼
                      CUSTOMER EXPOSURE
               (Operational/Financial Asset Impact)
                              │
                              ▼
                      RECOMMENDATIONS
              (Decision Support Recommendations)
                              │
                              ▼
                      EIGHT-QUESTION API
                              │
                              ▼
                       WEB APPLICATION
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.12+**
- **Node.js v20+** and **npm**
- *(Optional for production)* **Docker** & **PostgreSQL 16+** with `postgis` & `pgvector`

---

### 2. Environment Setup

#### Database Migrations (PostgreSQL)
To run database migrations against a PostgreSQL 16+ instance:
```bash
# Start PostgreSQL with PostGIS & pgvector via Docker Compose
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Execute reproducible migrations 001 through 020
psql -h localhost -U signaldesk -d signaldesk_db -f packages/database/migrations/001_extensions.sql
psql -h localhost -U signaldesk -d signaldesk_db -f packages/database/migrations/002_schema.sql
# ... sequential migrations 003 through 020
```

---

### 3. Running the Python Intelligence Engine & API

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run the backend FastAPI server:
```bash
uvicorn apps.api.main:app --reload --port 8000
```
The API will be live at `http://localhost:8000`. Test the health check endpoint:
```bash
curl http://localhost:8000/health
```

---

### 4. Running Backend Unit Tests

Execute the automated backend test suite testing the full ingestion-to-situation pipeline:
```bash
python3 tests/test_intelligence_engine.py
```

---

### 5. Running the Situation-Centric Web Application

Navigate to `apps/web`:
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` in your browser to interact with the **Eight-Question Situation Intelligence Hub**.

To build the production web bundle:
```bash
npm run build
```

---

## 📁 Repository Structure

```
signaldesk-app/
├── apps/
│   ├── api/                     # FastAPI Eight-Question Backend API (main.py)
│   └── web/                     # React + Vite Glassmorphic Situation Web App
├── services/
│   ├── ingestion/               # VectaNews & Radio Sensor Ingestion Service
│   ├── entity-resolution/       # Entity Extraction & Claim Resolution Service
│   ├── event-detection/         # Discrete Event Detection & Role Binding Service
│   ├── situation-engine/        # Situation Creation & 8-Question Synthesis Service
│   ├── trajectory-engine/       # Deterministic Trajectory Metric Calculation Service
│   ├── exposure-engine/         # Customer Asset Exposure Calculation Service
│   ├── recommendation-engine/   # Actionable Recommendation Engine
│   ├── radio-sensor/            # Radio Continuous Sensor Adapter
│   ├── transcription/           # Audio Segmentation & ASR Processing
│   └── alerting/                # Tenant Alert Engine
├── packages/
│   ├── database/                # Database Engine & Migrations (001_extensions to 020_views)
│   ├── ontology/                # Canonical Enums & Domain Models
│   ├── shared-types/            # Pydantic Schemas & 8-Question API Response Model
│   ├── ai/                      # Layered AI (Rules + Embeddings + LLM Synthesis)
│   └── observability/           # Logging & Model Provenance Tracking
├── infrastructure/
│   ├── docker/                  # Docker Compose setup for PostgreSQL 16 + PostGIS + pgvector
│   ├── migrations/              # SQL Migration copy
│   └── deployment/              # Production deployment manifests
├── docs/                        # Architecture & Product Specifications
│   ├── IMPLEMENTATION_DECISIONS.md # Architecture Decisions & Precedence Matrix
│   └── extracted/               # Extracted Specification Texts
├── tests/                       # Integration & Unit Test Suites
└── requirements.txt             # Python Package Dependencies
```

---

## 🔌 Primary API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status & DB entity counts |
| `POST` | `/api/v1/observations/ingest` | Ingest raw news article or radio transcript payload |
| `GET` | `/api/v1/situations` | List all active monitored Situations |
| `GET` | `/api/v1/situations/{id}` | Basic Situation summary details |
| `GET` | `/api/v1/situations/{id}/intelligence` | **Canonical Eight-Question Intelligence API** |
| `POST` | `/api/v1/organisations/{id}/assets` | Register customer asset (Mine, Facility, Supply Chain) |

---

## 📄 License & Canonical Documentation
All product specs in `/docs` represent canonical product definitions for SignalDesk Africa.
For details on decision precedence and architecture, see [`docs/IMPLEMENTATION_DECISIONS.md`](docs/IMPLEMENTATION_DECISIONS.md).
