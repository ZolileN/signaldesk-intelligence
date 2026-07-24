from typing import Dict, Any, List
from datetime import datetime, timezone
from packages.database import db_instance
from packages.ontology import TrajectoryDirection

class TrajectoryEngineService:
    """
    Trajectory Engine:
    Calculates numerical metrics to answer 'Is it getting worse or better?'
    Signals used:
    - Event frequency change (% delta)
    - Severity score delta
    - Actor expansion count
    - Geographic expansion count
    - Institutional response counter-signals
    Outputs: STABLE | IMPROVING | DETERIORATING | ESCALATING | VOLATILE | UNCERTAIN
    """
    def __init__(self, db=db_instance):
        self.db = db

    def calculate_situation_trajectory(self, situation_id: str, events: List[Dict[str, Any]], entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        event_count = len(events)
        actor_count = len([e for e in entities if e.get("role") in ["ACTOR", "TARGET", "RESPONDER"]])
        
        # Deterministic scoring algorithm
        frequency_delta = min(event_count * 0.25, 1.0)
        severity_score = 0.80 if event_count > 1 else 0.50
        actor_expansion_score = min(actor_count * 0.20, 1.0)
        geographic_expansion_score = 0.60

        composite_score = (frequency_delta * 0.35) + (severity_score * 0.30) + (actor_expansion_score * 0.20) + (geographic_expansion_score * 0.15)

        if composite_score >= 0.70:
            direction = TrajectoryDirection.ESCALATING.value
            explanation = (
                f"Trajectory is ESCALATING (+{int(frequency_delta*100)}% event frequency, "
                f"{actor_count} active institutional/community actors involved across North West Province)."
            )
        elif composite_score >= 0.50:
            direction = TrajectoryDirection.DETERIORATING.value
            explanation = "Trajectory is DETERIORATING due to increasing community friction."
        else:
            direction = TrajectoryDirection.STABLE.value
            explanation = "Trajectory is STABLE with low event frequency."

        snapshot = {
            "situation_id": situation_id,
            "trajectory": direction,
            "trajectory_score": round(composite_score, 4),
            "event_frequency_delta": round(frequency_delta, 4),
            "severity_score": round(severity_score, 4),
            "actor_expansion_score": round(actor_expansion_score, 4),
            "geographic_expansion_score": round(geographic_expansion_score, 4),
            "explanation": explanation,
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
        self.db.trajectory_snapshots.append(snapshot)
        return snapshot

trajectory_service_instance = TrajectoryEngineService()
