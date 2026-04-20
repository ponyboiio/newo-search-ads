# Newo as the Vercel of Phone Numbers — Product Vision
Prepared: April 20, 2026

---

## The Analogy

| Vercel | Newo |
|--------|------|
| Deploys web apps in 30 seconds | Adds AI phone in 5 minutes |
| `npx vercel` → live URL | `npx add-newo` → live AI number |
| Zero config, works with any framework | Zero config, works with any website |
| Developers don't think about servers | Developers don't think about telephony |
| Free tier → scales with usage | Free trial → scales with calls |
| Became the default deploy layer | Should become the default phone layer |

---

## Current Reality

**The problem Newo solves (for SMBs today):**
62% of calls go unanswered. Missing calls = missing revenue.
Newo answers every call, books appointments, handles inquiries.

**The bigger opportunity:**
Every business, every website, every AI app eventually needs a phone number.
Twilio is the current default — but Twilio requires engineering. Twilio gives you
a raw phone number and an API. You build everything else yourself.

**Newo's position:** The AI layer on top of telephony.
Not a raw API. A ready-to-go AI receptionist that works on day one.

---

## What "Vercel of Phone Numbers" Means

### For Developers (new segment)
- `npx add-newo` installs the CLI and runs setup in the terminal
- 3 questions: business name, vertical, what AI should say
- Output: your AI phone number + embed snippet + webhook URL
- Time from zero to live: under 10 minutes

### For Website Owners (new segment)
- One-line script tag, like Google Analytics or Intercom
- Paste it in your `<head>`, your phone number becomes AI
- No backend required, no API keys to manage
- Works with Squarespace, Wix, Webflow, WordPress, any HTML

### For AI Developers (Claude/GPT builders)
- `/add-newo` Claude skill (already built)
- Newo as the phone layer in any AI stack
- Webhooks for call transcripts → your database
- API for triggering calls, checking status, reading logs

---

## Product Roadmap for This Vision

### Phase 1 (Now — can pitch today)
- [x] AI receptionist for SMBs (existing product)
- [x] Claude skill `/add-newo`
- [ ] `npx add-newo` CLI installer
- [ ] One-line embed snippet (no account required to try)

### Phase 2 (Next 60 days)
- [ ] Developer documentation at newo.ai/developers
- [ ] Webhook API for call transcripts
- [ ] Partner with Vercel: "One-click Newo on Vercel deployments"
- [ ] Submit to npm registry as `add-newo`

### Phase 3 (Next 90 days)
- [ ] Creator/Influencer tier: custom persona, branded phone number
- [ ] White-label API for agencies
- [ ] MCP server: Newo as a tool in any AI agent

---

## Why This Is Defensible

1. **Network effects:** Every developer who adds Newo to their project is an implicit
   endorsement. When `/add-newo` surfaces in Claude Code, it has zero competition.

2. **Timing:** AI-native apps are being built right now. The developers making them
   are reaching for Twilio or Bland.ai but don't want to build the AI layer themselves.
   Newo IS the AI layer.

3. **Brand moat:** "Newo = AI phone" is simpler than "Twilio = CPaaS" or
   "Bland.ai = voice AI API." Simpler wins.

4. **Distribution via Claude:** Anthropic has millions of Claude Code users building
   apps. `/add-newo` is free distribution inside that channel.

---

## The NPX Installer Concept

```bash
npx add-newo
```

Output:
```
🤖 Newo AI Phone Setup

? Business name: Riverside Dental
? Vertical: dental
? Your phone number to upgrade: (614) 555-1234

✓ Creating your AI receptionist...
✓ Training on dental FAQs...
✓ Configuring appointment booking...

Your Newo AI number is ready: +1 (614) 867-5309

Add to your website:
<script src="https://widget.newo.ai/v1" data-agent="abc123"></script>

Dashboard: https://newo.ai/dashboard/abc123
Docs: https://newo.ai/docs

Setup took: 3 minutes
```

This is a vision — the technical implementation would integrate with Newo's existing
account creation and agent setup flow. The CLI is the front-end to the existing product.

---

## Pitch to Newo Leadership

**One sentence:** "Add a CLI and embed script, and Newo becomes the Vercel of phone
numbers — developers add it the same way they add analytics or Stripe."

**What it requires:**
1. A publicly documented embed script (may already exist)
2. An API endpoint for programmatic agent creation
3. An npm package `add-newo` that wraps the CLI setup
4. A developers page at newo.ai/developers

**What it unlocks:**
- Dev community distribution (Product Hunt, Hacker News, Twitter/X developer community)
- Every AI app built on Claude, GPT, Cursor becomes a potential Newo customer
- Claude skill surfacing to tens of thousands of Claude Code users
- Podcast/creator segment as a natural extension

**Estimated effort to implement:** 2-4 weeks engineering.
**Estimated new signups from dev channel in month 1:** 50–200.

---

## Immediate Action Items for Ryan

1. **Ask the Newo engineering team:**
   - Does a public embed script exist? What's the format?
   - Is there an API for programmatic agent creation?
   - Would they support an `npx add-newo` CLI?

2. **Pitch Newo leadership** on the developer segment using this doc

3. **Submit the `/add-newo` Claude skill** to any Claude community directories

4. **Write the developer landing page** — newo.ai/developers (copy is in developer-landing-copy.md)

5. **Post on X/Twitter and LinkedIn:**
   "Just built a Claude skill that adds AI phone answering to any website in 5 minutes.
   `/add-newo` — works with Next.js, React, or plain HTML."
   Target: developers, AI builders, indie hackers.
