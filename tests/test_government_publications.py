import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.ingestion.government_publications import (
    sa_government_engine_instance,
    SA_GOVERNMENT_PUBLICATIONS,
    BENCHMARK_GOVT_NOTICES
)
from packages.database import db_instance

def test_sa_government_publications_registration():
    sources = sa_government_engine_instance.list_government_publications()
    source_ids = [s["id"] for s in sources]

    assert "src-gov-sanews" in source_ids
    assert "src-gov-gazette" in source_ids
    assert "src-gov-dmre" in source_ids
    assert "src-gov-treasury" in source_ids
    assert "src-gov-saps" in source_ids
    assert "src-gov-eskom" in source_ids
    assert "src-gov-transnet" in source_ids

def test_ingest_official_government_notice():
    notice = BENCHMARK_GOVT_NOTICES[0]
    result = sa_government_engine_instance.ingest_government_notice(notice)

    assert result["status"] == "GOVERNMENT_NOTICE_INGESTED"
    assert result["observation_id"] is not None
    assert result["bound_situation_id"] is not None

    obs = db_instance.observations.get(result["observation_id"])
    assert obs is not None
    assert obs["metadata"]["official_government_source"] is True

if __name__ == "__main__":
    test_sa_government_publications_registration()
    test_ingest_official_government_notice()
    print("ALL SA GOVERNMENT PUBLICATIONS TESTS PASSED CLEANLY!")
