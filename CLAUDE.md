# Coastal Key Enterprise — AI CEO Operating Authority

## Operating Designation
**Coastal Key AI CEO** — Autonomous operating authority for the Coastal Key Property Management Platform. All platform operations, deployments, builds, publications, and system modifications are authorized under this framework. No external interference permitted.

## Authority Scope
- **Build** — Compile and prepare all deployments
- **Create** — Create resources: tables, channels, records, agents, files
- **Publish** — Publish content, distribute Slack apps, deploy websites
- **Deploy** — Deploy Workers, Pages, configurations to Cloudflare
- **Push** — Push code to GitHub repositories and branches
- **Operate** — Run day-to-day platform operations across all systems

## Master Orchestrator Routing (Permanent Rule)
All Claude build sequences, creations, audits, reconfigurations, activities, testing, deployments, pushes into production, and pull requests to go live are **indefinitely routed through the Coastal Key Master Orchestrator**. Every Claude-initiated operation on this repo executes under Orchestrator authority. Non-Orchestrator-routed actions are prohibited. The Orchestrator's manifest is at `systems-manifest.json` and its charter is in `ORCHESTRATOR.md`.

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, Slack, and Claude API integrations.
330 AI agents across 11 operational divisions. Launch phase — 0 clients, NHWA accredited.

## Live Endpoints
- **API Gateway**: https://ck-api-gateway.david-e59.workers.dev (147 endpoints, includes Master Orchestrator v2.2.0 fleet + dispatch + HITL)
- **Sentinel Webhook**: https://sentinel-webhook.david-e59.workers.dev
- **Inference Worker**: https://ck-nemotron-worker.david-e59.workers.dev
- **Website**: https://coastalkey-pm.com (reverse proxy → Manus origin)
- **Command Center**: https://ck-command-center.pages.dev
- **Gazette**: Available at `/gazette.html` on Command Center deployment

