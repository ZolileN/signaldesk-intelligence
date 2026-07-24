from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import hashlib

# Media Outlets Registry (50% South Africa, 50% Sub-Saharan Africa Expansion)
AFRICAN_MEDIA_OUTLETS = [
    # --- 50% SOUTH AFRICAN MEDIA OUTLETS ---
    {
        "id": "src-sa-news24",
        "name": "News24 South Africa",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "NATIONAL_NEWS",
        "rss_feed_url": "https://www.news24.com/news24/rss",
        "reliability_score": 0.95,
        "is_south_african": True
    },
    {
        "id": "src-sa-businessday",
        "name": "Business Day South Africa",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "BUSINESS_MINING",
        "rss_feed_url": "https://www.businesslive.co.za/bd/rss",
        "reliability_score": 0.96,
        "is_south_african": True
    },
    {
        "id": "src-sa-dailymaverick",
        "name": "Daily Maverick",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "INVESTIGATIVE_POLITICAL",
        "rss_feed_url": "https://www.dailymaverick.co.za/rss",
        "reliability_score": 0.94,
        "is_south_african": True
    },
    {
        "id": "src-sa-miningweekly",
        "name": "Mining Weekly South Africa",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "MINING_ENERGY",
        "rss_feed_url": "https://www.miningweekly.com/rss",
        "reliability_score": 0.97,
        "is_south_african": True
    },
    {
        "id": "src-sa-moneyweb",
        "name": "Moneyweb Financial News",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "FINANCIAL_MARKETS",
        "rss_feed_url": "https://www.moneyweb.co.za/feed",
        "reliability_score": 0.95,
        "is_south_african": True
    },
    {
        "id": "src-sa-mailguardian",
        "name": "Mail & Guardian",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "POLITICAL_ANALYSIS",
        "rss_feed_url": "https://mg.co.za/feed",
        "reliability_score": 0.93,
        "is_south_african": True
    },
    {
        "id": "src-sa-fin24",
        "name": "Fin24 Economy & Mining",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "ECONOMY",
        "rss_feed_url": "https://www.news24.com/fin24/rss",
        "reliability_score": 0.95,
        "is_south_african": True
    },
    {
        "id": "src-sa-sabcnews",
        "name": "SABC Digital News",
        "country_code": "ZA",
        "country_name": "South Africa",
        "category": "PUBLIC_BROADCASTER",
        "rss_feed_url": "https://www.sabcnews.com/sabcnews/feed",
        "reliability_score": 0.92,
        "is_south_african": True
    },

    # --- 50% REST OF SUB-SAHARAN AFRICA MEDIA OUTLETS ---
    {
        "id": "src-ng-businessday",
        "name": "BusinessDay Nigeria",
        "country_code": "NG",
        "country_name": "Nigeria",
        "category": "BUSINESS_ENERGY",
        "rss_feed_url": "https://businessday.ng/feed",
        "reliability_score": 0.92,
        "is_south_african": False
    },
    {
        "id": "src-ke-dailynation",
        "name": "Daily Nation Kenya",
        "country_code": "KE",
        "country_name": "Kenya",
        "category": "NATIONAL_NEWS",
        "rss_feed_url": "https://nation.africa/kenya/rss",
        "reliability_score": 0.93,
        "is_south_african": False
    },
    {
        "id": "src-zm-miningreview",
        "name": "Zambia Mining Magazine",
        "country_code": "ZM",
        "country_name": "Zambia",
        "category": "MINING_COPPERBELT",
        "rss_feed_url": "https://www.miningreview.com/zambia/feed",
        "reliability_score": 0.94,
        "is_south_african": False
    },
    {
        "id": "src-cd-radiookapi",
        "name": "Radio Okapi DRC",
        "country_code": "CD",
        "country_name": "Democratic Republic of Congo",
        "category": "COMMUNITY_MINING",
        "rss_feed_url": "https://www.radiookapi.net/rss",
        "reliability_score": 0.91,
        "is_south_african": False
    },
    {
        "id": "src-gh-graphic",
        "name": "Graphic Online Ghana",
        "country_code": "GH",
        "country_name": "Ghana",
        "category": "NATIONAL_NEWS",
        "rss_feed_url": "https://www.graphic.com.gh/feed",
        "reliability_score": 0.92,
        "is_south_african": False
    },
    {
        "id": "src-zw-herald",
        "name": "The Herald Zimbabwe",
        "country_code": "ZW",
        "country_name": "Zimbabwe",
        "category": "STATE_NEWS",
        "rss_feed_url": "https://www.herald.co.zw/feed",
        "reliability_score": 0.89,
        "is_south_african": False
    },
    {
        "id": "src-ao-angop",
        "name": "ANGOP Angola Press",
        "country_code": "AO",
        "country_name": "Angola",
        "category": "OIL_MINING",
        "rss_feed_url": "https://www.angop.ao/feed",
        "reliability_score": 0.90,
        "is_south_african": False
    },
    {
        "id": "src-tz-thecitizen",
        "name": "The Citizen Tanzania",
        "country_code": "TZ",
        "country_name": "Tanzania",
        "category": "NATIONAL_NEWS",
        "rss_feed_url": "https://www.thecitizen.co.tz/feed",
        "reliability_score": 0.91,
        "is_south_african": False
    }
]

class VectaNewsScraperEngine:
    """
    VectaNews Media Scraper & Aggregator.
    Enforces 50% South African outlets / 50% Regional Sub-Saharan Africa coverage ratio.
    """
    def __init__(self):
        self.outlets = AFRICAN_MEDIA_OUTLETS

    def get_outlet_distribution(self) -> Dict[str, Any]:
        sa_count = len([o for o in self.outlets if o["is_south_african"]])
        africa_count = len([o for o in self.outlets if not o["is_south_african"]])
        total = len(self.outlets)
        
        return {
            "total_outlets": total,
            "south_africa_outlets_count": sa_count,
            "south_africa_percentage": f"{round((sa_count / total) * 100)}%",
            "rest_of_africa_outlets_count": africa_count,
            "rest_of_africa_percentage": f"{round((africa_count / total) * 100)}%",
            "outlets": self.outlets
        }

    def simulate_crawl_outlet(self, outlet_id: str) -> List[Dict[str, Any]]:
        outlet = next((o for o in self.outlets if o["id"] == outlet_id), self.outlets[0])
        
        crawled_articles = [
            {
                "publication": outlet["name"],
                "headline": f"Operational & Policy Updates from {outlet['country_name']} Corridor",
                "content": f"New development reported in {outlet['country_name']}. Community and industrial stakeholders meet regarding regional economic agreements.",
                "source_url": f"{outlet['rss_feed_url']}/item-{datetime.now().strftime('%Y%m%d%H%M')}",
                "country_code": outlet["country_code"]
            }
        ]
        return crawled_articles

vectanews_scraper_instance = VectaNewsScraperEngine()
