# Zapier Webhook Setup: Banana Pro AI → Content Calendar → Slack

> Part of the Coastal Key AI Operations Platform (Module B: Social Automation)
> Related workflows: **WF-2** (Social Approval to Buffer), **WF-4** (Buffer Published to Airtable)
> Orchestrator config: `coastalkey-orchestrator.json`

## Quick Reference

| Component | ID / Value |
|-----------|-----------|
| Airtable Base | `appUSnNgpDkcEOzhN` (Untitled Base) |
| Content Calendar Table | `tblEPr4f2lMz6ruxF` |
| Status "Published" Choice | `selwTWAaVX1wLSqnM` |
| Slack Channel | `#content-calendar` |
| Content Pillars | Brand, CEO Journey |
| Brand Voice | Institutional, authoritative, concise, risk-first |

---

## BEFORE YOU START: Add Missing Platform Choices

The Content Calendar **Platform** field is missing two choices needed for the 6-platform duplication:

1. Go to Airtable → Content Calendar → Platform column
2. Add **Twitter** as a new choice
3. Add **Mighty** as a new choice

Current choices: Instagram, Facebook, Alignable, LinkedIn, Buffer, Threads

---

## Step 1: Webhooks by Zapier (Trigger)

1. Go to [zapier.com/app/dashboard](https://zapier.com/app/dashboard)
2. Click **Create** → **New Zap**
3. Trigger: **Webhooks by Zapier** → **Catch Raw Hook**
4. Skip test for now
5. **Copy your webhook URL** — you'll paste this into Banana Pro AI

### Expected Webhook Payload

```json
{
  "title": "My Post Title",
  "platform": "Instagram",
  "caption": "Post caption text...",
  "imageurl": "https://example.com/image.jpg",
  "postdate": "2026-03-21",
  "contentpillar": "CEO Journey"
}
```

---

## Step 2: Airtable — Create Record (Action)

| Zapier Field | Airtable Field | Source |
|-------------|---------------|--------|
| Base | Untitled Base | — |
| Table | Content Calendar | — |
| Post Title | `{{step1__title}}` | Webhook |
| Platform | `{{step1__platform}}` | Webhook |
| Caption | `{{step1__caption}}` | Webhook |
| Asset | `{{step1__imageurl}}` | Webhook |
| Post Date | `{{step1__postdate}}` | Webhook |
| Content Pillar | `{{step1__contentpillar}}` | Webhook |
| Status | `Published` | **HARDCODED** |
| Notes | `Auto-published from Banana Pro AI` | **HARDCODED** |

---

## Step 3: Slack — Send Channel Message (Action)

| Setting | Value |
|---------|-------|
| Channel | `#content-calendar` |
| Bot Name | `Coastal Key Content` |

### Message Template

```
📋 NEW POST PUBLISHED FROM BANANA PRO AI
Platform: {{step1__platform}}
Content Pillar: {{step1__contentpillar}}
Published: {{step1__postdate}}
Caption: {{step1__caption}}
🔗 View in Airtable: https://airtable.com/appUSnNgpDkcEOzhN/tblEPr4f2lMz6ruxF/rec{{step2__id}}
```

---

## Step 4: Publish the Zap

- **Title:** `Banana Pro AI Webhook → Content Calendar → Slack`
- **Turn On** the Zap

---

## Configure Banana Pro AI

1. Copy your webhook URL from Step 1
2. Go to **Banana Pro AI** → Settings → Webhooks
3. Add new webhook with the URL
4. Trigger: **"Post Published"**
5. Fire a test post and verify:
   - ✅ New record appears in Airtable Content Calendar
   - ✅ Slack alert fires in `#content-calendar`
   - ✅ Status = "Published"

---

## Build 6 Platform Duplicates

Once the Instagram Zap is tested, duplicate it for each platform. Change only the Platform filter/value in each duplicate:

| # | Platform | Airtable Choice Exists? |
|---|----------|------------------------|
| 1 | Instagram | ✅ Template Zap |
| 2 | Facebook | ✅ Ready |
| 3 | LinkedIn | ✅ Ready |
| 4 | Twitter | ❌ **Add to Airtable first** |
| 5 | Threads | ✅ Ready |
| 6 | Mighty | ❌ **Add to Airtable first** |
| 7 | Alignable | ✅ Ready |

---

## How This Fits the Full Stack

This webhook Zap handles **direct publish from Banana Pro AI**. It sits alongside these orchestrator workflows:

| Workflow | Trigger | What It Does |
|----------|---------|-------------|
| **This Zap** | Banana Pro AI webhook (Post Published) | Creates Airtable record + Slack alert |
| **WF-2** | Content Calendar Status = Approved | Pushes to Buffer + Slack confirm + Status → Scheduled |
| **WF-4** | Buffer publish confirmation | Status → Published |

The full content flow per the orchestrator:
1. CEO submits brief to Nanobanana
2. Nemotron drafts caption per platform
3. Draft record created in Content Calendar (Status = Draft)
4. Slack alert to `#ai-drafts` for CEO review
5. CEO attaches Banana Pro AI asset, sets Status = Approved
6. **WF-2** fires: Buffer post + Slack confirm + Status → Scheduled
7. Buffer publishes → **WF-4** fires: Status → Published
8. **This Zap** (alternative path): Banana Pro AI direct publish bypasses draft/approval
