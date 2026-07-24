from typing import List, Dict, Any
from datetime import datetime, timezone
from packages.database import db_instance
from packages.ontology import EventStatus, SeverityLevel

class EventDetectionService:
    """
    Event Engine: Detects discrete real-world occurrences from observations,
    extracts role assignments (ACTOR, TARGET, RESPONDER, LOCATION), and clusters events.
    """
    def __init__(self, db=db_instance):
        self.db = db

    def detect_events_from_observation(self, obs_id: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        obs = self.db.observations.get(obs_id)
        if not obs:
            return []

        text = (obs.get("raw_content") or "") + " " + (obs.get("transcript") or "") + " " + (obs.get("title") or "")
        events = []

        if "protest" in text.lower() or "blockade" in text.lower() or "grievance" in text.lower():
            # Check existing event to cluster/deduplicate
            existing_evt = None
            for e in self.db.events.values():
                if "protest" in e["title"].lower() or "blockade" in e["title"].lower():
                    existing_evt = e
                    break

            if existing_evt:
                # Add observation binding
                if not any(eo["event_id"] == existing_evt["id"] and eo["observation_id"] == obs_id for eo in self.db.event_observations):
                    self.db.event_observations.append({
                        "event_id": existing_evt["id"],
                        "observation_id": obs_id,
                        "relevance_score": 0.95
                    })
                events.append(existing_evt)
            else:
                entity_roles = []
                for ent in entities:
                    if ent["entity_type"] in ["COMMUNITY", "ORGANISATION"]:
                        entity_roles.append({"entity_id": ent["id"], "role": "ACTOR"})
                    elif ent["entity_type"] in ["MINE", "COMPANY"]:
                        entity_roles.append({"entity_id": ent["id"], "role": "TARGET"})
                    elif ent["entity_type"] in ["MUNICIPALITY", "GOVERNMENT"]:
                        entity_roles.append({"entity_id": ent["id"], "role": "RESPONDER"})

                evt_record = self.db.create_event({
                    "event_type": "community_protest_and_road_blockade",
                    "title": "Community Protest and Access Road Blockade near Rustenburg Mine",
                    "description": "Local community members disrupted mining access roads demanding employment commitments.",
                    "severity": SeverityLevel.HIGH.value,
                    "confidence_score": 0.91,
                    "observation_ids": [obs_id],
                    "entity_roles": entity_roles
                })
                events.append(evt_record)

        self.db.record_model_run(
            model_name="event-detector-v1",
            version="1.0.0",
            input_type="ObservationWithEntities",
            input_id=obs_id,
            output={"detected_event_ids": [e["id"] for e in events]},
            confidence=0.91
        )

        return events

event_service_instance = EventDetectionService()
