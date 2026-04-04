# Coastal Key — Social Media Automation & Posting System

**Classification:** Operations Playbook
**System Owner:** MKT Division (40 AI Agents)
**Version:** 1.0.0

---

## I. SYSTEM ARCHITECTURE

### The Content Engine Pipeline

```
[Content Generation] → [Airtable Calendar] → [Buffer Queue] → [Platform APIs] → [Analytics Sync]
      ↑                       ↑                     ↑                              ↓
  Claude API            Manual Review          Scheduling              Engagement Metrics
  MKT Division          Status Gates           Peak Times              back to Airtable
  40 AI Agents          Approval Flow          Auto-publish            Performance Loop
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

### Daily Minimum: 3 Posts Per Platform

| Platform | Post 1 | Post 2 | Post 3 | Weekly Total |
|---|---|---|---|---|
| **Instagram** | 7:00 AM ET | 12:00 PM ET | 7:00 PM ET | 21 |
| **Facebook** | 9:00 AM ET | 1:00 PM ET | 5:00 PM ET | 21 |
| **LinkedIn** | 7:30 AM ET | 12:00 PM ET | 5:30 PM ET | 21 |
| **YouTube** | 12:00 PM ET | 3:00 PM ET | 8:00 PM ET | 21 |
| **TikTok** | 8:00 AM ET | 1:00 PM ET | 8:00 PM ET | 21 |
| **TOTAL** | | | | **105/week** |

### Why These Times

- **Early morning (7-9 AM):** Property owners checking phones before work. Investors scanning market updates with coffee. Relocators researching during quiet hours.
- **Midday (12-1 PM):** Lunch break scrolling. Highest LinkedIn engagement window. Decision-makers between meetings.
- **Evening (5-8 PM):** End-of-day wind-down. Highest Instagram Reel completion rates. YouTube long-form consumption peaks.

### Weekend Adjustments

- Saturday: Shift all times 1 hour later (lifestyle content performs better with late risers)
- Sunday: Reduce LinkedIn to 1 post (professionals disengage). Increase lifestyle content across Instagram/TikTok.

---

## III. CONTENT PILLAR ROTATION

### Weekly Distribution

| Day | Morning Slot | Midday Slot | Evening Slot |
|---|---|---|---|
| **Monday** | AI Authority | Market Intelligence | Tracey Hunter |
| **Tuesday** | Market Intelligence | Treasure Coast Lifestyle | AI Authority |
| **Wednesday** | Tracey Hunter | AI Authority | Market Intelligence |
| **Thursday** | Treasure Coast Lifestyle | Tracey Hunter | AI Authority |
| **Friday** | AI Authority | Market Intelligence | Treasure Coast Lifestyle |
| **Saturday** | Treasure Coast Lifestyle | Tracey Hunter | Market Intelligence |
| **Sunday** | Treasure Coast Lifestyle | AI Authority | Tracey Hunter |

This rotation ensures:
- Each pillar gets ~25% of weekly content
- No two consecutive posts on any platform share the same pillar
- Weekend skews toward lifestyle (higher engagement on leisure content)

---

## IV. CONTENT CREATION WORKFLOW

### Stage 1: Generation (Automated)

```
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

The MKT division AI agents generate:
- Caption copy (platform-optimized length)
- Hashtag sets (5-10 per post)
- CTA (single, pillar-matched)
- Visual direction notes (for asset production)

Output writes directly to Airtable Content Calendar with `Status: Draft`.

### Stage 2: Review Gate (Human)

- **Draft** → Content generated, awaiting review
- **In Review** → Tracey or team member reviewing
- **Approved** → Ready for scheduling
- **Scheduled** → Queued in Buffer for publishing
- **Published** → Live on platform
- **Rejected** → Needs revision (notes added)

### Stage 3: Scheduling (Automated)

