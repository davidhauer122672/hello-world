# Coastal Key Enterprise — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo: Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, Buffer, and Claude API.

## Architecture
- **ck-api-gateway**: Central API — 50+ endpoints: inference, leads, agents, workflows, podcast, email, pricing, campaign, property intel (Cloudflare Worker)
- **ck-website**: Public website + Team Portal SPA — PWA-enabled, client-side routed (Cloudflare Pages, `coastalkey-pm`)
- **ck-command-center**: Legacy dashboard UI (Cloudflare Pages, `ck-command-center`)
- **sentinel-webhook**: Retell call_analyzed → Airtable + Slack pipeline (Cloudflare Worker)
- **th-sentinel-campaign**: 40-agent Retell campaign config for Tracey Hunter Group

## Commands
```bash
npm run dev:gateway       # Local dev for API gateway
npm run dev:sentinel      # Local dev for sentinel webhook
npm test                  # Run all tests (gateway + sentinel + domain + smoke)
npm run test:gateway      # Test API gateway only
npm run test:sentinel     # Test sentinel webhook only
npm run test:domain       # Test custom domain config
npm run test:smoke        # Test app structure and features
npm run test:domain:live  # Live domain validation (LIVE_DOMAIN_TEST=1)
npm run deploy            # Deploy all services
npm run deploy:gateway    # Deploy API gateway worker
npm run deploy:sentinel   # Deploy sentinel webhook worker
npm run deploy:website    # Deploy ck-website to Cloudflare Pages
npm run deploy:cc         # Deploy command center to Cloudflare Pages
```

## Key Patterns
- All workers use ES module format (`export default { fetch() }`)
- Auth via Bearer token (`WORKER_AUTH_TOKEN` secret)
- Rate limiting via KV namespace (`RATE_LIMITS`)
- Audit logging via KV namespace (`AUDIT_LOG`)
- Airtable base: `appUSnNgpDkcEOzhN` (38 tables wired)
- All API routes prefixed with `/v1/`
- Public routes (no auth): `/v1/health`, `/v1/leads/public`, `/v1/podcast/feed.xml`
- Website proxies `/v1/*` to gateway via `_redirects` rewrite
- CORS handled at gateway level
- Tests use Node.js built-in test runner (`node --test`)
- PWA: manifest.json, sw.js, offline caching, Add to Home Screen

## Secrets (set via `wrangler secret put` or Cloudflare dashboard)
- `ANTHROPIC_API_KEY` — Claude API key
- `AIRTABLE_API_KEY` — Airtable personal access token
- `WORKER_AUTH_TOKEN` — Bearer token for external callers
- `SLACK_WEBHOOK_URL` — Slack incoming webhook
- `RETELL_WEBHOOK_SECRET` — Retell signature verification
- `BUFFER_ACCESS_TOKEN` — Buffer API token (WF-2 publishing)

## Environment Variables (wrangler.toml [vars])
- `BUFFER_PROFILE_IDS` — JSON map of platform → Buffer profile ID

## Workflow Pipelines
- **SCAA-1**: Lead → AI battle plan → task → Slack
- **WF-2**: Content approved → Slack → Buffer schedule → Airtable status update
- **WF-3**: Investor flag → AI presentation → escalation task → email payload
- **WF-4**: No Answer/Not Interested → 90-day nurture drip → re-engagement task

## Agent Fleet (290 agents across 9 divisions)
EXC (Executive), SEN (Sentinel), OPS (Operations), INT (Intelligence), MKT (Marketing), FIN (Finance), VEN (Vendor Mgmt), TEC (Technology), WEB (Web Development)

## CI/CD
GitHub Actions on push to main: test → deploy gateway + sentinel + website + command center.
Post-deploy: live custom domain validation.
Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
