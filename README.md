# Coastal Key Enterprise Platform

> *Coastal Key delivers enterprise-grade AI systems that automate operational complexity for working owners—reclaiming their time while multiplying productivity across every business function.*

Enterprise AI operations platform for Coastal Key Property Management — Treasure Coast asset oversight powered by a 383-unit autonomous agent fleet, sovereign MCCO governance, and Cloudflare edge infrastructure.

**Standards**: Ferrari Precision | Red Bull Optimization | SpaceX Engineering
**Governance**: [GOVERNANCE.md](docs/governance/GOVERNANCE.md) | **Mission**: [MISSION.md](docs/governance/MISSION.md)

## Architecture

| Service | Runtime | Description |
|---------|---------|-------------|
| **ck-api-gateway** | Cloudflare Worker | Central API — 147 endpoints across 22 route modules |
| **ck-website** | Cloudflare Pages | Reverse proxy to Manus production site with edge caching, SEO injection |
| **ck-command-center** | Cloudflare Pages | Enterprise dashboard, trading desk, fleet command, Gazette |
| **sentinel-webhook** | Cloudflare Worker | Retell call_analyzed → Airtable + Slack pipeline |
| **ck-nemotron-worker** | Cloudflare Worker | Claude AI inference endpoint |
| **ck-trading-desk** | Electron + React | Desktop trading terminal with real-time market data |

## Quick Start

```bash
npm install                # Install all workspace dependencies
npm test                   # Run all test suites
npm run dev:gateway        # Local dev — API gateway
npm run dev:sentinel       # Local dev — sentinel webhook
npm run dev:nemotron       # Local dev — Nemotron worker
npm run deploy             # Deploy all services to Cloudflare
```

## Fleet Composition (383 Units)

- **15 MCCO** — Sovereign command (marketing & sales governance, Ferrari-Standard execution)
- **297 Division Agents** — 9 divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
- **50 Intelligence Officers** — 5 squads: ALPHA, BRAVO, CHARLIE, DELTA, ECHO
- **20 Email AI Agents** — 4 squads: INTAKE, COMPOSE, NURTURE, MONITOR
- **1 Apex Trader** — FIN-TRADER-001, direct CEO report

## API Gateway Modules

Inference, leads, agents, dashboards, workflows, pricing, property intelligence, campaigns, email agents, intelligence officers, MCCO sovereign command, financial engine, analysis suite, trading engine, deals, agent hierarchy, Slack integration, thinking coach, Atlas AI campaigns, frameworks, agent manifest.

All routes prefixed `/v1/`. Auth via Bearer token or Slack HMAC-SHA256 signature.

## Integrations

**Cloudflare** — Workers, Pages, KV (cache, sessions, rate limits, audit log)
**Airtable** — 39 tables, base `appUSnNgpDkcEOzhN`
**Slack** — 3 apps, 10 slash commands, 12 programmatic channels
**Retell AI** — Voice agent campaigns via Atlas platform
**Claude API** — Inference, content generation, thinking coach
**Anthropic** — Claude AI inference (dedicated worker)
**Stripe** — Payment processing

## CI/CD

GitHub Actions: `test → preflight token check → parallel deploy` on push to main.

```
test → preflight → ┬─ deploy-website
                    ├─ deploy-gateway → deploy-sentinel
                    ├─ deploy-gateway → deploy-nemotron
                    └─ deploy-command-center
```

## Security

- Bearer token authentication on all API endpoints
- Slack webhook HMAC-SHA256 signature verification (5-min replay window)
- Rate limiting — 60 RPM per IP via KV sliding window
- Audit logging — KV with 30-day TTL
- CORS restricted at gateway level
- CEO authority framework middleware

## License

Proprietary — Coastal Key Treasure Coast Asset Management.