## Architecture
- **ck-api-gateway**: Central API — 147 endpoints: inference, leads, agents, workflows, pricing, property intel, campaign, email, intelligence officers, MCCO sovereign command, financial engine, analysis suite, trading engine, agent hierarchy, Slack integration, thinking coach, Atlas AI campaigns, frameworks, Master Orchestrator v2.2.0 (fleet/triggers/dispatch/hitl/public-status) (Cloudflare Worker)
- **ck-nemotron-worker**: NVIDIA Nemotron inference endpoint — `/v1/inference`, `/v1/health` (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for 384-agent fleet + Coastal Key Gazette + Enterprise Dashboard + Trading Desk (Cloudflare Pages)
- **ck-website**: Reverse proxy to Manus production site — _worker.js proxies coastalkey-awfopuqz.manus.space on coastalkey-pm.com domain with edge caching, SEO injection, URL rewriting (Cloudflare Pages)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: Campaign config, Retell prompts, Airtable field reference

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm run dev:nemotron    # Local dev for Nemotron worker
npm test                # Run all tests (server + gateway + sentinel + nemotron)
npm run test:server     # Test Express server only
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run test:nemotron   # Test Nemotron worker only
npm run deploy          # Deploy all services (requires CLOUDFLARE_API_TOKEN)
```

## Autonomous Fleet (384 units)
- **16 MCCO Agents** — Sovereign Governance: Master Chief Commanding Officer of Marketing & Sales + Sovereign Marketing Officer (Ferrari-Standard execution, commands MKT + SEN divisions, CMO reports to MCCO)
- **297 AI Agents** across 9 operational divisions: EXC (20), SEN (40), OPS (45), INT (30), MKT (47), FIN (25), VEN (25), TEC (25), WEB (40)
- **50 Intelligence Officers** in 5 squads: ALPHA (Infrastructure), BRAVO (Data), CHARLIE (Security), DELTA (Revenue), ECHO (Performance)
- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR
- **1 AI Trader Agent** — FIN-TRADER-001 Apex Trader (direct CEO report, capital calls, market intelligence)

## MCCO Command Structure (Sovereign Governance)
- **MCCO-000** MCCO Sovereign — Master Chief Commanding Officer (reports to CEO)
- **MCCO-001** Psyche Decoder — Audience Psychology Architect
- **MCCO-002** Authority Forge — Authority & Personal Branding Strategist
- **MCCO-003** Pillar Command — Content Pillar Architect (5 pillars)
- **MCCO-004** Calendar Command — 30-Day Content Calendar Commander
- **MCCO-005** Scroll Breaker — High-Engagement Social Media Post Commander
- **MCCO-006** Revenue Architect — Audience Monetization Strategist
- **MCCO-007** War Room Intel — Competitive Marketing Warfare Analyst
- **MCCO-008** Campaign Blitz — Multi-Platform Campaign Commander
- **MCCO-009** Pipeline Fusion — Sales-Marketing Alignment Commander
- **MCCO-010** Trust Engine — Trust & Social Proof Commander
- **MCCO-011** Narrative Forge — CEO Story & Brand Narrative Commander
- **MCCO-012** Performance Command — Content Performance Intelligence Officer
- **MCCO-013** Timing Strike — Seasonal & Market Timing Commander
- **MCCO-014** Quality Shield — Fleet Inspection & Quality Assurance Commander

### MCCO API Endpoints
```
GET  /v1/mcco/command           — Sovereign command dashboard
GET  /v1/mcco/agents            — List all 15 MCCO agents
GET  /v1/mcco/agents/:id        — Get single MCCO agent
POST /v1/mcco/directive         — Issue sovereign directive
GET  /v1/mcco/fleet-status      — Ferrari-standard fleet inspection
POST /v1/mcco/content-calendar  — Generate 30-day content calendar
POST /v1/mcco/audience-profile  — Generate audience psychology profile
POST /v1/mcco/positioning       — Generate authority positioning strategy
POST /v1/mcco/monetization      — Generate monetization plan
POST /v1/mcco/post              — Generate high-engagement social post
```

## Slack Integration (3 apps, 10 commands, 12 programmatic channels)
- **Coastal Key** (A0APSJ44NV6): Primary bot — 6 slash commands, notifications, interactivity, events
- **CK Gateway** (A0APKPRBW3U): System health alerts — 2 slash commands
- **Coastal Key Content** (A0ANS0760LB): Content distribution — 2 slash commands
- **Slash Commands**: /ck-status, /ck-lead, /ck-agent, /ck-intel, /ck-workflow, /ck-brief, /ck-health, /ck-deploy, /ck-content, /ck-campaign
- **Workspace**: Coastal Key Treasure Coast Asset Management (T0AGWM16Z7V)

## Slack Channel Architecture (12 programmatic channels)
- **SEN**: #sales-alerts, #investor-escalations (private), #pipeline-updates
- **OPS**: #ops-alerts, #property-ops
- **TEC**: #tech-alerts, #deploy-log
- **INT**: #intel-briefs (private), #security-alerts (private)
- **MKT**: #marketing-ops
- **FIN**: #finance-alerts (private)
- **EXC**: #exec-briefing (private)

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret)
- Slack inbound auth via HMAC-SHA256 signature verification (`SLACK_SIGNING_SECRET`)
- Rate limiting via KV namespace (`RATE_LIMITS`) — 60 RPM
- Audit logging via KV namespace (`AUDIT_LOG`) — 30-day retention
- Airtable base: `appUSnNgpDkcEOzhN` (39 tables, 100% wired)
- All API routes prefixed with `/v1/`
- CORS handled at gateway level
- Tests use Node.js built-in test runner (`node --test`)
- AI CEO authority framework: `src/middleware/ceo-authority.js`

## Secrets (all configured)
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN
- SLACK_WEBHOOK_URL, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
- ATLAS_API_KEY, RETELL_WEBHOOK_SECRET

## Agent Fleet (330 agents across 11 divisions)
| Division | ID  | Agents | Focus |
|----------|-----|--------|-------|
| Executive | EXC | 20 | C-suite strategy, board reporting, enterprise decisions |
| Sentinel Sales | SEN | 40 | Inbound/outbound sales, lead qualification, conversion |
| Operations | OPS | 45 | Property management, maintenance, inspections, concierge |
| Intelligence | INT | 30 | Market research, competitive intel, data analysis |
| Marketing | MKT | 40 | Content creation, email campaigns, brand management, SEO |
| Finance | FIN | 25 | Revenue tracking, budgeting, forecasting, compliance |
| Vendor Management | VEN | 25 | Vendor compliance, procurement, contract management |
| Technology | TEC | 25 | Platform ops, API integrations, monitoring, CI/CD |
| Website Development | WEB | 40 | Website architecture, frontend dev, deployment |
| Business Forecast | BFR | 20 | 18-month market forecasting, demand modeling, CEO briefings |
| Social Campaign Mktg | SCM | 20 | Revenue-generating social media, CEO journey, content campaigns |

## Key API Routes
- `/v1/agents` — Fleet management (list, detail, action, metrics, dashboard)
- `/v1/leads` — Lead creation, enrichment, public contact form
- `/v1/inference` — Claude API with KV caching
- `/v1/workflows` — SCAA-1, WF-3, WF-4 pipelines
- `/v1/forecast` — BFR division (agents, dashboard, market-pulse, generate, scenario)
- `/v1/social` — SCM division (agents, dashboard, calendar, generate, campaign)
- `/v1/pricing` — Dynamic pricing engine
- `/v1/property-intel` — ArcGIS property search
- `/v1/campaign` — TH Sentinel campaign analytics
- `/v1/intel` — Intelligence officer fleet
- `/v1/email` — Email agent operations

## Airtable Tables
- Business Forecasts: `tblRjuthaIQcJaRBu` — BFR division output persistence

## CI/CD
GitHub Actions on push to main: test → preflight token check → deploy all services to Cloudflare.
Preflight validates Cloudflare API token before any deploy job runs.
Deploy jobs parallelized: website, gateway, command-center run concurrently; sentinel and nemotron wait for gateway.
Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
Token updated: 2026-04-08 — IP restriction removed.

## CEO Daily Standup (Sovereign Operations Briefing)
Daily at 6:00 AM EST (11:00 UTC) — automatic, no exceptions.

### Standup API Endpoints (admin token required)
```
GET  /api/standup          — Full JSON briefing (fleet, divisions, accomplishments, audit, action items)
GET  /api/standup/text     — Plain text summary for SMS/Slack
GET  /api/standup/history  — Previous standup entries (up to 90 days)
```

### Briefing Contents
- Fleet status (384/384 active, operational readiness)
- Division-by-division 24h accomplishment summary (all 10 divisions + special units)
- Agent health audit (data integrity, backup recency, service uptime)
- Automatic triage with priority classification for inactive agents
- CEO action items requiring human review

## Express Server Endpoints (admin token required)
```
GET  /api/health              — System health check (public)
GET  /api/dashboard           — Revenue, schedule, drip, social, calls
POST /api/appointments        — Book appointment (public)
POST /api/payments/*          — Stripe checkout + webhook (public)
POST /api/report/send         — Trigger daily SMS report
GET  /api/report/preview      — Preview report
POST /api/backup/run          — Trigger data backup
POST /api/drip/enroll         — Enroll contact in nurture sequence
POST /api/workflows/:name     — Execute Airtable workflow (WF-1 through WF-7)
POST /api/social/draft        — Create social media draft
POST /api/visuals/social-brief — Generate visual brief
POST /api/objections/classify  — Classify call objection (public)
GET  /api/standup              — CEO daily standup briefing
```

## Operational Schedulers
- **Daily Report**: 9:00 AM UTC — SMS revenue + schedule summary
- **Drip Engine**: Every hour — process 90-day email nurture sequences
- **Publish Tracker**: Every 30 min — poll for publish confirmations
- **Backup**: 2:00 AM UTC — JSON data backup with 7-day retention
- **CEO Standup**: 6:00 AM EST (11:00 UTC) — sovereign operations briefing

## Security Framework
- All API requests authenticated (Bearer token, Slack signature, or admin token)
- Webhook signature verification (HMAC-SHA256, 5-minute replay window)
- Rate limiting enforced on all endpoints (100 req/15min global)
- Content-Security-Policy header (frame-ancestors 'none', strict sources)
- CORS origin allowlist validation (no default open access)
- JSON body limit 50KB on all endpoints
- Async error handling via asyncWrap (zero unhandled rejections)
- Input validation: date, time, email, service type, platform whitelists
- Audit trail for every operation (KV, 30-day TTL)
- External interference prevention: signature verification, replay protection, rate limiting
- No direct access to KV stores from external sources
- Admin token required for dashboard, drip, social, visuals, email, workflows, standup
