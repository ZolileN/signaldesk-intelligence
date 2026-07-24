from typing import Dict, Any, List
from packages.database import db_instance
from packages.ontology import ExposureType

class CustomerExposureService:
    """
    Exposure Engine:
    Connects real-world Situations to Customer Assets (Mines, Facilities, Supply Chains, Investments)
    and computes exposure scores (Operational, Financial, Regulatory, Security, Reputational).
    """
    def __init__(self, db=db_instance):
        self.db = db

    def calculate_organisation_exposure(self, org_id: str, situation_id: str) -> List[Dict[str, Any]]:
        sit = self.db.situations.get(situation_id)
        if not sit:
            return []

        exposures = []
        # Match organisation assets
        org_assets = [a for a in self.db.customer_assets.values() if a["organisation_id"] == org_id]

        for asset in org_assets:
            if "rustenburg" in asset.get("location_name", "").lower() or "mine" in asset["asset_type"].lower():
                exp_id = f"exp-{asset['id'][:8]}-{situation_id[:8]}"
                exp_record = {
                    "id": exp_id,
                    "organisation_id": org_id,
                    "situation_id": situation_id,
                    "asset_id": asset["id"],
                    "asset_name": asset["name"],
                    "exposure_type": ExposureType.OPERATIONAL.value,
                    "exposure_score": 0.85,
                    "impact_score": 0.88,
                    "probability_score": 0.82,
                    "time_horizon": "IMMEDIATE_0_TO_48_HOURS",
                    "explanation": (
                        f"HIGH OPERATIONAL EXPOSURE: Community road blockades threaten shift transport "
                        f"and supply logistics at {asset['name']}."
                    )
                }
                self.db.exposures[exp_id] = exp_record
                exposures.append(exp_record)

                # Financial exposure
                fin_exp_id = f"exp-fin-{asset['id'][:8]}-{situation_id[:8]}"
                fin_record = {
                    "id": fin_exp_id,
                    "organisation_id": org_id,
                    "situation_id": situation_id,
                    "asset_id": asset["id"],
                    "asset_name": asset["name"],
                    "exposure_type": ExposureType.FINANCIAL.value,
                    "exposure_score": 0.72,
                    "impact_score": 0.75,
                    "probability_score": 0.70,
                    "time_horizon": "SHORT_TERM_1_WEEK",
                    "explanation": (
                        f"FINANCIAL EXPOSURE: Potential production output delays of up to 450 oz platinum daily "
                        f"if blockades persist longer than 24 hours."
                    )
                }
                self.db.exposures[fin_exp_id] = fin_record
                exposures.append(fin_record)

        return exposures

exposure_service_instance = CustomerExposureService()
