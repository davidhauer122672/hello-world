# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.

## Architecture
- **ck-api-gateway**: Central API — inference, leads, agents (290), workflows, pricing, property intel, email agents, campaigns (Cloudflare Worker)
- **ck-command-center**: Dashboard UI for fleet management + Coastal Key Gazette (Cloudflare Pages)
- **ck-website**: Public-facing website (coastalkey-pm.com) with team portal login (Cloudflare Pages)
- **sentinel-webhook**: Retell call_analyzed → Airtable Leads + Missed Calls QA + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: TH Sentinel 40-agent campaign config, Retell prompts, Airtable field reference

## Commands
```bash
npm run dev:gateway     # Local dev for API gateway
npm run dev:sentinel    # Local dev for sentinel webhook
npm test                # Run all tests
npm run test:gateway    # Test API gateway only
npm run test:sentinel   # Test sentinel webhook only
npm run deploy          # Deploy all services (gateway + sentinel + command center + website)
```

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret) with constant-time comparison
- Rate limiting via KV namespace (`RATE_LIMITS`)
- Audit logging via KV namespace (`AUDIT_LOG`)
- Airtable base: `appUSnNgpDkcEOzhN`
- All API routes prefixed with `/v1/`
- CORS restricted to known origins (coastalkey-pm.com, command center)
- Webhook signature verification (HMAC-SHA256) for Retell callbacks
- Retry with exponential backoff on Airtable/Slack API calls
- Tests use Node.js built-in test runner (`node --test`)

## Secrets (set via wrangler secret put or Cloudflare dashboard)
- ANTHROPIC_API_KEY, AIRTABLE_API_KEY, WORKER_AUTH_TOKEN, SLACK_WEBHOOK_URL, RETELL_WEBHOOK_SECRET
- See `.env.example` for full reference with descriptions

## Agent Fleet (290 agents across 9 divisions)
Divisions: EXC (Executive), SEN (Sentinel), OPS (Operations), INT (Intelligence), MKT (Marketing), FIN (Finance), VEN (Ventures), TEC (Technology), EMAIL (Email AI Agents)

## CI/CD
GitHub Actions on push to main: test → deploy all four services to Cloudflare.
Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.

## Security Notes
- Never commit `.env`, `.dev.vars`, or files matching secret patterns (see `.gitignore`)
- Campaign PII uses env var placeholders — actual values set at runtime
- Error responses never expose internal details to external callers
- CSP + HSTS headers configured on all web properties via `_headers`
