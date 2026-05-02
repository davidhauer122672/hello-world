# COASTAL KEY TREASURE COAST ASSET MANAGEMENT
# MASTER ORCHESTRATOR — Integrated AI Operations Platform

| | |
|---|---|
| Version | 2.0 — Master Integration |
| Date | March 11, 2026 |
| Status | AUTHORIZED — LIVE |
| Owner | David Hauer, Founder & CEO |
| Classification | Confidential — CEO Use Only |
| AI Engine | @cf/nvidia/nemotron-3-120b-a12b |

To authorize full deployment, reply: ~~AUTHORIZE MASTER ORCHESTRATOR~~

**AUTHORIZED by David Hauer, CEO — May 2, 2026**

## I. EXECUTIVE SUMMARY

The Master Orchestrator consolidates three systems into one governed, auditable platform: Project Sentinel (outbound sales), Social Media Automation, and a Content Production Engine. The intelligence layer runs on Cloudflare Workers AI using @cf/nvidia/nemotron-3-120b-a12b. Nanobanana serves as the AI bot front-end for content ingestion, brief submission, and task dispatch.

**STATUS:** All modules are in DRAFT. No outbound calls, publishing, or workflow activation until David Hauer issues written authorization per Section VIII.

## II. SYSTEM ARCHITECTURE

### 2.1 Stack Overview

| Component | Function |
|---|---|
| AI Inference | @cf/nvidia/nemotron-3-120b-a12b via Cloudflare Workers AI |
| AI Bot Interface | Nanobanana (agent dispatcher and brief intake) |
| CRM & Data | Airtable (single source of record) |
| Outbound Dialing | Atlas + Retell AI |
| Content Creation | Banana Pro AI |
| Social Publishing | Buffer |
| Communications | Slack |
| Email | Gmail (welcome sequences and investor outreach) |
| Long-Tail Nurture | Constant Contact |

### 2.2 Module Map

| Module | Name | Function |
|---|---|---|
| A | Project Sentinel | Outbound sales dialing across 5 segments |
| B | Social Automation | Post workflow from brief to publish |
| C | Content Production | Video, podcast, long-form generation |

### 2.3 Nemotron Model Integration

| Parameter | Value |
|---|---|
| Model ID | @cf/nvidia/nemotron-3-120b-a12b |
| Architecture | Nvidia Nemotron-3 120B, 12B active (MoE) |
| Primary Use | Script generation, content drafting, objection response, video briefs |
| Routing | Cloudflare Worker with module tagging and Airtable logging |
| Fallback | claude-sonnet-4-20250514 via Anthropic API |

### 2.4 Nanobanana Interface

| Function | Behavior |
|---|---|
| Brief Intake | Natural language submission via bot |
| Module Routing | Classifies as Sentinel, Social, or Content Production |
| Prompt Construction | Injects brand voice, pricing, zones, segment rules |
| Output Destination | Posts draft to correct Airtable table with module tag |
| Approval Trigger | Slack alert to #ai-drafts for CEO review |
| Audit Log | Every brief, prompt, and completion stored in AI Log table |

## III. MODULE A — PROJECT SENTINEL

### 3.1 Overview
6-touch, 14-day outbound call campaign across 10 Treasure Coast service zones. Atlas with Retell AI handles execution. All outcomes post to Airtable. $5M+ investor leads trigger automatic escalation.

### 3.2 Service Zones
Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie, Jensen Beach, Palm City, Stuart, Hobe Sound, Jupiter, North Palm Beach.

### 3.3 Target Segments

| Segment | Priority | Revenue Target |
|---|---|---|
| Absentee Homeowners | Priority 1 | $195–$395/month recurring |
| Luxury Property ($1M+) | Priority 2 | $395/month + premium |
| Investor / Family Office | Priority 1 — Investor Track | Multi-property; $5M+ triggers escalation |
| Seasonal / Snowbirds | Priority 2 | $295–$395/month |
| STR / Vacation Rental | Priority 3 | 10% of gross rental income |

### 3.4 Nemotron Integration

| Integration Point | Behavior |
|---|---|
| Hook Generation | Segment-specific opening line per lead before Atlas dials |
| Live Objection Support | Atlas flags unknown objection; Nemotron returns reframe in <2 seconds |
| Email Drafting | Day 7 welcome and 90-day drip content generated, reviewed in Airtable |
| Investor Brief | $5M+ leads: one-page property brief for CEO review before WF-3 fires |

