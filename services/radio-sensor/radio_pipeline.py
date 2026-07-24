from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from packages.database import db_instance
from services.radio_sensor.station_registry import radio_registry_instance
from services.transcription.asr_engine import asr_engine_instance
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance

class RadioSensorPipeline:
    """
    Continuous Radio Sensor Pipeline:
    1. Monitors registered South African radio streams (SAfm, Ukhozi FM, Umhlobo Wenene FM, RSG, Radio 2000).
    2. Captures audio segments.
    3. Runs Multilingual ASR for English, isiZulu, isiXhosa, and Afrikaans.
    4. Filters out music/ads, retaining News Bulletins & Current Affairs.
    5. Ingests transcripts as immutable Observations.
    6. Triggers downstream entity extraction, event detection, and situation graph updates.
    """
    def __init__(self, db=db_instance):
        self.db = db

    def trigger_station_stream_capture(self, call_sign: str, duration_seconds: int = 180) -> Dict[str, Any]:
        st = radio_registry_instance.get_station_by_callsign(call_sign)
        if not st:
            raise ValueError(f"Station with call sign '{call_sign}' not found in registry")

        lang = st.get("language_code", "en")
        audio_ref = f"s3://signaldesk-radio-audio-archive/{st['call_sign'].lower()}/{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"

        # 1. Run ASR transcription
        asr_result = asr_engine_instance.transcribe_audio_segment(audio_ref, language_code=lang)

        # 2. Ingest into Observation store
        obs_payload = {
            "station_name": st["name"],
            "call_sign": st["call_sign"],
            "transcript": asr_result["translated_english"],
            "broadcast_time": datetime.now(timezone.utc).isoformat(),
            "language_code": lang,
            "country_code": "ZA",
            "audio_file_uri": audio_ref,
            "duration_seconds": duration_seconds,
            "bulletin_type": asr_result["content_classification"]
        }
        obs = ingestion_service_instance.ingest_radio_segment(obs_payload)

        # Attach original native transcript in metadata
        self.db.observations[obs["id"]]["metadata"]["native_transcript"] = asr_result["original_transcript"]
        self.db.observations[obs["id"]]["metadata"]["language_name"] = asr_result["language_name"]

        # 3. Trigger downstream Situation Engine
        situation = situation_service_instance.process_observation_to_situation(obs["id"])

        return {
            "status": "CAPTURED_AND_PROCESSED",
            "station": st["name"],
            "call_sign": st["call_sign"],
            "language": asr_result["language_name"],
            "observation_id": obs["id"],
            "native_transcript": asr_result["original_transcript"],
            "translated_english": asr_result["translated_english"],
            "bound_situation_id": situation["id"],
            "situation_title": situation["title"]
        }

radio_pipeline_instance = RadioSensorPipeline()
