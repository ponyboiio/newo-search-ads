#!/usr/bin/env python3
"""
Newo Google Ads performance report.
Generates a daily/weekly summary of campaign performance and posts to Slack.

Usage:
  python3 performance_report.py              # last 7 days
  python3 performance_report.py --days 30    # last 30 days
  python3 performance_report.py --format slack --post
"""
import sys
import os
import json
import argparse
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path.home() / ".newo-ads.env")
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
import anthropic

from integrations.google_ads import get_account_summary, get_keyword_performance, get_search_terms

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

REPORT_PROMPT = """You are a Google Ads analyst for Newo.ai, an AI receptionist platform for small businesses.
Generate a concise performance report from this data.

Format:
# Newo Ads Report — {date_range}

## Account Summary
[Spend, clicks, impressions, CTR, conversions, CPA — vs. prior period if available]

## Campaign Breakdown
[Table: Campaign | Spend | Clicks | CTR | Conv | CPA | Status]
Flag any campaign significantly over/under budget or with poor CTR/CPA.

## Top Keywords (by conversions)
[Top 5 converting keywords with CPC and quality score]

## Wasted Spend Alerts
[Keywords or search terms with spend but 0 conversions — recommend pause or bid reduction]

## New Keyword Opportunities
[Search terms from the report that are converting but not yet added as exact-match keywords]

## Recommended Actions (Top 3)
[Specific, actionable changes to make this week — include exact keyword/bid changes]

Be specific with numbers. Flag anything wasting budget. Keep total length under 400 words.

DATA:
{data}
"""


def generate_report(summary: dict, keywords: list, search_terms: list, days: int) -> str:
    data = {
        "account_summary": summary,
        "top_keywords": keywords[:20],
        "search_terms": search_terms[:30],
        "report_date": datetime.now().isoformat(),
    }

    prompt = REPORT_PROMPT.format(
        date_range=f"Last {days} days (through {datetime.now().strftime('%B %d, %Y')})",
        data=json.dumps(data, indent=2)
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    return resp.content[0].text


def post_to_slack(report: str) -> bool:
    if not SLACK_WEBHOOK_URL:
        print("SLACK_WEBHOOK_URL not set")
        return False
    r = httpx.post(SLACK_WEBHOOK_URL, json={"text": report}, timeout=10)
    return r.status_code == 200


def main():
    parser = argparse.ArgumentParser(description="Newo Google Ads performance report")
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument("--format", choices=["terminal", "markdown", "slack"], default="terminal")
    parser.add_argument("--post", action="store_true", help="Post to Slack")
    args = parser.parse_args()

    print(f"Fetching {args.days}-day Google Ads data...")

    try:
        summary = get_account_summary(days_back=args.days)
    except Exception as e:
        print(f"Google Ads error: {e}")
        sys.exit(1)

    keywords = get_keyword_performance(days_back=args.days)
    search_terms = get_search_terms(days_back=args.days)

    print(f"Spend: ${summary['total_spend']:,.2f} | Clicks: {summary['total_clicks']} | "
          f"Conversions: {summary['total_conversions']}")
    print("Generating AI analysis...")

    report = generate_report(summary, keywords, search_terms, args.days)
    print(report)

    # Save report
    out_dir = Path.home() / "newo-search-ads" / "reports"
    out_dir.mkdir(exist_ok=True)
    filename = out_dir / f"report-{datetime.now().strftime('%Y-%m-%d')}.md"
    filename.write_text(report)
    print(f"\nSaved to {filename}")

    if args.post or args.format == "slack":
        ok = post_to_slack(report)
        print("Posted to Slack ✓" if ok else "Slack post failed")


if __name__ == "__main__":
    main()
