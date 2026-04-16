# Coastal Key Enterprise — Media Automation Operational Execution Guide

**Classification:** Pre-Live Operations Playbook
**Owner:** CEO / Chief Integration Officer
**Version:** 1.0.0
**Effective:** 2026-04-08

---

## OBJECTIVE

Execute a controlled live-fire test of the WF-2 media automation pipeline: Airtable Content Calendar → Buffer API → Multi-Platform Publishing. This guide validates end-to-end connectivity before full production activation.

---

## PREREQUISITES

| Requirement | Status | Action If Missing |
|---|---|---|
| Meta Ads Manager connector authorized | **REQUIRED** | Complete OAuth re-authorization (see Directive 1 below) |
| Buffer account created | **REQUIRED** | Create at https://buffer.com, connect social channels |
| Airtable API key configured | Operational | Verify `AIRTABLE_API_KEY` in Cloudflare Worker secrets |
| CK API Gateway deployed | Operational | `https://ck-api-gateway.david-e59.workers.dev` |
| Content Calendar table exists | Operational | Table ID: `tblEPr4f2lMz6ruxF` |

---

## DIRECTIVE 1: RESTORE META ADS CONNECTIVITY

**Owner:** CEO / System Administrator
**Deadline:** Immediate
**Impact:** Blocks paid amplification of organic content; blocks WF-2 boost triggers

### Steps

1. Navigate to the Meta Business Suite: https://business.facebook.com/settings
2. Go to **Integrations** → **Connected Apps** or the platform's connector page
3. Locate the Coastal Key connector (or add a new one)
4. Click **Configure** under the Manage button
5. Complete the OAuth 2.0 authorization flow:
   - Grant permissions: `ads_management`, `ads_read`, `pages_manage_posts`, `pages_read_engagement`
   - Select the Coastal Key Facebook Page and Instagram Business Account
   - Confirm all requested scopes
6. Verify the connection status shows **Active** / **Connected**
7. Test with a read-only API call to confirm token validity

### Verification

```bash
# Test Meta Ads API connectivity (replace TOKEN with the new access token)
curl -s "https://graph.facebook.com/v19.0/me/adaccounts?access_token=TOKEN" | jq '.data[0].id'
```

If the response returns an ad account ID, the connector is live.

---

## DIRECTIVE 2: 6-STEP OPERATIONAL CHECKLIST — PRE-LIVE MEDIA AUTOMATION TEST

**Owner:** Chief Integration Officer (Manus AI) / CEO
**Deadline:** Within 24 hours of Meta Ads restoration
**Test Record:** `rechVm1hmggAvfvXp` (Content Calendar table)

### Step 1: Verify Buffer Account & Social Channel Connections

**Action:** Confirm Buffer account is created and all target social channels are connected.

| Channel | Buffer Profile Secret | Expected |
|---|---|---|
| Instagram | `BUFFER_PROFILE_INSTAGRAM` | Connected |
| Facebook | `BUFFER_PROFILE_FACEBOOK` | Connected |
| LinkedIn | `BUFFER_PROFILE_LINKEDIN` | Connected |
| X (Twitter) | `BUFFER_PROFILE_X` | Connected |

**Verification:**
```bash
# Check Buffer profiles (requires BUFFER_ACCESS_TOKEN)
curl -s "https://api.bufferapp.com/1/profiles.json?access_token=$BUFFER_ACCESS_TOKEN" | jq '.[].service'
```

**Pass Criteria:** All 4 platform profiles return valid IDs. Store each profile ID in the corresponding Cloudflare Worker secret.

---

### Step 2: Export Canva Design & Upload to Airtable Asset Field

**Action:** Export the Canva design for test record `rechVm1hmggAvfvXp` as a PNG and manually upload it to the Airtable `Asset` field.

1. Open the Canva design linked to this content calendar entry
2. Export as **PNG** (1080x1080 for Instagram, or platform-appropriate dimensions)
3. Open Airtable → Content Calendar table → find record `rechVm1hmggAvfvXp`
4. Click the `Asset` attachment field → Upload the exported PNG file
5. Verify the attachment thumbnail renders in Airtable

**Pass Criteria:** The `Asset` field contains a valid PNG attachment with a working URL.

---

### Step 3: Execute script1_update_date.sh — Push Post Date +48 Hours

**Action:** Run the date update script to push the Post Date 48 hours into the future and reset the Status to `Draft`.

```bash
cd scripts && chmod +x script1_update_date.sh && ./script1_update_date.sh
```

**What It Does:**
- Calculates a date 48 hours from the current time
- Updates record `rechVm1hmggAvfvXp` in the Content Calendar table:
  - `Post Date` → 48 hours from now (formatted as `YYYY-MM-DD`)
  - `Status` → `Draft`
- Logs the update response for verification

**Pass Criteria:** Script exits with code 0. Airtable record shows updated Post Date and Status = `Draft`.

**Environment Required:** `AIRTABLE_API_KEY` must be set in the shell environment.

---

