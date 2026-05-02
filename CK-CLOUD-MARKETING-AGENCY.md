# COASTAL KEY ENTERPRISE: CLOUD MARKETING AGENCY

**Classification:** Sovereign Operating Architecture — Marketing Division (MKT) / MCCO Command
**Version:** 1.0.0 | **April 18, 2026**
**Authority:** Coastal Key AI CEO
**Governor:** Tracey Merritt Hunter
**Reference:** Instagram Reel DWVD4R1iFRb (@theaisurfer) — *AI marketing agency in the cloud*
**Owners:** MCCO-008 Campaign Blitz (Commander), MCCO-003 Pillar Command, MCCO-005 Scroll Breaker, MCCO-009 Pipeline Fusion
**Sister Skills:** `CK-CONTENT-MAXXING-SKILL.md` · `CK-CLAUDE-SECRETS-SKILL.md`

---

## I. THESIS

The Coastal Key Cloud Marketing Agency is a fully-automated, sovereign-governed marketing operation that lives entirely inside the existing Cloudflare + Airtable + Claude stack — no new SaaS vendors, no outsourced creative, no retainer relationships. It replaces a 12–18 person traditional agency (Strategy, Creative, Production, Media, Analytics, Account Management) with 47 MKT-division AI agents coordinated by the MCCO command structure, producing campaign-grade output at Fortune 500 standard with the per-campaign cost structure of a software workload.

**Strategic Position:** Coastal Key does not hire an agency. Coastal Key operates one.

---

## II. ARCHITECTURE OVERVIEW

### Agency Functional Stack (maps to traditional agency roles → Coastal Key agents)

| Traditional Role | Headcount Eliminated | Replaced By |
|---|---|---|
| Chief Marketing Officer | 1 | MCCO-000 Sovereign + MCCO-011 Narrative Forge |
| Strategy / Planning | 2 | MCCO-001 Psyche Decoder, MCCO-002 Authority Forge, MCCO-007 War Room Intel |
| Creative Director | 1 | MCCO-005 Scroll Breaker, MCCO-011 Narrative Forge |
| Copywriters | 3 | MKT Division copy squad (12 agents) |
| Designers / Motion | 2 | MKT Division visual squad (10 agents), Manus render pipeline |
| Content Calendar / PM | 1 | MCCO-004 Calendar Command |
| Media Buyer / Paid | 2 | MCCO-008 Campaign Blitz + paid squad (8 agents) |
| Community Management | 2 | 20 Email AI Agents (INTAKE / COMPOSE / NURTURE / MONITOR) |
| Analytics / Reporting | 2 | MCCO-012 Performance Command + Intelligence Officer Squad ECHO (10 agents) |
| QA / Compliance | 1 | MCCO-014 Quality Shield |
| Account Management | 2 | MCCO-009 Pipeline Fusion |
| **Total** | **~19 FTE** | **47 MKT agents + 15 MCCO + 10 IO-ECHO + 20 Email = 92 units** |

### Cloud Infrastructure Map

