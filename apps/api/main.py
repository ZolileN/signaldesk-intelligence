from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import os

from packages.database import db_instance
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance
from services.radio_sensor.station_registry import radio_registry_instance
from services.radio_sensor.radio_pipeline import radio_pipeline_instance
from services.ingestion.vectanews_scraper import vectanews_scraper_instance
from services.ingestion.government_publications import sa_government_engine_instance, BENCHMARK_GOVT_NOTICES
from services.ingestion.political_parties import political_parties_engine_instance, BENCHMARK_POLITICAL_STATEMENTS
from services.event_detection.causality_graph import causality_graph_instance
from services.situation_engine.historical_archive import historical_archive_instance
from services.alerting.alert_service import alerting_engine_instance
from packages.ai.vector_search import vector_search_instance

app = FastAPI(
    title="SignalDesk Africa Intelligence Engine API",
    description="African-First Situation Intelligence Infrastructure Platform answering eight core questions.",
    version="1.0.0"
)

# Enable CORS for Web App frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize seed data on startup
@app.on_event("startup")
def startup_event():
    benchmark_payload = {
        "publication": "News24 South Africa",
        "headline": "Rustenburg Community Blockades Karee Platinum Mine Access Road Demanding Jobs",
        "content": (
            "Protesters from the Rustenburg Community Action Forum have blocked main transport routes "
            "leading to AngloGold Ashanti Karee Platinum Mine operations today. Community leaders stated that "
            "local employment agreements negotiated last year remain unfulfilled. Local police and Rustenburg "
            "Local Municipality representatives are on-site monitoring the situation as morning shift transport was delayed."
        ),
        "source_url": "https://www.news24.com/articles/rustenburg-mine-blockade-2026",
        "country_code": "ZA"
    }
    obs = ingestion_service_instance.ingest_vectanews_article(benchmark_payload)
    situation_service_instance.process_observation_to_situation(obs["id"])

    # Seed radio streams
    radio_pipeline_instance.trigger_station_stream_capture("Ukhozi FM")
    radio_pipeline_instance.trigger_station_stream_capture("SAfm")

    # Ingest benchmark official South African Government Notice
    sa_government_engine_instance.ingest_government_notice(BENCHMARK_GOVT_NOTICES[0])

    # Ingest benchmark South African Political Party Statement
    political_parties_engine_instance.ingest_political_statement(BENCHMARK_POLITICAL_STATEMENTS[0])

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "platform": "SignalDesk Africa",
        "version": "1.0.0",
        "database": "CONNECTED",
        "situations_count": len(db_instance.situations),
        "observations_count": len(db_instance.observations),
        "media_outlets_monitored": len(vectanews_scraper_instance.outlets),
        "radio_stations_monitored": len(radio_registry_instance.list_registered_stations()),
        "government_sources_monitored": len(sa_government_engine_instance.list_government_publications()),
        "political_parties_monitored": len(political_parties_engine_instance.get_party_distribution()["parties"]),
        "alerts_count": len(alerting_engine_instance.alerts)
    }

@app.get("/api/v1/political/parties")
def list_political_parties():
    """
    List registered African political parties (60% South Africa, 40% Rest of Sub-Saharan Africa).
    """
    return political_parties_engine_instance.get_party_distribution()

@app.post("/api/v1/political/ingest")
def ingest_political_statement(payload: Dict[str, Any]):
    """
    Ingest official political party statement or media declaration.
    """
    result = political_parties_engine_instance.ingest_political_statement(payload)
    return result

@app.get("/api/v1/government/publications")
def list_government_publications():
    return sa_government_engine_instance.list_government_publications()

@app.post("/api/v1/government/ingest")
def ingest_government_notice(payload: Dict[str, Any]):
    result = sa_government_engine_instance.ingest_government_notice(payload)
    return result

@app.get("/api/v1/news/outlets")
def list_media_outlets():
    return vectanews_scraper_instance.get_outlet_distribution()

@app.post("/api/v1/search/vector")
def vector_search_situations(payload: Dict[str, Any]):
    query = payload.get("query", "mining community protest disruption")
    top_k = payload.get("top_k", 3)
    results = vector_search_instance.search_similar_situations(query, top_k=top_k)
    return {"query": query, "results": results}

@app.get("/api/v1/graph/situations/{situation_id}/causality")
def get_situation_causality_graph(situation_id: str):
    graph = causality_graph_instance.get_event_graph_for_situation(situation_id)
    return {"situation_id": situation_id, "causality_relationships": graph}

@app.post("/api/v1/situations/comparables")
def get_historical_comparables(payload: Dict[str, Any]):
    situation_id = payload.get("situation_id")
    top_k = payload.get("top_k", 2)
    comparables = historical_archive_instance.find_comparable_situations(situation_id, top_k=top_k)
    return {"situation_id": situation_id, "historical_comparables": comparables}

@app.post("/api/v1/organisations/{organisation_id}/watchlists")
def create_tenant_watchlist(organisation_id: str, payload: Dict[str, Any]):
    wl = alerting_engine_instance.create_tenant_watchlist(organisation_id, payload)
    return wl

@app.get("/api/v1/organisations/{organisation_id}/alerts")
def get_tenant_alerts(organisation_id: str):
    alerts = alerting_engine_instance.get_organisation_alerts(organisation_id)
    return alerts

@app.get("/api/v1/radio/stations")
def list_radio_stations():
    return radio_registry_instance.list_registered_stations()

@app.post("/api/v1/radio/stations/{call_sign}/trigger-capture")
def trigger_radio_capture(call_sign: str):
    try:
        result = radio_pipeline_instance.trigger_station_stream_capture(call_sign)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/v1/observations/ingest")
def ingest_observation(payload: Dict[str, Any]):
    if "transcript" in payload:
        obs = ingestion_service_instance.ingest_radio_segment(payload)
    else:
        obs = ingestion_service_instance.ingest_vectanews_article(payload)
    
    sit = situation_service_instance.process_observation_to_situation(obs["id"])
    return {
        "status": "SUCCESS",
        "observation_id": obs["id"],
        "content_hash": obs["content_hash"],
        "bound_situation_id": sit["id"]
    }

@app.get("/api/v1/situations")
def list_situations():
    return list(db_instance.situations.values())

@app.get("/api/v1/situations/{situation_id}/intelligence")
def get_eight_question_intelligence(
    situation_id: str,
    organisation_id: Optional[str] = Query("org-mining-corp-001")
):
    intelligence = situation_service_instance.get_eight_question_intelligence(situation_id, organisation_id)
    if not intelligence:
        raise HTTPException(status_code=404, detail="Intelligence model for situation not found")
    return intelligence
