# Coastal Key — Enterprise AI Operations Platform

AI-powered luxury property management on Florida's Treasure Coast. 290 AI agents across 9 divisions.

## Architecture

| Service | Description | Runtime |
|---------|------------|---------|
| `ck-api-gateway` | Central API — inference, leads, agents, workflows, podcast, pricing, email, campaign | Cloudflare Worker |
| `ck-website` | Public website + Team Portal SPA (PWA) | Cloudflare Pages |
| `ck-command-center` | Legacy agent dashboard | Cloudflare Pages |
| `sentinel-webhook` | Retell call → Airtable → Slack pipeline | Cloudflare Worker |
| `th-sentinel-campaign` | 40-agent Retell outbound campaign config | Config |

## Quick Start

```bash
npm install
npm run dev:gateway     # API gateway on localhost
npm run dev:sentinel    # Sentinel webhook on localhost
npm test                # All tests (gateway + sentinel + domain + smoke)
npm run deploy          # Deploy all services to Cloudflare
```

## Secrets

Set via `wrangler secret put <NAME>`:

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API |
| `AIRTABLE_API_KEY` | Airtable PAT |
| `WORKER_AUTH_TOKEN` | Bearer auth for API callers |
| `SLACK_WEBHOOK_URL` | Slack notifications |
| `RETELL_WEBHOOK_SECRET` | Retell signature verification |
| `BUFFER_ACCESS_TOKEN` | Buffer publishing (WF-2) |

## API Routes (50+)

**Public (no auth):** `/v1/health`, `/v1/leads/public`, `/v1/podcast/feed.xml`

**Authenticated:** Inference, leads, agents (290), dashboard, content generation, workflows (SCAA-1, WF-2, WF-3, WF-4), podcast, pricing, property intel, campaign, email, audit.

## Workflow Pipelines

| Pipeline | Trigger | Chain |
|----------|---------|-------|
| SCAA-1 | New lead | AI battle plan → task → Slack |
| WF-2 | Content approved | Validate → Slack → Buffer → Airtable status |
| WF-3 | Investor flag | AI presentation → escalation task → email |
| WF-4 | No Answer | 90-day nurture → re-engagement task |

## CI/CD

GitHub Actions on push to `main`: test → deploy (gateway + sentinel + website + command center) → live domain validation.

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
