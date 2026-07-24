from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from packages.database import db_instance
from packages.ontology import SourceType

# Target SABC Public Broadcast Radio Stations for South African Multilingual Intelligence
SABC_RADIO_STATIONS = [
    {
        "call_sign": "SAfm",
        "name": "SAfm 104-107 FM (National English Talk)",
        "language_code": "en",
        "language_name": "English",
        "stream_url": "https://icecast.sabc.co.za/safm-mp3",
        "timezone": "Africa/Johannesburg",
        "monitoring_priority": 100,
        "schedule": {
            "top_of_hour_bulletin": True,
            "news_blocks": ["06:00-09:00", "12:00-13:00", "17:00-19:00"],
            "key_programmes": ["First Take SA", "The Midday Report", "PM Live"]
        }
    },
    {
        "call_sign": "Ukhozi FM",
        "name": "Ukhozi FM 90.8-107.4 (isiZulu National)",
        "language_code": "zu",
        "language_name": "isiZulu",
        "stream_url": "https://icecast.sabc.co.za/ukhozifm-mp3",
        "timezone": "Africa/Johannesburg",
        "monitoring_priority": 100,
        "schedule": {
            "top_of_hour_bulletin": True,
            "news_blocks": ["06:00-09:00", "12:00-13:00", "18:00-19:00"],
            "key_programmes": ["Ezasekhaya", "Indaba Zembizo", "Izindaba Top of Hour"]
        }
    },
    {
        "call_sign": "Umhlobo Wenene FM",
        "name": "Umhlobo Wenene FM (isiXhosa National)",
        "language_code": "xh",
        "language_name": "isiXhosa",
        "stream_url": "https://icecast.sabc.co.za/umhlobowenenefm-mp3",
        "timezone": "Africa/Johannesburg",
        "monitoring_priority": 95,
        "schedule": {
            "top_of_hour_bulletin": True,
            "news_blocks": ["06:00-09:00", "13:00-14:00", "18:00-19:00"],
            "key_programmes": ["Lalela Mzansi", "Izindaba ze-Xhosa", "Lwesine Discussion"]
        }
    },
    {
        "call_sign": "RSG",
        "name": "RSG - Radio Sonder Grense (Afrikaans)",
        "language_code": "af",
        "language_name": "Afrikaans",
        "stream_url": "https://icecast.sabc.co.za/rsg-mp3",
        "timezone": "Africa/Johannesburg",
        "monitoring_priority": 95,
        "schedule": {
            "top_of_hour_bulletin": True,
            "news_blocks": ["06:00-08:30", "12:00-13:00", "17:00-18:30"],
            "key_programmes": ["Monitor", "Spektrumbulletin", "RSG Nuus"]
        }
    },
    {
        "call_sign": "Radio 2000",
        "name": "Radio 2000 (English/Multilingual Talk & Sport)",
        "language_code": "en",
        "language_name": "English / Multilingual",
        "stream_url": "https://icecast.sabc.co.za/radio2000-mp3",
        "timezone": "Africa/Johannesburg",
        "monitoring_priority": 85,
        "schedule": {
            "top_of_hour_bulletin": True,
            "news_blocks": ["07:00-09:00", "13:00-14:00", "17:00-18:00"],
            "key_programmes": ["Drive Time 2000", "National News Roundup"]
        }
    }
]

class RadioStationRegistry:
    """
    Registry for managing continuous radio broadcast sensors across South Africa.
    Tracks station health, streaming endpoints, timezones, and schedules.
    """
    def __init__(self, db=db_instance):
        self.db = db
        self.register_default_stations()

    def register_default_stations(self):
        for st in SABC_RADIO_STATIONS:
            # Check existing source by name
            existing_src = None
            for s in self.db.sources.values():
                if s["name"] == st["name"] or s.get("call_sign") == st["call_sign"]:
                    existing_src = s
                    break

            if not existing_src:
                src_id = f"src-radio-{st['call_sign'].lower().replace(' ', '-')}"
                self.db.sources[src_id] = {
                    "id": src_id,
                    "name": st["name"],
                    "call_sign": st["call_sign"],
                    "source_type": SourceType.RADIO_STATION.value,
                    "country_code": "ZA",
                    "language_codes": [st["language_code"]],
                    "url": st["stream_url"],
                    "reliability_score": 0.94,
                    "active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

    def list_registered_stations(self) -> List[Dict[str, Any]]:
        stations = []
        for s in self.db.sources.values():
            if s.get("source_type") == SourceType.RADIO_STATION.value:
                # Attach match schedule from SABC list
                matched_config = next((c for c in SABC_RADIO_STATIONS if c["call_sign"] == s.get("call_sign")), {})
                st_data = dict(s)
                st_data.update(matched_config)
                stations.append(st_data)
        return stations

    def get_station_by_callsign(self, call_sign: str) -> Optional[Dict[str, Any]]:
        for st in self.list_registered_stations():
            if st["call_sign"].lower() == call_sign.lower():
                return st
        return None

radio_registry_instance = RadioStationRegistry()
