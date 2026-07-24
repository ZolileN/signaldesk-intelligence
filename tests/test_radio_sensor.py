import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.radio_sensor.station_registry import radio_registry_instance
from services.transcription.asr_engine import asr_engine_instance
from services.radio_sensor.radio_pipeline import radio_pipeline_instance
from packages.database import db_instance

def test_radio_station_registration():
    stations = radio_registry_instance.list_registered_stations()
    call_signs = [s["call_sign"] for s in stations]
    
    # Assert SAfm, Ukhozi FM, Umhlobo Wenene FM, RSG, and Radio 2000 are registered
    assert "SAfm" in call_signs
    assert "Ukhozi FM" in call_signs
    assert "Umhlobo Wenene FM" in call_signs
    assert "RSG" in call_signs
    assert "Radio 2000" in call_signs

def test_multilingual_asr_transcription():
    # Test isiZulu ASR for Ukhozi FM
    zu_res = asr_engine_instance.transcribe_audio_segment("audio_zu.mp3", language_code="zu")
    assert zu_res["language_name"] == "isiZulu"
    assert "Rustenburg" in zu_res["original_transcript"]
    assert "Rustenburg" in zu_res["translated_english"]

    # Test isiXhosa ASR for Umhlobo Wenene FM
    xh_res = asr_engine_instance.transcribe_audio_segment("audio_xh.mp3", language_code="xh")
    assert xh_res["language_name"] == "isiXhosa"
    assert "Rustenburg" in xh_res["original_transcript"]

    # Test Afrikaans ASR for RSG
    af_res = asr_engine_instance.transcribe_audio_segment("audio_af.mp3", language_code="af")
    assert af_res["language_name"] == "Afrikaans"
    assert "Platina-myn" in af_res["original_transcript"]

def test_full_radio_stream_capture_pipeline():
    # Trigger live capture & ASR processing for Ukhozi FM
    result = radio_pipeline_instance.trigger_station_stream_capture("Ukhozi FM")
    assert result["status"] == "CAPTURED_AND_PROCESSED"
    assert result["call_sign"] == "Ukhozi FM"
    assert result["language"] == "isiZulu"
    assert result["bound_situation_id"] is not None

    # Trigger live capture for RSG (Afrikaans)
    rsg_result = radio_pipeline_instance.trigger_station_stream_capture("RSG")
    assert rsg_result["status"] == "CAPTURED_AND_PROCESSED"
    assert rsg_result["language"] == "Afrikaans"

if __name__ == "__main__":
    test_radio_station_registration()
    test_multilingual_asr_transcription()
    test_full_radio_stream_capture_pipeline()
    print("ALL RADIO SENSOR & MULTILINGUAL ASR TESTS PASSED CLEANLY!")
