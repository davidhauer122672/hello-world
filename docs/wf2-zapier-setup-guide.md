# WF-2: Social Approval to Buffer — Zapier Setup Guide

**Deployment Tracker Record:** `recBDReVmJrH6dPHg`
**Owner:** Build Agent (Agent 3)
**Status:** Pending Build
**Stack:** Zapier + Airtable + Buffer + Slack

---

## Overview

WF-2 automates the publishing pipeline for approved social media content. When a Content Calendar record's Status changes to **Approved**, this workflow:

1. Sends a Slack preview to `#content-calendar`
2. Schedules the post via Buffer (Instagram, Facebook, LinkedIn)
3. Updates Airtable: Status → **Scheduled**, writes Buffer Post ID to Notes
4. Fires a manual-publish Slack alert for Alignable posts (Buffer unsupported)

---

## Prerequisites

Before building WF-2 in Zapier, verify these dependencies are complete:

| Dependency | Status | Notes |
|---|---|---|
| Buffer account created at buffer.com | Required | Connect Instagram Business, Facebook Page, LinkedIn Company Page |
| Buffer authorized in Zapier (My Apps) | Required | OAuth flow via Zapier |
| Airtable authorized in Zapier (My Apps) | Required | Personal access token or OAuth |
| Slack authorized in Zapier (My Apps) | Required | Workspace-level OAuth |
| Slack `#content-calendar` channel exists | Done | Channel ID: `C0ALCM1E5E2` |
| Content Calendar table verified | Done | Table: `tblEPr4f2lMz6ruxF` |

---

## Airtable Field Reference

| Field | Field ID | Type | WF-2 Usage |
|---|---|---|---|
| Status | `fldD2rgOO9z1MTs9U` | Single Select | Trigger (= Approved) → Update (= Scheduled) |
| Caption | `fldgJXI5IAaWcyw89` | Long Text | Maps to Buffer post text |
| Asset | `fldlbwkaiT9JBV18E` | Attachment | Maps to Buffer post image (first attachment URL) |
| Post Date | `fldFESTOO3wxMT4u2` | Date | Maps to Buffer `scheduled_at` |
| Notes | `fld0hiWEXsL70GFpS` | Long Text | Buffer Post ID written here |
| Post Title | — | Single Line | Slack notification display |
| Platform | — | Multiple Select | Routing logic (Buffer vs Alignable) |

---

## Step-by-Step Zapier Build

### Step 1: Trigger — Airtable Updated Record

| Setting | Value |
|---|---|
| App | Airtable |
| Event | Updated Record |
| Account | Coastal Key Airtable |
| Base | Coastal Key Master Orchestrator (`appUSnNgpDkcEOzhN`) |
| Table | Content Calendar (`tblEPr4f2lMz6ruxF`) |

**Trigger Filter:**
- Field: `Status` (`fldD2rgOO9z1MTs9U`)
- Condition: equals `Approved`

### Step 2: Action — Slack Send Channel Message

| Setting | Value |
|---|---|
| App | Slack |
| Event | Send Channel Message |
| Channel | `#content-calendar` (`C0ALCM1E5E2`) |
| Message Text | See template below |

**Message Template:**
```
*SOCIAL POST APPROVED*
*Title:* {{Post Title}}
*Platform:* {{Platform}}
*Post Date:* {{Post Date}}
*Caption Preview:*
{{Caption}} (truncate to 200 chars)
```

### Step 3: Action — Buffer Create Update

| Setting | Value |
|---|---|
| App | Buffer |
| Event | Create Update |
| Account | Coastal Key Buffer |
| Profile(s) | Map dynamically from Platform field, or select all connected profiles |
| Text | `{{Caption}}` (field `fldgJXI5IAaWcyw89`) |
| Photo | `{{Asset}}` — use first attachment URL (field `fldlbwkaiT9JBV18E`) |
| Scheduled At | `{{Post Date}}` (field `fldFESTOO3wxMT4u2`) — format: ISO 8601 |

**Notes:**
- If Post Date is blank, Buffer queues the post in the default schedule
- Photo must be a publicly accessible URL
- Buffer will post to all selected profiles simultaneously

### Step 4: Action — Airtable Update Record

| Setting | Value |
|---|---|
| App | Airtable |
| Event | Update Record |
| Base | Coastal Key Master Orchestrator (`appUSnNgpDkcEOzhN`) |
| Table | Content Calendar (`tblEPr4f2lMz6ruxF`) |
| Record ID | `{{id}}` from Step 1 trigger |
| Status | `Scheduled` |
| Notes | `Buffer Post ID: {{Step 3 Update ID}}` |

### Step 5: Filter — Alignable Branch

| Setting | Value |
|---|---|
| Type | Filter by Zapier |
| Condition | Platform field **contains** `Alignable` |
| Action | Only continue if true |

### Step 6: Action — Slack Alert (Alignable Manual Publish)

| Setting | Value |
|---|---|
| App | Slack |
| Event | Send Channel Message |
| Channel | `#content-calendar` (`C0ALCM1E5E2`) |
| Message Text | See template below |

**Message Template:**
```
*ALIGNABLE POST READY*
*Title:* {{Post Title}}
*Post Date:* {{Post Date}}
*Manual publish required.* Alignable does not support Buffer API.
*Caption:*
{{Caption}}
```

---

## Testing Procedure

**Test Record:** `rechVm1hmggAvfvXp`

1. Ensure test record exists in Content Calendar with Caption, Platform, Post Date, and Asset populated
2. Update `Post Date` to a future date (at least 1 hour ahead)
3. Set `Status` to `Draft`
4. Change `Status` to `Approved`
5. Verify:
   - [ ] Slack message appears in `#content-calendar` with post preview
   - [ ] Buffer shows scheduled post with correct caption, image, and date
   - [ ] Airtable `Status` updates to `Scheduled`
   - [ ] Airtable `Notes` contains Buffer Post ID
   - [ ] If Platform includes Alignable: second Slack alert with manual-publish notice

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Trigger not firing | Verify Status field changed from non-Approved to Approved (not just re-saved) |
| Buffer "Invalid profile" | Re-authorize Buffer in Zapier My Apps; verify social channels connected |
| Image not attaching | Ensure Asset field contains a valid attachment with public URL |
| Alignable alert not firing | Verify Platform field contains exactly "Alignable" (case-sensitive) |
| Duplicate triggers | Add Zapier filter: only trigger if Status was NOT previously Approved |

---

## Parallel Implementation: Cloudflare Worker

WF-2 is also implemented as a native Cloudflare Worker route at `POST /v1/workflows/wf2` in the `ck-api-gateway`. This provides:

- Zero Zapier task consumption
- Sub-50ms latency vs Zapier's 1-15 second execution
- Direct KV audit logging
- Unified auth via `WORKER_AUTH_TOKEN`

The Worker implementation can be triggered by Airtable Automations directly (HTTP POST to gateway) as an alternative to Zapier.

**Secret required:** `BUFFER_ACCESS_TOKEN` (set via `wrangler secret put BUFFER_ACCESS_TOKEN`)
