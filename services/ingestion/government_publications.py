from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from packages.database import db_instance
from packages.ontology import SourceType, ContentType
from services.ingestion.ingestion_service import ingestion_service_instance
from services.situation_engine.situation_service import situation_service_instance

# Official South African Government & Regulatory Publications Registry
SA_GOVERNMENT_PUBLICATIONS = [
    {
        "id": "src-gov-sanews",
        "name": "SAnews - South African Government News Agency",
        "department": "Government Communication and Information System (GCIS)",
        "source_type": SourceType.GOVERNMENT.value,
        "country_code": "ZA",
        "url": "https://www.sanews.gov.za",
        "rss_url": "https://www.sanews.gov.za/rss.xml",
        "reliability_score": 0.98,
        "category": "OFFICIAL_STATE_NEWS"
    },
    {
        "id": "src-gov-gazette",
        "name": "South African Government Gazette (GPW)",
        "department": "Government Printing Works",
        "source_type": SourceType.GOVERNMENT.value,
        "country_code": "ZA",
        "url": "https://www.gpwonline.co.za",
        "rss_url": "https://www.gpwonline.co.za/gazettes/rss",
        "reliability_score": 0.99,
        "category": "LEGAL_REGULATORY_NOTICES"
    },
    {
        "id": "src-gov-dmre",
        "name": "Department of Mineral Resources and Energy (DMRE)",
        "department": "Ministry of Mineral Resources & Energy",
        "source_type": SourceType.REGULATOR.value,
        "country_code": "ZA",
        "url": "https://www.dmre.gov.za",
        "rss_url": "https://www.dmre.gov.za/media-room/rss",
        "reliability_score": 0.99,
        "category": "MINING_ENERGY_LICENSING"
    },
    {
        "id": "src-gov-treasury",
        "name": "National Treasury of South Africa",
        "department": "Ministry of Finance",
        "source_type": SourceType.GOVERNMENT.value,
        "country_code": "ZA",
        "url": "https://www.treasury.gov.za",
        "rss_url": "https://www.treasury.gov.za/rss",
        "reliability_score": 0.99,
        "category": "FISCAL_MUNICIPAL_FINANCE"
    },
    {
        "id": "src-gov-saps",
        "name": "South African Police Service (SAPS) National Media Centre",
        "department": "Ministry of Police",
        "source_type": SourceType.GOVERNMENT.value,
        "country_code": "ZA",
        "url": "https://www.saps.gov.za",
        "rss_url": "https://www.saps.gov.za/newsroom/rss",
        "reliability_score": 0.97,
        "category": "PUBLIC_ORDER_SECURITY"
    },
    {
        "id": "src-gov-eskom",
        "name": "Eskom Official System Operator Bulletins",
        "department": "Eskom Holdings SOC Ltd / DPE",
        "source_type": SourceType.CORPORATE.value,
        "country_code": "ZA",
        "url": "https://www.eskom.co.za",
        "rss_url": "https://www.eskom.co.za/news/rss",
        "reliability_score": 0.96,
        "category": "GRID_ENERGY_SECURITY"
    },
    {
        "id": "src-gov-transnet",
        "name": "Transnet Freight Rail & Port Authority Notices",
        "department": "Transnet SOC Ltd / DPE",
        "source_type": SourceType.CORPORATE.value,
        "country_code": "ZA",
        "url": "https://www.transnet.net",
        "rss_url": "https://www.transnet.net/media/rss",
        "reliability_score": 0.96,
        "category": "PORT_RAIL_LOGISTICS"
    }
]

# Benchmark Government Publication Payload Fixtures for Testing
BENCHMARK_GOVT_NOTICES = [
    {
        "publication_id": "src-gov-dmre",
        "source_name": "Department of Mineral Resources and Energy (DMRE)",
        "title": "Government Gazette Notice: Proposed Revisions to Mining Charter Local Procurement Directives",
        "content": (
            "The Minister of Mineral Resources and Energy hereby publishes Government Gazette Notice 48921 "
            "inviting public comments on proposed amendments to mining social and labour plan directives in "
            "North West and Limpopo provinces. Mining right holders will be required to submit quarterly audit "
            "reports on host-community supplier procurement compliance."
        ),
        "content_type": ContentType.GOVERNMENT_NOTICE.value,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "source_url": "https://www.dmre.gov.za/gazette-notice-48921",
        "country_code": "ZA"
    },
    {
        "publication_id": "src-gov-saps",
        "source_name": "South African Police Service (SAPS) National Media Centre",
        "title": "SAPS National Statement: Public Order Policing Deployed to Rustenburg Mining Access Routes",
        "content": (
            "SAPS Public Order Policing units have been deployed along major mining access roads in Rustenburg "
            "to ensure public safety, protect critical economic infrastructure, and maintain traffic flow "
            "following community blockades. Law enforcement remains in dialogue with municipal stakeholders."
        ),
        "content_type": ContentType.PRESS_RELEASE.value,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "source_url": "https://www.saps.gov.za/newsroom/statement-rustenburg-deployment",
        "country_code": "ZA"
    }
]

class SAGovernmentPublicationEngine:
    """
    Ingestion Engine for Official South African Government & Regulatory Publications:
    - SAnews
    - Government Gazette (GPW)
    - DMRE (Mining & Energy Licensing)
    - National Treasury
    - SAPS Security Statements
    - Eskom Grid Bulletins
    - Transnet Freight & Port Notices
    """
    def __init__(self, db=db_instance):
        self.db = db
        self.register_government_sources()

    def register_government_sources(self):
        for gov in SA_GOVERNMENT_PUBLICATIONS:
            if gov["id"] not in self.db.sources:
                self.db.sources[gov["id"]] = {
                    "id": gov["id"],
                    "name": gov["name"],
                    "source_type": gov["source_type"],
                    "country_code": gov["country_code"],
                    "url": gov["url"],
                    "reliability_score": gov["reliability_score"],
                    "active": True,
                    "metadata": {
                        "department": gov["department"],
                        "category": gov["category"],
                        "rss_url": gov["rss_url"]
                    },
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

    def list_government_publications(self) -> List[Dict[str, Any]]:
        return SA_GOVERNMENT_PUBLICATIONS

    def ingest_government_notice(self, notice_payload: Dict[str, Any]) -> Dict[str, Any]:
        source_id = notice_payload.get("publication_id", "src-gov-sanews")
        
        obs_record = self.db.add_observation({
            "source_id": source_id,
            "content_type": notice_payload.get("content_type", ContentType.GOVERNMENT_NOTICE.value),
            "title": notice_payload.get("title"),
            "raw_content": notice_payload.get("content"),
            "source_url": notice_payload.get("source_url"),
            "published_at": notice_payload.get("published_at") or datetime.now(timezone.utc).isoformat(),
            "language_code": "en",
            "country_code": notice_payload.get("country_code", "ZA"),
            "metadata": {
                "official_government_source": True,
                "gazette_reference": notice_payload.get("gazette_reference"),
                "ingested_via": "SA_Gov_Publications_Adapter"
            }
        })

        # Process observation into Situation model
        situation = situation_service_instance.process_observation_to_situation(obs_record["id"])

        return {
            "status": "GOVERNMENT_NOTICE_INGESTED",
            "observation_id": obs_record["id"],
            "title": obs_record["title"],
            "content_hash": obs_record["content_hash"],
            "bound_situation_id": situation["id"]
        }

sa_government_engine_instance = SAGovernmentPublicationEngine()
