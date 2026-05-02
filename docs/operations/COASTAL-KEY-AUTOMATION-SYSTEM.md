# Coastal Key — Social Media Automation & Posting System

**Classification:** Operations Playbook
**System Owner:** MKT Division (40 AI Agents)
**Version:** 2.0.0

---

## I. SYSTEM ARCHITECTURE

### Content Engine Pipeline

```
[Content Generation] → [Airtable Calendar] → [Buffer Queue] → [Platform APIs] → [Analytics Sync]
       ↑                      ↑                    ↑                                ↓
   Claude API           Manual Review          Scheduling                   Engagement Metrics
  MKT Division          Status Gates           Peak Times                  back to Airtable
  40 AI Agents          Approval Flow          Auto-publish                Performance Loop
```

### Components

| Component | Technology | Role |
|---|---|---|
| **Content Brain** | Claude API via `/v1/content/generate` | Generates captions, scripts, articles, hashtags |
| **Content Calendar** | Airtable `Content Calendar` table | Single source of truth for all scheduled content |
| **Distribution** | Buffer API / native platform scheduling | Queues and publishes at peak times |
| **Analytics** | Platform APIs → Airtable sync | Tracks impressions, engagements, engagement rate |
| **Orchestration** | CK API Gateway + Cloudflare Workers | Triggers generation, syncs analytics, manages pipeline |

---

## II. POSTING CADENCE & PEAK HOURS

### Platform Schedule

| Platform | Post 1 | Post 2 | Post 3 | Weekly Total |
|---|---|---|---|---|
| Instagram | 7:00 AM ET | 12:00 PM ET | 7:00 PM ET | 21 |
| Facebook | 9:00 AM ET | 1:00 PM ET | — | 14 |
| LinkedIn | 7:30 AM ET | — | — | 7 |
| YouTube | 12:00 PM ET | — | — | 3 |
| TikTok | 8:00 AM ET | 1:00 PM ET | — | 14 |
| X (Twitter) | 7:30 AM ET | 12:30 PM ET | 7:00 PM ET | 21 |
| Mighty Networks | 8:00 AM ET | — | — | 7 |
| Alignable | 8:30 AM ET | — | — | 7 |
| **TOTAL** | | | | **~94-112/week** |

### Why These Times

**Early morning (7-9 AM):** Property owners checking phones before work. Investors scanning market updates. Relocators researching during quiet hours. **Midday (12-1 PM):** Lunch-break scrolling. Highest LinkedIn engagement window. Decision-makers between meetings. **Evening (5-8 PM):** End-of-day wind-down. Highest Instagram Reel completion rates. YouTube long-form consumption peaks.

**Weekend adjustments:** Saturday — shift all times 1 hour later (lifestyle content performs better with late risers). Sunday — reduce LinkedIn to 0 posts, increase lifestyle content on Instagram/TikTok.

---

## III. CONTENT PILLAR ROTATION

| Day | Morning Slot | Midday Slot | Evening Slot |
|---|---|---|---|
| Monday | AI Authority | Market Intelligence | Tracey Hunter |
| Tuesday | Market Intelligence | Treasure Coast Lifestyle | AI Authority |
| Wednesday | Tracey Hunter | AI Authority | Market Intelligence |
| Thursday | Treasure Coast Lifestyle | Tracey Hunter | AI Authority |
| Friday | AI Authority | Market Intelligence | Treasure Coast Lifestyle |
| Saturday | Treasure Coast Lifestyle | Tracey Hunter | Market Intelligence |
| Sunday | Treasure Coast Lifestyle | AI Authority | Tracey Hunter |

Each pillar gets ~25% of weekly content. No two consecutive posts on any platform share the same pillar. Weekends skew toward lifestyle (higher engagement on leisure content).

---

## IV. CONTENT CREATION WORKFLOW

### Stage 1: Generation (Automated)

```json
POST /v1/content/generate
{
  "type": "social",
  "platform": "instagram",
  "pillar": "AI Authority",
  "target_segment": "Investors",
  "service_zone": "Stuart",
  "format": "reel",
  "tone": "authoritative"
}
```