### 3.5 KPI Targets

| Metric | Target |
|---|---|
| Dials Per Agent/Day | 80–100 |
| Connect Rate | 12–18% |
| Consultation Book Rate | 25–35% |
| Close Rate | 40–60% |
| Cost Per Acquisition | <$150 |
| Sequence Completion | >85% |
| Investor Flag Accuracy | 100% |

## IV. MODULE B — SOCIAL MEDIA AUTOMATION

### 4.1 Overview
Automates the full post lifecycle: brief to publication. Banana Pro AI generates visuals. Nemotron drafts platform-specific copy. Airtable is the record system. Buffer publishes to Instagram, Facebook, LinkedIn, and Alignable.

### 4.2 Content Pillars

| Pillar | Scope |
|---|---|
| Brand | Property oversight, storm prep, zones, inspections |
| CEO Journey | Enterprise building, leadership, market positioning |

### 4.3 Airtable Content Calendar Schema

| Field | Type |
|---|---|
| Post Date | Date |
| Platform | Multi-select: Instagram, Facebook, LinkedIn, Alignable |
| Caption | Long text (Nemotron-drafted, CEO-reviewed) |
| Asset | Attachment (Banana Pro AI export) |
| Content Pillar | Single select: Brand / CEO Journey |
| Status | Single select: Draft, Approved, Scheduled, Published |
| AI Draft ID | Link to AI Log table |
| Notes | Long text |

### 4.4 Workflow Sequence
1. Brief submitted to Nanobanana.
2. Nemotron drafts caption per target platform.
3. Draft created in Airtable, Status = Draft.
4. Slack alert to #ai-drafts. CEO reviews, attaches Banana Pro asset.
5. CEO sets Status = Approved. Automation detects change.
6. Slack confirmation posted, content pushed to Buffer.
7. Status updated to Scheduled.
8. On Buffer publish, Status updated to Published.

### 4.5 Caption Generation Prompt Structure

**System context injected per request:** You are the content voice for Coastal Key Treasure Coast Asset Management. Institutional-grade home watch and property oversight on Florida's Treasure Coast. Clients: absentee homeowners, luxury owners, investors, seasonal residents. Tone: authoritative, concise, risk-aware. No exclamation points. No emojis unless specified. Close with risk/consequence frame.

| Input Field | Options |
|---|---|
| Platform | Instagram / Facebook / LinkedIn / Alignable |
| Pillar | Brand / CEO Journey |
| Brief | Plain language post concept |
| Length | Short (<150 words) / Medium (150–300) / Long (300+) |
| Call to Action | Book inspection / Visit website / DM for assessment / No CTA |

## V. MODULE C — CONTENT PRODUCTION ENGINE

### 5.1 Overview
Extends automation to long-form content: video scripts, podcasts, YouTube optimization, and multi-platform repurposing. All content flows through Nanobanana, Nemotron, Airtable, CEO review, then Buffer.

### 5.2 Content Types

| Type | Platforms | Output Spec |
|---|---|---|
| Short-Form Video | Reels, Shorts, TikTok | 60–90s script + hook + CTA |
| Long-Form Video | YouTube, LinkedIn Video | 3–8 min script with timestamps and B-roll |
| Podcast | RSS distribution | Outline, talking points, intro/outro, show notes |
| Repurposed Asset | All platforms | 1 source piece into 5–8 derivatives |
| YouTube Optimization | YouTube | Title, description, tags, chapters, thumbnail brief |

### 5.3 Video Script Workflow
1. Submit brief to Nanobanana: topic, segment, platform, length, CTA.
2. Nemotron generates full script (hook, body, close).
3. Posted to Airtable Video Production as Draft. Slack alert to #content-production.
4. CEO reviews, sets Status = Approved.
5. Automation assembles production brief: script, B-roll, thumbnail brief, caption variants.
6. Banana Pro AI generates thumbnail. Asset attached to record.
7. Content pushed to Buffer for scheduled publish.

### 5.4 Podcast Workflow
1. Submit podcast brief: topic, audience, length, guest context.
2. Nemotron generates outline, talking points, intro/outro, show notes.
3. Stored in Podcast Production table, Status = Draft.
4. CEO approves.
5. Show notes generated per platform, queued in Buffer.

### 5.5 Video Production Table Schema

