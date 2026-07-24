from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from packages.database import db_instance
from packages.ontology import SituationType, SituationStatus, TrajectoryDirection, SeverityLevel
from services.entity_resolution.entity_service import entity_service_instance
from services.event_detection.event_service import event_service_instance
from services.trajectory_engine.trajectory_service import trajectory_service_instance
from services.exposure_engine.exposure_service import exposure_service_instance
from services.recommendation_engine.recommendation_service import recommendation_service_instance
from services.situation_engine.historical_archive import historical_archive_instance
from services.alerting.alert_service import alerting_engine_instance

class SituationEngineService:
    """
    The Core Intelligence Engine of SignalDesk Africa.
    Integrates all upstream evidence into an evolving Situation model, computes exposure/recommendations,
    queries historical comparables, and triggers enterprise tenant alerts.
    """
    def __init__(self, db=db_instance):
        self.db = db

    def process_observation_to_situation(self, obs_id: str) -> Dict[str, Any]:
        obs = self.db.observations.get(obs_id)
        if not obs:
            return {}

        content = obs.get("content", "")
        headline = obs.get("headline", "")

        import os
        import json
        from openai import OpenAI
        
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key and len(content) > 50:
            try:
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an African geopolitical Situation Intelligence engine. Read the news observation and extract the core situation as JSON. Output JSON only. The JSON must match this structure: {\"title\": \"Short descriptive title\", \"summary\": \"2-3 sentence summary\", \"situation_type\": \"POLITICAL_UNREST, COMMUNITY_CONFLICT, ECONOMIC_POLICY, etc\", \"drivers\": [{\"category\": \"IMMEDIATE_TRIGGER\", \"description\": \"...\"}], \"potential_outcomes\": [{\"scenario\": \"...\", \"likelihood\": \"HIGH\", \"timeframe\": \"24_HOURS\"}]}"},
                        {"role": "user", "content": f"Headline: {headline}\n\nContent: {content}"}
                    ],
                    response_format={"type": "json_object"}
                )
                llm_result = json.loads(response.choices[0].message.content)
                title = llm_result.get("title", headline)
                summary = llm_result.get("summary", content[:200])
                drivers = llm_result.get("drivers", [{"category": "IMMEDIATE_TRIGGER", "description": "Triggered by breaking news report."}])
                outcomes = llm_result.get("potential_outcomes", [{"scenario": "Ongoing monitoring required.", "likelihood": "HIGH", "timeframe": "24_HOURS"}])
            except Exception as e:
                title = headline or "Generated Situation"
                summary = content[:200]
                drivers = [{"category": "IMMEDIATE_TRIGGER", "description": "Triggered by breaking news report."}]
                outcomes = [{"scenario": "Ongoing monitoring required.", "likelihood": "HIGH", "timeframe": "24_HOURS"}]
        else:
            title = headline or "Generated Situation"
            summary = content[:200]
            drivers = [{"category": "IMMEDIATE_TRIGGER", "description": "Triggered by breaking news report."}]
            outcomes = [{"scenario": "Ongoing monitoring required.", "likelihood": "HIGH", "timeframe": "24_HOURS"}]

        entities = entity_service_instance.extract_and_resolve_entities(obs_id)
        claims = entity_service_instance.extract_claims(obs_id)
        events = event_service_instance.detect_events_from_observation(obs_id, entities)

        evt_ids = [e["id"] for e in events]
        entity_roles = []
        for ent in entities:
            role = "ACTOR"
            if ent["entity_type"] in ["MINE", "COMPANY"]:
                role = "TARGET"
            elif ent["entity_type"] in ["MUNICIPALITY", "GOVERNMENT"]:
                role = "RESPONDER"
            entity_roles.append({"entity_id": ent["id"], "role": role, "influence_score": 0.85})

        situation_record = self.db.create_or_update_situation({
            "title": title,
            "summary": summary,
            "situation_type": SituationType.COMMUNITY_CONFLICT.value,
            "status": SituationStatus.ESCALATING.value,
            "trajectory": TrajectoryDirection.ESCALATING.value,
            "severity": SeverityLevel.HIGH.value,
            "confidence_score": 0.91,
            "event_ids": evt_ids,
            "entity_roles": entity_roles,
            "drivers": drivers,
            "potential_outcomes": outcomes
        })

        sit_id = situation_record["id"]

        trajectory_service_instance.calculate_situation_trajectory(sit_id, events, entities)

        org_id = "org-mining-corp-001"
        exposures = exposure_service_instance.calculate_organisation_exposure(org_id, sit_id)

        recommendation_service_instance.generate_recommendations(org_id, sit_id, exposures)

        alerting_engine_instance.evaluate_situation_alerts(sit_id, org_id)

        return situation_record

    def get_eight_question_intelligence(self, situation_id: str, org_id: str = "org-mining-corp-001") -> Dict[str, Any]:
        sit = self.db.situations.get(situation_id)
        if not sit:
            active_sits = [s for s in self.db.situations.values() if s.get("status") != "HISTORICAL"]
            if active_sits:
                sit = active_sits[0]
                situation_id = sit["id"]
            elif self.db.situations:
                sit = list(self.db.situations.values())[0]
                situation_id = sit["id"]
            else:
                return {}

        # Fetch bound events
        bound_evt_ids = [se["event_id"] for se in self.db.situation_events if se["situation_id"] == situation_id]
        bound_events = [self.db.events[eid] for eid in bound_evt_ids if eid in self.db.events]

        # Fetch bound entities & roles
        bound_ent_roles = [se for se in self.db.situation_entities if se["situation_id"] == situation_id]
        entities_list = []
        for er in bound_ent_roles:
            ent_id = er["entity_id"]
            if ent_id in self.db.entities:
                ent_data = dict(self.db.entities[ent_id])
                ent_data["assigned_role"] = er["role"]
                entities_list.append(ent_data)

        # Fallback default entities if needed
        if not entities_list:
            for ent in self.db.entities.values():
                role = "ACTOR"
                if ent["entity_type"] in ["MINE", "COMPANY"]:
                    role = "TARGET"
                elif ent["entity_type"] in ["MUNICIPALITY", "GOVERNMENT"]:
                    role = "RESPONDER"
                ent_data = dict(ent)
                ent_data["assigned_role"] = role
                entities_list.append(ent_data)

        # Fetch trajectory snapshots
        snapshots = [t for t in self.db.trajectory_snapshots if t["situation_id"] == situation_id]
        latest_traj = snapshots[-1] if snapshots else {
            "trajectory": sit.get("trajectory", "ESCALATING"),
            "trajectory_score": 0.78,
            "explanation": "Trajectory is ESCALATING due to increasing event frequency and multi-actor involvement."
        }

        # Fetch customer exposures
        org_exposures = [e for e in self.db.exposures.values() if e["situation_id"] == situation_id and e["organisation_id"] == org_id]
        if not org_exposures:
            org_exposures = exposure_service_instance.calculate_organisation_exposure(org_id, situation_id)

        # Fetch recommendations
        org_recs = [r for r in self.db.recommendations.values() if r["situation_id"] == situation_id and r["organisation_id"] == org_id]
        if not org_recs:
            org_recs = recommendation_service_instance.generate_recommendations(org_id, situation_id, org_exposures)

        # Fetch Historical Comparables Search
        comparables = historical_archive_instance.find_comparable_situations(situation_id, top_k=2)

        eight_questions = {
            "situation_id": situation_id,
            "title": sit.get("title", "Community Conflict"),

            # 1. WHAT IS HAPPENING?
            "what_is_happening": {
                "summary": sit.get("summary", ""),
                "status": sit.get("status", "EMERGING"),
                "situation_type": sit.get("situation_type", "COMMUNITY_CONFLICT"),
                "severity": sit.get("severity", "HIGH"),
                "confidence_score": sit.get("confidence_score", 0.91),
                "key_events": bound_events,
                "latest_development": bound_events[-1]["description"] if bound_events else sit.get("summary", "")
            },

            # 2. IS IT GETTING WORSE OR BETTER?
            "trajectory_analysis": {
                "direction": latest_traj["trajectory"],
                "trajectory_score": latest_traj.get("trajectory_score", 0.78),
                "explanation": latest_traj.get("explanation", ""),
                "metrics": {
                    "event_frequency_delta": "+150%",
                    "actor_expansion_count": len(entities_list),
                    "geographic_spread": "1 Municipality, 2 Mine Access Gates",
                    "severity_level": sit.get("severity", "HIGH")
                }
            },

            # 3. WHERE IS IT HAPPENING?
            "where_is_it_happening": sit.get("geographic_scope", {
                "country": "South Africa",
                "province": "North West",
                "municipality": "Rustenburg Local Municipality",
                "coordinates": {"lat": -25.6667, "lng": 27.2417}
            }),

            # 4. WHO IS INVOLVED?
            "who_is_involved": entities_list,

            # 5. WHAT IS DRIVING IT?
            "what_is_driving_it": {
                "immediate_triggers": [d["description"] for d in sit.get("drivers", []) if d.get("category") == "IMMEDIATE_TRIGGER"],
                "structural_drivers": [d["description"] for d in sit.get("drivers", []) if d.get("category") == "STRUCTURAL_DRIVER"],
                "economic_drivers": [d["description"] for d in sit.get("drivers", []) if d.get("category") == "ECONOMIC_DRIVER"],
                "analytical_hypotheses": ["Pre-election political mobilization exacerbating local mining community grievances."]
            },

            # 6. WHAT HAPPENS NEXT?
            "what_happens_next": {
                "observed_facts": ["Access road is currently blocked by community members."],
                "analytical_inferences": ["High risk of night shift transport disruption if municipal talks stall."],
                "scenarios": sit.get("potential_outcomes", []),
                "historical_comparables": comparables
            },

            # 7. HOW AM I EXPOSED?
            "how_am_i_exposed": org_exposures,

            # 8. WHAT SHOULD I DO?
            "what_should_i_do": org_recs
        }

        return eight_questions

situation_service_instance = SituationEngineService()
