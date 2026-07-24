import hashlib
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from packages.database import db_instance
from packages.ontology import ContentType, SourceType

class IngestionService:
    """
    Ingestion Layer: Converts incoming raw news payloads (from VectaNews)
    and radio broadcast transcripts into canonical immutable Observations.
    Preserves original source, content, URL, hash, and metadata.
    """
    def __init__(self, db=db_instance):
        self.db = db

    def ingest_vectanews_article(self, article_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adapts VectaNews article payload into SignalDesk Observation.
        """
        source_name = article_payload.get("publication", "VectaNews Feed")
        
        # Resolve or register source
        source_id = None
        for s in self.db.sources.values():
            if s["name"].lower() == source_name.lower():
                source_id = s["id"]
                break
        
        if not source_id:
            source_id = self.db.add_source({
                "name": source_name,
                "source_type": SourceType.NEWS_PUBLICATION.value,
                "country_code": article_payload.get("country_code", "ZA"),
                "url": article_payload.get("source_url"),
                "reliability_score": 0.88
            })

        obs_record = self.db.add_observation({
            "source_id": source_id,
            "content_type": ContentType.ARTICLE.value,
            "title": article_payload.get("headline") or article_payload.get("title"),
            "raw_content": article_payload.get("body") or article_payload.get("content"),
            "source_url": article_payload.get("url") or article_payload.get("source_url"),
            "published_at": article_payload.get("published_at"),
            "language_code": article_payload.get("language", "en"),
            "country_code": article_payload.get("country_code", "ZA"),
            "metadata": {
                "author": article_payload.get("author"),
                "ingested_via": "VectaNews_Adapter",
                "categories": article_payload.get("categories", [])
            }
        })

        # Record provenance
        self.db.record_model_run(
            model_name="vectanews-ingestion-adapter",
            version="1.0.0",
            input_type="VectaNewsArticlePayload",
            input_id=article_payload.get("article_id"),
            output={"observation_id": obs_record["id"], "content_hash": obs_record["content_hash"]},
            confidence=1.00
        )

        return obs_record

    def ingest_radio_segment(self, radio_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adapts Radio Sensor continuous broadcast segment transcript into SignalDesk Observation.
        """
        station_name = radio_payload.get("station_name", "SAFM Radio")
        
        source_id = None
        for s in self.db.sources.values():
            if s["name"].lower() == station_name.lower():
                source_id = s["id"]
                break
        
        if not source_id:
            source_id = self.db.add_source({
                "name": station_name,
                "source_type": SourceType.RADIO_STATION.value,
                "country_code": radio_payload.get("country_code", "ZA"),
                "reliability_score": 0.90
            })

        obs_record = self.db.add_observation({
            "source_id": source_id,
            "content_type": ContentType.AUDIO.value,
            "title": f"Radio Broadcast Segment - {station_name} ({radio_payload.get('broadcast_time', 'Top of Hour')})",
            "transcript": radio_payload.get("transcript"),
            "published_at": radio_payload.get("broadcast_time") or datetime.now(timezone.utc).isoformat(),
            "language_code": radio_payload.get("language_code", "en"),
            "country_code": radio_payload.get("country_code", "ZA"),
            "metadata": {
                "audio_reference": radio_payload.get("audio_file_uri"),
                "duration_seconds": radio_payload.get("duration_seconds", 180),
                "bulletin_type": radio_payload.get("bulletin_type", "NEWS_BULLETIN")
            }
        })

        return obs_record

ingestion_service_instance = IngestionService()