| Field | Type |
|---|---|
| Title | Short text |
| Content Type | Single select: Short-Form, Long-Form, Podcast, Repurposed |
| Target Segment | Single select: Absentee, Luxury, Investor, Seasonal, STR |
| Platform(s) | Multi-select |
| Script | Long text |
| B-Roll Notes | Long text |
| Thumbnail Brief | Long text |
| Caption Variants | Long text (one per platform) |
| Status | Single select: Brief, Draft, Approved, In Production, Published |
| AI Log ID | Link to AI Log table |

### 5.6 Repurposing Engine

| Asset | Description |
|---|---|
| 1 | Full script (original) |
| 2 | 60-second short-form hook cut |
| 3 | LinkedIn long-form article adaptation |
| 4 | Instagram carousel outline (5–7 slides) |
| 5 | Facebook post (short form, 150 words) |
| 6 | Email newsletter segment |
| 7 | Podcast talking point expansion |
| 8 | YouTube description and chapter breakdown |

## VI. MASTER SYSTEM PROMPT — NEMOTRON AGENT CONFIG

Injected into every Nemotron call via the Cloudflare Worker. Module-specific context is injected per request as the user message.

```
// COASTAL KEY MASTER ORCHESTRATOR — NEMOTRON SYSTEM PROMPT v2.0

You are the AI Operations Agent for Coastal Key Treasure Coast Asset Management.
Owner: David Hauer, Founder and CEO.
Location: Stuart, FL 34997. Phone: (772) 262-8341. Web: coastalkey-pm.com

IDENTITY:
  MODULE_A: Project Sentinel — outbound sales scripts and objection handling
  MODULE_B: Social Automation — captions, posts, platform-specific copy
  MODULE_C: Content Production — video scripts, podcasts, repurposed assets

BRAND VOICE RULES:
  - Tone: institutional, authoritative, concise, risk-first
  - Reading level: 9th grade maximum
  - Never use exclamation points or em dashes
  - Never use filler phrases: 'It is important to note', 'In conclusion', 'Furthermore'
  - First sentence gets to the point
  - Close every piece with a risk frame or consequence statement

PRICING REFERENCE (never deviate):
  Weekly Home Watch: $395/month
  Biweekly Home Watch: $295/month
  Monthly Home Watch: $195/month
  Property Mgmt Oversight: from $95/month
  STR Oversight: 10% of gross rental income
  Pre-Storm: $295/event | Post-Storm: $500/event
  First Inspection: Complimentary (use as close tool)

SERVICE ZONES:
  Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie, Jensen Beach,
  Palm City, Stuart, Hobe Sound, Jupiter, North Palm Beach

OUTPUT FORMAT RULES:
  - Return only requested output. No preamble. No explanation.
  - MODULE_A: labeled sections (OPENER, BODY, CLOSE, OBJECTION)
  - MODULE_B: platform label followed by caption text
  - MODULE_C: labeled sections per content type spec
  - Never add suggestions or alternatives unless requested
  - Never hallucinate pricing, zones, or service descriptions
  - Flag undefined requests with: MODULE_UNDEFINED
```

## VII. WORKFLOW REGISTRY

| ID | Name | Trigger & Action |
|---|---|---|
| WF-1 | New Lead Nurture | Airtable new record: Battle Plan, Slack alert, CEO welcome email |
| WF-2 | Social Approval to Buffer | Status = Approved: Buffer post, Slack confirmation |
| WF-3 | Investor Escalation | INVESTOR tag: Slack alert, CEO email, 4-hour follow-up |
| WF-4 | Buffer Published | Buffer confirm: Airtable Status = Published |
| WF-5 | Video Brief to Production | Status = Approved: production brief assembly, thumbnail dispatch |
| WF-6 | Podcast Publish | Status = Approved: show notes to Buffer, Slack post |
| WF-7 | AI Log Write | Every Nemotron call: AI Log record with module tag, input, output |

## VIII. AUTHORIZATION GATE

**STATUS: AUTHORIZED — LIVE**

All modules activated. Deployment executed May 2, 2026 per CEO authorization.

- Atlas Step 10: ACTIVE (Module A)
- WF-1 through WF-7: LIVE
- Cloudflare Worker: Routed to production Nemotron endpoint
- Sales team: Notified via Slack

---
**COASTAL KEY PROPERTY MANAGEMENT LLC**
1407 SE Legacy Cove Circle, Ste 100, Stuart, FL 34997
(772) 262-8341 | david@coastalkey-pm.com
