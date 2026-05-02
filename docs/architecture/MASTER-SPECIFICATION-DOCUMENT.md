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
├── ck-nemotron-worker/          # Cloudflare Worker — Claude AI inference
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
├── config/systems-manifest.json # Complete system inventory (JSON)
└── config/deployment.json       # Deployment architecture reference
```

### 2.2 Service Map

| Service | Runtime | Deployment | Endpoints | Purpose |
|---------|---------|------------|-----------|---------|
| **ck-api-gateway** | Cloudflare Worker | `ck-api-gateway.david-e59.workers.dev` | 147 | Central API router — inference, agents, leads, workflows, campaigns, financial engine, trading, Slack |
| **ck-website** | Cloudflare Pages | `coastalkey-pm.com` | Proxy | Reverse proxy to Manus origin with edge caching, SEO injection, URL rewriting |
| **ck-command-center** | Cloudflare Pages | `ck-command-center.pages.dev` | Static | Enterprise dashboard, Gazette, Trading Desk UI, fleet monitoring |
| **sentinel-webhook** | Cloudflare Worker | `sentinel-webhook.david-e59.workers.dev` | 2 | Retell call_analyzed → Airtable lead + Slack notification pipeline |
| **ck-nemotron-worker** | Cloudflare Worker | `ck-nemotron-worker.david-e59.workers.dev` | 2 | Claude AI inference endpoint |
| **ck-trading-desk** | Electron 30 + React 18 | Desktop (Win/Mac/Linux) | IPC | Autonomous financial operations terminal with live market data |

### 2.3-2.6 Architecture Detail

See Sections 2.3 (Service Architecture Detail), 2.4 (Tech Stack), 2.5 (CI/CD Pipeline), and 2.6 (Security Layer) in the full V3.0 specification.

---

## SECTION 3: AI AGENT FLEET (383 UNITS)

### 3.1 Fleet Composition

```
CEO / Founder (Tracey Merritt Hunter)
  └→ AI CEO (Autonomous Operating Authority)
       ├→ MCCO-000 Sovereign (Master Chief Commanding Officer)
       │    └→ 14 MCCO Agents (Sovereign Governance)
       ├→ 9 Division Commanders → 297 Division Agents
       ├→ 50 Intelligence Officers (5 squads)
       ├→ 20 Email AI Agents (4 squads)
       └→ 1 Apex Trader (FIN-TRADER-001)
