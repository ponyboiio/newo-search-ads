# newo-search-ads

Google Ads automation for Newo.ai — daily performance reports, keyword optimization, and bid management via Claude.

## What it does

- **Daily report** (`scripts/performance_report.py`) — pulls campaign + keyword data, generates AI analysis via Claude, posts to Slack
- **Keyword optimizer** (`scripts/keyword_optimizer.py`) — identifies wasted spend, suggests bid changes, surfaces new keyword opportunities from search terms
- **GitHub Actions** — runs the daily report automatically at 9am ET weekdays

## Setup

### 1. Google Ads API credentials

1. Enable the Google Ads API: [console.cloud.google.com](https://console.cloud.google.com) → APIs → Google Ads API
2. Create OAuth2 credentials → Desktop app → download `client_secrets.json`
3. Get your developer token: Google Ads → Tools → API Center → Developer Token
4. Get your customer ID: top-right of Google Ads UI (remove dashes)

### 2. Environment variables

```bash
cp .env.example ~/.newo-ads.env
# Fill in all values
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. GitHub Actions secrets

In your repo Settings → Secrets → Actions, add all variables from `.env.example`.

## Usage

```bash
# Daily performance report (printed)
python3 scripts/performance_report.py

# Post to Slack
python3 scripts/performance_report.py --post

# 30-day analysis
python3 scripts/performance_report.py --days 30

# Keyword optimization suggestions (dry run)
python3 scripts/keyword_optimizer.py

# Set optimization targets in ~/.newo-ads.env:
# TARGET_CPA=50
# TARGET_ROAS=4.0
```

## Cost

| Item | Cost |
|------|------|
| Google Ads API | Free |
| GitHub Actions | Free |
| Claude (report generation) | ~$0.10/day |
| **Total** | **~$3/month** |
