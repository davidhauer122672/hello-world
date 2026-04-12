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
