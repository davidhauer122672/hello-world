# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.
330 AI agents across 11 operational divisions. Launch phase — 0 clients, NHWA accredited.

## Architecture
- **ck-api-gateway**: Central API — inference, leads, agents, workflows, forecasting, social campaigns (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for 330-agent fleet management (Cloudflare Pages, single HTML)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: Campaign config, Retell prompts, Airtable field reference

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm test                # Run all tests
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run deploy          # Deploy all services
```

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret)
- Rate limiting via KV namespace (`RATE_LIMITS`)
- Audit logging via KV namespace (`AUDIT_LOG`)
- Airtable base: `appUSnNgpDkcEOzhN`
- All API routes prefixed with `/v1/`
- CORS handled at gateway level
- Tests use Node.js built-in test runner (`node --test`)

## Secrets (set via wrangler secret put or Cloudflare dashboard)
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL, RETELL_WEBHOOK_SECRET

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
GitHub Actions on push to main: test → deploy all three services to Cloudflare.
Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
