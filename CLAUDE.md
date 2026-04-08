# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Enterprise AI Operations Platform — Worldwide Enterprise & Global Business Partner.
Monorepo with Cloudflare Workers, Cloudflare Pages, Electron Desktop App, Airtable, Retell AI, and Claude API integrations.
Two operational divisions: Property Management (382 agents) and CK Trading Desk (97 agents).

## Live Endpoints
- **API Gateway**: https://ck-api-gateway.david-e59.workers.dev (68 endpoints, Bearer auth)
- **Sentinel Webhook**: https://sentinel-webhook.david-e59.workers.dev
- **Nemotron Worker**: https://ck-nemotron-worker.david-e59.workers.dev
- **Website**: https://main.coastalkey-pm.pages.dev
- **Command Center**: https://ck-command-center.pages.dev
- **Enterprise Dashboard**: https://ck-command-center.pages.dev/enterprise-dashboard.html
- **Gazette**: https://ck-command-center.pages.dev/gazette.html

## Architecture
- **ck-api-gateway**: Central API — 68 endpoints: inference, leads, agents, workflows, pricing, property intel, campaign, email, intelligence officers, MCCO sovereign command (Cloudflare Worker)
- **ck-nemotron-worker**: NVIDIA Nemotron inference endpoint — `/v1/inference`, `/v1/health` (Cloudflare Worker)
- **ck-command-center**: Agent Command Center + Enterprise Dashboard + Gazette (Cloudflare Pages)
- **ck-website**: Public-facing website with contact form (Cloudflare Pages)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **ck-trading-desk**: Electron desktop app — 97 AI trading agents, 10 financial analysis engines, automated trading (Electron + React + Vite)
- **th-sentinel-campaign**: Campaign config, Retell prompts, Airtable field reference

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm run dev:nemotron    # Local dev for Nemotron worker
npm run dev:trading     # Local dev for CK Trading Desk
npm run build:trading   # Build Trading Desk desktop app
npm test                # Run all tests
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run test:nemotron   # Test Nemotron worker only
npm run deploy          # Deploy all Cloudflare services
```

## Autonomous Fleet (479 units)

### Property Management Division (382 agents)
- **15 MCCO Agents** — Sovereign Governance: Master Chief Commanding Officer (Ferrari-Standard, commands MKT + SEN, CMO reports to MCCO)
- **297 AI Agents** across 10 operational divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
- **50 Intelligence Officers** in 5 squads: ALPHA (Infrastructure), BRAVO (Data), CHARLIE (Security), DELTA (Revenue), ECHO (Performance)
- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR

### CK Trading Desk Division (97 agents)
- **7 C-Suite**: CEO, COO, CFO, CIO, CRO, CTO, CCO — Goldman Sachs corporate hierarchy
- **8 Senior Leadership**: 6 Managing Directors + 2 Partners
- **4 Executive Directors**: Equities, Fixed Income, Derivatives, Alternatives
- **6 Vice Presidents**: Equity Research, Trading Strategy, Portfolio Analytics, Client Relations, Quant Dev, Market Intel
- **16 Mid-Level**: 6 Senior Associates + 10 Associates (one per analysis module)
- **40 Analysts**: 20 Senior Analysts + 20 Analysts across all divisions
- **16 Specialists**: 4 Quants, 4 Traders, 2 Structurers, 2 Portfolio Managers, 4 Engineers

### 10 Financial Analysis Engines
1. Goldman Sachs Stock Screener — P/E, revenue growth, moat, price targets
2. Morgan Stanley DCF Valuation — 5-year projection, WACC, terminal value, sensitivity
3. Bridgewater Risk Analysis — VaR, correlation, stress tests, hedging
4. JPMorgan Earnings Breakdown — EPS surprise, implied move, scenarios
5. BlackRock Portfolio Construction — asset allocation, ETFs, rebalancing
6. Citadel Technical Analysis — RSI, MACD, Bollinger, patterns, trade signals
7. Harvard Endowment Dividend Strategy — safety scores, DRIP, income projection
8. Bain Competitive Advantage — moat analysis, SWOT, market share
9. Renaissance Technologies Pattern Finder — seasonality, insider flow, options
10. McKinsey Macro Impact — interest rates, inflation, GDP, sector rotation

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

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret)
- Rate limiting via KV namespace (`RATE_LIMITS`)
- Audit logging via KV namespace (`AUDIT_LOG`)
- Airtable base: `appUSnNgpDkcEOzhN` (38 tables, 100% wired)
- All API routes prefixed with `/v1/`
- CORS handled at gateway level
- Tests use Node.js built-in test runner (`node --test`)

## Secrets (all configured)
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL, NVIDIA_API_KEY

## CK Trading Desk — Desktop Application
- **Stack**: Electron 30 + React 18 + Vite 5
- **Main Process**: `src/main/main.js` — 18 IPC handlers, system tray, auto-updater, deep links
- **Preload**: `src/main/preload.js` — contextBridge with grouped API (trading.*, analysis.*, agents.*)
- **Renderer Pages**: Dashboard, TradingDesk, AnalysisSuite (10 modules), AgentFleet, Portfolio, CashFlow
- **Engines**: `src/engines/financial-engines.js` (10 classes), `src/engines/trading-engine.js` (7 classes)
- **Services**: gateway-client.js (CK API integration), market-data.js (real-time data)
- **Agent Hierarchy**: `src/shared/agent-hierarchy.js` — 97 agents, Goldman Sachs structure
- **Trading Strategies**: Momentum, Mean Reversion, Stat Arb, Event Driven, Dividend Capture, Sector Rotation

## CI/CD
GitHub Actions on push to main: test → deploy all Cloudflare services.
Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
CK Trading Desk builds separately via `npm run build:trading` (Electron Builder).

## Enterprise Dashboard
Unified Master Dashboard at `/enterprise-dashboard.html` on Command Center deployment.
11 views: Executive Overview, Trading Desk, Cash Flow, Agent Fleet (479), Campaigns, Property Intel, MCCO Command, 10 Engines, Intelligence Officers, Email Agents, All Systems.
Live P&L ticker, real-time clock, DRIP compound tables, cross-linked to all CK platforms.
