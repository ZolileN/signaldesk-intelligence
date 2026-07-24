import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.ingestion.vectanews_scraper import vectanews_scraper_instance
from services.ingestion.syndication_dedup import dedup_engine_instance
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance
from packages.ai.vector_search import vector_search_instance
from services.event_detection.causality_graph import causality_graph_instance
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

def test_media_outlets_50_percent_south_africa_distribution():
    dist = vectanews_scraper_instance.get_outlet_distribution()
    
    assert dist["south_africa_outlets_count"] == 8
    assert dist["rest_of_africa_outlets_count"] == 8
    assert dist["south_africa_percentage"] == "50%"
    assert dist["rest_of_africa_percentage"] == "50%"

def test_syndication_deduplication_engine():
    text1 = "Community protest blockades Karee Mine access road in Rustenburg."
    text2 = "Community protest blockades Karee Mine access road in Rustenburg."
    
    is_dup1, _, _ = dedup_engine_instance.is_syndicated_duplicate(text1)
    assert is_dup1 is False

    is_dup2, _, _ = dedup_engine_instance.is_syndicated_duplicate(text2)
    assert is_dup2 is True

def test_pgvector_semantic_search():
    seed_test_data()
    query = "platinum mine community blockade"
    results = vector_search_instance.search_similar_situations(query, top_k=2)
    
    assert len(results) > 0
    assert "similarity_score" in results[0]
    assert results[0]["similarity_score"] > 0.0

def test_event_causality_graph():
    seed_test_data()
    sits = list(db_instance.situations.keys())
    sit_id = sits[0]
    
    graph = causality_graph_instance.get_event_graph_for_situation(sit_id)
    assert len(graph) > 0
    assert graph[0]["relationship_type"] in ["TRIGGERS", "CAUSES", "ESCALATES", "CORROBORATES"]

if __name__ == "__main__":
    seed_test_data()
    test_media_outlets_50_percent_south_africa_distribution()
    test_syndication_deduplication_engine()
    test_pgvector_semantic_search()
    test_event_causality_graph()
    print("ALL PHASE 5 & PHASE 6 TESTS PASSED CLEANLY!")
