from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from packages.database import db_instance
from packages.ai.vector_search import vector_search_instance

HISTORICAL_SITUATION_ARCHIVE = [
    {
        "id": "sit-hist-2024-rustenburg",
        "title": "2024 Rustenburg Platinum Belt Community Employment Grievance",
        "summary": "Community blockade of platinum mine access roads regarding local employment allocations. Mediation by local municipality led to a 10% local vendor quota resolution within 5 days.",
        "situation_type": "COMMUNITY_CONFLICT",
        "status": "HISTORICAL",
        "severity": "HIGH",
        "start_time": "2024-05-10T08:00:00Z",
        "geographic_scope": {"country": "South Africa", "province": "North West", "municipality": "Rustenburg"},
        "outcome": {
            "resolved_within_days": 5,
            "final_resolution": "Municipal-mediated 10% local vendor procurement quota agreement.",
            "operational_impact": "Temporary 3-day shift transport delay; zero equipment damage."
        }
    },
    {
        "id": "sit-hist-2023-richardsbay",
        "title": "2023 Richards Bay Logistics & Port Access Disruption",
        "summary": "Trucking transport blockade affecting mining export corridors near Richards Bay port. Resolved following provincial security deployment and stakeholder council formation.",
        "situation_type": "SUPPLY_CHAIN_DISRUPTION",
        "status": "HISTORICAL",
        "severity": "CRITICAL",
        "start_time": "2023-09-14T06:00:00Z",
        "geographic_scope": {"country": "South Africa", "province": "KwaZulu-Natal", "city": "Richards Bay"},
        "outcome": {
            "resolved_within_days": 8,
            "final_resolution": "Provincial Task Team established dedicated freight security corridors.",
            "operational_impact": "Export volume delay of 12,000 tonnes coal/minerals."
        }
    }
]

class HistoricalSituationArchiveEngine:
    """
    Historical Situation Archive & Comparables Search Engine:
    Performs semantic and structural similarity matching against historical African situation outcomes:
    'Show me similar past mining conflicts and what happened next.'
    """
    def __init__(self, db=db_instance):
        self.db = db
        self._seed_archive()

    def _seed_archive(self):
        for h in HISTORICAL_SITUATION_ARCHIVE:
            if h["id"] not in self.db.situations:
                self.db.situations[h["id"]] = h

    def find_comparable_situations(self, situation_id: str, top_k: int = 2) -> List[Dict[str, Any]]:
        target = self.db.situations.get(situation_id)
        if not target:
            return []

        target_text = f"{target.get('title', '')} {target.get('summary', '')} {target.get('situation_type', '')}"
        
        comparables = []
        for h in HISTORICAL_SITUATION_ARCHIVE:
            h_text = f"{h['title']} {h['summary']} {h['situation_type']}"
            
            # Vector similarity calculation
            query_vec = vector_search_instance.generate_embedding(target_text)
            h_vec = vector_search_instance.generate_embedding(h_text)
            sim = vector_search_instance.cosine_similarity(query_vec, h_vec)
            
            # Additional score boost if situation_type matches
            if h["situation_type"] == target.get("situation_type"):
                sim = min(1.0, sim + 0.20)

            comparables.append({
                "historical_situation_id": h["id"],
                "title": h["title"],
                "summary": h["summary"],
                "situation_type": h["situation_type"],
                "similarity_score": round(sim, 4),
                "historical_outcome": h["outcome"]
            })

        comparables.sort(key=lambda x: x["similarity_score"], reverse=True)
        return comparables[:top_k]

historical_archive_instance = HistoricalSituationArchiveEngine()
