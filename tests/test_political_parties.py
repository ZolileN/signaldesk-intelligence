import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.ingestion.political_parties import (
    political_parties_engine_instance,
    BENCHMARK_POLITICAL_STATEMENTS
)
from packages.database import db_instance

def test_political_parties_60_40_distribution():
    dist = political_parties_engine_instance.get_party_distribution()

    assert dist["south_africa_count"] == 6
    assert dist["rest_of_africa_count"] == 4
    assert dist["south_africa_percentage"] == "60%"
    assert dist["rest_of_africa_percentage"] == "40%"

def test_ingest_political_statement():
    stmt = BENCHMARK_POLITICAL_STATEMENTS[0]
    result = political_parties_engine_instance.ingest_political_statement(stmt)

    assert result["status"] == "POLITICAL_STATEMENT_INGESTED"
    assert result["observation_id"] is not None
    assert result["bound_situation_id"] is not None

    obs = db_instance.observations.get(result["observation_id"])
    assert obs is not None
    assert obs["metadata"]["political_party_statement"] is True

if __name__ == "__main__":
    test_political_parties_60_40_distribution()
    test_ingest_political_statement()
    print("ALL POLITICAL PARTIES STATEMENTS TESTS PASSED CLEANLY!")
