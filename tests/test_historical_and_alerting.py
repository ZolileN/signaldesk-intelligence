import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.situation_engine.historical_archive import historical_archive_instance
from services.alerting.alert_service import alerting_engine_instance
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance
from packages.database import db_instance

def seed_test_data():
    if not db_instance.situations:
        obs = ingestion_service_instance.ingest_vectanews_article({
            "publication": "News24 South Africa",
            "headline": "Karee Platinum Mine Community Blockade",
            "content": "Protesters blocked Karee Platinum Mine roads demanding employment in Rustenburg.",
            "country_code": "ZA"
        })
        situation_service_instance.process_observation_to_situation(obs["id"])

def test_historical_comparables_search():
    seed_test_data()
    sit_id = list(db_instance.situations.keys())[0]
    
    comparables = historical_archive_instance.find_comparable_situations(sit_id, top_k=2)
    assert len(comparables) > 0
    assert "historical_outcome" in comparables[0]
    assert "similarity_score" in comparables[0]

def test_enterprise_tenant_alerting():
    seed_test_data()
    sit_id = list(db_instance.situations.keys())[0]
    org_id = "org-mining-corp-001"
    
    alerts = alerting_engine_instance.evaluate_situation_alerts(sit_id, org_id)
    assert len(alerts) > 0
    assert alerts[0]["alert_level"] in ["HIGH", "CRITICAL", "ELEVATED"]

def test_create_watchlist_rule():
    org_id = "org-mining-corp-001"
    wl = alerting_engine_instance.create_tenant_watchlist(org_id, {
        "name": "Rustenburg Smelter Operations",
        "topics": ["smelter", "electricity", "eskom"],
        "entity_names": ["Rustenburg Smelter"],
        "alert_threshold": "HIGH"
    })
    assert wl["id"] is not None
    assert wl["organisation_id"] == org_id

if __name__ == "__main__":
    seed_test_data()
    test_historical_comparables_search()
    test_enterprise_tenant_alerting()
    test_create_watchlist_rule()
    print("ALL HISTORICAL ARCHIVE & ENTERPRISE ALERTING TESTS PASSED CLEANLY!")
