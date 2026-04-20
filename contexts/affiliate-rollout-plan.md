# Newo.ai Affiliate Program — Launch Rollout Plan
Prepared: April 19, 2026 | Owner: Ryan McManus | Status: Pre-launch

---

## Current State

The affiliate portal is **built and deployed** at:
`https://newo-affiliate-app-production.up.railway.app/`

Affiliates sign up → get unique referral link → submit leads → track pipeline. Admin dashboard with CSV export is live. Three things block launch:

1. **Resend API key** not configured → no emails send
2. **Commission structure** not defined → affiliates don't know what they earn
3. **First partners** not recruited

---

## Commission Structure Recommendation

**Recommended: 15% recurring, 12 months**

| Model | Pros | Cons |
|-------|------|------|
| $500 flat per closed deal | Simple, predictable | No recurring incentive; affiliates churn after one referral |
| 15% recurring for 12 months | Strong affiliate motivation; compounds; industry standard | More complex to track |
| Hybrid: $200 upfront + 10% recurring | Best of both | Most complex |

**Go with 15% recurring.** Newo plans range $99–$799/month. A $299/month customer = $44.85/month to affiliate = $538/year per deal. This is a strong enough incentive to sustain affiliate effort.

Attribution window: **60-day last-click.** Generous enough to reward long sales cycles without being unfair.

---

## Pre-Launch Checklist (Week 1)

- [ ] Engineering: Configure Resend API key + verify newo.ai sending domain
- [ ] Engineering: Create admin accounts for Newo sales team (set isAdmin=true in DB)
- [ ] Engineering: Build accounting email notification when lead hits Closed Won
- [ ] Ryan: Finalize commission structure (recommend 15% recurring, 12 months)
- [ ] Ryan: Write affiliate agreement (commission rate, payout schedule, attribution rules)
- [ ] Ryan: Define payout schedule (recommend: net-30 after Closed Won, monthly batch via ACH)
- [ ] Ryan: Create partner-facing one-pager (what Newo is, commission rate, how it works)
- [ ] Ryan: Create outreach email templates for each vertical

---

## Target Affiliate Companies & People

### Tier 1 — Restaurants

These affiliates talk to restaurant owners every day. A single introduction can yield multiple referrals.

| Affiliate | Type | Reach | Contact |
|-----------|------|-------|---------|
| **Toast Certified Partners** | POS resellers/consultants | 100K+ Toast restaurants | toast.com/partners — find local certified partners |
| **Square for Restaurants Partners** | POS resellers | 200K+ SMB restaurants | squareup.com/us/en/solutions/restaurants/partner-program |
| **The Restaurant Coach** (Donald Burns) | Business coach | 50K+ podcast listeners | therestaurantcoach.com |
| **Restaurant Rockstars** (Roger Beaudoin) | Podcast + community | 500+ episodes, restaurant owner audience | restaurantrockstars.com |
| **David Scott Peters** | Restaurant consultant/coach | 10K+ newsletter | davidscottpeters.com |
| **Aaron Allen & Associates** | Restaurant strategy firm | Works with chains + independents | aaronallen.com |
| **RestaurantOwner.com** | Online community + training | 10K+ members | restaurantowner.com — contact editor |
| **Eat App** (if not direct competitor) | Reservation/waitlist software | Embedded in restaurant workflows | eatapp.co |
| **OpenTable Partner Network** | Tech integrations | 57K+ restaurants | contact via developer.opentable.com |
| **My Restaurant Sucks** (podcast) | Indie restaurant community | Indie operators | contact podcast host |

**Best first outreach:** Toast certified partners. They're already trusted by restaurant owners, earn commissions on software they recommend, and Newo integrates directly into their workflow.

---

### Tier 1 — Home Services (HVAC, Plumbing, Electrical, Landscaping)