Approved posts auto-queue to Buffer at designated peak times:
- Buffer API integration via `Buffer Status` and `Buffer Post ID` fields
- `Buffer Scheduled` checkbox confirms queue placement
- Fallback: if Buffer fails, native platform scheduling via API

### Stage 4: Publishing (Automated)

Buffer publishes at the scheduled time. On publish:
- `Status` → Published
- `Published At` → timestamp
- `Buffer Sync` → confirmation ID

### Stage 5: Analytics (Automated — Daily Sync)

Daily cron job at 6:00 AM ET syncs previous day's metrics:
- `Impressions` ← platform API
- `Engagements` ← platform API (likes + comments + shares + saves)
- `Engagement Rate` ← calculated (engagements / impressions × 100)
- `Analytics Synced` ← sync date

---

## V. PLATFORM-SPECIFIC AUTOMATION RULES

### Instagram
- **Reels:** Auto-generate cover frame from first 3 seconds. Add caption overlay.
- **Carousels:** Generate 5-8 slides. First slide = hook. Last slide = CTA.
- **Stories:** Auto-post daily. Include poll/question sticker 3x/week for engagement.
- **Auto-reply:** DM automation for common inquiries → route to Speed-to-Lead.

### Facebook
- **Cross-post:** Instagram Reels auto-share to Facebook Reels.
- **Groups:** Auto-post market updates to "Treasure Coast Property Owners" group.
- **Boost rules:** Posts exceeding 2x average engagement auto-flagged for paid boost.
- **Event integration:** Local events auto-posted from community calendar.

### LinkedIn
- **Article publishing:** Long-form posts auto-formatted for LinkedIn article layout.
- **Engagement automation:** Auto-like and comment on 10 target accounts daily.
- **Newsletter:** Weekly digest of top-performing posts → LinkedIn Newsletter.
- **Tagging:** Auto-tag relevant industry connections on thought leadership posts.

### YouTube
- **Shorts:** All Instagram Reels auto-repurposed as YouTube Shorts.
- **SEO:** Auto-generate titles, descriptions, and tags optimized for search.
- **Thumbnails:** AI-generate thumbnail with consistent brand template.
- **End screens:** Auto-add subscribe CTA and related video link.

### TikTok
- **Trend monitoring:** MKT agents scan trending sounds/formats daily.
- **Cross-post:** Top-performing Reels repurposed with TikTok-native captions.
- **Duets/Stitches:** Flag competitor content for strategic duet opportunities.
- **Hashtag optimization:** Real-time hashtag performance tracking.

---

## VI. CONTENT TEMPLATES

### Template 1: AI Authority Reel (Instagram/TikTok)
```
HOOK (0-1.5s): "Here's what 290 AI agents do before you wake up."
BODY (1.5-12s): Screen recording of Command Center dashboard.
       Show agent count, division breakdown, real-time activity feed.
CLOSER (12-15s): "Your property. Our obsession. Link in bio."
```

### Template 2: Market Intelligence Carousel (Instagram/Facebook)
```
SLIDE 1: "[County] Q1 2026 Market Report" — bold headline, CK branding
SLIDE 2: Median price + YoY change — big number, trend arrow
SLIDE 3: Days on market — comparison chart
SLIDE 4: Hot zones — map with highlighted areas
SLIDE 5: "What this means for you" — plain-language insight
SLIDE 6: CTA — "Get your free property valuation. Link in bio."
```

### Template 3: Tracey Hunter Talking Head (All Platforms)
```
HOOK: Direct-to-camera. "I listed this waterfront home at $1.8M. Then something unexpected happened."
STORY: 30-60 seconds. Natural, conversational. One key insight or win.
CTA: "If you're thinking about making a move on the Treasure Coast, let's talk."
```

### Template 4: Treasure Coast Lifestyle (Instagram/TikTok)
```
VISUAL: Drone footage — sunrise over Hutchinson Island / Stuart waterfront / Jupiter Inlet
OVERLAY TEXT: "This is why people are moving to the Treasure Coast."
CAPTION: Market fact + lifestyle benefit + soft CTA
```

