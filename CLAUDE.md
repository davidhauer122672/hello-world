# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.

## Architecture
- **ck-api-gateway**: Central API — inference, leads, agents, workflows (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for 40-agent fleet management (Cloudflare Pages, single HTML)
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

## Agent Fleet (40 agents across 8 divisions)
Divisions: EXC (Executive), SEN (Sentinel), OPS (Operations), INT (Intelligence), MKT (Marketing), FIN (Finance), VEN (Ventures), TEC (Technology)

## CI/CD
GitHub Actions on push to main: test → deploy all three services to Cloudflare.
Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
