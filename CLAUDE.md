# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.

## Live Endpoints
- **API Gateway**: https://ck-api-gateway.david-e59.workers.dev
- **Sentinel Webhook**: https://sentinel-webhook.david-e59.workers.dev
- **Nemotron Worker**: https://ck-nemotron-worker.david-e59.workers.dev
- **Website**: https://main.coastalkey-pm.pages.dev
- **Command Center**: https://ck-command-center.pages.dev
- **Gazette**: Available at `/gazette.html` on Command Center deployment

## Architecture
- **ck-api-gateway**: Central API — 43 endpoints: inference, leads, agents, workflows, pricing, property intel, campaign, email, intelligence officers (Cloudflare Worker)
- **ck-nemotron-worker**: NVIDIA Nemotron inference endpoint — `/v1/inference`, `/v1/health` (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for 290-agent fleet + Coastal Key Gazette (Cloudflare Pages)
- **ck-website**: Public-facing website with contact form (Cloudflare Pages)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: Campaign config, Retell prompts, Airtable field reference

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm run dev:nemotron    # Local dev for Nemotron worker
npm test                # Run all tests
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run test:nemotron   # Test Nemotron worker only
npm run deploy          # Deploy all services
```

## Autonomous Fleet (360 units)
- **290 AI Agents** across 9 divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
- **50 Intelligence Officers** in 5 squads: ALPHA (Infrastructure), BRAVO (Data), CHARLIE (Security), DELTA (Revenue), ECHO (Performance)
- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR

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

## CI/CD
GitHub Actions on push to main: test → deploy all services to Cloudflare.
Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
