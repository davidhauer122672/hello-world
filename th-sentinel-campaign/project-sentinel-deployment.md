# COASTAL KEY TREASURE COAST ASSET MANAGEMENT

## PROJECT SENTINEL

### Atlas + Retell AI Deployment Configuration

---

| Field | Detail |
|---|---|
| **Authorization Date** | April 2, 2026 |
| **Authorized By** | David Hauer, Founder and CEO |
| **Classification** | Confidential — CEO Use Only |
| **Campaign** | Project Sentinel — 6-Touch 14-Day Outbound |
| **Platform** | Atlas + Retell AI + Airtable + Zapier |
| **Airtable Record** | `recpEkZoxXTKNXYWW` (Deployment Tracker) |
| **Status** | **CEO AUTHORIZED — READY FOR EXECUTION** |

---

> **LEGAL STOP — TCPA COMPLIANCE REQUIRED**
>
> TCPA compliance must be confirmed before Step 10 activation. DNC scrub required. Sovereign Legal (L-01 CLIO) must clear before first dial. Calling hours Monday through Saturday, 9:00 AM to 7:00 PM ET only. No exceptions.

---

## I. PRE-LAUNCH BLOCKERS

All four items below must be resolved before Atlas Step 10 is activated. **Do not activate Step 10 with any blocker unresolved.**

| # | Blocker | Resolution Required |
|---|---|---|
| 1 | Slack channels `#sales-alerts` and `#sales-alerts-high-value` do not have confirmed IDs | Create both channels in Slack. Copy channel IDs into Zapier configuration. |
| 2 | Zapier WF-1 (New Lead Nurture) not built | Build in Zapier UI using spec in Section III. Set to ON before Step 10. |
| 3 | Zapier WF-3 (Investor Escalation) not built | Build in Zapier UI using spec in Section IV. Set to ON before Step 10. |
| 4 | TCPA DNC scrub not confirmed | Scrub all prospect lists against national DNC registry before import. |

---

## II. ATLAS 10-STEP DEPLOYMENT

Execute Steps 1 through 9 in Atlas **DRAFT** mode. Do not activate Step 10 until all pre-launch blockers in Section I are resolved.

### Step 1 — Create Campaign

- Log into Atlas dashboard.
- Create new campaign.
- **Name:** `[CK] Project Sentinel - Outbound`
- Set mode to **DRAFT**. Do not activate.

### Step 2 — Upload Prospect Lists

Five separate lists. Tag each on import with the segment name.

| Segment Name | Priority | Revenue Target |
|---|---|---|
| Absentee Homeowners | Priority 1 | $195 to $395/month recurring |
| Luxury Property ($1M+) | Priority 2 | $395/month + property premium |
| Investor / Family Office | Priority 1 (Investor Track) | Multi-property; $5M+ triggers WF-3 |
| Seasonal Residents / Snowbirds | Priority 2 | $295 to $395/month |
| STR / Vacation Rental Owners | Priority 3 | 10% of gross rental income |

### Step 3 — Connect Retell AI

- Link Retell AI phone number to the campaign.
- Assign the AI voice profile.
- Run a test call to verify audio and connection before loading scripts.
- **Do not proceed to Step 4 without a successful test call.**

### Step 4 — Load Live Call Scripts

Paste each script into the corresponding Atlas sequence step. Do not modify pricing, service zones, or objection handlers.

| Script | Sequence Position |
|---|---|
| Script 1 — Cold Open Call | Day 1 Live Call |
| Script 3 — Second Live Attempt | Day 4 Live Call |
| Script 4 — Final Call / Hard Close | Day 10 Live Call |

### Step 5 — Load Voicemail Drop

- Paste **Script 2** into the Day 2 Voicemail Drop step.
- Confirm duration is under 45 seconds in the Atlas preview.

### Step 6 — Configure Sequence Timing

| Day | Touch Type | Channel | Goal |
|---|---|---|---|
| Day 1 | Cold Open Call | Retell Outbound | Qualify + book consultation |
| Day 2 | Voicemail Drop | Retell VM Drop | Restate value, leave callback |
| Day 4 | Second Live Attempt | Retell Outbound | Handle objections, close to consult |
| Day 7 | Welcome Email Trigger | Zapier to Gmail | CEO welcome email + launch video |
| Day 10 | Final Call | Retell Outbound | Hard close or disqualify |
| Day 14 | Long-Tail Nurture | Constant Contact | 90-day drip if no close |

### Step 7 — Configure Airtable Webhook

On every Atlas connect event, POST lead record to Airtable Leads table.

| Parameter | Value |
|---|---|
| **Table ID** | `tblpNasm0AxreRqLW` |
| **Base ID** | `appUSnNgpDkcEOzhN` |

**Disposition outcomes to map:** Booked, Callback, Not Interested, Disqualified, No Answer.

| Data Point | Airtable Field ID |
|---|---|
| Sentinel Segment (from import tag) | `fldIO7nG7Rdjbg1CY` |
| Call Disposition | `fld6O4IRIKmGfzWHg` |
| Sequence Step | `fldKNvxsK7YjykNPY` |

### Step 8 — Configure Investor Flag Logic

| Parameter | Value |
|---|---|
| **Trigger Condition** | Property Value > $5,000,000 **OR** keyword match: `investor`, `family office`, `trust`, `ROI` |
| **Action** | Set Investor Flag field (`fldbgutLkHL3YAYmL`) to `true` |
| **Downstream** | Flag triggers Zapier WF-3 Investor Escalation automatically |
| **Accuracy Target** | 100% of $5M+ leads flagged. Zero misses. |

