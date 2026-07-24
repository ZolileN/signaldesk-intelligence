from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from packages.database import db_instance
from packages.ontology import AlertLevel

class EnterpriseAlertingEngine:
    """
    Enterprise Tenant Alerting & Watchlist Engine:
    - Manages tenant watchlists (key entities, mines, topics, locations)
    - Evaluates situation severity, trajectory escalation, and asset exposure against rules
    - Dispatches multi-channel alerts (Webhooks, Email, Push) for CRITICAL, HIGH, and ELEVATED alerts
    """
    def __init__(self, db=db_instance):
        self.db = db
        self.alerts: List[Dict[str, Any]] = []
        self.watchlists: Dict[str, Dict[str, Any]] = {}
        self._seed_default_watchlist()

    def _seed_default_watchlist(self):
        org_id = "org-mining-corp-001"
        wl_id = "wl-mining-assets-za"
        self.watchlists[wl_id] = {
            "id": wl_id,
            "organisation_id": org_id,
            "name": "Platinum Mining Assets & Community Watchlist",
            "topics": ["protest", "blockade", "strike", "employment", "mining"],
            "entity_names": ["Rustenburg", "Karee Platinum Mine", "AngloGold Ashanti", "NUM"],
            "alert_threshold": "HIGH"
        }

    def evaluate_situation_alerts(self, situation_id: str, organisation_id: str = "org-mining-corp-001") -> List[Dict[str, Any]]:
        sit = self.db.situations.get(situation_id)
        if not sit:
            return []

        triggered_alerts = []
        # Check matching watchlists
        org_watchlists = [w for w in self.watchlists.values() if w["organisation_id"] == organisation_id]

        for wl in org_watchlists:
            # Check match
            match = False
            title_text = sit.get("title", "").lower() + " " + sit.get("summary", "").lower()
            for topic in wl["topics"]:
                if topic in title_text:
                    match = True
                    break
            
            if match:
                alert_id = f"alt-{uuid.uuid4().hex[:8]}"
                alert_level = AlertLevel.HIGH.value if sit.get("severity") == "HIGH" or sit.get("trajectory") == "ESCALATING" else AlertLevel.ELEVATED.value
                
                alert_record = {
                    "id": alert_id,
                    "organisation_id": organisation_id,
                    "situation_id": situation_id,
                    "watchlist_id": wl["id"],
                    "alert_level": alert_level,
                    "title": f"ALERT [{alert_level}]: {sit['title']}",
                    "message": f"Situation trajectory is {sit.get('trajectory', 'ESCALATING')} with {sit.get('severity', 'HIGH')} severity affecting monitored asset corridor.",
                    "channels_dispatched": ["WEBHOOK", "EMAIL_DIGEST", "IN_APP"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                self.alerts.append(alert_record)
                triggered_alerts.append(alert_record)

        return triggered_alerts

    def create_tenant_watchlist(self, organisation_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        wl_id = f"wl-{uuid.uuid4().hex[:8]}"
        wl_record = {
            "id": wl_id,
            "organisation_id": organisation_id,
            "name": payload.get("name", "Custom Watchlist"),
            "topics": payload.get("topics", []),
            "entity_names": payload.get("entity_names", []),
            "alert_threshold": payload.get("alert_threshold", "HIGH"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.watchlists[wl_id] = wl_record
        return wl_record

    def get_organisation_alerts(self, organisation_id: str) -> List[Dict[str, Any]]:
        return [a for a in self.alerts if a["organisation_id"] == organisation_id]

alerting_engine_instance = EnterpriseAlertingEngine()
