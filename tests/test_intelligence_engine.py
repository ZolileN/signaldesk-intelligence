import sys
import os
import pytest

# Add workspace to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.database import db_instance
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance

def test_ingestion_preserves_immutability_and_hash():
    payload = {
        "publication": "VectaNews Test",
        "headline": "Test Protests in Rustenburg",
        "content": "A community protest occurred at Karee Mine in Rustenburg.",
        "country_code": "ZA"
    }
    obs = ingestion_service_instance.ingest_vectanews_article(payload)
    assert obs["id"] is not None
    assert obs["content_hash"] is not None

    # Test deduplication
    obs_dup = ingestion_service_instance.ingest_vectanews_article(payload)
    assert obs["id"] == obs_dup["id"]

def test_full_ingestion_to_situation_vertical_slice():
    payload = {
        "publication": "SA News Daily",
        "headline": "Community Blockades Platinum Mine Transport Route",
        "content": (
            "Protesters from Rustenburg Community Action Forum have blocked Karee Platinum Mine roads "
            "demanding employment agreements. Rustenburg Municipality and Police are monitoring."
        ),
        "country_code": "ZA"
    }
    obs = ingestion_service_instance.ingest_vectanews_article(payload)
    sit = situation_service_instance.process_observation_to_situation(obs["id"])
    
    assert sit["id"] is not None
    assert sit["title"] is not None
    assert sit["situation_type"] == "COMMUNITY_CONFLICT"

def test_eight_question_intelligence_api_structure():
    sits = list(db_instance.situations.values())
    assert len(sits) > 0
    sit_id = sits[0]["id"]

    intel = situation_service_instance.get_eight_question_intelligence(sit_id, "org-mining-corp-001")
    
    # Assert all 8 core questions are present in output payload
    assert "what_is_happening" in intel
    assert "trajectory_analysis" in intel
    assert "where_is_it_happening" in intel
    assert "who_is_involved" in intel
    assert "what_is_driving_it" in intel
    assert "what_happens_next" in intel
    assert "how_am_i_exposed" in intel
    assert "what_should_i_do" in intel

    # Assert specific intelligence keys
    assert intel["what_is_happening"]["status"] is not None
    assert intel["trajectory_analysis"]["direction"] in ["STABLE", "IMPROVING", "DETERIORATING", "ESCALATING", "VOLATILE", "UNCERTAIN"]
    assert len(intel["who_is_involved"]) > 0
    assert len(intel["how_am_i_exposed"]) > 0
    assert len(intel["what_should_i_do"]) > 0

if __name__ == "__main__":
    test_ingestion_preserves_immutability_and_hash()
    test_full_ingestion_to_situation_vertical_slice()
    test_eight_question_intelligence_api_structure()
    print("ALL INTELLIGENCE ENGINE TESTS PASSED CLEANLY!")