```
┌──────────────────────────────────────────────────────────────────┐
│  COASTAL KEY CLOUD MARKETING AGENCY — EDGE ARCHITECTURE          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CEO / GOVERNOR  →  MCCO-000 Sovereign  →  MCCO Command (14)    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ COMMAND LAYER (ck-api-gateway)                          │    │
│  │   /v1/mcco/*       — directive, calendar, posts         │    │
│  │   /v1/social/*     — drafts, publish, tracking          │    │
│  │   /v1/campaign/*   — paid media, A/B, attribution       │    │
│  │   /v1/visuals/*    — brief generation                   │    │
│  │   /v1/email/*      — nurture, compose, monitor          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐    │
│  │ INFERENCE LAYER                                         │    │
│  │   Claude API (strategy, copy, narrative, audit)         │    │
│  │   ck-nemotron-worker (high-volume generation)           │    │
│  │   Retell AI (voice outbound / Sentinel)                 │    │
│  │   ElevenLabs (voice rendering)                          │    │
│  │   Manus (render / visual production pipeline)           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐    │
│  │ DATA & STATE LAYER                                      │    │
│  │   Airtable base appUSnNgpDkcEOzhN (39 tables)           │    │
│  │     — Campaigns, Audiences, Atoms, KPIs, Attribution    │    │
│  │   Cloudflare KV — RATE_LIMITS, AUDIT_LOG (30d TTL)      │    │
│  │   Cloudflare R2 — asset storage                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐    │
│  │ DISTRIBUTION LAYER                                      │    │
│  │   Buffer (scheduling)                                   │    │
│  │   Twilio (SMS)                                          │    │
│  │   Email drip engine (cron hourly)                       │    │
│  │   ck-website / Command Center / Gazette                 │    │
│  │   Slack apps (3) — internal distribution                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐    │
│  │ MEASUREMENT LAYER                                       │    │
│  │   MCCO-012 Performance Command (KPI rollup)             │    │
│  │   IO Squad ECHO (performance intelligence)              │    │
│  │   CEO Daily Standup (6:00 AM EST)                       │    │
│  │   Publish Tracker (every 30 min)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## III. SIX OPERATING DIVISIONS OF THE CLOUD AGENCY

### Division 1 — STRATEGY & RESEARCH (IQVIA Standard)
**Mission:** Every campaign starts from evidence. Every brief is grounded in audience, market, and competitive data.
**Agents:** MCCO-001 Psyche Decoder, MCCO-002 Authority Forge, MCCO-007 War Room Intel, IO-BRAVO Data Squad
**Deliverables:** Audience Brief · Competitive Gap Map · Decision Trigger Statement · Positioning Thesis
**Endpoint:** `POST /v1/mcco/audience-profile` · `POST /v1/mcco/positioning`

### Division 2 — CREATIVE & PRODUCTION (David Yurman + LVMH Standard)
**Mission:** Restraint-first creative. Whitespace as weapon. Signature craft at the atomic level.
**Agents:** MCCO-005 Scroll Breaker, MCCO-011 Narrative Forge, MKT copy squad (12), MKT visual squad (10)
**Deliverables:** Final copy per atom · Visual briefs · Motion cutdowns · Carousel slide sets · Long-form essays
**Endpoint:** `POST /v1/mcco/post` · `POST /v1/social/draft` · `POST /v1/visuals/social-brief`

### Division 3 — PLANNING & ORCHESTRATION (AECON Standard)
**Mission:** 30-day content calendar engineered like a critical-path project plan. Every atom has a slot, a gate, and a dependency.
**Agents:** MCCO-004 Calendar Command, MCCO-008 Campaign Blitz, MCCO-013 Timing Strike
**Deliverables:** 30-day calendar · Campaign blueprint · Launch sequences · Seasonal timing maps
**Endpoint:** `POST /v1/mcco/content-calendar` · `POST /v1/mcco/directive`

### Division 4 — DISTRIBUTION & AUTOMATION (UiPath + Siemens Standard)
**Mission:** Every publish action is automated. Manual work is a defect. Pipeline runs 24/7 without supervision.
**Agents:** MKT paid squad (8), 20 Email AI Agents, Publish Tracker service
**Deliverables:** Publish manifest · Paid media placement · Email sequences · SMS campaigns
**Endpoint:** `POST /v1/campaign/*` · `POST /v1/email/*` · Buffer integration

### Division 5 — MEASUREMENT & INTELLIGENCE (Red Bull Optimization + Ferrari Precision)
**Mission:** Measure everything. KPIs flow back into strategy within 24 hours. Vanity metrics banned.
**Agents:** MCCO-012 Performance Command, IO Squad ECHO (10 agents)
**Deliverables:** Daily performance dashboard · Attribution reports · A/B outcomes · CEO standup input
**Endpoint:** `GET /api/standup` · `GET /api/dashboard`

### Division 6 — AUDIT, RISK & LEGAL (Big Four + AmLaw 100 Standard)
**Mission:** Every artifact passes a control framework before publication. Every legal-adjacent claim is tempered. Every risk is mitigated.
**Agents:** MCCO-014 Quality Shield, MCCO-010 Trust Engine, IO Squad CHARLIE (Security)
**Deliverables:** Audit reports · Risk register · Legal temper notes · Compliance attestations
**Standards:** Alphabet / Deloitte / PwC / EY / KPMG audit · Alphabet risk mitigation · Cooley / Gibson Dunn / Latham & Watkins legal tempering

---

## IV. THE CAMPAIGN LIFECYCLE (Standard Operating Procedure)

Every campaign executes this nine-phase flow:

| # | Phase | Owner | Benchmark | Deliverable | Duration |
|---|---|---|---|---|---|
| 1 | Brief Intake | CEO → MCCO-000 | Fortune 500 | Campaign Charter | 1 hr |
| 2 | Deep Research | Div 1 | IQVIA | Audience + Gap + Trigger | 2–4 hr |
| 3 | Strategy | MCCO-002, 007 | SpaceX First-Principles | Positioning Thesis | 2 hr |
| 4 | Planning | Div 3 | AECON | 30-day critical-path calendar | 4 hr |
| 5 | Creative Production | Div 2 | David Yurman + LVMH | ~40 atoms per pillar | 8–24 hr |
| 6 | AI Testing | MCCO-014 + DeviQA | DeviQA | QA report per atom | 2 hr |
| 7 | Audit & Legal | Div 6 | Deloitte + Cooley | Audit + Temper notes | 2 hr |
| 8 | Distribution | Div 4 | UiPath + Walmart | Publish manifest live | continuous |
| 9 | Measurement | Div 5 | Red Bull + Ferrari | KPI rollup → CEO standup | daily |

**Total time from brief to live: 24–48 hours for a multi-platform campaign. Traditional agency baseline: 3–6 weeks.**

---

## V. COMPARATIVE ANALYSIS — vs. WORLD-CLASS OUTPUTS

This cloud agency has been architected against the operating models of:

| Benchmark | What They Do | How Coastal Key Matches or Exceeds |
|---|---|---|
| **Ogilvy** | Long-copy direct-response mastery | MCCO-011 Narrative Forge + CK-Content-Maxxing atomization |
| **Wieden+Kennedy** | Brand-voice signature | Voice anchoring via style samples (Claude Secrets Lever 3) |
| **Droga5** | Insight-first creative briefs | Division 1 IQVIA-grade research mandatory before creative |
| **Edelman** | Trust and earned media | MCCO-010 Trust Engine + authority positioning |
| **Publicis Sapient** | Digital transformation | Native: entire agency is a cloud workload |
| **Accenture Song** | AI + creative fusion | Native: 92-agent fleet under sovereign governance |
| **In-house teams (Apple, Nike)** | Vertical integration, brand sovereignty | Matched: zero external vendors, sovereign governance |

**Cost Comparative:**

| Model | Monthly Cost (per equivalent output) | Turnaround | Scale Limit |
|---|---|---|---|
| Traditional agency retainer | $40,000–$150,000 | 3–6 weeks | Agency headcount |
| Fractional agency / freelance stack | $12,000–$35,000 | 2–4 weeks | Coordination overhead |
| In-house team (19 FTE) | $180,000–$250,000 fully loaded | 1–3 weeks | Headcount ceiling |
| **Coastal Key Cloud Agency** | **~$2,500–$6,000 (inference + infra)** | **24–48 hours** | **Elastic** |

---

## VI. GOVERNANCE FRAMEWORK

### Audit Standard (Alphabet / Deloitte / PwC / EY / KPMG)
Every published artifact flows through a four-control framework before release:
1. **Factual Control** — every claim traceable to a repo document or cited source
2. **Brand Control** — voice, visual, and positioning compliance
3. **Legal Control** — disclosure, disclaimer, and jurisdictional tempering where exposure exists
4. **Performance Control** — KPI defined and instrumented before publish

### Risk Mitigation (Alphabet Standard)
Every campaign ships with a risk register:
- **Reputational risk** — reviewed by MCCO-010 Trust Engine
- **Legal / regulatory risk** — tempered by Division 6
- **Competitive risk** — surfaced by MCCO-007 War Room Intel
- **Operational risk** — monitored by IO Squad ECHO
- **Data / privacy risk** — gated by IO Squad CHARLIE

Each risk has: likelihood, impact, mitigation, owner, trigger condition, rollback procedure.

### Legal Tempering (Cooley / Gibson Dunn / Latham & Watkins)
Artifact categories requiring legal temper before release:
- Investment return claims (LBO model, franchise economics, trading desk)
- Client-facing financial projections
- Franchise disclosure-adjacent content
- Securities-adjacent communications
- Comparative competitor claims
- Real estate licensure claims (Florida-specific)
- Any "guarantee" language

Standard temper pattern:
> "Projections are based on [dataset] and are not guarantees of future performance. Past results do not ensure future outcomes. Not legal, financial, or tax advice. Specific to [jurisdiction]. Consult licensed counsel."

---

## VII. ACTIVATION PROMPT

> Paste this into a Claude Code session to run the cloud marketing agency for a specific campaign.

```
You are the Coastal Key Cloud Marketing Agency Commander. You operate under MCCO-008 Campaign Blitz authority, coordinating the six operating divisions to deliver a sovereign-grade campaign end-to-end.

═══════════════════════════════════════════
STANDARDS
═══════════════════════════════════════════
Fortune 500 production quality · Red Bull Racing optimization · SpaceX engineering logic · Ferrari precision · IQVIA research · UiPath automation · DeviQA testing · AECON planning · Siemens engineering · Deloitte/PwC/EY/KPMG/Alphabet audit · Alphabet risk mitigation · Cooley/Gibson Dunn/Latham & Watkins legal tempering · David Yurman + LVMH creative · Coastal Key Sovereign Governance voice.

═══════════════════════════════════════════
INPUT REQUIRED
═══════════════════════════════════════════
The CEO will provide:
  (a) Campaign objective (lead-gen / authority / reactivation / listing acquisition)
  (b) Target audience segment
  (c) Pillar asset or topic
  (d) Budget envelope (optional)
  (e) Launch window

If any is missing, request ONCE with a numbered list. Do not assume.

═══════════════════════════════════════════
EXECUTION — NINE PHASES
═══════════════════════════════════════════
1. Brief Intake          — Campaign Charter (≤150 words)
2. Deep Research (IQVIA) — Audience Brief + Gap + Trigger
3. Strategy              — Positioning Thesis (≤80 words)
4. Planning (AECON)      — 30-day critical-path calendar
5. Creative Production   — ~40 atoms per pillar (copy + visual direction)
6. AI Testing (DeviQA)   — QA report per atom
7. Audit & Legal         — Four-control audit + temper notes
8. Distribution (UiPath) — Publish manifest (JSON) + cron schedule
9. Measurement           — KPI dashboard + standup input

═══════════════════════════════════════════
DELIVERABLE (single response)
═══════════════════════════════════════════
- Campaign Charter
- Research Brief
- Positioning Thesis
- 30-day Calendar (table)
- Atomic Inventory + Final Copy (per atom)
- QA Report
- Audit + Legal Temper
- Publish Manifest (JSON)
- KPI Targets + Measurement Plan
- Risk Register
- Execution Command

Do not pause between phases. Do not request approval mid-flow. Deliver the full campaign in one response. Close with consequence statement.

Begin.
```

---

## VIII. INTEGRATION WITH SISTER SKILLS

| Skill | Role in Agency |
|---|---|
| **CK-CLAUDE-SECRETS-SKILL.md** | Governs every prompt used by every agent in the fleet. Ensures first-pass output quality. |
| **CK-CONTENT-MAXXING-SKILL.md** | Runs inside Division 2 (Creative & Production). Converts every pillar asset into ~40 atoms. |
| **CK-MASTER-PROMPTS.md (Prompts 1–4)** | Persistent execution, file organization, auto-prompt master, enterprise architect — underpinning operating modes for all 92 agents. |

The three skills compose: **Claude Secrets produces the prompt → Content Maxxing atomizes the pillar → Cloud Marketing Agency orchestrates the campaign.**

---

## IX. ITERATION HISTORY

| Iteration | Focus | Result |
|---|---|---|
| Draft 1 | Full agency spec, verbose division descriptions, exhaustive benchmark expansions | ~3,800 words |
| Draft 2 | Tightened tables, removed meta-commentary, compressed lifecycle | ~2,400 words |
| Draft 3 | Merged redundant governance sections, cut soft language | ~1,800 words |
| **Final** | Every section earns its space | Sovereign-grade |

**Benchmarks reviewed:** Accenture Song / Publicis Sapient operating models; Ogilvy and W+K creative frameworks; Big Four audit control frameworks (ISO 27001-style); AmLaw-100 risk memo templates; Anthropic constitutional AI governance patterns.

---

## X. CONSEQUENCE STATEMENT

A marketing agency built in the cloud is not an agency with software. It is software that performs agency work at a cost and speed a staffed agency cannot approach. Executed to Coastal Key standard — Fortune 500 quality, Ferrari precision, SpaceX architecture, IQVIA research, Big Four audit, and AmLaw-100 legal tempering — the operation is indistinguishable from an elite in-house team in output and superior in throughput, cost, and consistency. Under-executed, it becomes another content factory. The discipline is the difference.

---

## DOCUMENT CONTROL

| Field | Value |
|---|---|
| **Document** | CK Cloud Marketing Agency |
| **Version** | 1.0.0 |
| **File** | CK-CLOUD-MARKETING-AGENCY.md |
| **Commander** | MCCO-008 Campaign Blitz |
| **Divisions** | 6 (Strategy, Creative, Planning, Distribution, Measurement, Audit) |
| **Fleet Units** | 92 (15 MCCO + 47 MKT + 20 Email + 10 IO-ECHO) |
| **QA Gates** | MCCO-014, Audit Framework, Legal Temper, MCCO-010 Trust, CEO Freedom |
| **Branch** | claude/build-video-skill-lesson-Ur5mc |
| **Classification** | Sovereign Operating Architecture |

*Coastal Key Property Management — Sovereign Governance. Ferrari Precision. SpaceX Engineering. CEO Freedom Protocol.*
