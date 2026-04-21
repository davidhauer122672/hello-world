# Coastal Key PM — API Token Configuration Guide

## Overview

Coastal Key's infrastructure relies on four secret tokens and one development key. Each token is scoped to a single responsibility and must never be committed to version control.

---

## Required Tokens

### 1. ANTHROPIC_API_KEY

**Purpose:** Claude inference for the API gateway, content generation, and agent orchestration.

**Create:**
1. Sign in at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **Settings > API Keys**
3. Click **Create Key**, name it `coastalkey-production`
4. Copy the key (format: `sk-ant-...`) — it is shown only once

**Deploy:**
```bash
cd ck-api-gateway
wrangler secret put ANTHROPIC_API_KEY
```

**Claude Code (local development):**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Add to your shell profile (`~/.bashrc` or `~/.zshrc`) to persist across sessions. Alternatively, run `claude login` for browser-based OAuth without managing a key manually.

---

### 2. AIRTABLE_API_KEY

**Purpose:** CRM read/write across Lead Contacts, Call Log, Agent Performance, and Campaign Analytics tables in base `appUSnNgpDkcEOzhN`.

**Create:**
1. Sign in at [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **Create new token**
3. Set scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
4. Restrict access to the **Coastal Key Master Orchestrator** base only
5. Copy the token (format: `pat...`)

**Deploy:**
```bash
cd ck-api-gateway
wrangler secret put AIRTABLE_API_KEY

cd ../sentinel-webhook
wrangler secret put AIRTABLE_API_KEY
```

---

### 3. WORKER_AUTH_TOKEN

**Purpose:** Bearer authentication for external callers (Retell webhooks, Zapier triggers, command center) hitting the API gateway.

**Create:**
Generate a cryptographically random token:
```bash
openssl rand -base64 48
```

**Deploy:**
```bash
cd ck-api-gateway
wrangler secret put WORKER_AUTH_TOKEN
```

**Usage by callers:**
```
Authorization: Bearer <WORKER_AUTH_TOKEN>
```

All API gateway endpoints except `/health` and `/v1/leads/contact` require this header. The gateway uses constant-time comparison to validate tokens.

---

### 4. SLACK_WEBHOOK_URL

**Purpose:** Real-time notifications for call outcomes, lead escalations, and system alerts.

**Create:**
1. Go to [api.slack.com/apps](https://api.slack.com/apps) and select the Coastal Key app
2. Navigate to **Incoming Webhooks > Add New Webhook to Workspace**
3. Select the target channel and authorize
4. Copy the webhook URL

**Deploy:**
```bash
cd sentinel-webhook
wrangler secret put SLACK_WEBHOOK_URL
```

---

## Security Requirements

| Rule | Detail |
|------|--------|
| **No plaintext storage** | All tokens live in Cloudflare Worker secrets or local environment variables only |
| **No version control** | Never commit tokens to `.env` files, config, or code |
| **Least privilege** | Scope each token to its minimum required permissions |
| **Rotation cadence** | Rotate all tokens quarterly; rotate immediately on suspected exposure |
| **Audit** | Token usage is logged to the `AUDIT_LOG` KV namespace |

---

## Verification

After deploying all secrets, confirm each service is operational:

```bash
# API Gateway health (no auth required)
curl https://coastalkey-pm.com/health

# Authenticated endpoint test
curl -H "Authorization: Bearer <WORKER_AUTH_TOKEN>" \
  https://coastalkey-pm.com/v1/agents
```

Both should return `200`. If any return `500` with `auth token not set`, the corresponding secret was not deployed to the Worker.
