# Social Media Automation — Deployment Runbook

**Version:** 1.0
**Last Updated:** 2026-04-03
**Owner:** CTO / TEC Division
**Deployment Tracker:** `recBDReVmJrH6dPHg`

---

## Objective

End-to-end deployment of the WF-2 Social Approval → Buffer pipeline, including account setup, API integrations, Zapier workflow build, and Cloudflare Worker deployment.

---

## Phase 1: Account Setup & Social Channel Connection

### 1.1 Create Buffer Account

- [ ] Navigate to buffer.com and create a business account
- [ ] Use organizational email: `social@coastalkey-pm.com` (or designated)
- [ ] Select Buffer Publish plan (supports scheduling + multi-channel)

### 1.2 Connect Social Channels to Buffer

| Channel | Account Type | Buffer Connection |
|---|---|---|
| Instagram | Business Account | Connect via Facebook Business Suite |
| Facebook | Business Page | Direct page connection |
| LinkedIn | Company Page | Connect via LinkedIn OAuth |

- [ ] Instagram Business connected to Buffer
- [ ] Facebook Business Page connected to Buffer
- [ ] LinkedIn Company Page connected to Buffer
- [ ] Verify all three channels show as "Connected" in Buffer dashboard
- [ ] Post a test update to each channel to confirm permissions

### 1.3 Generate Buffer Access Token

- [ ] Navigate to Buffer Developer Portal
- [ ] Create a new application or use "Manage Apps"
- [ ] Generate a permanent access token
- [ ] Store token securely — this will be set as `BUFFER_ACCESS_TOKEN` secret

---

## Phase 2: Zapier Authorization & Integration

### 2.1 Authorize Buffer in Zapier

- [ ] Log in to Zapier → Settings → My Apps
- [ ] Click "Add Connection" → Search "Buffer"
- [ ] Complete OAuth flow with Buffer credentials
- [ ] Verify connection shows as "Connected" with green status

### 2.2 Verify Existing Zapier Connections

- [ ] Airtable: Connected (verify Personal Access Token is valid)
- [ ] Slack: Connected (verify workspace access)
- [ ] Buffer: Connected (from step 2.1)

### 2.3 Build WF-2 in Zapier

Follow the detailed build guide: [`docs/wf2-zapier-setup-guide.md`](./wf2-zapier-setup-guide.md)

- [ ] Step 1: Airtable trigger configured (Updated Record, Status = Approved)
- [ ] Step 2: Slack preview message configured
- [ ] Step 3: Buffer Create Update configured (Caption, Asset, Post Date mapped)
- [ ] Step 4: Airtable Update Record configured (Status → Scheduled, Notes → Buffer ID)
- [ ] Step 5: Alignable filter branch configured
- [ ] Step 6: Alignable manual-publish Slack alert configured
- [ ] Zap turned ON

---

## Phase 3: Cloudflare Worker Deployment (Native Alternative)

### 3.1 Set Buffer Secret

```bash
cd ck-api-gateway
wrangler secret put BUFFER_ACCESS_TOKEN
# Paste the Buffer access token when prompted
```

### 3.2 Verify New Files

| File | Purpose |
|---|---|
| `src/services/buffer.js` | Buffer API client (profiles, create post, get update) |
| `src/routes/social-publish.js` | WF-2 handler: POST /v1/workflows/wf2 |
| `src/automations/triggers.js` | WF-2 trigger config (updated) |
| `src/index.js` | Gateway router (WF-2 route wired) |

### 3.3 Deploy

```bash
npm run deploy:gateway
# Or: cd ck-api-gateway && npx wrangler deploy
```

### 3.4 Verify Deployment

```bash
# Health check
curl -s https://ck-api-gateway.<your-subdomain>.workers.dev/v1/health | jq .

# Test WF-2 endpoint (with auth)
curl -X POST https://ck-api-gateway.<your-subdomain>.workers.dev/v1/workflows/wf2 \
  -H "Authorization: Bearer $WORKER_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recordId": "rechVm1hmggAvfvXp"}'
```

---

## Phase 4: Canva Asset Pipeline

### 4.1 Export Canva Design

- [ ] Open the target Canva design
- [ ] Click Share → Download → PNG format
- [ ] Resolution: 1080x1080 (Instagram square) or 1200x628 (Facebook/LinkedIn landscape)
- [ ] Download to local machine