MKT agents generate: caption copy (platform-optimized), hashtag sets (5-10), single pillar-matched CTA, and visual direction notes. Output writes to Airtable Content Calendar with Status: `Draft`.

### Stage 2: Review Gate (Human)

`Draft` → `In Review` → `Approved` → `Scheduled` → `Published` (or `Rejected` with revision notes)

### Stage 3: Scheduling (Automated)

Approved posts auto-queue to Buffer at designated peak times via Buffer API. Buffer Status and Buffer Post ID fields confirm placement. Fallback: native platform scheduling via API if Buffer fails.

### Stage 4: Publishing (Automated)

On publish: Status → `Published`, timestamp recorded, Buffer sync confirmation logged.

### Stage 5: Analytics (Daily Sync at 6:00 AM ET)

Daily cron syncs previous day's metrics per post: Impressions, Engagements (likes + comments + shares + saves), Engagement Rate (engagements / impressions × 100), and sync date.

---

## V. PLATFORM-SPECIFIC AUTOMATION RULES

### Instagram
Reels: auto-generate cover frame from first 3 seconds, add caption overlay. Carousels: generate 5-8 slides (first = hook, last = CTA). Stories: auto-post daily with poll/question sticker 3x/week. DM automation for common inquiries → route to Speed-to-Lead.

### Facebook
Cross-post Instagram Reels to Facebook Reels. Auto-post market updates to "Treasure Coast Property Owners" group. Posts exceeding 2x average engagement auto-flagged for paid boost. Local events auto-posted from community calendar.

### LinkedIn
Long-form posts auto-formatted for article layout. Auto-like and comment on 10 target accounts daily. Weekly digest → LinkedIn Newsletter. Auto-tag relevant connections on thought leadership posts.

### YouTube
All Instagram Reels auto-repurposed as YouTube Shorts. AI-generated titles, descriptions, and tags optimized for search. Consistent brand-template thumbnails. Auto-add subscribe CTA and related video end screens.

### TikTok
MKT agents scan trending sounds/formats daily. Top Reels repurposed with TikTok-native captions. Flag competitor content for strategic duet opportunities. Real-time hashtag performance tracking.

### X (Twitter)
LinkedIn articles auto-converted to 5-8 tweet threads (first tweet = standalone hook). Market stats auto-pulled from INT Division data for single-tweet data drops. Flag competitor tweets for quote-tweet responses with Treasure Coast data. Weekly auto-poll from engagement data — results feed content strategy. Auto-limit 2-3 hashtags per tweet. Auto-reply to mentions within 15 minutes.

### Mighty Networks
Discussion prompts and exclusive content auto-posted at peak engagement times. New member welcome sequence: 5 posts over 7 days (fleet intro, Tracey credentials, service zones, premium access). Monthly "Command Center Live" auto-scheduled with 24h/1h/15min reminders. Members segmented by interest for targeted delivery. Premium gating on Gazette reports and DELTA Squad data. Weekly engagement scores trigger re-engagement nudges.

### Alignable
Operational milestones auto-posted from Airtable events. Auto-connect with Treasure Coast businesses in target categories (HVAC, plumbing, landscaping, cleaning, insurance). Auto-prompt recommendations after successful vendor projects; reciprocate within 48 hours. Condensed LinkedIn market intelligence auto-formatted for business audience. New contractor connections auto-flagged for VEN Division intake.

---

## VI. CONTENT TEMPLATES

### Template 1: AI Authority Reel (Instagram/TikTok)

**Hook (0-1.5s):** "Here's what 290 AI agents do before you wake up." **Body (1.5-12s):** Command Center dashboard screen recording — agent count, division breakdown, activity feed. **Closer (12-15s):** "Your property. Our obsession. Link in bio."

### Template 2: Market Intelligence Carousel (Instagram/Facebook)

Slide 1: "[County] Q1 2026 Market Report" (bold headline, CK branding). Slide 2: Median price + YoY change. Slide 3: Days on market comparison. Slide 4: Hot zones map. Slide 5: Plain-language insight. Slide 6: CTA — "Get your free property valuation."

