# Coastal Key — Enterprise AI Operations Platform

Coastal Key Property Management (CKPM) Enterprise AI Operations Platform.
Monorepo with Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, and Claude API integrations.

## Architecture

| Service | Description | Runtime |
|---------|------------|---------|
| `ck-api-gateway` | Central API — inference, leads, agents (290), workflows, pricing, property intel, email, campaigns | Cloudflare Worker |
| `ck-command-center` | 40-agent fleet Command Center dashboard + Coastal Key Gazette | Cloudflare Pages |
| `ck-website` | Public-facing Coastal Key website (coastalkey-pm.com) with team portal | Cloudflare Pages |
| `sentinel-webhook` | Retell call_analyzed → Airtable lead + Missed Calls QA + Slack pipeline | Cloudflare Worker |
| `th-sentinel-campaign` | TH Sentinel 40-agent campaign config, Retell prompts, Airtable field reference | Config/Docs |

## Agent Fleet (290 agents across 9 divisions)

| Division | Code | Description |
|----------|------|-------------|
| Executive | EXC | C-suite strategic operations |
| Sentinel | SEN | AI outbound sales agents |
| Operations | OPS | Day-to-day property operations |
| Intelligence | INT | 50 Intelligence Officers — data scanning |
| Marketing | MKT | Content, social, campaigns |
| Finance | FIN | Financial analysis & reporting |
| Ventures | VEN | New market expansion |
| Technology | TEC | Platform engineering |
| Email | EMAIL | 20 AI email agents — compose, classify, respond |

## Quick Start

```bash
# Install all dependencies (npm workspaces)
npm install

# Dev — API Gateway (http://localhost:8787)
npm run dev:gateway

# Dev — Sentinel Webhook
npm run dev:sentinel

# Run all tests
npm test

# Deploy all services
npm run deploy
```

## API Routes (v1)

All authenticated routes require `Authorization: Bearer <WORKER_AUTH_TOKEN>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/health` | No | Health check (add `?deep=true` for dependency checks) |
| POST | `/v1/leads/public` | No | Public website contact form |
| POST | `/v1/inference` | Yes | Claude inference with KV caching |
| POST | `/v1/leads` | Yes | Create lead |
| GET | `/v1/leads/:id` | Yes | Get lead by record ID |
| POST | `/v1/leads/enrich` | Yes | AI-enrich lead (battle plan / segment analysis) |
| POST | `/v1/webhook/retell` | Yes | Retell call_analyzed webhook |
| POST | `/v1/content/generate` | Yes | AI content generation |
| GET | `/v1/agents` | Yes | List/search agents |
| GET | `/v1/agents/metrics` | Yes | Aggregate agent metrics |
| GET | `/v1/agents/:id` | Yes | Get single agent |
| POST | `/v1/agents/:id/action` | Yes | Execute agent action |
| GET | `/v1/dashboard` | Yes | Combined dashboard data |
| POST | `/v1/workflows/scaa1` | Yes | SCAA-1 Battle Plan |
| POST | `/v1/workflows/wf3` | Yes | WF-3 Investor Escalation |
| POST | `/v1/workflows/wf4` | Yes | WF-4 Long-Tail Nurture |
| POST | `/v1/pricing/recommend` | Yes | Dynamic pricing |
| GET | `/v1/pricing/zones` | Yes | Zone benchmarks |
| GET | `/v1/property-intel/*` | Yes | Property intelligence (search, import, stats) |
| GET | `/v1/campaign/*` | Yes | TH Sentinel campaign (calls, agents, analytics, contacts, dashboard) |
| GET | `/v1/intel/*` | Yes | Intelligence Officers (list, dashboard, scan) |
| GET | `/v1/email/*` | Yes | Email agents (list, dashboard, compose, classify) |
| GET | `/v1/audit` | Yes | Audit log entries |

## Environment Secrets

Set via `wrangler secret put <NAME>` or Cloudflare dashboard:

| Secret | Service | Description |
|--------|---------|-------------|
| `ANTHROPIC_API_KEY` | ck-api-gateway | Claude API key |
| `AIRTABLE_API_KEY` | ck-api-gateway, sentinel-webhook | Airtable personal access token |
| `WORKER_AUTH_TOKEN` | ck-api-gateway | Bearer token for external callers |
| `SLACK_WEBHOOK_URL` | ck-api-gateway, sentinel-webhook | Slack incoming webhook |
| `RETELL_WEBHOOK_SECRET` | sentinel-webhook | Retell HMAC signature verification |
| `CLOUDFLARE_API_TOKEN` | CI/CD | GitHub Actions deployment |
| `CLOUDFLARE_ACCOUNT_ID` | CI/CD | GitHub Actions deployment |

## CI/CD

GitHub Actions automatically deploys on push to `main`:

1. **Test** — Runs all gateway and sentinel tests
2. **Deploy API Gateway** — `wrangler deploy` to Cloudflare Workers
3. **Deploy Sentinel Webhook** — `wrangler deploy` to Cloudflare Workers
4. **Deploy Command Center** — `wrangler pages deploy` to Cloudflare Pages
5. **Deploy Website** — `wrangler pages deploy` to Cloudflare Pages

## Security

- All API routes authenticated via Bearer token with constant-time comparison
- Rate limiting via Cloudflare KV (configurable RPM)
- Audit logging to KV with 30-day TTL
- Webhook signature verification (HMAC-SHA256) for Retell callbacks
- CORS restricted to known origins (coastalkey-pm.com, command center)
- CSP, HSTS, X-Frame-Options headers on all web properties
- Secrets managed via Cloudflare dashboard (never committed to repo)
