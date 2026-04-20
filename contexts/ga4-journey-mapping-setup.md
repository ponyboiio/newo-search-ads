# GA4 Conversion Journey Mapping — Setup Guide
Newo.ai | April 20, 2026

---

## Goal

Map the exact pages users visit before converting (signing up / starting a trial).
Answer: "What is the path users take from first visit to becoming a Newo customer?"

This requires GA4 Explore reports + correct event tracking setup.

---

## Step 1 — Verify Conversion Events Are Firing

Before building journey reports, confirm GA4 is tracking the right events.

**Required events:**
1. `sign_up` or `generate_lead` — fires when a user submits the trial/demo form
2. `begin_checkout` — fires when a user clicks "Start Free Trial" (if applicable)
3. `purchase` — fires when a subscription starts (if connected to Stripe/payment)

**How to verify in GA4:**
1. Go to `analytics.google.com` → select Newo.ai property
2. Left nav → **Reports** → **Realtime**
3. Open newo.ai in another browser tab and click the trial CTA
4. Watch Realtime — you should see the event fire within 30 seconds

If no events fire: the GA4 event tracking is not set up correctly.
Jump to Step 1b (Fix tracking first).

---

## Step 1b — Set Up Conversion Tracking (if not already done)

**Option A: Google Tag Manager (recommended)**

```html
<!-- Add to newo.ai <head> if not already there -->
<!-- GTM snippet -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
```

Then in GTM: add a trigger for the "Start Free Trial" button click → push event:
```javascript
dataLayer.push({
  event: 'generate_lead',
  event_category: 'conversion',
  event_label: 'trial_start'
})
```

**Option B: Direct GA4 code (no GTM)**

On the trial confirmation page (after form submit):
```javascript
gtag('event', 'generate_lead', {
  event_category: 'conversion',
  currency: 'USD',
  value: 99  // lowest plan value
})
```

---

## Step 2 — Mark generate_lead as a Conversion

1. GA4 → **Admin** (gear icon) → Property column → **Events**
2. Find `generate_lead` in the list
3. Toggle "Mark as conversion" → ON
4. Wait 24 hours for data to accumulate

---

## Step 3 — Build the Conversion Path Explore Report

This answers: "What pages do users visit before converting?"

1. GA4 → **Explore** (left nav, compass icon)
2. Click **Blank** to create a new exploration
3. Name it: "Conversion Path — Trial Signups"

**Configure the report:**

Under **Variables** (left panel):
- **Dimensions:** Add `Page path`, `Event name`, `Session default channel group`
- **Metrics:** Add `Sessions`, `Conversions`, `Conversion rate`

Under **Tab Settings** (right panel):
- Visualization: **Path exploration**
- Starting point: `Session start`
- Steps: `Page path` → `Page path` → `Page path` → `generate_lead`

4. Click **Run** → You'll see the most common 3-step paths before conversion

---

## Step 4 — Funnel Exploration (Page-by-Page Funnel)

This answers: "Where do users drop off before converting?"

1. GA4 → **Explore** → **Funnel exploration**
2. Name it: "Trial Signup Funnel"

**Funnel steps:**
- Step 1: Page path = `/` (homepage)
- Step 2: Page path contains `/pricing` OR `/dental` OR `/hvac` OR `/restaurant`
- Step 3: Page path = `/get-started` OR `/signup` (wherever the trial form is)
- Step 4: Event = `generate_lead`

This shows the drop-off rate at each step and which vertical pages lead to conversion.

---

## Step 5 — Top Pages Before Conversion Report

This answers: "Which pages do converters visit most?"

1. GA4 → **Explore** → **Segment overlap**
2. Create a segment: "Converters" = users with at least 1 `generate_lead` event
3. Add dimension: `Page path`
4. See which pages appear most in the "Converters" segment

**Expected insight:** The vertical pages (dental, HVAC, restaurant) probably appear
more in converters' paths than the blog. The pricing page is probably the last page
before conversion.

---

## Step 6 — Set Up Custom Reports for Ongoing Monitoring

Save these as custom reports in GA4 so you don't have to rebuild them:

**Report 1: Daily Conversion Source**
- Dimension: `Session default channel group`
- Metric: `Conversions`, `Conversion rate`, `Sessions`
- Filter: Event = `generate_lead`
- This shows: organic search vs paid vs direct vs referral

**Report 2: Top Converting Pages**
- Dimension: `Page path`
- Metric: `Conversions`, `Engaged sessions`, `Engagement rate`
- Sort by: Conversions DESC
- This shows: which pages drive the most sign-ups

**Report 3: Device Type Conversion**
- Dimension: `Device category`
- Metric: `Conversions`, `Conversion rate`
- This shows: mobile vs desktop conversion rate (if mobile is low, landing pages need mobile UX fixes)

---

## Quick Wins from Journey Data (hypotheses to test)

Based on site structure observed in SEO crawl, expected findings:

1. **Pricing page is the last step** — most users visit pricing before signing up.
   Action: Add stronger CTA + social proof + urgency to pricing page.

2. **Blog posts don't convert well** — informational intent, low commercial intent.
   Action: Add CTAs at the bottom of blog posts linking to vertical pages.

3. **Vertical pages are the highest-converting second step** — users go homepage → dental → pricing → convert.
   Action: Strengthen vertical page CTAs. Add "Start Free" directly on dental/HVAC/restaurant pages.

4. **Direct traffic converts best** — people who type newo.ai directly already know the brand.
   Action: Focus on top-of-funnel awareness (content, social, ads) to grow direct traffic.

---

## Access Requirements

To run this setup, you need:
- GA4 Admin or Editor access to the Newo.ai property
- GTM access (if using Tag Manager for event tracking)
- At least 2–4 weeks of conversion data before path reports are meaningful

**If you don't have GA4 access:** Ask the Newo engineering or marketing team for
Editor access to the Google Analytics 4 property for newo.ai.

**Property ID format:** GA4 property IDs look like `G-XXXXXXXXXX` in the GA4 settings.
