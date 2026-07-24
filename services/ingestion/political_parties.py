from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from packages.database import db_instance
from packages.ontology import SourceType, ContentType, EntityType
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance

# Political Party Media & Statement Channels Registry (60% SA / 40% Rest of Africa)
POLITICAL_PARTIES_REGISTRY = [
    # --- 60% SOUTH AFRICAN POLITICAL PARTIES ---
    {
        "id": "src-pol-anc",
        "name": "African National Congress (ANC) Official Statements",
        "party_code": "ANC",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://www.anc1912.org.za",
        "reliability_score": 0.94,
        "is_south_african": True
    },
    {
        "id": "src-pol-da",
        "name": "Democratic Alliance (DA) Federal Media",
        "party_code": "DA",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://www.da.org.za",
        "reliability_score": 0.94,
        "is_south_african": True
    },
    {
        "id": "src-pol-eff",
        "name": "Economic Freedom Fighters (EFF) Central Command",
        "party_code": "EFF",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://effonline.org",
        "reliability_score": 0.93,
        "is_south_african": True
    },
    {
        "id": "src-pol-mk",
        "name": "uMkhonto weSizwe Party (MK Party) Media Office",
        "party_code": "MKP",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://mkparty.org.za",
        "reliability_score": 0.92,
        "is_south_african": True
    },
    {
        "id": "src-pol-ifp",
        "name": "Inkatha Freedom Party (IFP) Information Center",
        "party_code": "IFP",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://www.ifp.org.za",
        "reliability_score": 0.93,
        "is_south_african": True
    },
    {
        "id": "src-pol-actionsa",
        "name": "ActionSA National Communications",
        "party_code": "ACTIONSA",
        "country_code": "ZA",
        "country_name": "South Africa",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://www.actionsa.org.za",
        "reliability_score": 0.92,
        "is_south_african": True
    },

    # --- 40% REST OF SUB-SAHARAN AFRICA POLITICAL PARTIES ---
    {
        "id": "src-pol-apc",
        "name": "All Progressives Congress (APC Nigeria)",
        "party_code": "APC",
        "country_code": "NG",
        "country_name": "Nigeria",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://officialapcng.org",
        "reliability_score": 0.91,
        "is_south_african": False
    },
    {
        "id": "src-pol-uda",
        "name": "United Democratic Alliance (UDA Kenya)",
        "party_code": "UDA",
        "country_code": "KE",
        "country_name": "Kenya",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://uda.ke",
        "reliability_score": 0.91,
        "is_south_african": False
    },
    {
        "id": "src-pol-upnd",
        "name": "United Party for National Development (UPND Zambia)",
        "party_code": "UPND",
        "country_code": "ZM",
        "country_name": "Zambia",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://upndzambia.org",
        "reliability_score": 0.91,
        "is_south_african": False
    },
    {
        "id": "src-pol-udps",
        "name": "UDPS Union for Democracy and Social Progress (DRC)",
        "party_code": "UDPS",
        "country_code": "CD",
        "country_name": "Democratic Republic of Congo",
        "source_type": SourceType.SOCIAL_ACCOUNT.value,
        "url": "https://udps.cd",
        "reliability_score": 0.90,
        "is_south_african": False
    }
]

BENCHMARK_POLITICAL_STATEMENTS = [
    {
        "party_id": "src-pol-eff",
        "party_name": "Economic Freedom Fighters (EFF)",
        "title": "EFF Statement on Mining Community Grievances in Rustenburg",
        "content": (
            "The Economic Freedom Fighters stands in solidarity with the youth of Rustenburg protesting "
            "for employment opportunities at Karee Platinum Mine. We call on mining corporations to honor local "
            "procurement agreements and demand immediate municipal intervention to prevent conflict escalation."
        ),
        "published_at": datetime.now(timezone.utc).isoformat(),
        "country_code": "ZA"
    }
]

class PoliticalPartyStatementsEngine:
    """
    Ingestion Engine for African Political Parties Statements & Declarations.
    Enforces 60% South African political parties / 40% Rest of Sub-Saharan Africa ratio.
    """
    def __init__(self, db=db_instance):
        self.db = db
        self.register_parties()

    def register_parties(self):
        for party in POLITICAL_PARTIES_REGISTRY:
            if party["id"] not in self.db.sources:
                self.db.sources[party["id"]] = {
                    "id": party["id"],
                    "name": party["name"],
                    "source_type": party["source_type"],
                    "country_code": party["country_code"],
                    "url": party["url"],
                    "reliability_score": party["reliability_score"],
                    "active": True,
                    "metadata": {
                        "party_code": party["party_code"],
                        "country_name": party["country_name"],
                        "is_south_african": party["is_south_african"]
                    },
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

    def get_party_distribution(self) -> Dict[str, Any]:
        sa_count = len([p for p in POLITICAL_PARTIES_REGISTRY if p["is_south_african"]])
        africa_count = len([p for p in POLITICAL_PARTIES_REGISTRY if not p["is_south_african"]])
        total = len(POLITICAL_PARTIES_REGISTRY)

        return {
            "total_parties": total,
            "south_africa_count": sa_count,
            "south_africa_percentage": f"{round((sa_count / total) * 100)}%",
            "rest_of_africa_count": africa_count,
            "rest_of_africa_percentage": f"{round((africa_count / total) * 100)}%",
            "parties": POLITICAL_PARTIES_REGISTRY
        }

    def ingest_political_statement(self, statement_payload: Dict[str, Any]) -> Dict[str, Any]:
        party_id = statement_payload.get("party_id", "src-pol-anc")
        
        obs_record = self.db.add_observation({
            "source_id": party_id,
            "content_type": ContentType.PRESS_RELEASE.value,
            "title": statement_payload.get("title"),
            "raw_content": statement_payload.get("content"),
            "published_at": statement_payload.get("published_at") or datetime.now(timezone.utc).isoformat(),
            "language_code": "en",
            "country_code": statement_payload.get("country_code", "ZA"),
            "metadata": {
                "political_party_statement": True,
                "party_name": statement_payload.get("party_name"),
                "ingested_via": "Political_Parties_Adapter"
            }
        })

        situation = situation_service_instance.process_observation_to_situation(obs_record["id"])

        return {
            "status": "POLITICAL_STATEMENT_INGESTED",
            "observation_id": obs_record["id"],
            "title": obs_record["title"],
            "content_hash": obs_record["content_hash"],
            "bound_situation_id": situation["id"]
        }

political_parties_engine_instance = PoliticalPartyStatementsEngine()