### Template 5: LinkedIn Thought Leadership
```
HOOK LINE: One provocative statement about AI in real estate.
BODY: 800-1200 words. Personal perspective. Data-backed.
       Reference specific CK infrastructure (fleet size, divisions, endpoints).
CLOSER: Question to drive comments. Soft CTA.
```

---

## VII. AUTOMATION TRIGGERS

### Event-Driven Content

| Trigger | Content Generated | Platform |
|---|---|---|
| New lead created in Airtable | "Another Treasure Coast property owner joined Coastal Key" | Instagram Story |
| Deal closed by Tracey | Celebration post + Children's Miracle Network mention | All platforms |
| Market report generated by INT division | Data carousel + video summary | Instagram, LinkedIn, YouTube |
| Hurricane watch issued | Storm prep content series (3 posts) | All platforms |
| New property listed | Property showcase Reel + carousel | Instagram, Facebook, TikTok |
| Monthly Gazette published | Gazette excerpt series (5 posts) | LinkedIn, Instagram |
| 100+ calls in a day by Sentinel | "Our AI fleet made 2,400 calls today" milestone post | LinkedIn, TikTok |

### Recurring Automation

| Schedule | Action |
|---|---|
| Daily 5:00 AM ET | Generate day's content → Airtable (Status: Draft) |
| Daily 5:30 AM ET | Auto-approve posts matching approved templates |
| Daily 6:00 AM ET | Sync previous day's analytics from all platforms |
| Weekly Monday 4:00 AM ET | Generate full week content batch |
| Weekly Friday 5:00 PM ET | Week-in-review performance report → Slack |
| Monthly 1st 6:00 AM ET | Generate monthly market report content series |
| Quarterly | Content pillar performance audit. Rebalance if needed. |

---

## VIII. PERFORMANCE MONITORING

### Real-Time Dashboard (Command Center Integration)

Add social media metrics to the CK Command Center dashboard:
- Live follower count across all platforms
- Today's posts: published vs. scheduled vs. draft
- Engagement rate trend (7-day rolling average)
- Top-performing post of the week
- Content pipeline status (how many posts in each stage)

### Alert Triggers

| Condition | Alert | Channel |
|---|---|---|
| Post engagement > 3x average | "Boost candidate" flag | Slack #marketing |
| Engagement rate drops below 2% for 3 days | "Content quality review needed" | Slack #marketing |
| Buffer publish failure | "Manual post required" | Slack #marketing-urgent |
| Negative comment detected | "Reputation management" | Slack #marketing-urgent |
| Follower milestone (every 1,000) | Celebration post auto-generated | All platforms |

---

## IX. CONTENT REPURPOSING MATRIX

Every piece of content gets repurposed across the ecosystem:

```
1 YouTube Video (8 min)
  → 3 YouTube Shorts (15-60s clips)
  → 3 Instagram Reels (reformatted)
  → 3 TikToks (native captions)
  → 1 LinkedIn Article (transcript + insights)
  → 1 Facebook Post (key takeaway)
  → 5 Instagram Stories (behind-the-scenes)
  → 1 Email Newsletter segment
  → 1 Gazette excerpt

Total: 1 production → 18 content pieces
```

### Repurposing Rules
- YouTube → Shorts: Extract top 3 hooks/moments
- YouTube → Reels: Reformat to 9:16, add Instagram-native text overlays
- YouTube → LinkedIn: Transcribe, edit for professional tone, add data callouts
- Reels → TikTok: Re-caption with TikTok-native language, trending sounds
- LinkedIn → Email: Condense to 300 words, add personal CTA from Tracey

---

*Coastal Key Property Management — Automated Content Operations*
*MKT Division | 40 AI Agents | 105 Posts/Week | Zero Manual Publishing*