### 4.2 Attach to Airtable Test Record

- [ ] Open Content Calendar table in Airtable (`tblEPr4f2lMz6ruxF`)
- [ ] Navigate to test record `rechVm1hmggAvfvXp`
- [ ] Click the **Asset** field (`fldlbwkaiT9JBV18E`)
- [ ] Upload the exported PNG
- [ ] Verify the attachment shows a preview thumbnail

---

## Phase 5: End-to-End Test

### 5.1 Prepare Test Record

Using test record `rechVm1hmggAvfvXp`:

- [ ] Set **Caption** field to test copy (include hashtags and CTA)
- [ ] Set **Platform** to target channels (e.g., Instagram, Facebook, LinkedIn)
- [ ] Attach Canva PNG to **Asset** field (Phase 4)
- [ ] Set **Post Date** to a future date (minimum 1 hour ahead)
- [ ] Set **Status** to `Draft`

### 5.2 Execute Test

- [ ] Change **Status** from `Draft` to `Approved`
- [ ] Wait 15-30 seconds for Zapier/Worker to fire

### 5.3 Verify Results

| Check | Expected Result | Status |
|---|---|---|
| Slack `#content-calendar` | Preview message with title, platform, date, caption | [ ] |
| Buffer Dashboard | Scheduled post with caption, image, correct date | [ ] |
| Airtable Status | Changed to `Scheduled` | [ ] |
| Airtable Notes | Contains `Buffer Post ID: <id>` | [ ] |
| Alignable Alert (if applicable) | Second Slack message: "ALIGNABLE POST READY" | [ ] |

### 5.4 Reset & Re-Test (if needed)

- [ ] Set Status back to `Draft`
- [ ] Clear Notes field
- [ ] Delete the Buffer scheduled post
- [ ] Change Status to `Approved` again
- [ ] Re-verify all checkpoints

---

## Phase 6: Production Cutover

### 6.1 Update Deployment Tracker

- [ ] Update record `recBDReVmJrH6dPHg` Status from "Pending Owner" to "Complete"
- [ ] Add completion notes with date and verified channels

### 6.2 Notify Stakeholders

- [ ] Slack `#content-calendar`: "WF-2 Social Publish pipeline is LIVE"
- [ ] Update MKT division agents on new workflow availability
- [ ] Brief content team on Status field workflow: Draft → Approved → Scheduled

### 6.3 Monitoring

| Metric | Tool | Frequency |
|---|---|---|
| Zapier task usage | Zapier Dashboard | Weekly |
| Buffer post failures | Buffer Analytics | Daily |
| WF-2 audit trail | `/v1/audit` endpoint | On-demand |
| Airtable Status stuck on Approved | Content Calendar view filter | Daily |

---

## Architecture Decision: Zapier vs Cloudflare Worker

| Factor | Zapier | Cloudflare Worker |
|---|---|---|
| Setup complexity | Low (visual builder) | Medium (code deployment) |
| Latency | 1-15 seconds | < 50ms |
| Cost per execution | Counts toward Zapier plan tasks | Free (Workers free tier) |
| Reliability | Zapier uptime SLA | Cloudflare edge network |
| Auditability | Zapier task history | KV AUDIT_LOG + AI_LOG |
| Maintenance | No-code updates | Code changes + deploy |

**Recommendation:** Deploy both. Use Zapier for initial validation and content team self-service. Use Cloudflare Worker for high-volume automated triggers from Airtable Automations.

---

## Secrets Reference

| Secret | Service | Set Via |
|---|---|---|
| `BUFFER_ACCESS_TOKEN` | Buffer API | `wrangler secret put BUFFER_ACCESS_TOKEN` |
| `AIRTABLE_API_KEY` | Airtable API | Already configured |
| `WORKER_AUTH_TOKEN` | Gateway auth | Already configured |
| `SLACK_WEBHOOK_URL` | Slack notifications | Already configured |

---

## Rollback Procedure

If WF-2 causes issues in production:

1. **Zapier:** Turn off the Zap in Zapier dashboard (instant)
2. **Worker:** Revert the `social-publish.js` route or remove from `index.js` and redeploy
3. **Airtable:** Manually set any stuck records' Status back to `Draft` or `Approved`
4. **Buffer:** Cancel any incorrectly scheduled posts in Buffer dashboard