### Template 3: Tracey Hunter Talking Head (All Platforms)

**Hook:** Direct-to-camera. "I listed this waterfront home at $1.8M. Then something unexpected happened." **Story (30-60s):** Natural, conversational, one key insight. **CTA:** "Thinking about making a move on the Treasure Coast? Let's talk."

### Template 4: Lifestyle (Instagram/TikTok)

Drone footage (Hutchinson Island sunrise / Stuart waterfront / Jupiter Inlet). Overlay: "This is why people are moving to the Treasure Coast." Caption: market fact + lifestyle benefit + soft CTA.

### Template 5: LinkedIn Thought Leadership

One provocative opening statement. 800-1,200 words, personal perspective, data-backed, referencing CK infrastructure. Close with engagement question and soft CTA.

---

## VII. AUTOMATION TRIGGERS

### Event-Driven Content

| Trigger | Content Generated | Platform |
|---|---|---|
| New lead in Airtable | "Another Treasure Coast property owner joined Coastal Key" | Instagram Story |
| Deal closed by Tracey | Celebration post + Children's Miracle Network mention | All platforms |
| INT division market report | Data carousel + video summary | Instagram, LinkedIn, YouTube |
| Hurricane watch issued | Storm prep content series (3 posts) | All platforms |
| New property listed | Property showcase Reel + carousel | Instagram, Facebook, TikTok |
| Monthly Gazette published | Gazette excerpt series (5 posts) | LinkedIn, Instagram |
| 100+ Sentinel calls in a day | "Our AI fleet made 2,400 calls today" milestone | LinkedIn, TikTok |

### Recurring Schedule

| Frequency | Time | Action |
|---|---|---|
| Daily | 5:00 AM ET | Generate day's content → Airtable (`Draft`) |
| Daily | 5:30 AM ET | Auto-approve posts matching approved templates |
| Daily | 6:00 AM ET | Sync previous day's analytics from all platforms |
| Weekly (Mon) | 4:00 AM ET | Generate full week content batch |
| Weekly (Fri) | 5:00 PM ET | Week-in-review performance report → Slack |
| Monthly (1st) | 6:00 AM ET | Generate monthly market report content series |
| Quarterly | — | Content pillar performance audit; rebalance if needed |

---

## VIII. PERFORMANCE MONITORING

### Command Center Integration

Social media metrics added to CK Command Center dashboard: live follower counts, today's post status (published/scheduled/draft), 7-day rolling engagement rate, top-performing post of the week, and content pipeline stage counts.

### Alert Triggers

| Condition | Alert | Channel |
|---|---|---|
| Post engagement > 3x average | "Boost candidate" flag | Slack #marketing |
| Engagement rate < 2% for 3 days | "Content quality review needed" | Slack #marketing |
| Buffer publish failure | "Manual post required" | Slack #marketing-urgent |
| Negative comment detected | "Reputation management" | Slack #marketing-urgent |
| Follower milestone (every 1,000) | Celebration post auto-generated | All platforms |

---

## IX. CONTENT REPURPOSING MATRIX

**1 YouTube video (8 min) produces:**

1 YouTube Video → 3 Shorts → 3 Instagram Reels → 3 TikToks → 1 LinkedIn Article → 1 Facebook Post → 1 X Thread → 1 Mighty Networks Discussion → 1 Alignable Update → 5 Instagram Stories → 1 Email Newsletter segment → 1 Gazette excerpt

**Total: 1 production → 21 content pieces.**

### Repurposing Rules

YouTube → Shorts: extract top 3 hooks/moments. YouTube → Reels: reformat to 9:16, Instagram-native overlays. YouTube → LinkedIn: transcribe, professional tone, data callouts. Reels → TikTok: re-caption with native language, trending sounds. LinkedIn → Email: condense to 300 words, personal CTA from Tracey.

---

*Coastal Key Property Management — Automated Content Operations | MKT Division | 40 AI Agents | ~112 Posts/Week | 8 Platforms | Zero Manual Publishing*
