# Coastal Key — Enterprise Platform

Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.

## Architecture

| Service | Description | Runtime |
|---------|------------|---------|
| `ck-api-gateway` | Central inference router, lead management, agent orchestration | Cloudflare Worker |
| `ck-command-center` | Agent Command Center dashboard UI | Cloudflare Pages |
| `sentinel-webhook` | Retell call → Airtable → Slack pipeline | Cloudflare Worker |
| `th-sentinel-campaign` | Campaign configuration and Retell agent prompts | Config/Docs |

## Quick Start

```bash
# Install dependencies
npm install

# Dev — API Gateway
npm run dev:gateway

# Dev — Sentinel Webhook
npm run dev:sentinel

# Run tests
npm test

# Deploy all workers
npm run deploy
```

## Environment Secrets

Set via `wrangler secret put <NAME>` or Cloudflare dashboard:

- `ANTHROPIC_API_KEY` — Claude API key
- `AIRTABLE_API_KEY` — Airtable personal access token
- `WORKER_AUTH_TOKEN` — Bearer token for external callers
- `SLACK_WEBHOOK_URL` — Slack incoming webhook
- `RETELL_WEBHOOK_SECRET` — Retell signature verification (optional)

## CI/CD

GitHub Actions automatically deploys on push to `main`:
- Runs tests for all workers
- Deploys `ck-api-gateway` and `sentinel-webhook` to Cloudflare
- Deploys `ck-command-center` to Cloudflare Pages

Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets.
