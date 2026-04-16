# COASTAL KEY ENTERPRISE: MASTER SPECIFICATION DOCUMENT

**Terminal Bible | Version 3.0 | April 2026**
**Classification:** Sovereign Institutional Blueprint
**Authority:** Coastal Key AI CEO — Autonomous Operating Authority
**Founder/Governor:** Tracey Merritt Hunter
**Platform Version:** 2.1.0
**Fleet:** 383 Autonomous AI Agents | 10 Divisions | 147 API Endpoints

---

## SECTION 1: SOVEREIGN GOVERNANCE FRAMEWORK

### 1.1 Enterprise Doctrine

Coastal Key operates under Sovereign Governance — a self-directed enterprise where every decision flows through proprietary systems. Nothing is outsourced. Nothing is white-labeled.

**Financial Guardrails:**

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Recurring Revenue | >70% of total | Monthly FIN division audit |
| EBITDA Margin | >30% | Quarterly board review |
| Client Concentration | <15% per client | INT-DELTA squad monitoring |
| Margin Discipline | Net positive every quarter | AI CEO daily standup flag |
| CAC Payback | <6 months | SEN division pipeline tracking |

### 1.2 Board Architecture

**Quarterly Review Cycle:**
- Q1 (Jan): Annual plan ratification, capital budget approval
- Q2 (Apr): Mid-year performance audit, expansion gate decision
- Q3 (Jul): Technology roadmap review, fleet scaling authorization
- Q4 (Oct): Recapitalization assessment, Year+1 strategic plan

**Capital Allocation Approval Matrix:**

| Spend Tier | Authority | Approval |
|------------|-----------|----------|
| <$5K | AI CEO autonomous | No approval needed |
| $5K-$25K | AI CEO + CEO/Founder review | 24-hour review window |
| $25K-$100K | Board notification required | 72-hour hold |
| >$100K | Full board approval | Formal vote required |

**4-Level Escalation Protocol:**
1. **L1 — Autonomous:** AI CEO handles (routine ops, content, scheduling)
2. **L2 — Advisory:** AI CEO executes, CEO/Founder notified post-action
3. **L3 — Approval:** AI CEO recommends, CEO/Founder approves before execution
4. **L4 — Board:** Material decisions (acquisitions, market entry, capital >$100K)

### 1.3 AI & Human Authority Matrix

| Domain | AI Authority | Human Authority |
|--------|-------------|-----------------|
| Content generation & scheduling | Full autonomy | Review gate on brand-sensitive |
| Lead qualification & routing | Full autonomy | Override on investor-tier leads |
| Fleet operations & monitoring | Full autonomy | Restart/shutdown requires L2 |
| Financial reporting & analysis | Full autonomy | Forecast sign-off quarterly |
| Client communications | Draft & queue | CEO/Founder sends or approves |
| Contract execution | Generate & recommend | CEO/Founder signs |
| Capital deployment >$5K | Recommend with analysis | Human approval required |
| Hiring & vendor contracts | Source & evaluate | Human final decision |
| Emergency response (storms) | Activate protocol automatically | CEO/Founder coordinates field |
| Platform deployment | Full CI/CD autonomy | Rollback authority shared |