| Affiliate | Type | Reach | Contact |
|-----------|------|-------|---------|
| **ServiceTitan Certified Partners** | Software consultants | 100K+ ST contractors | marketplace.servicetitan.com/partner-program |
| **Housecall Pro Integration Partners** | Software adjacent | 40K+ contractors | housecallpro.com/partnerships |
| **Jobber Partner Network** | Software adjacent | 200K+ businesses | getjobber.com/partner-program |
| **Billy Stevens** (Servant Plumber) | Business coach/podcast | 10K+ plumbing contractors | servantplumber.com |
| **Al Levi** (The 7-Power Contractor) | Business coach | Trades business owners | allevibusiness.com |
| **HVAC School** (Bryan Orr) | Podcast + training | 30K+ downloads/episode | hvacrschool.com |
| **Service Business Mastery** (Tersh Blissett) | Podcast | Field service business owners | servicebusinessmastery.com |
| **Rival Digital** | HVAC/plumbing marketing agency | 200+ active clients | rivaldigital.com |
| **Scorpion** | Trades marketing agency | 15K+ clients across trades | scorpion.co |
| **Tradie Digital** | Home services marketing | Contractor focus | tradiedigital.com.au |
| **Contractor Success Map** (Randal DeHart) | Podcast + accounting services | Contractor owners | contractorsuccessmap.com |
| **Mike Michalowicz community** | Small biz owners incl. trades | Profit First certified coaches | mikemichalowicz.com |
| **Angi Leads / HomeAdvisor partners** | Lead gen adjacent | Active contractor network | angi.com/pro |

**Best first outreach:** ServiceTitan certified partners. They're paid to advise contractors, actively look for tools to recommend, and their clients are Newo's exact ICP.

---

### Tier 1 — Dental

| Affiliate | Type | Reach | Contact |
|-----------|------|-------|---------|
| **Levin Group** | Dental practice consulting | Fortune 1000 of dental consulting | levingroup.com |
| **ACT Dental** | Practice growth coaching | Monthly coaching programs, 1K+ practices | actdental.com |
| **Fortune Management** | Practice management coaching | 30+ offices across US | fortunemgmt.com |
| **Dentist Advisors** | Financial advisors for dentists | Newsletter + podcast | dentistadvisors.com |
| **Dental Intelligence** | Practice analytics software | 10K+ practices | dentalintelligence.com — integration/partner program |
| **Solutionreach** | Patient communication platform | 50K+ practices | solutionreach.com (if not competitive) |
| **Benco Dental reps** | Equipment reps who visit every practice | 30K+ practices | benco.com — contact regional VP |
| **Patterson Dental reps** | Equipment distributor | Largest dental distributor in US | pattersoncompanies.com |
| **Dental Marketing Hero** | Dental marketing agency | 100+ dental practice clients | dentalmarketinghero.com |
| **ProSites** | Dental website company | 4K+ dental practices | prosites.com |
| **Smile Igniter** | Dental marketing agency | Practice owners | smileigniter.com |
| **The Dental Marketer** (podcast) | Michael Arias | Dentists + marketing | thedentalmarketer.lpages.co |
| **Shared Practices** (podcast) | Group practice growth | Practice owners | sharedpractices.com |
| **Dental Economics** contributors | Trade press + consultants | Practice owners read this monthly | dentaleconomics.com — contact editor for contributor list |

**Best first outreach:** Dental practice consultants (Levin Group, ACT Dental, Fortune Management). They have recurring relationships with owners, are trusted completely, and they're always looking for tools to add value.

---

### Tier 2 — Cross-Vertical Affiliates

These affiliates span multiple verticals and can drive volume across all three:

| Affiliate | Type | Reach |
|-----------|------|-------|
| **Profit First Certified Coaches** | Small business financial coaches | 500+ coaches, serve all SMB verticals |
| **EOS Implementers** | Business operating system consultants | 500+ implementers who work with SMBs |
| **SCORE mentors** | Free business mentors (SBA-backed) | 10K+ volunteers, serve all SMB types |
| **Local chambers of commerce** | Business associations | Each chapter has 200–1,000 member businesses |
| **Entrepreneur.com contributors** | Business media | Reach SMB owners across all verticals |
| **LinkedIn B2B influencers** | Content creators targeting business owners | 10K–500K followers in SMB space |
| **G2/Capterra reviewers** | Power users who write reviews | Trusted by buyers in decision phase |