### Step 9 — Set Calling Hours and Daily Cap

| Parameter | Value |
|---|---|
| Calling Hours | Monday through Saturday, 9:00 AM to 7:00 PM ET |
| Sunday | No calls |
| Daily Dial Cap | 80 to 100 dials per agent per day |
| DNC Scrub | Run all prospect lists against national DNC registry before import |

Confirm DNC scrub completion before Step 10.

---

### STEP 10 — AUTHORIZE AND GO LIVE

> **STEP 10 IS LOCKED.** Do not activate until all pre-launch blockers in Section I are resolved and confirmed. This is an all-or-nothing activation. All three modules go live simultaneously. There is no partial launch.

**Pre-activation checklist:**

1. Confirm `#sales-alerts` and `#sales-alerts-high-value` channels exist with verified IDs.
2. Confirm WF-1 and WF-3 are built and set to ON in Zapier.
3. Confirm DNC scrub is complete and logged.
4. Confirm Retell test call was successful.
5. **Activate Atlas Step 10 to go live.**
6. Verify first dial fires and lead record posts to Airtable Leads table.

---

## III. ZAPIER WF-1 — NEW LEAD NURTURE

Build as a separate Zap at zapier.com. Set to **OFF** until Step 10 activation.

| Step | Action | App | Detail |
|---|---|---|---|
| **Trigger** | New Record in Leads | Airtable | Table: `tblpNasm0AxreRqLW` — Base: `appUSnNgpDkcEOzhN` |
| 1 | Run SCAA-1 Agent | Zapier AI Actions | Execute with full 9,999-char directive |
| 2 | Post to `#sales-alerts` | Slack | Lead details + Battle Plan — Channel: `C0AP1HRFTBL` |
| 3 | DM Sales Agent | Slack | Direct message to assigned agent with lead summary |
| 4 | Send CEO Welcome Email | Gmail | CEO-signed welcome email with inspection offer and launch video link |

---

## IV. ZAPIER WF-3 — INVESTOR ESCALATION

Build as a separate Zap at zapier.com. Set to **OFF** until Step 10 activation.

| Step | Action | App | Detail |
|---|---|---|---|
| **Trigger** | Investor Flag = True | Airtable | Table: `tblpNasm0AxreRqLW` — Filter: Investor Flag (`fldbgutLkHL3YAYmL`) = true AND WF-3 Sent (`fldQku2Qjy5oMnfUQ`) = false |
| 1 | Alert `#sales-alerts-high-value` | Slack | Investor lead details — Channel: `C0ANV6HALHH` |
| 2 | Send CEO Investor Email | Gmail | CEO-signed email with institutional presentation link |
| 3 | Create Follow-Up Task | Airtable | High-priority task in Tasks table (`tbl5kGQ81WObMHTup`) — Due: 4 hours from trigger |
| 4 | Check WF-3 Sent | Airtable Update | Set WF-3 Sent field (`fldQku2Qjy5oMnfUQ`) to true to prevent duplicate fires |

---

## V. KPI TARGETS — ATLAS DASHBOARD

| Metric | Coastal Key Target | Industry Benchmark |
|---|---|---|
| Dials Per Agent Per Day | 80 to 100 | 60 to 80 |
| Connect Rate | 12% to 18% | 8% to 12% |
| Consultation Book Rate (of connects) | 25% to 35% | 15% to 20% |
| Consultation-to-Close Rate | 40% to 60% | 25% to 35% |
| Cost Per Acquisition Target | Under $150 | LTV: $3,540 avg/yr |
| Sequence Completion Rate | Over 85% | No lead exits untouched |
| Investor Flag Accuracy | 100% of $5M+ leads flagged | SCAA-1 auto-detect |

### Revenue Math at Full Ramp

> 80 dials x 15% connect = **12 connects/agent**
> At 30% book = **3.6 consults/day**
> At 50% close = **1.8 new clients/day**
> At $3,540 ARR each x 5 days = **$31,860 in new recurring revenue added per week**

---

## VI. AIRTABLE FIELD REFERENCE

Use these field IDs for all Atlas webhook configuration and Zapier workflow mapping.

| Field Name | Field ID | Purpose |
|---|---|---|
| Lead Name | `fldAQJqw8WaAzVJkc` | Primary field — full name of lead |
| Sentinel Segment | `fldIO7nG7Rdjbg1CY` | Maps from Atlas segment tag on import |
| Property Value | `fldxaWbH7pkY7Jpzv` | Triggers Investor Flag if > $5M |
| Service Zone | `fldqWoQGCR1M1k3O9` | Treasure Coast zone |
| Call Disposition | `fld6O4IRIKmGfzWHg` | Set by Atlas webhook on connect |
| Investor Flag | `fldbgutLkHL3YAYmL` | Checkbox — triggers WF-3 when true |
| Sequence Step | `fldKNvxsK7YjykNPY` | Current position in 6-touch sequence |
| Property Address | `fldM63iz3K8k36Vjh` | `[Address]` variable in call scripts |
| Mailing Address | `fldNVapicg1kweyZt` | If outside TC = Absentee or Snowbird |
| WF-3 Sent | `fldQku2Qjy5oMnfUQ` | Prevents duplicate WF-3 fires |
| Phone Number | `fld1QyH8hdLQnTm09` | Primary dial number for Atlas |

---

**Coastal Key Property Management LLC**
1407 SE Legacy Cove Circle, Ste 100, Stuart, FL 34997 | (772) 247-0982 | david@coastalkey-pm.com
FL RE #SL3575566 | FL CAM #CAM65337
