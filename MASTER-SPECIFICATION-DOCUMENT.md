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