---

## Outreach Sequence (Per Affiliate)

### Day 1 — Cold Email
Subject: Partnership opportunity — 15% recurring commission on Newo.ai referrals

```
Hi [Name],

I run [role] at Newo.ai — we're an AI receptionist that answers calls 24/7, 
books appointments, and handles inquiries across phone, SMS, chat, and more 
for [restaurants/HVAC companies/dental practices].

We just launched a partner program and are selectively inviting [consultants/
coaches/agencies] who work with [vertical] owners. Commission is 15% recurring 
for 12 months on every customer you refer — closed deals pay out monthly.

The average Newo customer is at $299/month, so that's $537/year per referral.

We have an affiliate portal live — unique link, dashboard, automatic notifications 
when your leads progress. Takes 5 minutes to sign up.

Interested in a quick 15-minute call this week?

Ryan McManus
ryan.mcmanus@newo.ai
```

### Day 4 — Follow-Up With Value
Send the vertical-specific lead magnet (e.g., HVAC After-Hours Job Value Calculator) 
with a note: "Thought this might be useful for your clients — we give this to 
affiliates to share with their audience."

### Day 7 — Final Outreach
One-line: "Did the partnership catch your interest? Happy to set up the account 
for you in 5 minutes — would just need your email to get started."

---

## Partner Onboarding (After Yes)

1. Send portal signup link: `https://newo-affiliate-app-production.up.railway.app/`
2. They sign up → unique referral link generated automatically
3. Send welcome email with:
   - Their referral link
   - Newo one-pager (PDF) to share with clients
   - Vertical-specific lead magnet (calculator)
   - Commission agreement link
4. Schedule 15-min onboarding call if they want it

Target: onboarding under 30 minutes per affiliate.

---

## 90-Day Rollout Timeline

### Month 1 (April 20 – May 20): System + First 10 Partners
- [ ] Complete all pre-launch checklist items above
- [ ] Recruit and onboard 3 restaurant affiliates (start with Toast certified partners)
- [ ] Recruit and onboard 4 home services affiliates (ServiceTitan partners + 2 coaches)
- [ ] Recruit and onboard 3 dental affiliates (1 large consulting firm + 2 smaller)
- [ ] Get first 3 referral links shared publicly by affiliates
- [ ] Track: signups, link clicks, leads submitted

### Month 2 (May 20 – June 20): Scale to 25 Partners
- [ ] Send all 10 active affiliates a monthly update with tips + win stories
- [ ] Recruit 15 more affiliates using learnings from Month 1
- [ ] Launch "affiliate spotlight" — feature a top partner in outreach materials
- [ ] Close first Closed Won deal → process first commission payout
- [ ] Publish case study with first affiliate win (quote + numbers)

### Month 3 (June 20 – July 20): Systematize + 50 Partners
- [ ] Recruit to 50 total affiliates
- [ ] Create tiered structure: Standard (15%) / Elite (17% for 3+ closed deals)
- [ ] Build affiliate newsletter cadence (monthly)
- [ ] Document full playbook for second customer launch on OH.io platform

---

## Success Metrics

| Metric | Month 1 | Month 3 |
|--------|---------|---------|
| Active affiliates (signed up + shared link) | 10 | 50 |
| Referral link clicks | 200 | 2,000 |
| Leads submitted | 15 | 100 |
| Closed Won | 1 | 8 |
| Monthly recurring from affiliate deals | $299 | $2,400 |
| Commission paid out | $44.85 | $360/month |

---

## Notes on the Platform

The portal (built by Kyle on Railway) is extensible to multiple customers. 
After Newo.ai pilot validates the model, OH.io can pitch the affiliate tracking 
system as a service to other clients.

Key open decisions (need answers before launch):
- Commission: **15% recurring recommended** (confirm with Newo leadership)
- Attribution: **60-day last-click recommended**
- Payout: **monthly batch, net-30 after Closed Won** via ACH
- Partner portal: **self-serve** (already built this way)

---

Document prepared: April 19, 2026 | Ryan McManus (rmcmanus@oh.io)
