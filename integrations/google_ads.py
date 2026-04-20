"""
Google Ads API client for newo-search-ads.
Fetches campaign, ad group, and keyword performance data.

Requires:
  - Google Ads developer token
  - OAuth2 credentials (client_id, client_secret, refresh_token)
  - Customer ID (without dashes, e.g. 1234567890)

See README.md for credential setup.
"""
import os
from datetime import date, timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path.home() / ".newo-ads.env")

try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    HAS_SDK = True
except ImportError:
    HAS_SDK = False

CUSTOMER_ID = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "")
LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", CUSTOMER_ID)


def _client() -> "GoogleAdsClient":
    if not HAS_SDK:
        raise ImportError("Run: pip install google-ads")
    return GoogleAdsClient.load_from_env()


def get_campaign_performance(days_back: int = 7) -> list[dict]:
    """Return campaign-level metrics for the last N days."""
    client = _client()
    ga_service = client.get_service("GoogleAdsService")

    end = date.today()
    start = end - timedelta(days=days_back)

    query = f"""
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.cost_per_conversion
        FROM campaign
        WHERE segments.date BETWEEN '{start}' AND '{end}'
          AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
    """

    results = []
    response = ga_service.search(customer_id=CUSTOMER_ID, query=query)
    for row in response:
        c = row.campaign
        m = row.metrics
        results.append({
            "campaign_id": c.id,
            "name": c.name,
            "status": c.status.name,
            "impressions": m.impressions,
            "clicks": m.clicks,
            "ctr": round(m.ctr * 100, 2),
            "avg_cpc": round(m.average_cpc / 1_000_000, 2),
            "spend": round(m.cost_micros / 1_000_000, 2),
            "conversions": round(m.conversions, 1),
            "cost_per_conversion": round(m.cost_per_conversion / 1_000_000, 2) if m.conversions else 0,
        })
    return results


def get_keyword_performance(days_back: int = 7, min_impressions: int = 10) -> list[dict]:
    """Return keyword-level metrics, filtered to keywords with meaningful data."""
    client = _client()
    ga_service = client.get_service("GoogleAdsService")

    end = date.today()
    start = end - timedelta(days=days_back)

    query = f"""
        SELECT
          campaign.name,
          ad_group.name,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.quality_score
        FROM keyword_view
        WHERE segments.date BETWEEN '{start}' AND '{end}'
          AND metrics.impressions >= {min_impressions}
        ORDER BY metrics.cost_micros DESC
        LIMIT 200
    """

    results = []
    response = ga_service.search(customer_id=CUSTOMER_ID, query=query)
    for row in response:
        kw = row.ad_group_criterion.keyword
        m = row.metrics
        results.append({
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "keyword": kw.text,
            "match_type": kw.match_type.name,
            "impressions": m.impressions,
            "clicks": m.clicks,
            "ctr": round(m.ctr * 100, 2),
            "avg_cpc": round(m.average_cpc / 1_000_000, 2),
            "spend": round(m.cost_micros / 1_000_000, 2),
            "conversions": round(m.conversions, 1),
            "quality_score": m.quality_score if m.quality_score else None,
        })
    return results


def get_search_terms(days_back: int = 7) -> list[dict]:
    """Return actual search queries that triggered ads — useful for finding new keywords and negatives."""
    client = _client()
    ga_service = client.get_service("GoogleAdsService")

    end = date.today()
    start = end - timedelta(days=days_back)

    query = f"""
        SELECT
          search_term_view.search_term,
          search_term_view.status,
          campaign.name,
          ad_group.name,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros
        FROM search_term_view
        WHERE segments.date BETWEEN '{start}' AND '{end}'
          AND metrics.impressions >= 5
        ORDER BY metrics.conversions DESC, metrics.clicks DESC
        LIMIT 100
    """

    results = []
    response = ga_service.search(customer_id=CUSTOMER_ID, query=query)
    for row in response:
        st = row.search_term_view
        m = row.metrics
        results.append({
            "search_term": st.search_term,
            "status": st.status.name,
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "impressions": m.impressions,
            "clicks": m.clicks,
            "conversions": round(m.conversions, 1),
            "spend": round(m.cost_micros / 1_000_000, 2),
        })
    return results


def get_account_summary(days_back: int = 7) -> dict:
    """Top-level spend and performance summary for the account."""
    campaigns = get_campaign_performance(days_back)
    total_spend = sum(c["spend"] for c in campaigns)
    total_clicks = sum(c["clicks"] for c in campaigns)
    total_impressions = sum(c["impressions"] for c in campaigns)
    total_conversions = sum(c["conversions"] for c in campaigns)

    return {
        "days": days_back,
        "total_spend": round(total_spend, 2),
        "total_clicks": total_clicks,
        "total_impressions": total_impressions,
        "avg_ctr": round(total_clicks / total_impressions * 100, 2) if total_impressions else 0,
        "total_conversions": round(total_conversions, 1),
        "cost_per_conversion": round(total_spend / total_conversions, 2) if total_conversions else 0,
        "active_campaigns": len([c for c in campaigns if c["status"] == "ENABLED"]),
        "campaigns": campaigns,
    }


if __name__ == "__main__":
    import json
    summary = get_account_summary(days_back=7)
    print(json.dumps(summary, indent=2))
