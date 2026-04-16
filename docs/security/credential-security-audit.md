# Coastal Key Credential Security Audit — S1-004

**Date:** April 15, 2026
**Classification:** CEO-VAULT SECURITY
**Standard:** SOC 2 Type II Alignment

---

## Credential Inventory

| ID | Credential | Provider | Scope | Rotation Policy | Status |
|----|-----------|----------|-------|----------------|--------|
| CRED-001 | ANTHROPIC_API_KEY | Anthropic | Claude inference | 90 days | ACTIVE |
| CRED-002 | AIRTABLE_API_KEY | Airtable | 39-table read/write | 90 days | VERIFY |
| CRED-003 | WORKER_AUTH_TOKEN | Internal | Gateway auth | 90 days | VERIFY |
| CRED-004 | CLOUDFLARE_API_TOKEN | Cloudflare | Workers deploy | IMMEDIATE | ROTATE NOW |
| CRED-005 | SLACK_BOT_TOKEN | Slack | Bot operations | 180 days | ACTIVE |
| CRED-006 | SLACK_SIGNING_SECRET | Slack | Webhook verify | Static | ACTIVE |
| CRED-007 | SLACK_WEBHOOK_URL | Slack | Legacy fallback | Static | ACTIVE |
| CRED-008 | ATLAS_API_KEY | Atlas AI | Campaign ops | 90 days | GENERATE |
| CRED-009 | BUFFER_ACCESS_TOKEN | Buffer | Content publish | 90 days | ACTIVE |
| CRED-010 | GOOGLE_CLIENT_ID | Google | Gmail OAuth | Static | ACTIVE |
| CRED-011 | GOOGLE_CLIENT_SECRET | Google | Gmail OAuth | 180 days | ACTIVE |
| CRED-012 | GMAIL_REFRESH_TOKEN | Google | Gmail send | Auto-renew | ACTIVE |
| CRED-013 | META_PAGE_ACCESS_TOKEN | Meta | Ad management | 60 days | ACTIVE |
| CRED-014 | META_AD_ACCOUNT_ID | Meta | Ad account | Static | ACTIVE |
| CRED-015 | NVIDIA_API_KEY | NVIDIA | Nemotron inference | 90 days | ACTIVE |

---

## IMMEDIATE ACTIONS REQUIRED

### CRED-004: CLOUDFLARE_API_TOKEN — ROTATE NOW (COMPROMISED)

**Severity:** CRITICAL
**Action Steps:**
1. Go to: Cloudflare Dashboard > My Profile > API Tokens
2. Revoke the current token immediately
3. Create new token with permissions:
   - Account: Cloudflare Workers Scripts:Edit
   - Account: Cloudflare Workers KV Storage:Edit
   - Zone: Workers Routes:Edit
   - Account: Cloudflare Pages:Edit
4. **DO NOT** add IP restrictions (GitHub Actions runners use dynamic IPs)
5. Update GitHub repo secret: Settings > Secrets > CLOUDFLARE_API_TOKEN
6. Test: Push a commit to main and verify deploy pipeline passes

### CRED-008: ATLAS_API_KEY — GENERATE

**Severity:** HIGH
**Action Steps:**
1. Log into youratlas.com
2. Go to Settings > API > Generate New Key
3. Store as Cloudflare Worker secret: `wrangler secret put ATLAS_API_KEY`
4. Also store in GitHub Secrets for CI/CD access

### CRED-002: AIRTABLE_API_KEY — VERIFY

**Severity:** MEDIUM
**Action Steps:**
1. Go to: airtable.com/create/tokens
2. Verify token has read/write access to base appUSnNgpDkcEOzhN
3. Check expiration date — rotate if > 90 days old
4. Ensure token scope covers all 39 tables

### CRED-003: WORKER_AUTH_TOKEN — VERIFY

**Severity:** MEDIUM
**Action Steps:**
1. Verify this token is unique and not shared with any external service
2. Rotate if it has been exposed in logs, commits, or error messages
3. Update in: Retell webhook config, Atlas webhook config, any external callers

---

## New Secrets Required (Eliza AI System — S1-003)

| Secret | Provider | Purpose |
|--------|----------|---------|
| ELEVENLABS_API_KEY | ElevenLabs | Voice synthesis API access |
| ELEVENLABS_VOICE_ID | ElevenLabs | CEO voice clone identifier |
| RETELL_AGENT_ID | Retell AI | Eliza conversational agent |
| HEYGEN_API_KEY | HeyGen | Avatar video generation |
| HEYGEN_AVATAR_ID | HeyGen | CEO avatar identifier |
| ATLAS_REVIVAL_CAMPAIGN_ID | Atlas AI | Dead lead revival campaign |
| ATLAS_CONFIRMATION_CAMPAIGN_ID | Atlas AI | Appointment confirmation |
| ATLAS_NEW_LEAD_CAMPAIGN_ID | Atlas AI | Immediate new lead outreach |

---

## Security Best Practices (Enforced)

1. **No secrets in code** — All secrets stored via `wrangler secret put` or GitHub Secrets
2. **No IP restrictions on CI/CD tokens** — GitHub Actions uses dynamic runner IPs
3. **90-day rotation policy** — Calendar reminders for all rotating credentials
4. **Audit trail** — All API operations logged to AUDIT_LOG KV (30-day TTL)
5. **Webhook verification** — HMAC-SHA256 on all incoming webhooks (Retell, Slack)
6. **Rate limiting** — 60 RPM enforced on all authenticated endpoints
7. **No secrets in error messages** — Error handler strips sensitive data before logging

---

*Coastal Key Enterprise. CEO-Vault Security Standard. Zero exposure tolerance.*