### Step 4: Execute script2_clear_image_url.sh — Clear Invalid Canva Link

**Action:** Run the image URL cleanup script to clear the invalid Canva link from the `Image URL` field.

```bash
cd scripts && chmod +x script2_clear_image_url.sh && ./script2_clear_image_url.sh
```

**What It Does:**
- Clears the `Image URL` (text/URL) field on record `rechVm1hmggAvfvXp`
- This removes any stale or broken Canva embed links
- The `Asset` attachment field (uploaded in Step 2) remains intact and is used by the publish pipeline

**Pass Criteria:** Script exits with code 0. The `Image URL` field on the record is empty. The `Asset` attachment field still contains the PNG from Step 2.

**Environment Required:** `AIRTABLE_API_KEY` must be set in the shell environment.

---

### Step 5: Change Status to Approved — Trigger Live Fire Test

**Action:** Change the Status of record `rechVm1hmggAvfvXp` to `Approved` to trigger the WF-2 content publish pipeline.

**Option A — Manual (Airtable UI):**
1. Open Airtable → Content Calendar → record `rechVm1hmggAvfvXp`
2. Change the `Status` field from `Draft` to `Approved`
3. This triggers the Airtable automation → API Gateway `/v1/content/publish`

**Option B — API (programmatic):**
```bash
curl -s -X PATCH "https://api.airtable.com/v0/appUSnNgpDkcEOzhN/tblEPr4f2lMz6ruxF" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [{
      "id": "rechVm1hmggAvfvXp",
      "fields": { "Status": "Approved" }
    }],
    "typecast": true
  }' | jq '.records[0].fields.Status'
```

**What Happens Next (WF-2 Pipeline):**
1. Airtable automation detects Status change → `Approved`
2. Automation POSTs to `https://ck-api-gateway.david-e59.workers.dev/v1/content/publish` with `{ "recordId": "rechVm1hmggAvfvXp" }`
3. API Gateway reads the record, validates status = `Approved`
4. If `BUFFER_ACCESS_TOKEN` is configured: pushes to Buffer API for each platform
5. If Buffer not configured: returns manual-mode payload with copy-paste instructions
6. Updates Airtable record with Buffer Status, Buffer Post ID, and execution notes
7. Writes to AI Log table for audit trail

**Pass Criteria:** API Gateway returns `200` with either `mode: "buffer"` (automated) or `mode: "manual"` (fallback). Airtable record's `Buffer Status` field updates accordingly.

---

### Step 6: Validate End-to-End Results

**Action:** Verify the complete pipeline executed correctly.

| Check | Method | Expected Result |
|---|---|---|
| API Gateway response | Check Cloudflare Worker logs | 200 OK, mode = buffer or manual |
| Airtable Buffer Status | View record `rechVm1hmggAvfvXp` | `Scheduled`, `Manual`, or `Partial` |
| Buffer queue | Check Buffer dashboard | Post appears in scheduled queue |
| AI Log entry | Check AI Log table | New record with Module = `Social` |
| Audit log | `GET /v1/audit` | Entry for `/v1/content/publish` |
| Slack notification | Check `#marketing-ops` channel | Post approval notification (if configured) |

---

## DIRECTIVE 3: CAPITALIZE ON INBOUND DEAL FLOW

**Owner:** Chief Integration Officer (Manus AI)
**Deadline:** Ongoing

### Acquisition Criteria Filter

Analyze all inbound commercial real estate listings against these criteria:

| Criteria | Threshold |
|---|---|
| Location | Martin, St. Lucie, Indian River, Palm Beach counties (Treasure Coast corridor) |
| Property Type | Multifamily, commercial office, retail, mixed-use |
| Price Range | $500K – $5M (sweet spot: $750K – $2.5M) |
| Cap Rate | ≥ 6% (target: 7-9%) |
| Condition | Value-add preferred; stabilized assets acceptable at premium cap rates |
| Occupancy | ≥ 75% for stabilized; any for value-add |

### Process

1. Monitor Gmail for new commercial RE listing notifications
2. Score each listing against criteria (pass/fail + weighted score)
3. For viable targets: draft preliminary analysis memo
4. For strong candidates: draft outreach email to listing broker
5. Log all analyzed listings in Airtable Competitive Intel table

---

## POST-TEST: PRODUCTION ACTIVATION

Once all 6 steps pass:

1. **Enable Airtable automation** for Content Calendar → Status = Approved → POST to `/v1/content/publish`
2. **Configure Buffer profile IDs** as Cloudflare Worker secrets
3. **Activate the MCCO Content Calendar Commander** (MCCO-004) to begin generating 30-day content calendars
4. **Enable the Publish Tracker** cron (every 30 min) to poll Buffer for publish confirmations
5. **Activate Meta Ads boost triggers** for posts exceeding 3x average engagement

The media automation engine is then fully operational.

---

*Coastal Key Enterprise — Media Automation Pre-Live Test | WF-2 Pipeline Validation | Zero-Downtime Activation*
