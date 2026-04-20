# Developer Landing Page Copy — newo.ai/developers
Prepared: April 20, 2026

---

## Hero Section

**Headline (primary):**
Add AI phone answering to any website in 5 minutes.

**Headline (A/B variant A):**
Your AI app needs a phone number. We built it.

**Headline (A/B variant B):**
The Twilio alternative that's already smart.

**Subheadline:**
One script tag. Your website's phone number answers calls 24/7, books appointments,
and handles customer questions — no backend required.

**CTA:**
[Get Started Free — No credit card] [View the Docs →]

**Social proof line:**
Works with Next.js, React, Webflow, Squarespace, WordPress, and plain HTML.

---

## Integration Section

**Headline:** Three ways to add Newo

### 1. Script Tag (30 seconds)
```html
<script src="https://widget.newo.ai/v1" data-agent="YOUR_AGENT_ID"></script>
```
That's it. Paste in your `<head>` or before `</body>`. No configuration required.

### 2. npm Package (2 minutes)
```bash
npm install @newo/widget
```
```tsx
import { NewoWidget } from '@newo/widget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <NewoWidget agentId="YOUR_AGENT_ID" />
    </>
  )
}
```

### 3. Claude Skill (for AI builders)
In any Claude Code session, type `/add-newo` and the skill detects your stack,
asks 3 questions, and inserts the correct code in the right place. Done.

---

## What You Get

| Feature | Details |
|---------|---------|
| AI phone answering | Calls answered 24/7, no voicemail |
| Appointment booking | Integrated with Google Calendar, Calendly |
| SMS + call handling | Works on phone, SMS, chat simultaneously |
| Call transcripts | Every call logged with summary |
| Webhook support | POST transcripts to your endpoint |
| Custom AI persona | Train on your content, your FAQs |
| Analytics dashboard | Call volume, topics, conversion |

---

## API / Webhook Section

**Headline:** Webhooks for developers who want the data

Every call generates a webhook event with:
```json
{
  "event": "call.completed",
  "call_id": "call_abc123",
  "duration_seconds": 187,
  "caller": "+15551234567",
  "summary": "Caller asked about pricing for the premium plan. Booked a demo for Thursday 2pm.",
  "transcript": "...",
  "booking": {
    "scheduled": true,
    "time": "2026-04-24T14:00:00Z",
    "calendar_link": "https://cal.newo.ai/event/xyz"
  }
}
```

Configure your webhook URL in the dashboard. Use it to:
- Sync bookings to your CRM
- Trigger follow-up sequences
- Log calls to your database
- Alert your team in Slack

---

## Use Cases for Developers

### AI-Built Startups
Building an AI SaaS? Your users need support. Instead of building a call center,
add Newo. Every support call is answered, transcribed, and logged automatically.

### SaaS Products with SMB Customers
If your customers are dentists, HVAC companies, restaurants, or any SMB, they need
phone AI. White-label Newo for your customers or build the integration yourself.

### Indie Hackers
Launch fast. No engineering time spent on phone infrastructure. One snippet and
your app has AI phone support from day one.

### Agencies
Offer AI receptionist as a service to your clients. Spin up a Newo agent per client
from the API. Bill a recurring fee. Newo runs itself.

---

## Pricing for Developers

| Tier | Price | Calls/mo | Best For |
|------|-------|----------|---------|
| Starter | $99/mo | 500 | Solo projects, MVPs |
| Growth | $299/mo | 2,000 | Early-stage startups |
| Scale | $799/mo | Unlimited | Agencies, white-label |

Annual pricing available. API access on Growth and above.

---

## FAQ

**Q: Do I need to build any backend?**
No. The widget is entirely client-side. Newo's infrastructure handles calls, booking,
and storage. Webhooks are optional.

**Q: Can I customize what the AI says?**
Yes. In the dashboard, configure the greeting, FAQ answers, booking rules, and personality.
No prompt engineering required — it's a form.

**Q: Does it work with my existing phone number?**
Yes. You can either use a Newo number or forward your existing number to Newo. Setup
takes about 5 minutes.

**Q: What about HIPAA / compliance?**
Newo is HIPAA-compliant for dental and healthcare use cases. SOC 2 in progress.

**Q: API rate limits?**
No rate limits on the widget. Webhook delivery is real-time with automatic retry.

---

## CTA Section

**Headline:** Add AI phone answering to your project today.

**Subheadline:** Takes 5 minutes. Free for the first 2 months.

**CTAs:**
[Start Free →] [Read the Docs] [/add-newo Claude Skill]

**Trust line:** No credit card required. Cancel anytime. Works with any website.

---

## Meta / SEO

**Title:** Newo.ai for Developers — Add AI Phone Answering to Any Website
**Meta description:** Add Newo's AI receptionist to your website in 5 minutes. One script tag answers every call 24/7, books appointments, and handles customer inquiries. Works with Next.js, React, HTML.
**URL:** newo.ai/developers
**Target keywords:**
- ai phone api for developers
- add ai receptionist to website
- twilio alternative for ai
- phone answering api
- ai phone number for startups
