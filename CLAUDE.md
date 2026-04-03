# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.
Governed by the **Sovereign Governance Compendium v1.0** — founded on Truth, Liberty, and Free Speech.

## Mission Statement
Coastal Key exists to protect, preserve, and elevate properties and investments entrusted to our care.
**Three Moral Principals: Service, Stewardship, Security.**

## Live Endpoints
- **API Gateway**: https://ck-api-gateway.david-e59.workers.dev (53 endpoints)
- **Sentinel Webhook**: https://sentinel-webhook.david-e59.workers.dev
- **Website**: https://main.coastalkey-pm.pages.dev
- **Command Center**: Deploy `ck-command-center/` to Cloudflare Pages
- **Gazette**: Available at `/gazette.html` on Command Center deployment
- **Mobile App**: Deploy `ck-mobile-app/` to Cloudflare Pages (PWA)
- **App Builder**: Deploy `ck-app-builder/` to Cloudflare Pages

## Architecture
- **ck-api-gateway**: Central API — 53 endpoints: inference, leads, agents, workflows, pricing, property intel, campaign, email, intelligence officers, governance, skills, market, systems, subscriptions (Cloudflare Worker)
- **ck-mobile-app**: Flagship AI command center PWA — luxury Ferrari-level UI, 6 screens: Home, Leads, AI Skills, Content, Market, Systems (Cloudflare Pages)
- **ck-app-builder**: Mobile App Builder SaaS platform — occupation selection, module config, branding, agent quantity toggle, deploy (Cloudflare Pages)
- **ck-command-center**: Dashboard UI for 290-agent fleet + Coastal Key Gazette (Cloudflare Pages)
- **ck-website**: Public-facing website with contact form (Cloudflare Pages)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: Campaign config, Retell prompts, Airtable field reference

## Governance
- **Compendium**: `ck-api-gateway/src/governance/compendium.js` — Mission, Moral Principals, Principles, CEO Journey, Pricing Tiers
- **SOP Framework**: `ck-api-gateway/src/governance/sop-framework.js` — AI-Agentic Operations Filter, SOP Templates, Workflow Events
- **Division Alignment**: Each division maps to a Moral Principal (Service/Stewardship/Security)
- **Agent Enrichment**: All 290 agents carry `governance` metadata via registry enrichment

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm run dev:mobile      # Local dev for mobile app (port 8788)
npm run dev:builder     # Local dev for app builder (port 8789)
npm test                # Run all tests
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run deploy          # Deploy all services
```

## Autonomous Fleet (360 units)
- **290 AI Agents** across 9 divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
- **50 Intelligence Officers** in 5 squads: ALPHA (Infrastructure), BRAVO (Data), CHARLIE (Security), DELTA (Revenue), ECHO (Performance)
- **20 Email AI Agents** in 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR
- All agents governed by Sovereign Governance Compendium v1.0

## Subscription Tiers
- **Starter**: $299/mo — 10 AI Agents
- **Pro**: $1,500/mo — 50 AI Agents
- **Enterprise**: $5K-$25K/mo — 200+ AI Agents (custom)

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret)
- Rate limiting via KV namespace (`RATE_LIMITS`)
- Audit logging via KV namespace (`AUDIT_LOG`)
- Airtable base: `appUSnNgpDkcEOzhN` (38 tables, 100% wired)
- All API routes prefixed with `/v1/`
- CORS handled at gateway level
- Tests use Node.js built-in test runner (`node --test`)
- Mobile app is a PWA (installable, offline-capable)
- App Builder features agent quantity toggle (builder-only, not in end-user apps)

## Secrets (all configured)
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL

## CI/CD
GitHub Actions on push to main: test → deploy all 5 services to Cloudflare.
Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
