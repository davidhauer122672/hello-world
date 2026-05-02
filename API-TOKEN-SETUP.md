# Coastal Key — API Token Configuration Guide

**Authority:** Coastal Key AI CEO under Master Orchestrator routing.
**Scope:** Production secrets for the live platform — gateway, nemotron, sentinel, website, command center.
**Status:** Production live. All endpoints verified (`deploy-status.json`).

---

## Token Inventory

| Token | Service | Purpose |
|-------|---------|---------|
| `ANTHROPIC_API_KEY` | Gateway, Nemotron, Server | Claude inference for all AI reasoning |
| `AIRTABLE_API_KEY` | Gateway, Sentinel, Server | CRM persistence (base `appUSnNgpDkcEOzhN`) |
| `WORKER_AUTH_TOKEN` | Gateway | Bearer auth for external callers |
| `SLACK_WEBHOOK_URL` | Gateway, Sentinel, Server | Notifications across 12 programmatic channels |
| `SLACK_BOT_TOKEN` | Server | Slash commands and interactivity |
| `SLACK_SIGNING_SECRET` | Server | HMAC verification on Slack inbound |
| `RETELL_WEBHOOK_SECRET` | Sentinel | HMAC verification on Retell webhooks |
| `RETELL_API_KEY` | Server | Voice campaign automation (Retell AI) |
| `ADMIN_TOKEN` | Server | Admin-only endpoints (standup, dashboard, drip) |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions | CI/CD deploy authority |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions | Cloudflare account identity |

---

## 1. ANTHROPIC_API_KEY

**Create**
1. Sign in at [console.anthropic.com](https://console.anthropic.com)
2. **Settings → API Keys → Create Key**, name it `coastalkey-production`
3. Copy the `sk-ant-...` value — shown only once

**Deploy**
```bash
cd ck-api-gateway && wrangler secret put ANTHROPIC_API_KEY
cd ../ck-nemotron-worker && wrangler secret put ANTHROPIC_API_KEY
```

**Local development (Claude Code)**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# Or run `claude login` for browser-based OAuth
```

---

## 2. AIRTABLE_API_KEY

**Create**
1. [airtable.com/create/tokens](https://airtable.com/create/tokens) → **Create new token**
2. Scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
3. Restrict to base **Coastal Key Master Orchestrator** (`appUSnNgpDkcEOzhN`, 39 tables)
4. Copy the `pat...` value

**Deploy**
```bash
cd ck-api-gateway && wrangler secret put AIRTABLE_API_KEY
cd ../sentinel-webhook && wrangler secret put AIRTABLE_API_KEY
```

---

## 3. WORKER_AUTH_TOKEN

**Generate**
```bash
openssl rand -base64 48
```

**Deploy**
```bash
cd ck-api-gateway && wrangler secret put WORKER_AUTH_TOKEN
```

**Caller usage**
```
Authorization: Bearer <WORKER_AUTH_TOKEN>
```
The gateway uses constant-time comparison (`src/middleware/auth.js`) to prevent timing attacks. Public routes (`/v1/health`, `/v1/leads/contact`) bypass this gate.

---

## 4. Slack Triple

**`SLACK_WEBHOOK_URL`** — incoming webhook URL from each Slack app (Coastal Key, CK Gateway, CK Content). Used for outbound notifications.

**`SLACK_BOT_TOKEN`** — `xoxb-...` from app's OAuth & Permissions page. Required for slash commands and interactivity.

**`SLACK_SIGNING_SECRET`** — from app's Basic Information page. Verifies HMAC-SHA256 signature with 5-minute replay window on every Slack inbound request.

**Deploy**
```bash
cd ck-api-gateway && wrangler secret put SLACK_WEBHOOK_URL
# Repeat for sentinel-webhook
# SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET go in Express server .env
```

---

## 5. RETELL_WEBHOOK_SECRET

Used by `sentinel-webhook` to verify Retell `call_analyzed` payloads before persisting to Airtable.

**Source:** Retell dashboard → Webhook configuration page → copy signing secret.

**Deploy**
```bash
cd sentinel-webhook && wrangler secret put RETELL_WEBHOOK_SECRET
```

---

## 6. CI/CD Tokens (GitHub Actions)

**`CLOUDFLARE_API_TOKEN`** — scoped to: Account.Workers Scripts:Edit, Account.Pages:Edit, Zone.DNS:Edit. **No IP restriction** (removed 2026-04-08 to enable GitHub-hosted runners). Configured at: GitHub → Settings → Secrets → Actions.

**`CLOUDFLARE_ACCOUNT_ID`** — Cloudflare dashboard → right sidebar. Same location.

The deploy workflow (`.github/workflows/deploy.yml`) validates these in a preflight job before any deployment runs. Failure halts the pipeline before any service is touched.

---

## Security Requirements

| Rule | Detail |
|------|--------|
| **No plaintext storage** | Tokens live only in Cloudflare Worker secrets, GitHub encrypted secrets, or local `.env` (gitignored) |
| **No version control** | `.env` and `*.secret*` are gitignored — verify before every commit |
| **Least privilege** | Each token scoped to minimum required permissions and resources |
| **Rotation cadence** | Quarterly. Immediate rotation on suspected exposure |
| **Audit trail** | Every authenticated operation logged to `AUDIT_LOG` KV namespace, 30-day TTL |
| **Replay protection** | HMAC + 5-minute timestamp window on all inbound webhooks |
| **Rate limit** | 60 RPM per caller via `RATE_LIMITS` KV namespace |

---

## Verification

After deploying secrets, run the live smoke test that the CI pipeline executes:

```bash
# Gateway liveness
curl -sS https://ck-api-gateway.david-e59.workers.dev/v1/health
# Expected: {"status":"healthy",...}

# Authenticated endpoint
curl -H "Authorization: Bearer $WORKER_AUTH_TOKEN" \
  https://ck-api-gateway.david-e59.workers.dev/v1/agents
# Expected: 200 with agent fleet payload

# Nemotron inference worker
curl -sS https://ck-nemotron-worker.david-e59.workers.dev/v1/health
# Expected: {"status":"healthy"}

# Sentinel webhook
curl -sS -o /dev/null -w "%{http_code}\n" \
  https://sentinel-webhook.david-e59.workers.dev/
# Expected: 405 (method not allowed on GET — proves worker is reachable)
```

A 500 with `auth token not set` means the secret was not deployed to that Worker. A 401 on the dashboard confirms the auth gate is enforced (deployment is healthy).

---

## Token Rotation Procedure

1. Generate new value at the source (Anthropic, Airtable, etc.)
2. Deploy to all consuming Workers via `wrangler secret put`
3. Update GitHub Actions secrets if applicable
4. Verify with smoke test above
5. Revoke old value at source
6. Log rotation in `CEO-AUTHORIZATION-LOG.md`

Rotation is non-blocking — `wrangler secret put` activates the new value on the next request without redeploying code.
