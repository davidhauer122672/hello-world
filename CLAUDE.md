# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.

## Live Endpoints
- **API Gateway**: https://ck-api-gateway.david-e59.workers.dev
- **Sentinel Webhook**: https://sentinel-webhook.david-e59.workers.dev
- **Website**: https://main.coastalkey-pm.pages.dev
- **Command Center**: Deploy `ck-command-center/` to Cloudflare Pages
- **Gazette**: Available at `/gazette.html` on Command Center deployment

## Architecture
- **ck-api-gateway**: Central API — 53 endpoints: inference, leads, agents, workflows, pricing, property intel, campaign, email, intelligence officers, MCCO sovereign command (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for 293-agent fleet + MCCO Sovereign Command + Coastal Key Gazette (Cloudflare Pages)
- **ck-website**: Public-facing website with contact form (Cloudflare Pages)
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

## Autonomous Fleet (363 units)
- **293 AI Agents** across 10 divisions: SOV (Sovereign Command), EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
- **MCCO Sovereign Command (SOV)**: 2 sovereign-tier agents — MCCO Sovereign (SOV-001) + Revenue Commander (SOV-002). Highest authority tier. Commands MKT and SEN divisions. CMO (MKT-041) reports directly to MCCO.
- **50 Intelligence Officers** in 5 squads: ALPHA (Infrastructure), BRAVO (Data), CHARLIE (Security), DELTA (Revenue), ECHO (Performance)
- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR

## MCCO Capabilities
- Audience Psychology Breakdown (frustrations, desires, fears, daily habits)
- Brand Positioning & Authority Strategy Engine
- 5 Content Pillars That Convert (Property Intel, CEO Journey, Service Excellence, AI Innovation, Lifestyle)
- 30-Day Content Calendar Generator (daily idea, format, angle, goal per post)
- High-Engagement Social Media Post Generator (hooks, insights, CTAs)
- Audience Monetization Strategy (7 revenue streams, follower-to-buyer pipeline)
- Competitive Intelligence & Market Domination Engine
- Tesla-Grade Hypergrowth Strategy (Foundation → Acceleration → Domination)

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
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL

## CI/CD
GitHub Actions on push to main: test → deploy all services to Cloudflare.
Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