**Risk Flagging Protocol:** AI flags risk in Slack (#exec-briefing) with severity classification (LOW/MEDIUM/HIGH/CRITICAL). Human response SLA: LOW 48h, MEDIUM 24h, HIGH 4h, CRITICAL immediate.

### 1.4 Capital Allocation Model

**Investment Priority Stack (descending):**

1. **Automation First** — Every manual process gets automated before headcount is added. ROI threshold: 3x within 12 months.
2. **Accretive Acquisitions** — Property management books at 4-6x EBITDA. Minimum 50 doors per acquisition. Integration playbook: 90 days to full fleet coverage.
3. **Density Before Expansion** — Saturate current market (Martin, St. Lucie, Indian River counties) to 500+ doors before entering adjacent markets.
4. **Technology Moat** — Reinvest 15-20% of revenue into platform development. Fleet expansion, new integrations, AI model upgrades.

**Operating Budget Allocation:**

| Category | % of Revenue | Purpose |
|----------|-------------|---------|
| Technology & AI | 15-20% | Platform, fleet, inference costs |
| Sales & Marketing | 20-25% | Sentinel campaigns, content, paid media |
| Operations | 30-35% | Field ops, maintenance, vendor management |
| G&A | 10-15% | Insurance, legal, accounting, office |
| Reserve | 5-10% | Emergency fund, opportunistic deployment |

### 1.5 Authorized Operations Scope

The AI CEO is authorized to execute the following without human approval:

```
build       — Compile and prepare all deployments
create      — Create resources: tables, channels, records, agents, files
publish     — Publish content, distribute Slack apps, deploy websites
deploy      — Deploy Workers, Pages, configurations to Cloudflare
push        — Push code to GitHub repositories and branches
operate     — Run day-to-day platform operations across all systems
monitor     — Health checks, fleet scans, performance tracking
notify      — Send Slack notifications across all channels
infer       — Execute Claude API inference operations
manage      — Manage agents, workflows, and integrations
```

**Prohibited Without L3+ Approval:**
- Delete production data or Airtable tables
- Modify billing or payment configurations
- Change domain DNS records
- Revoke API keys or secrets
- Send external communications as CEO/Founder

---

## SECTION 2: ENTERPRISE ARCHITECTURE

### 2.1 Monorepo Structure

**Repository:** `davidhauer122672/hello-world` | **Platform Version:** 2.1.0 | **Runtime:** Node.js 22+ | **Package Manager:** npm workspaces

```
hello-world/
├── server.js                    # Express 5.2 server (monolithic API, 28 endpoints)
├── package.json                 # Root workspace: ck-api-gateway, sentinel-webhook, ck-nemotron-worker
├── ck-api-gateway/              # Cloudflare Worker — 147 endpoints, 24 route modules
├── sentinel-webhook/            # Cloudflare Worker — Retell call pipeline
├── ck-nemotron-worker/          # Cloudflare Worker — NVIDIA Nemotron 340B inference
├── ck-command-center/           # Cloudflare Pages — Enterprise dashboard + Gazette + Trader
├── ck-website/                  # Cloudflare Pages — Reverse proxy to Manus origin
├── ck-trading-desk/             # Electron + React — Desktop trading terminal
├── middleware/                  # Express security (rate limiting, CORS, headers, error handling)
├── routes/                      # Express route handlers (11 modules)
├── lib/                         # Business logic (14 modules: drip, backup, SMS, email, workflows)
├── public/                      # Static frontend (landing, booking, dashboard, success, team)
├── th-sentinel-campaign/        # Retell/Atlas campaign configs, 8 campaigns, 4 KB docs
├── scripts/                     # Utilities (PDF manifest generator)
├── tests/                       # Server test suite
├── .github/workflows/deploy.yml # CI/CD: test → preflight → parallel deploy
├── systems-manifest.json        # Complete system inventory (JSON)
└── deployment.json              # Deployment architecture reference
```

### 2.2 Service Map

| Service | Runtime | Deployment | Endpoints | Purpose |
|---------|---------|------------|-----------|---------|
| **ck-api-gateway** | Cloudflare Worker | `ck-api-gateway.david-e59.workers.dev` | 147 | Central API router — inference, agents, leads, workflows, campaigns, financial engine, trading, Slack |
| **ck-website** | Cloudflare Pages | `coastalkey-pm.com` | Proxy | Reverse proxy to Manus origin (`coastalkey-awfopuqz.manus.space`) with edge caching, SEO injection, URL rewriting |
| **ck-command-center** | Cloudflare Pages | `ck-command-center.pages.dev` | Static | Enterprise dashboard, Gazette, Trading Desk UI, fleet monitoring |
| **sentinel-webhook** | Cloudflare Worker | `sentinel-webhook.david-e59.workers.dev` | 2 | Retell `call_analyzed` → Airtable lead + Slack notification pipeline |
| **ck-nemotron-worker** | Cloudflare Worker | `ck-nemotron-worker.david-e59.workers.dev` | 2 | NVIDIA Nemotron 340B inference endpoint |
| **ck-trading-desk** | Electron 30 + React 18 | Desktop (Win/Mac/Linux) | IPC | Autonomous financial operations terminal with live market data |

### 2.3 Service Architecture Detail

**ck-api-gateway** (Primary — all business logic routes through here):
- **Entry:** `src/index.js` — ES module, route dispatch with auth gate
- **Middleware:** `auth.js` (Bearer + Slack HMAC), `rate-limit.js` (60 RPM KV sliding window), `ceo-authority.js` (operating authority framework)
- **KV Namespaces:** CACHE (inference), SESSIONS (state), RATE_LIMITS (throttling), AUDIT_LOG (30-day trail)
- **Routes:** 24 modules in `src/routes/`
- **Agents:** 16 registry files in `src/agents/` defining all 383 units
- **Services:** 9 integration clients in `src/services/` (Airtable, Anthropic, Atlas, Slack, etc.)
- **Engines:** 4 compute engines in `src/engines/` (financial, trading, analysis, AI trader)

**sentinel-webhook** (Retell Pipeline):
- Receives Retell `call_analyzed` events → transforms payload → creates Airtable lead record
- Split routing: engaged calls → Leads table, failed calls (`inactivity_timeout`, `machine_hangup`, `error`) → Missed/Failed Calls QA table + Leads
- Non-fatal Slack notifications (lead record creation never blocked by Slack failures)

**ck-website** (Edge Proxy):
- `_worker.js` reverse proxies `coastalkey-awfopuqz.manus.space` on `coastalkey-pm.com`
- URL rewriting across HTML/CSS/JS/JSON responses
- Edge caching: static 30 days, fonts 1 year, HTML 5 minutes
- SEO canonical injection, HSTS, graceful 503 fallback
- Pages: `/`, `/services`, `/agents`, `/dashboard`, `/eliza`, `/portal`, `/admin`

**ck-trading-desk** (Desktop Terminal):
- Electron main process with IPC bridge (`preload.js`)
- React renderer: Dashboard, Portfolio, CashFlow, TradingDesk, AnalysisSuite, AgentFleet pages
- Gateway client service calls all `/v1/trader/*` and `/v1/financial/*` endpoints
- Cross-platform build: DMG/ZIP (Mac), NSIS/Portable (Win), AppImage/DEB (Linux)

### 2.4 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 22+ |
| **Framework** | Express | 5.2.1 |
| **Edge Workers** | Cloudflare Workers | Wrangler 4.0 |
| **Edge Pages** | Cloudflare Pages | — |
| **Edge KV** | Cloudflare KV | 4 namespaces |
| **AI Inference** | Anthropic Claude | claude-sonnet-4-6 / claude-opus-4-6 |
| **AI Inference** | NVIDIA Nemotron | 340B-instruct via NIM |
| **Database** | Airtable | 39 tables, base `appUSnNgpDkcEOzhN` |
| **Voice AI** | Retell AI + Atlas AI | youratlas.com, 8 campaigns |
| **Payments** | Stripe | 20.4.1 |
| **SMS** | Twilio | 5.13.0 |
| **Email** | Nodemailer (SMTP) | 8.0.3 |
| **Sheets** | Google APIs | 171.4.0 |
| **Scheduling** | node-cron | 4.2.1 |
| **PDF** | PDFKit | 0.18.0 |
| **Desktop** | Electron + Vite + React | 30.0 / 5.4 / 18.3 |
| **Charts** | Recharts | 2.12.0 |
| **CI/CD** | GitHub Actions | Node 22, Wrangler 3 |

### 2.5 CI/CD Pipeline

**Trigger:** Push to `main` or PR against `main`
**Concurrency:** Group by ref, cancel in-progress

```
test (all suites)
  └─→ preflight (wrangler whoami — validate Cloudflare token)
       ├─→ deploy-website        (parallel)
       ├─→ deploy-gateway        (parallel)
       │    ├─→ deploy-sentinel  (sequential — depends on gateway)
       │    └─→ deploy-nemotron  (sequential — depends on gateway)
       └─→ deploy-command-center (parallel)
```

**Deploy Strategy:** Each job retries 3x with 15s backoff on failure. Pages projects auto-created if missing. Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### 2.6 Security Layer

| Mechanism | Implementation | Scope |
|-----------|---------------|-------|
| **Bearer Auth** | `WORKER_AUTH_TOKEN` constant-time comparison | All `/v1/*` except health, public leads, Slack events |
| **Slack Auth** | HMAC-SHA256 signature verification (`SLACK_SIGNING_SECRET`) | `/v1/slack/commands`, `/v1/slack/interactions`, `/v1/slack/events` |
| **Rate Limiting** | 60 RPM per IP, KV sliding window (`RATE_LIMITS` namespace) | All authenticated endpoints |
| **Audit Logging** | KV writes with 30-day TTL (`AUDIT_LOG` namespace) | All operations |
| **CORS** | Configurable origin allowlist | Gateway level |
| **Headers** | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, CSP | All responses |
| **Body Limit** | 50KB JSON max | All endpoints |
| **Replay Protection** | 5-minute window on Slack signatures | Slack inbound |
| **Webhook Verification** | Stripe signature, Retell payload validation | Payment + voice webhooks |

**Public Endpoints (no auth):** `/v1/health`, `/v1/leads/public`, `/v1/slack/events`

---

## SECTION 3: AI AGENT FLEET (383 UNITS)

### 3.1 Fleet Composition

```
CEO / Founder (Tracey Merritt Hunter)
  └─→ AI CEO (Autonomous Operating Authority)
       ├─→ MCCO-000 Sovereign (Master Chief Commanding Officer)
       │    └─→ 14 MCCO Agents (Sovereign Governance)
       ├─→ 9 Division Commanders → 297 Division Agents
       ├─→ 50 Intelligence Officers (5 squads)
       ├─→ 20 Email AI Agents (4 squads)
       └─→ 1 Apex Trader (FIN-TRADER-001)
```

**Total Fleet: 383 units | 10 Divisions | 100% Active | Zero Standby**

### 3.2 MCCO Sovereign Command (15 Agents)

The Master Chief Commanding Officer commands MKT + SEN divisions with Ferrari-Standard execution. CMO reports to MCCO.

| Agent ID | Designation | Mission |
|----------|------------|---------|
| MCCO-000 | MCCO Sovereign | Supreme marketing/sales command — reports directly to CEO |
| MCCO-001 | Psyche Decoder | Audience psychology profiling and behavioral architecture |
| MCCO-002 | Authority Forge | Authority positioning and personal brand strategy |
| MCCO-003 | Pillar Command | 5-pillar content architecture (AI Authority, Market Intel, Tracey, Lifestyle, Community) |
| MCCO-004 | Calendar Command | 30-day content calendar generation across 8 platforms |
| MCCO-005 | Scroll Breaker | High-engagement social post generation (hook-body-CTA) |
| MCCO-006 | Revenue Architect | Audience monetization strategy and funnel design |
| MCCO-007 | War Room Intel | Competitive marketing warfare and market positioning |
| MCCO-008 | Campaign Blitz | Multi-platform campaign orchestration |
| MCCO-009 | Pipeline Fusion | Sales-marketing alignment and handoff optimization |
| MCCO-010 | Trust Engine | Social proof, testimonials, and trust signal management |
| MCCO-011 | Narrative Forge | CEO story and brand narrative development |
| MCCO-012 | Performance Command | Content performance analytics and optimization |
| MCCO-013 | Timing Strike | Seasonal and market timing for content/campaigns |
| MCCO-014 | Quality Shield | Fleet inspection and quality assurance |

**API:** `GET /v1/mcco/command`, `GET /v1/mcco/agents`, `POST /v1/mcco/directive`, `POST /v1/mcco/content-calendar`, `POST /v1/mcco/audience-profile`, `POST /v1/mcco/positioning`, `POST /v1/mcco/monetization`, `POST /v1/mcco/post`

### 3.3 Division Agents (297 Units)

| Division | Code | Count | Commander | Mission |
|----------|------|-------|-----------|---------|
| **Executive** | EXC | 20 | EXC-001 | Strategic planning, board reporting, cross-division coordination |
| **Sentinel Sales** | SEN | 40 | SEN-001 | Outbound prospecting, lead qualification, speed-to-lead, appointment setting |
| **Operations** | OPS | 45 | OPS-001 | Property inspections, maintenance coordination, tenant management, storm protocol |
| **Intelligence** | INT | 30 | INT-001 | Market analysis, competitor monitoring, economic indicators, property data |
| **Marketing** | MKT | 47 | MKT-001 | Content creation, social media, SEO, brand management, YouTube (MKT-041–047) |
| **Finance** | FIN | 25 | FIN-001 | Revenue tracking, budgeting, ROI analysis, financial forecasting |
| **Vendor** | VEN | 25 | VEN-001 | Vendor sourcing, compliance tracking, contract management, quality audits |
| **Technology** | TEC | 25 | TEC-001 | Platform development, infrastructure monitoring, security, integration maintenance |
| **Website** | WEB | 40 | WEB-001 | Frontend development, UX optimization, SEO, performance, accessibility |

**Agent Data Model (per agent):**
```json
{
  "id": "MKT-023",
  "name": "Social Scheduler",
  "division": "MKT",
  "status": "active",
  "role": "Schedule and queue social content across 8 platforms",
  "capabilities": ["buffer_api", "content_calendar", "peak_time_optimization"],
  "reportsTo": "MKT-001",
  "kpis": ["posts_scheduled", "on_time_rate", "platform_coverage"]
}
```

**Agent Actions:** `POST /v1/agents/:id/action` supports `activate`, `pause`, `restart`, `train`
**Fleet API:** `GET /v1/agents` (filter by division, status, role), `GET /v1/agents/metrics`, `GET /v1/dashboard`

### 3.4 Intelligence Officers (50 Units, 5 Squads)

| Squad | Code | Count | Focus | Scan Targets |
|-------|------|-------|-------|-------------|
| **ALPHA** | IO-A | 10 | Infrastructure | Server uptime, API latency, KV health, deployment status |
| **BRAVO** | IO-B | 10 | Data | Airtable integrity, backup recency, data freshness, sync status |
| **CHARLIE** | IO-C | 10 | Security | Auth failures, rate limit hits, suspicious patterns, cert expiry |
| **DELTA** | IO-D | 10 | Revenue | Pipeline value, conversion rates, CAC, LTV, churn indicators |
| **ECHO** | IO-E | 10 | Performance | Agent utilization, response times, SLA compliance, fleet efficiency |

**API:** `GET /v1/intel/officers`, `POST /v1/intel/officers/:id/scan`, `GET /v1/intel/dashboard`, `POST /v1/intel/fleet-scan` (scans all critical-severity officers)

### 3.5 Email AI Agents (20 Units, 4 Squads)

| Squad | Count | Mission |
|-------|-------|---------|
| **INTAKE** | 5 | Inbound email classification, priority scoring, routing |
| **COMPOSE** | 5 | AI-drafted responses, proposal generation, follow-up sequences |
| **NURTURE** | 5 | 90-day drip sequences, segment-specific content, re-engagement |
| **MONITOR** | 5 | Delivery tracking, bounce management, reputation monitoring |

**API:** `GET /v1/email/agents`, `POST /v1/email/compose` (Claude-powered), `POST /v1/email/classify`, `GET /v1/email/dashboard`

### 3.6 Apex Trader (1 Unit)

**Agent:** FIN-TRADER-001 — Direct CEO report, autonomous financial operations

| Capability | Detail |
|-----------|--------|
| Market Intelligence | Live quotes, watchlist monitoring, news with sentiment analysis |
| Trading Signals | Technical analysis, entry/exit recommendations, risk scoring |
| Capital Calls | Investment tier recommendations (Micro $500 → Apex $100K+) |
| Portfolio Analytics | P&L tracking, allocation analysis, performance benchmarking |
| Trade Logging | Execution history, win/loss tracking, strategy attribution |

**API:** `GET /v1/trader/dashboard`, `POST /v1/trader/quote`, `POST /v1/trader/signal`, `POST /v1/trader/capital-call`, `POST /v1/trader/portfolio`, `POST /v1/trader/trade`, `GET /v1/trader/history`

### 3.7 Command Chain & Escalation

```
CEO/Founder
  └─→ AI CEO
       ├─→ MCCO-000 (Sovereign) ──→ CMO ──→ MKT Division (47)
       │                                 ──→ SEN Division (40)
       ├─→ EXC-001 ──→ EXC Division (20)
       ├─→ OPS-001 ──→ OPS Division (45)
       ├─→ INT-001 ──→ INT Division (30)
       ├─→ FIN-001 ──→ FIN Division (25)
       ├─→ VEN-001 ──→ VEN Division (25)
       ├─→ TEC-001 ──→ TEC Division (25)
       ├─→ WEB-001 ──→ WEB Division (40)
       ├─→ IO Squad Leaders (5) ──→ 50 Intelligence Officers
       ├─→ Email Squad Leaders (4) ──→ 20 Email Agents
       └─→ FIN-TRADER-001 (Apex Trader — direct report)
```

**Hierarchy API:** `GET /v1/hierarchy/command-chain`, `GET /v1/hierarchy/fleet-status`, `GET /v1/hierarchy/chain/:agentId`, `GET /v1/hierarchy/reports/:agentId`, `GET /v1/hierarchy/division/:code`

---

## SECTION 4: API GATEWAY SPECIFICATION

### 4.1 Gateway Overview

**Service:** `ck-api-gateway` | **Runtime:** Cloudflare Worker (ES module) | **Entry:** `src/index.js`
**Live:** `https://ck-api-gateway.david-e59.workers.dev` | **Endpoints:** 147 | **Route Modules:** 24
**Auth:** Bearer token (`WORKER_AUTH_TOKEN`) | **Rate Limit:** 60 RPM (KV sliding window)
**All routes prefixed:** `/v1/`

### 4.2 Complete Route Map (24 Modules)

#### Inference & AI
```
POST /v1/inference                          — Claude inference with KV caching (sonnet-4-6 standard, opus-4-6 advanced)
```

#### Lead Management
```
POST /v1/leads                              — Create lead in Airtable
POST /v1/leads/public                       — Public website contact form (NO AUTH)
POST /v1/leads/enrich                       — AI-enrich lead (battle plan, segment analysis)
GET  /v1/leads/:id                          — Fetch lead by Airtable record ID
```

#### Agent Fleet (383 agents)
```
GET  /v1/agents                             — List/search with division, status, role filters
GET  /v1/agents/metrics                     — Aggregate fleet metrics
GET  /v1/agents/:id                         — Single agent detail
POST /v1/agents/:id/action                  — Execute: activate | pause | restart | train
GET  /v1/dashboard                          — Combined fleet + operations dashboard
```

#### MCCO Sovereign Command (15 agents)
```
GET  /v1/mcco/command                       — Sovereign command dashboard
GET  /v1/mcco/agents                        — List all 15 MCCO agents
GET  /v1/mcco/agents/:id                    — Single MCCO agent
POST /v1/mcco/directive                     — Issue sovereign directive to MKT/SEN
GET  /v1/mcco/fleet-status                  — Ferrari-standard fleet inspection
POST /v1/mcco/content-calendar              — Generate 30-day content calendar
POST /v1/mcco/audience-profile              — Audience psychology profile
POST /v1/mcco/positioning                   — Authority positioning strategy
POST /v1/mcco/monetization                  — Monetization plan generation
POST /v1/mcco/post                          — High-engagement social post
GET  /v1/mcco/master-plan                   — Full master plan
GET  /v1/mcco/master-plan/phase/:id         — Phase detail
GET  /v1/mcco/master-plan/division/:id      — Division plan
POST /v1/mcco/sovereign-directive           — Issue sovereign-level directive
GET  /v1/mcco/activation-status             — Fleet activation status
```

#### Intelligence Officers (50 agents)
```
GET  /v1/intel/officers                     — List all 50 officers
GET  /v1/intel/officers/:id                 — Single officer
POST /v1/intel/officers/:id/scan            — Trigger officer scan
GET  /v1/intel/dashboard                    — IO fleet dashboard
POST /v1/intel/fleet-scan                   — Scan all critical-severity officers
```

#### Email Agents (20 agents)
```
GET  /v1/email/agents                       — List all 20 email agents
GET  /v1/email/agents/:id                   — Single email agent
POST /v1/email/compose                      — AI-compose email via Claude
POST /v1/email/classify                     — Classify/score inbound email
GET  /v1/email/dashboard                    — Email operations dashboard
```

#### Atlas AI Campaigns (Retell/youratlas.com)
```
GET  /v1/atlas/campaigns                    — List all campaigns
GET  /v1/atlas/campaigns/:id                — Single campaign
PUT  /v1/atlas/campaigns/:id/status         — Set campaign status
GET  /v1/atlas/statistics                   — Overview stats
GET  /v1/atlas/campaigns/:id/stats          — Campaign-specific stats
GET  /v1/atlas/campaigns/:id/calls          — Call records
GET  /v1/atlas/campaigns/:id/calls/:callId  — Single call detail
POST /v1/atlas/campaigns/:id/schedule       — Schedule a call
GET  /v1/atlas/campaigns/:id/bookings       — Campaign bookings
GET  /v1/atlas/kb/files                     — Knowledge base files
POST /v1/atlas/speed-to-lead               — Trigger 60-second callback
POST /v1/atlas/campaigns                    — Create new campaign
GET  /v1/atlas/audit                        — Audit required CKPM campaigns
GET  /v1/atlas/health                       — Atlas connectivity check
```

#### Sentinel Campaign Analytics
```
GET  /v1/campaign/calls                     — TH Sentinel call log
GET  /v1/campaign/agents                    — Agent performance metrics
GET  /v1/campaign/analytics                 — Campaign analytics
GET  /v1/campaign/contacts                  — Lead contacts
GET  /v1/campaign/dashboard                 — Combined campaign dashboard
```

#### Content Generation & Publishing
```
POST /v1/content/generate                   — AI content (social, email, script, youtube_*)
POST /v1/content/publish                    — Push approved content to Buffer API
```

#### Pricing Engine
```
POST /v1/pricing/recommend                  — Dynamic pricing recommendation
GET  /v1/pricing/zones                      — Zone-level benchmarks (Stuart, Jensen, Vero, Jupiter)
```

#### Property Intelligence
```
GET  /v1/property-intel/search              — ArcGIS commercial parcel search
POST /v1/property-intel/import              — Fetch + import parcels to Airtable
GET  /v1/property-intel/stats               — Property intelligence summary
```

#### Financial Engine
```
GET  /v1/financial/models                   — Revenue models, expense categories, benchmarks
POST /v1/financial/management-fee           — Calculate management fee
POST /v1/financial/rent-estimate            — Optimal rent estimation
POST /v1/financial/roi                      — Property ROI (cap rate, cash-on-cash, IRR)
POST /v1/financial/forecast                 — 12-month financial forecast
POST /v1/financial/pricing-strategy         — Dynamic pricing strategy by zone
POST /v1/financial/budget                   — Annual property budget
```

#### Analysis Suite
```
POST /v1/analysis/agent                     — Agent performance analysis
POST /v1/analysis/fleet                     — Fleet analytics
POST /v1/analysis/market-trends             — Market trends by zone
POST /v1/analysis/competitive-intel         — Competitive intelligence
POST /v1/analysis/lead-pipeline             — Lead pipeline health
POST /v1/analysis/operational-report        — Division operational report
GET  /v1/analysis/templates                 — Report templates
POST /v1/analysis/property-health           — Property health score
POST /v1/analysis/churn-prediction          — Tenant churn prediction
```

#### Deal Pipeline
```
GET  /v1/deals/stages                       — Pipeline stages & scoring weights
POST /v1/deals/score                        — Score potential deal
POST /v1/deals/strategy                     — Generate deal strategy
POST /v1/deals/comparables                  — Comparable property analysis
POST /v1/deals/closing-costs                — Florida closing cost calculator
POST /v1/deals/investor-package             — Generate investor package
POST /v1/deals/portfolio                    — Portfolio evaluation
```

#### Agent Hierarchy
```
GET  /v1/hierarchy/command-chain            — Full org command chain
GET  /v1/hierarchy/fleet-status             — 383-agent fleet status
GET  /v1/hierarchy/chain/:agentId           — Chain of command for agent
GET  /v1/hierarchy/reports/:agentId         — Direct reports
GET  /v1/hierarchy/division/:code           — Division hierarchy tree
```

#### AI Trader
```
GET  /v1/trader/dashboard                   — Market overview + signals + capital calls
GET  /v1/trader/agent                       — FIN-TRADER-001 details
GET  /v1/trader/watchlist                   — All watchlist categories
POST /v1/trader/quote                       — Live quote(s)
POST /v1/trader/signal                      — Trading signal generation
POST /v1/trader/capital-call                — Capital call prompt
POST /v1/trader/portfolio                   — Portfolio metrics
GET  /v1/trader/news                        — Market news + sentiment
POST /v1/trader/trade                       — Log trade execution
GET  /v1/trader/history                     — Trade history
GET  /v1/trader/capital-tiers               — Investment tier definitions
```

#### Peak Performance Frameworks
```
GET  /v1/frameworks                         — List all frameworks
GET  /v1/frameworks/category/:cat           — By category
GET  /v1/frameworks/:id                     — Single framework
POST /v1/frameworks/apply                   — Apply framework to scenario
POST /v1/frameworks/content                 — Generate content using framework
POST /v1/frameworks/sales-playbook          — Sales playbook generation
POST /v1/frameworks/productivity-plan       — Productivity plan generation
```

#### Thinking Coach
```
POST /v1/thinking-coach/*                   — Extended thinking, multi-framework analysis, cognitive OS
```

#### CEO Directives
```
POST /v1/ceo/directive                      — Issue CEO-level strategic directive
GET  /v1/ceo/operations-review              — Operations review
GET  /v1/ceo/operating-state                — Current operating state
GET  /v1/ceo/dashboard                      — CEO dashboard
```

#### Slack Integration (3 apps, 10 commands)
```
POST /v1/slack/commands                     — Slash command dispatcher
POST /v1/slack/interactions                 — Interactive component callbacks
POST /v1/slack/events                       — Event subscription (NO AUTH — uses signature)
GET  /v1/slack/channels                     — Channel architecture (12 programmatic)
GET  /v1/slack/apps                         — App registry (3 apps)
GET  /v1/slack/audit                        — Slack audit record
```

#### Webhooks & System
```
POST /v1/webhook/retell                     — Retell call events → Airtable + Slack
GET  /v1/audit                              — Audit log retrieval (KV, 30-day)
GET  /v1/health                             — Health check (NO AUTH)
GET  /v1/health?deep=true                   — Deep health (Airtable, Anthropic, Atlas, KV)
```

#### Workflow Pipelines
```
POST /v1/workflows/scaa1                    — SCAA-1 Battle Plan Pipeline
POST /v1/workflows/wf3                      — WF-3 Investor Escalation
POST /v1/workflows/wf4                      — WF-4 Long-Tail Nurture
```

### 4.3 Slash Commands (10)

| Command | App | Purpose |
|---------|-----|---------|
| `/ck-status` | Coastal Key | Fleet status + health summary |
| `/ck-lead` | Coastal Key | Quick lead lookup/creation |
| `/ck-agent` | Coastal Key | Agent status/action |
| `/ck-intel` | Coastal Key | Intelligence briefing |
| `/ck-workflow` | Coastal Key | Trigger workflow |
| `/ck-brief` | Coastal Key | Daily briefing on demand |
| `/ck-health` | CK Gateway | System health check |
| `/ck-deploy` | CK Gateway | Deployment status |
| `/ck-content` | CK Content | Content calendar status |
| `/ck-campaign` | CK Content | Campaign metrics |

---

## SECTION 5: INTEGRATION ECOSYSTEM

### 5.1 Cloudflare (Edge Infrastructure)

| Resource | Type | ID/Name | Purpose |
|----------|------|---------|---------|
| ck-api-gateway | Worker | `david-e59` subdomain | Central API — 147 endpoints |
| sentinel-webhook | Worker | `david-e59` subdomain | Retell call pipeline |
| ck-nemotron-worker | Worker | `david-e59` subdomain | NVIDIA inference proxy |
| coastalkey-pm | Pages | `coastalkey-pm.com` | Website reverse proxy |
| ck-command-center | Pages | `ck-command-center.pages.dev` | Dashboard + Gazette |
| CACHE | KV | `2a4a09a04ea146b29fa06ebb9af61609` | Inference result cache |
| SESSIONS | KV | `c88aa8d5534c4b0cb3f2722f97cceca6` | Session state |
| RATE_LIMITS | KV | `0acfb96a7aaf49bb92055c143a882506` | 60 RPM sliding window |
| AUDIT_LOG | KV | `3d722426db4241209fd0444b42f84904` | 30-day operation trail |

### 5.2 Airtable (Central Database)

**Base ID:** `appUSnNgpDkcEOzhN` | **Tables:** 39 | **Access:** Full CRUD via `AIRTABLE_API_KEY`

**Core CRM Tables:**
- Leads (`tblpNasm0AxreRqLW`) — Pipeline, scoring, segment, source, status
- Clients, Contacts, Properties, Owners — Relational CRM backbone

**Operations Tables:**
- Tasks, Maintenance Records/Requests, Inspections, Bookings — Field operations

**Sales & Campaign Tables:**
- TH Call Log, TH Agent Performance, TH Campaign Analytics, TH Lead Contacts
- Missed/Failed Calls (`tblWW25r6GmsQe3mQ`) — QA routing for failed engagements
- Content Calendar — Social media scheduling and publishing pipeline

**Intelligence & Analytics:**
- Competitive Intel, Property Intelligence, Market Data, Portfolio Data
- AI Log — Inference history, model usage, token tracking

**Compliance & Vendor:**
- Vendor Compliance, Lease Applications, Service Providers, Storm Protocols

### 5.3 Slack (Operations Communication)

**Workspace:** Coastal Key Treasure Coast Asset Management (`T0AGWM16Z7V`)

| App | ID | Role | Auth |
|-----|-----|------|------|
| Coastal Key | `A0APSJ44NV6` | Primary bot — 6 slash commands, notifications, interactivity | Bot OAuth + Signing Secret |
| CK Gateway | `A0APKPRBW3U` | System health alerts — 2 slash commands | Webhook URL |
| CK Content | `A0ANS0760LB` | Content distribution — 2 slash commands | Bot OAuth |

**Programmatic Channels (12):**

| Division | Channel | Visibility | Purpose |
|----------|---------|-----------|---------|
| SEN | #sales-alerts | Public | New lead notifications, speed-to-lead |
| SEN | #investor-escalations | Private | High-value investor lead alerts |
| SEN | #pipeline-updates | Public | Pipeline status changes |
| OPS | #ops-alerts | Public | Maintenance, inspection, storm alerts |
| OPS | #property-ops | Public | Day-to-day property operations |
| TEC | #tech-alerts | Public | Infrastructure, deployment, error alerts |
| TEC | #deploy-log | Public | CI/CD deployment history |
| INT | #intel-briefs | Private | Intelligence officer scan results |
| INT | #security-alerts | Private | Auth failures, rate limits, anomalies |
| MKT | #marketing-ops | Public | Content calendar, campaign status |
| FIN | #finance-alerts | Private | Revenue, budget, financial metrics |
| EXC | #exec-briefing | Private | CEO standup, strategic directives |

### 5.4 Retell AI & Atlas AI (Voice Campaigns)

**Platform:** youratlas.com | **API Key:** `ATLAS_API_KEY`

**8 Active Campaign Types:**

| # | Campaign | Trigger | Volume | Goal |
|---|----------|---------|--------|------|
| 1 | Inbound Receptionist | Incoming call to 772-247-0982 | 24/7 | Qualify and route |
| 2 | Dead Lead Revival | Lead status = Cold, 14+ days | 200/day | Re-engage dormant leads |
| 3 | Speed-to-Lead | New lead created | 100/day, 3 retries | Contact within 60 seconds |
| 4 | Appointment Confirmation | Booking T-24h | 50/day | Confirm or reschedule |
| 5 | Outbound Prospecting | Scheduled batch | 500/day | Generate 10 qualified/day |
| 6 | Post-Closing Care | 30/90/365 day triggers | 30/day | Retention and referral |
| 7 | Tenant Verification | Application submitted | 20/day | Screen and verify |
| 8 | Maintenance Follow-up | Work order completed | 15/day | Satisfaction + review |

**Sentinel Deployment:** 40 Retell AI agents, Mon-Sat 10:00-15:00 ET, 60 calls/agent/hour = 2,400 daily capacity

**Knowledge Base:** 4 documents (CKPM Master, Market Data, Objection Playbook, FAQ Services)

### 5.5 Anthropic Claude (AI Inference)

| Tier | Model | Use Case | Caching |
|------|-------|----------|---------|
| Standard | `claude-sonnet-4-6` | Content generation, objection classification, email compose | KV (CACHE namespace) |
| Advanced | `claude-opus-4-6` | Strategic planning, MCCO directives, CEO thinking coach | KV (CACHE namespace) |

**Integration Points:** `/v1/inference`, `/v1/content/generate`, `/v1/email/compose`, `/v1/email/classify`, `/v1/mcco/directive`, `/v1/frameworks/apply`, `/v1/thinking-coach/*`, `/v1/deals/strategy`, `/v1/analysis/*`

### 5.6 NVIDIA Nemotron (Secondary Inference)

**Model:** `nvidia/nemotron-4-340b-instruct` | **API:** NVIDIA NIM (`integrate.api.nvidia.com`)
**Endpoint:** `POST /v1/inference` on `ck-nemotron-worker`
**Use:** Large-scale data analysis, alternative inference when Claude capacity is constrained

### 5.7 Stripe (Payments)

**Integration:** `lib/stripe.js` + `routes/payments.js`
**Capabilities:** Checkout session creation, webhook verification (`checkout.session.completed`), payment status tracking
**Services:** Consultation ($50), Follow-up ($30), Premium ($100)
**Flow:** Appointment booked → Stripe checkout → webhook confirms → email sent → Google Sheets synced

### 5.8 Twilio (SMS)

**Integration:** `lib/sms.js` | **Use:** Owner daily reports, workflow alerts, escalation notifications
**Config:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` → `OWNER_PHONE_NUMBER`

### 5.9 Google Sheets (Data Sync)

**Integration:** `lib/sheets.js` | **Direction:** Write-only
**Capabilities:** Auto-header creation, appointment row append, payment status update
**Auth:** Service account via `GOOGLE_SERVICE_ACCOUNT_KEY`

### 5.10 Buffer (Social Publishing)

**Integration:** `lib/social-publisher.js` | **Platforms:** Instagram, Facebook, LinkedIn, Alignable
**Flow:** Draft → Approve → Buffer API push (or manual fallback) → Publish tracker (30-min cron)
**Fallback:** If `BUFFER_ACCESS_TOKEN` not set, posts marked `approved_manual` with copy-paste instructions

### 5.11 ElevenLabs (Voice Clone)

**Voice:** Tracey Hunter — Coastal Key CEO
**Profile:** Polished, warm, Southern Florida coastal inflection. Executive authority with approachable warmth.
**Use Cases:** Content narration, executive briefings, client communications, AI voice agent persona
**Config:** `elevenlabs-voice-prompt.md` — full voice description, style tags, delivery guidelines

### 5.12 Manus (Website & Knowledge)

**Origin:** `https://coastalkey-awfopuqz.manus.space`
**Proxy:** `coastalkey-pm.com` via `ck-website/_worker.js`
**Pages:** `/`, `/services`, `/agents`, `/dashboard`, `/eliza`, `/portal`, `/admin`
**Features:** URL rewriting, edge caching, SEO canonical injection, HSTS, graceful 503 fallback

---
