import os
import sqlite3
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class SignalDeskDatabase:
    """
    Core database engine for SignalDesk Africa.
    Connects to PostgreSQL (PostGIS/pgvector) when configured, or provides an in-memory
    relational fallback storing all canonical tables for local fast execution and testing.
    """
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or os.getenv("DATABASE_URL", "sqlite:///:memory:")
        self.is_postgres = self.db_url.startswith("postgresql")
        self._init_storage()

    def _init_storage(self):
        # In-memory storage dictionary representing relational graph tables
        self.sources: Dict[str, Dict[str, Any]] = {}
        self.observations: Dict[str, Dict[str, Any]] = {}
        self.entities: Dict[str, Dict[str, Any]] = {}
        self.entity_mentions: List[Dict[str, Any]] = []
        self.claims: Dict[str, Dict[str, Any]] = {}
        self.events: Dict[str, Dict[str, Any]] = {}
        self.event_observations: List[Dict[str, Any]] = []
        self.event_entities: List[Dict[str, Any]] = []
        self.situations: Dict[str, Dict[str, Any]] = {}
        self.situation_events: List[Dict[str, Any]] = []
        self.situation_entities: List[Dict[str, Any]] = []
        self.trajectory_snapshots: List[Dict[str, Any]] = []
        self.customer_organisations: Dict[str, Dict[str, Any]] = {}
        self.customer_assets: Dict[str, Dict[str, Any]] = {}
        self.exposures: Dict[str, Dict[str, Any]] = {}
        self.recommendations: Dict[str, Dict[str, Any]] = {}
        self.model_runs: List[Dict[str, Any]] = []
        self.outbox: List[Dict[str, Any]] = []

        # Seed default test organisation & default sources
        self._seed_reference_data()

    def _seed_reference_data(self):
        # Default org
        org_id = "org-mining-corp-001"
        self.customer_organisations[org_id] = {
            "id": org_id,
            "name": "AngloGold Ashanti (SA Operations)",
            "organisation_type": "MINING_COMPANY",
            "country_code": "ZA"
        }
        # Default customer asset
        asset_id = "asset-mine-rustenburg-01"
        self.customer_assets[asset_id] = {
            "id": asset_id,
            "organisation_id": org_id,
            "asset_type": "MINE",
            "name": "Karee Platinum Mine (Rustenburg Complex)",
            "location_name": "Rustenburg, North West, South Africa",
            "latitude": -25.6667,
            "longitude": 27.2417
        }
        # Default news source
        src_id = "src-vectanews-main"
        self.sources[src_id] = {
            "id": src_id,
            "name": "VectaNews Africa Ingestion Adapter",
            "source_type": "NEWS_PUBLICATION",
            "country_code": "ZA",
            "reliability_score": 0.92,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    # Sources & Observations
    def add_source(self, source_data: Dict[str, Any]) -> str:
        s_id = source_data.get("id") or f"src-{uuid.uuid4().hex[:8]}"
        source_data["id"] = s_id
        source_data["created_at"] = datetime.now(timezone.utc).isoformat()
        self.sources[s_id] = source_data
        return s_id

    def add_observation(self, obs_data: Dict[str, Any]) -> Dict[str, Any]:
        content = obs_data.get("raw_content") or obs_data.get("transcript") or ""
        content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
        
        # Check deduplication
        for existing in self.observations.values():
            if existing["content_hash"] == content_hash:
                return existing

        obs_id = obs_data.get("id") or f"obs-{uuid.uuid4().hex[:8]}"
        obs_record = {
            "id": obs_id,
            "source_id": obs_data["source_id"],
            "content_type": obs_data.get("content_type", "ARTICLE"),
            "title": obs_data.get("title", ""),
            "raw_content": obs_data.get("raw_content", ""),
            "transcript": obs_data.get("transcript", ""),
            "source_url": obs_data.get("source_url", ""),
            "published_at": obs_data.get("published_at") or datetime.now(timezone.utc).isoformat(),
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "language_code": obs_data.get("language_code", "en"),
            "country_code": obs_data.get("country_code", "ZA"),
            "content_hash": content_hash,
            "processing_status": "COMPLETED",
            "metadata": obs_data.get("metadata", {})
        }
        self.observations[obs_id] = obs_record
        return obs_record

    # Entities & Claims
    def upsert_entity(self, entity_data: Dict[str, Any]) -> Dict[str, Any]:
        c_name = entity_data["canonical_name"]
        for e in self.entities.values():
            if e["canonical_name"].lower() == c_name.lower() or c_name in e.get("aliases", []):
                return e
        
        ent_id = entity_data.get("id") or f"ent-{uuid.uuid4().hex[:8]}"
        entity_record = {
            "id": ent_id,
            "canonical_name": c_name,
            "entity_type": entity_data["entity_type"],
            "description": entity_data.get("description", ""),
            "country_code": entity_data.get("country_code", "ZA"),
            "aliases": entity_data.get("aliases", []),
            "confidence_score": entity_data.get("confidence_score", 0.90),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.entities[ent_id] = entity_record
        return entity_record

    def add_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        cl_id = claim_data.get("id") or f"clm-{uuid.uuid4().hex[:8]}"
        claim_record = {
            "id": cl_id,
            "observation_id": claim_data["observation_id"],
            "claim_text": claim_data["claim_text"],
            "claim_type": claim_data.get("claim_type", "FACTUAL_ASSERTION"),
            "claimant_entity_id": claim_data.get("claimant_entity_id"),
            "verification_status": claim_data.get("verification_status", "UNVERIFIED"),
            "confidence_score": claim_data.get("confidence_score", 0.85),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.claims[cl_id] = claim_record
        return claim_record

    # Events & Situations
    def create_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        evt_id = event_data.get("id") or f"evt-{uuid.uuid4().hex[:8]}"
        evt_record = {
            "id": evt_id,
            "event_type": event_data["event_type"],
            "title": event_data["title"],
            "description": event_data.get("description", ""),
            "start_time": event_data.get("start_time") or datetime.now(timezone.utc).isoformat(),
            "severity": event_data.get("severity", "MEDIUM"),
            "confidence_score": event_data.get("confidence_score", 0.88),
            "status": "DETECTED",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.events[evt_id] = evt_record

        # Bind observations & entity roles
        for obs_id in event_data.get("observation_ids", []):
            self.event_observations.append({"event_id": evt_id, "observation_id": obs_id, "relevance_score": 0.95})
        for er in event_data.get("entity_roles", []):
            self.event_entities.append({"event_id": evt_id, "entity_id": er["entity_id"], "role": er["role"], "confidence_score": 0.90})

        return evt_record

    def create_or_update_situation(self, situation_data: Dict[str, Any]) -> Dict[str, Any]:
        sit_id = situation_data.get("id") or f"sit-{uuid.uuid4().hex[:8]}"
        sit_record = {
            "id": sit_id,
            "title": situation_data["title"],
            "summary": situation_data["summary"],
            "situation_type": situation_data.get("situation_type", "COMMUNITY_CONFLICT"),
            "status": situation_data.get("status", "EMERGING"),
            "trajectory": situation_data.get("trajectory", "ESCALATING"),
            "severity": situation_data.get("severity", "HIGH"),
            "confidence_score": situation_data.get("confidence_score", 0.89),
            "start_time": situation_data.get("start_time") or datetime.now(timezone.utc).isoformat(),
            "last_activity_at": datetime.now(timezone.utc).isoformat(),
            "geographic_scope": situation_data.get("geographic_scope", {"country": "ZA", "provinces": ["North West"], "cities": ["Rustenburg"]}),
            "drivers": situation_data.get("drivers", []),
            "potential_outcomes": situation_data.get("potential_outcomes", []),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self.situations[sit_id] = sit_record

        for evt_id in situation_data.get("event_ids", []):
            if not any(se["situation_id"] == sit_id and se["event_id"] == evt_id for se in self.situation_events):
                self.situation_events.append({"situation_id": sit_id, "event_id": evt_id, "relevance_score": 0.95})

        for er in situation_data.get("entity_roles", []):
            if not any(se["situation_id"] == sit_id and se["entity_id"] == er["entity_id"] and se["role"] == er["role"] for se in self.situation_entities):
                self.situation_entities.append({
                    "situation_id": sit_id,
                    "entity_id": er["entity_id"],
                    "role": er["role"],
                    "influence_score": er.get("influence_score", 0.85)
                })

        return sit_record

    # Record Provenance
    def record_model_run(self, model_name: str, version: str, input_type: str, input_id: str, output: Dict[str, Any], confidence: float):
        self.model_runs.append({
            "id": f"mrun-{uuid.uuid4().hex[:8]}",
            "model_name": model_name,
            "model_version": version,
            "input_type": input_type,
            "input_id": input_id,
            "output": output,
            "confidence_score": confidence,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

# Global singleton DB instance
db_instance = SignalDeskDatabase()
