from typing import Dict, Any, List
from packages.database import db_instance
from packages.ontology import AlertLevel

class RecommendationService:
    """
    Recommendation Engine:
    Translates situation intelligence and customer exposure into actionable recommendations
    with Urgency, Reason, Confidence, and Evidence provenance.
    """
    def __init__(self, db=db_instance):
        self.db = db

    def generate_recommendations(self, org_id: str, situation_id: str, exposures: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        recs = []
        if any(e["exposure_type"] == "OPERATIONAL" for e in exposures):
            r1_id = f"rec-op-01-{situation_id[:8]}"
            rec1 = {
                "id": r1_id,
                "organisation_id": org_id,
                "situation_id": situation_id,
                "recommendation_text": "Activate secondary access routes for Karee Mine shift transport and notify logistics team.",
                "urgency": AlertLevel.HIGH.value,
                "reason": "Primary access road is blocked by community protest.",
                "confidence_score": 0.92
            }
            self.db.recommendations[r1_id] = rec1
            recs.append(rec1)

            r2_id = f"rec-comm-02-{situation_id[:8]}"
            rec2 = {
                "id": r2_id,
                "organisation_id": org_id,
                "situation_id": situation_id,
                "recommendation_text": "Initiate early dialogue with Rustenburg Community Action Forum representatives and local municipal mediators.",
                "urgency": AlertLevel.ELEVATED.value,
                "reason": "Protest drivers center around unfulfilled local employment agreements.",
                "confidence_score": 0.88
            }
            self.db.recommendations[r2_id] = rec2
            recs.append(rec2)

        return recs

recommendation_service_instance = RecommendationService()