```

**Total Fleet: 383 units | 10 Divisions | 100% Active | Zero Standby**

### 3.2 MCCO Sovereign Command (15 Agents)

| Agent ID | Designation | Mission |
|----------|------------|---------|
| MCCO-000 | MCCO Sovereign | Supreme marketing/sales command — reports directly to CEO |
| MCCO-001 | Psyche Decoder | Audience psychology profiling and behavioral architecture |
| MCCO-002 | Authority Forge | Authority positioning and personal brand strategy |
| MCCO-003 | Pillar Command | 5-pillar content architecture |
| MCCO-004 | Calendar Command | 30-day content calendar generation across 8 platforms |
| MCCO-005 | Scroll Breaker | High-engagement social post generation |
| MCCO-006 | Revenue Architect | Audience monetization strategy and funnel design |
| MCCO-007 | War Room Intel | Competitive marketing warfare and market positioning |
| MCCO-008 | Campaign Blitz | Multi-platform campaign orchestration |
| MCCO-009 | Pipeline Fusion | Sales-marketing alignment and handoff optimization |
| MCCO-010 | Trust Engine | Social proof, testimonials, and trust signal management |
| MCCO-011 | Narrative Forge | CEO story and brand narrative development |
| MCCO-012 | Performance Command | Content performance analytics and optimization |
| MCCO-013 | Timing Strike | Seasonal and market timing for content/campaigns |
| MCCO-014 | Quality Shield | Fleet inspection and quality assurance |

### 3.3 Division Agents (297 Units)

| Division | Code | Count | Mission |
|----------|------|-------|---------|
| Executive | EXC | 20 | Strategic planning, board reporting, cross-division coordination |
| Sentinel Sales | SEN | 40 | Outbound prospecting, lead qualification, speed-to-lead |
| Operations | OPS | 45 | Property inspections, maintenance, tenant management, storm protocol |
| Intelligence | INT | 30 | Market analysis, competitor monitoring, economic indicators |
| Marketing | MKT | 47 | Content creation, social media, SEO, brand management |
| Finance | FIN | 25 | Revenue tracking, budgeting, ROI analysis, forecasting |
| Vendor | VEN | 25 | Vendor sourcing, compliance, contract management |
| Technology | TEC | 25 | Platform development, infrastructure, security |
| Website | WEB | 40 | Frontend development, UX, SEO, performance |

### 3.4 Intelligence Officers (50 Units, 5 Squads)

| Squad | Code | Count | Focus |
|-------|------|-------|-------|
| ALPHA | IO-A | 10 | Infrastructure monitoring |
| BRAVO | IO-B | 10 | Data integrity |
| CHARLIE | IO-C | 10 | Security |
| DELTA | IO-D | 10 | Revenue intelligence |
| ECHO | IO-E | 10 | Performance |

### 3.5-3.7 Email Agents, Apex Trader, Command Chain

- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR
- **FIN-TRADER-001 Apex Trader** — Direct CEO report, autonomous financial operations
- **Hierarchy API:** `/v1/hierarchy/command-chain`, `/v1/hierarchy/fleet-status`

---

## SECTION 4: API GATEWAY SPECIFICATION

**Service:** `ck-api-gateway` | **Endpoints:** 147 | **Route Modules:** 24

### Complete Route Map

- **Inference:** `POST /v1/inference`
- **Leads:** `POST /v1/leads`, `POST /v1/leads/public`, `POST /v1/leads/enrich`, `GET /v1/leads/:id`
- **Agents:** `GET /v1/agents`, `GET /v1/agents/metrics`, `GET /v1/agents/:id`, `POST /v1/agents/:id/action`, `GET /v1/dashboard`
- **MCCO:** `GET /v1/mcco/command`, `GET /v1/mcco/agents`, `POST /v1/mcco/directive`, `POST /v1/mcco/content-calendar`, `POST /v1/mcco/audience-profile`, `POST /v1/mcco/positioning`, `POST /v1/mcco/monetization`, `POST /v1/mcco/post`
- **Intel:** `GET /v1/intel/officers`, `POST /v1/intel/officers/:id/scan`, `GET /v1/intel/dashboard`, `POST /v1/intel/fleet-scan`
- **Email:** `GET /v1/email/agents`, `POST /v1/email/compose`, `POST /v1/email/classify`, `GET /v1/email/dashboard`
- **Atlas AI:** 14 endpoints for campaign management, call records, bookings, speed-to-lead
- **Sentinel Campaign:** `GET /v1/campaign/calls`, `/agents`, `/analytics`, `/contacts`, `/dashboard`
- **Content:** `POST /v1/content/generate`, `POST /v1/content/publish`
- **Pricing:** `POST /v1/pricing/recommend`, `GET /v1/pricing/zones`
- **Property Intel:** `GET /v1/property-intel/search`, `POST /v1/property-intel/import`, `GET /v1/property-intel/stats`
- **Financial:** 6 endpoints for fee calc, rent estimate, ROI, forecast, pricing strategy, budget
- **Analysis Suite:** 9 endpoints for agent, fleet, market, competitive, pipeline, operational, property health, churn
- **Deals:** 7 endpoints for scoring, strategy, comparables, closing costs, investor package, portfolio
- **Hierarchy:** 5 endpoints for command chain, fleet status, chain, reports, division
- **Trader:** 11 endpoints for dashboard, watchlist, quotes, signals, capital calls, portfolio, news, trades
- **Frameworks:** 7 endpoints for peak performance frameworks
- **Thinking Coach:** Extended thinking and multi-framework analysis
- **CEO Directives:** `POST /v1/ceo/directive`, `GET /v1/ceo/operations-review`, `GET /v1/ceo/dashboard`
- **Slack:** Commands, interactions, events, channels, apps, audit
- **Webhooks:** Retell, audit log, health
- **Workflows:** SCAA-1, WF-3, WF-4 pipelines

---

## SECTION 5: INTEGRATION ECOSYSTEM

| Integration | Purpose |
|------------|---------|
| Cloudflare Workers/Pages/KV | Edge infrastructure — 5 services, 4 KV namespaces |
| Airtable | Central database — 39 tables, base appUSnNgpDkcEOzhN |
| Slack | Operations communication — 3 apps, 10 commands, 12 channels |
| Retell AI + Atlas AI | Voice campaigns — 8 campaign types, 2,400 daily capacity |
| Anthropic Claude | AI inference — sonnet-4-6 standard, opus-4-6 advanced |
| Stripe | Payment processing — checkout sessions, webhook verification |
| Twilio | SMS — daily reports, escalation notifications |
| Google Sheets | Data sync — appointment records |
| Buffer | Social publishing — 4 platforms |
| ElevenLabs | Voice clone — Tracey Hunter CEO voice |
| Manus | Website origin — coastalkey-awfopuqz.manus.space |

---

## SECTION 6: SALES & CLIENT ACQUISITION ENGINE

### Lead Lifecycle

```
[Source] → [Capture] → [Qualify] → [Nurture] → [Convert] → [Onboard] → [Retain]
```

- **SCAA-1 Battle Plan Pipeline:** 7-step pre-flight checklist for every new lead
- **Speed-to-Lead:** Contact within 60 seconds via Atlas AI
- **Sentinel Sales:** 40 agents, Mon-Sat 10:00-15:00 ET, 2,400 daily capacity
- **90-Day Drip:** 7 emails across 90 days, 5 segments, institutional brand voice
- **Objection Handling:** Real-time AI classification via Claude, <50ms keyword fast-path
- **Content-to-Lead Funnel:** ~112 posts/week across 8 platforms

---

## SECTION 7: FINANCIAL ARCHITECTURE

### Five-Year Recapitalization Model

| Year | ARR Target | Doors | EBITDA | Valuation (6-10x) |
|------|-----------|-------|--------|-------------------|
| Y1 (2026) | $500K | 75-100 | $150K (30%) | $900K-$1.5M |
| Y2 (2027) | $1.5M | 200-250 | $500K (33%) | $3M-$5M |
| Y3 (2028) | $4M | 400-500 | $1.4M (35%) | $8.4M-$14M |
| Y4 (2029) | $8M | 800-1000 | $3.2M (40%) | $19M-$32M |
| Y5 (2030) | $15M | 1500+ | $6M (40%) | $36M-$60M |

### Revenue Model (>70% Recurring Target)

| Stream | Margin | Contribution |
|--------|--------|-------------|
| Full-Service PM | 8-12% of rent | 50-60% |
| STR Management | 15-25% of booking | 15-20% |
| Leasing Fees | 50-100% first month | 10-15% |
| Maintenance Margins | 10-20% markup | 5-10% |
| Real Estate Commissions | 2.5-3% of sale | 10-15% |
| Investor Advisory | Retainer + perf | 5-10% (Y3+) |

### Financial Engine API

All calculations available via `/v1/financial/*` and `/v1/deals/*` endpoints.

---

## SECTION 8: OPERATIONAL PLAYBOOKS

- **CEO Daily Standup:** 6:00 AM EST, automatic, fleet briefing + action items
- **Scheduler Matrix:** 5 cron jobs (standup, report, drip, publish, backup)
- **Workflow Engine:** 7 pipelines (WF-1 through WF-7), replaced Zapier
- **Multi-Market Expansion:** Density → Adjacency → Luxury Pilot
- **Property Risk Scoring:** 6 categories, weighted, 4 tiers (GREEN/YELLOW/ORANGE/RED)
- **Storm Protocol:** Pre-storm, during, post-storm automated response
- **Thinking Coach:** 7 frameworks (First Principles, Systems, Inversion, Opportunity Cost, Second-Order, Regret Min, Red Team)

---

## SECTION 9: TERMINAL ORCHESTRATION LAYER

Architecture: Terminal → Claude Code API → N8N Automation → All Systems

**Context Injection:** Every request auto-receives relevant Master Spec sections. Claude Code always operates with full Coastal Key business knowledge.

**CKOS Command Examples:**
```bash
ckos market-report --zone stuart --format pdf --distribute slack,email
ckos lead-intake --name "John Smith" --property "123 Ocean Blvd" --value 850000
ckos content-deploy --days 30 --platforms all --approve auto
ckos fleet-scan --severity critical --report slack --channel exec-briefing
```

---

## SECTION 10: DEPLOYMENT & OPERATIONS

### Required Secrets

ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, ATLAS_API_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, GOOGLE_SERVICE_ACCOUNT_KEY, ADMIN_TOKEN

### Deployment Commands

```bash
npm run deploy              # Full platform deploy
npm run deploy:gateway      # API gateway
npm run deploy:sentinel     # Sentinel webhook
npm run deploy:nemotron     # Nemotron worker
npm run deploy:cc           # Command Center
npm test                    # All test suites
```

### Health Monitoring

- Gateway: `GET /v1/health?deep=true` (Airtable, Anthropic, Atlas, KV)
- Express: `GET /api/health` (uptime, memory, data integrity, env validation)

### Data Persistence

7 JSON stores with mutex locking + daily 2AM backup with 7-day retention. KV namespaces: CACHE, SESSIONS, RATE_LIMITS, AUDIT_LOG (30-day TTL).

### Domain Architecture

| Domain | Purpose |
|--------|---------|
| coastalkey-pm.com | Primary website (Cloudflare Pages) |
| ck-api-gateway.david-e59.workers.dev | API gateway |
| sentinel-webhook.david-e59.workers.dev | Retell pipeline |
| ck-nemotron-worker.david-e59.workers.dev | Claude inference |
| ck-command-center.pages.dev | Enterprise dashboard |

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| **Document** | Coastal Key Enterprise Master Specification Document |
| **Version** | 3.0 |
| **Classification** | Sovereign Institutional Blueprint |
| **Authority** | Coastal Key AI CEO |
| **Governor** | Tracey Merritt Hunter |
| **Created** | April 2026 |
| **Platform Version** | 2.1.0 |
| **Fleet** | 383 Autonomous AI Agents |
| **API Endpoints** | 147 (Gateway) + 28 (Express) |
| **Integrations** | 12 platforms |
| **Airtable Tables** | 39 |
| **Sections** | 10 |

**This document is the terminal's bible. Every terminal operation, deployment, and business decision references this specification. Sovereign governance. Ferrari precision. Zero defect execution.**

*Coastal Key Property Management — Enterprise-Grade Operations. Boutique-Level Care. 383-Unit Fleet. Treasure Coast Dominance.*
