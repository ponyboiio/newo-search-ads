#!/usr/bin/env python3
"""
Keyword bid optimizer for newo-search-ads.
Analyzes keyword performance and suggests bid adjustments, pauses, and new additions.

Usage:
  python3 keyword_optimizer.py              # analyze last 14 days
  python3 keyword_optimizer.py --days 30
  python3 keyword_optimizer.py --apply      # WARNING: applies changes via API
"""
import sys
import os
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path.home() / ".newo-ads.env")
sys.path.insert(0, str(Path(__file__).parent.parent))

import anthropic
from integrations.google_ads import get_keyword_performance, get_search_terms, _client, CUSTOMER_ID

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
TARGET_CPA = float(os.getenv("TARGET_CPA", "50"))       # target cost per conversion
TARGET_ROAS = float(os.getenv("TARGET_ROAS", "4.0"))    # target return on ad spend

OPTIMIZER_PROMPT = """You are a Google Ads expert optimizing campaigns for Newo.ai, an AI receptionist platform for restaurants, home services, and dental practices.

Target CPA: ${target_cpa}
Target ROAS: {target_roas}x

Analyze these keyword and search term results and provide specific optimization recommendations.

Format your response as JSON:
{{
  "pause_keywords": [
    {{"keyword": "...", "reason": "...", "current_cpa": 0.00}}
  ],
  "increase_bids": [
    {{"keyword": "...", "current_cpc": 0.00, "suggested_cpc": 0.00, "reason": "..."}}
  ],
  "decrease_bids": [
    {{"keyword": "...", "current_cpc": 0.00, "suggested_cpc": 0.00, "reason": "..."}}
  ],
  "add_as_keywords": [
    {{"search_term": "...", "match_type": "EXACT|PHRASE", "campaign": "...", "reason": "..."}}
  ],
  "add_as_negatives": [
    {{"search_term": "...", "level": "campaign|account", "reason": "..."}}
  ],
  "summary": "2-3 sentence summary of the biggest optimization opportunities"
}}

Rules:
- Pause keywords with CPA > 3x target AND 0 conversions after meaningful spend (>$20)
- Increase bids on keywords with CPA < target and high conversion rate
- Add converting search terms as exact-match keywords
- Add irrelevant search terms as negatives (e.g. 'job', 'careers', 'free', unrelated industries)

DATA:
{data}
"""


def analyze_keywords(keywords: list, search_terms: list, days: int) -> dict:
    data = {
        "keywords": keywords,
        "search_terms": search_terms,
        "days": days,
        "target_cpa": TARGET_CPA,
    }

    prompt = OPTIMIZER_PROMPT.format(
        target_cpa=TARGET_CPA,
        target_roas=TARGET_ROAS,
        data=json.dumps(data, indent=2)
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = resp.content[0].text
    # Extract JSON from response
    import re
    match = re.search(r'\{[\s\S]+\}', text)
    if match:
        return json.loads(match.group())
    return {"error": "Could not parse recommendations", "raw": text}


def apply_bid_change(keyword_resource_name: str, new_cpc_micros: int) -> bool:
    """Apply a bid change via Google Ads API."""
    try:
        client = _client()
        op_service = client.get_service("AdGroupCriterionService")
        op = client.get_type("AdGroupCriterionOperation")
        criterion = op.update
        criterion.resource_name = keyword_resource_name
        criterion.cpc_bid_micros = new_cpc_micros
        client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, criterion._pb))
        op_service.mutate_ad_group_criteria(customer_id=CUSTOMER_ID, operations=[op])
        return True
    except Exception as e:
        print(f"Bid change failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Keyword bid optimizer")
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--apply", action="store_true",
                        help="Apply recommended changes (default: dry run only)")
    args = parser.parse_args()

    print(f"Analyzing {args.days}-day keyword performance...")
    keywords = get_keyword_performance(days_back=args.days, min_impressions=5)
    search_terms = get_search_terms(days_back=args.days)

    print(f"Found {len(keywords)} keywords, {len(search_terms)} search terms")
    print("Running AI analysis...")

    recommendations = analyze_keywords(keywords, search_terms, args.days)

    if "error" in recommendations:
        print(f"Error: {recommendations['error']}")
        sys.exit(1)

    print(f"\n{recommendations.get('summary', '')}\n")
    print(f"Pause:         {len(recommendations.get('pause_keywords', []))} keywords")
    print(f"Increase bids: {len(recommendations.get('increase_bids', []))} keywords")
    print(f"Decrease bids: {len(recommendations.get('decrease_bids', []))} keywords")
    print(f"Add keywords:  {len(recommendations.get('add_as_keywords', []))} search terms")
    print(f"Add negatives: {len(recommendations.get('add_as_negatives', []))} terms")

    # Save recommendations
    out_dir = Path.home() / "newo-search-ads" / "reports"
    out_dir.mkdir(exist_ok=True)
    from datetime import datetime
    out_file = out_dir / f"optimizer-{datetime.now().strftime('%Y-%m-%d')}.json"
    out_file.write_text(json.dumps(recommendations, indent=2))
    print(f"\nSaved to {out_file}")

    if args.apply:
        print("\n⚠️  Applying changes...")
        # Bid increases
        for kw in recommendations.get("increase_bids", []):
            print(f"  ↑ {kw['keyword']}: ${kw['current_cpc']} → ${kw['suggested_cpc']}")
        # Bid decreases
        for kw in recommendations.get("decrease_bids", []):
            print(f"  ↓ {kw['keyword']}: ${kw['current_cpc']} → ${kw['suggested_cpc']}")
        print("Apply logic requires keyword resource names — run via performance_report.py for now.")
    else:
        print("\nDry run — use --apply to apply changes via API")


if __name__ == "__main__":
    main()
