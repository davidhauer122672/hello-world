# ATLAS + ZAPIER WORKFLOW INTEGRATION SPECIFICATION

## Coastal Key Property Management — Project Sentinel

| Field | Detail |
|---|---|
| **Version** | 2.0.0 |
| **Date** | April 2, 2026 |
| **Platform** | Atlas + Zapier + Airtable + Slack + Gmail |
| **Status** | Production — Tested and Deployed |

---

## I. ATLAS TRIGGER → ZAPIER VARIABLE MAPPING

Atlas outputs specific field names via Zapier triggers. These must be mapped precisely to avoid variable resolution failures.

### Call Completed Trigger — Output Variables

| Atlas Output Variable | Zapier Step Variable | Airtable Field | Field ID |
|---|---|---|---|
| `Customer Name` | `{{customer_name}}` | Lead Name | `fldAQJqw8WaAzVJkc` |
| `Customer Number` | `{{customer_number}}` | Phone Number | `fld1QyH8hdLQnTm09` |
| `Call Id` | `{{call_id}}` | Audit Trail (embedded) | `fld5GJNlA20mLNQbR` |
| `Campaign Name` | `{{campaign_name}}` | Sentinel Segment (derived) | `fldIO7nG7Rdjbg1CY` |
| `Campaign Id` | `{{campaign_id}}` | — (metadata only) | — |
| `Agent Name` | `{{agent_name}}` | Audit Trail (embedded) | `fld5GJNlA20mLNQbR` |
| `Agent Id` | `{{agent_id}}` | — (metadata only) | — |
| `Campaign Type` | `{{campaign_type}}` | — (outbound/inbound/voice-bubble) | — |
| `Call Summary` | `{{call_summary}}` | Call Disposition (derived) + Inquiry Notes | `fld6O4IRIKmGfzWHg` / `fldgqSB4kyR1J6KQI` |
| `Call Transcript` | `{{call_transcript}}` | Inquiry Notes | `fldgqSB4kyR1J6KQI` |
| `Started At` | `{{started_at}}` | Date Captured | `fld07tUlJKbE3EV1o` |
| `Ended At` | `{{ended_at}}` | — (duration calc) | — |
| `Duration Ms` | `{{duration_ms}}` | — (audit trail) | — |
| `Duration Seconds` | `{{duration_seconds}}` | — (audit trail + Slack) | — |
| `Duration Minutes` | `{{duration_minutes}}` | — (Slack display) | — |
| `Audio Url` | `{{audio_url}}` | — (Slack link) | — |

### Call Started Trigger — Output Variables

| Atlas Output Variable | Usage |
|---|---|
| `Campaign Id` | Real-time monitoring |
| `Agent Id` | Agent load tracking |
| `Call Id` | Call tracking correlation |
| `Customer Number` | DNC verification |
| `Customer Name` | Slack notification |
| `Campaign Name` | Campaign attribution |
| `Agent Name` | Agent performance |

### Call A Number Action — Input Parameters

| Parameter | Source | Required | Notes |
|---|---|---|---|
| `Campaign` | Select from Atlas campaigns | Yes | `[CK] Project Sentinel - Outbound` |
| `Phone Number` | Airtable `Phone Number` field | Yes | Must be E.164 format |
| `Customer First Name` | Airtable `Lead Name` (split) | Yes | First word of Lead Name |
| `Customer Last Name` | Airtable `Lead Name` (split) | No | Remaining words of Lead Name |
| `Dynamic information` | Key-value pairs | No | `segment=absentee;service_zone=stuart;property_address=123 Main St` |
| `Scheduled Date` | Sequence step date | No | ISO 8601 format. Omit for immediate dial. |

---

## II. ZAPIER WORKFLOW SPECIFICATIONS

### ZAP-1: Atlas Call Completed → Airtable Lead + Slack Alert

**Trigger:** Atlas — Call Completed

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Call Completed | Atlas | Campaign: `[CK] Project Sentinel - Outbound` |
| 1 | Webhook POST | Webhooks by Zapier | URL: `https://sentinel-webhook.{account}.workers.dev/webhook/atlas` — POST full Atlas payload as JSON |
| 2 | Post to Channel | Slack | Channel: `C0AP1HRFTBL` (#sales-alerts) — Message: `New Atlas Lead: {{customer_name}} | {{customer_number}} | Campaign: {{campaign_name}} | Agent: {{agent_name}} | Duration: {{duration_minutes}}m {{duration_seconds mod 60}}s` |

**Why Webhook POST instead of direct Airtable:** The sentinel-webhook Worker handles disposition derivation from Call Summary, segment mapping from Campaign Name, zone extraction from Dynamic information, and audit trail formatting. Direct Airtable creation would skip this intelligence layer.

### ZAP-2: Atlas Call Completed → CEO Welcome Email (Day 7 Sequence)

**Trigger:** Atlas — Call Completed (filtered)

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Call Completed | Atlas | Campaign: `[CK] Project Sentinel - Outbound` |
| 1 | Filter | Zapier Filter | Continue only if `{{call_summary}}` contains `booked` |
| 2 | Delay | Zapier Delay | Delay for 6 days (Day 7 email trigger) |
| 3 | Send Email | Gmail | To: (lookup from Airtable by `{{customer_number}}`) — Template: CEO Welcome Email (Draft ID: `r3251062693675892531`) |

### ZAP-3: Atlas Call Started → Real-Time Slack Notification

**Trigger:** Atlas — Call Started

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Call Started | Atlas | Campaign: `[CK] Project Sentinel - Outbound` |
| 1 | Post to Channel | Slack | Channel: `C0AP1HRFTBL` — Message: `Dial Active: {{agent_name}} calling {{customer_name}} ({{customer_number}}) | Campaign: {{campaign_name}}` |

### ZAP-4: Airtable Investor Flag → Atlas Follow-Up Call

**Trigger:** Airtable — Record matches conditions

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Record matches conditions | Airtable | Table: `tblpNasm0AxreRqLW` — Filter: Investor Flag (`fldbgutLkHL3YAYmL`) = true AND WF-3 Sent (`fldQku2Qjy5oMnfUQ`) = false |
| 1 | Alert Channel | Slack | Channel: `C0ANV6HALHH` — Investor lead details |
| 2 | Send Email | Gmail | CEO Investor Email template (Draft ID: `r5858664530595369316`) |
| 3 | Call A Number | Atlas | Campaign: `[CK] Project Sentinel - Outbound` — Phone: `{{Phone Number}}` — First Name: `{{Lead Name split first}}` — Dynamic info: `segment=investor;property_value={{Property Value}}` — Scheduled: 4 hours from now |
| 4 | Update Record | Airtable | Set `WF-3 Sent` (`fldQku2Qjy5oMnfUQ`) = true |

### ZAP-5: Sequence Advancement — Day 4 Follow-Up Call

**Trigger:** Airtable — Record matches conditions

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Record matches conditions | Airtable | Table: `tblpNasm0AxreRqLW` — Filter: Sequence Step = `Day 1 - Cold Open` AND Call Disposition = `Callback` |
| 1 | Delay | Zapier Delay | 3 days (fire on Day 4) |
| 2 | Call A Number | Atlas | Campaign: `[CK] Project Sentinel - Outbound` — Phone: `{{Phone Number}}` — First Name: `{{Lead Name split first}}` — Dynamic info: `segment={{Sentinel Segment}};service_zone={{Service Zone}}` |
| 3 | Update Record | Airtable | Set Sequence Step = `Day 4 - Second Live Attempt` |

### ZAP-6: Sequence Advancement — Day 10 Hard Close

**Trigger:** Airtable — Record matches conditions

| Step | Action | App | Configuration |
|---|---|---|---|
| **Trigger** | Record matches conditions | Airtable | Table: `tblpNasm0AxreRqLW` — Filter: Sequence Step = `Day 4 - Second Live Attempt` AND Call Disposition IN (`Callback`, `No Answer`) |
| 1 | Delay | Zapier Delay | 6 days (fire on Day 10) |
| 2 | Call A Number | Atlas | Campaign: `[CK] Project Sentinel - Outbound` — Phone: `{{Phone Number}}` — First Name: `{{Lead Name split first}}` — Dynamic info: `segment={{Sentinel Segment}};service_zone={{Service Zone}}` |
| 3 | Update Record | Airtable | Set Sequence Step = `Day 10 - Final Call` |

---

## III. VARIABLE NAME COMPLIANCE CHECKLIST

| Issue | Resolution |
|---|---|
| Atlas uses `Customer Name` (space) vs Retell uses `customer_name` (snake) | Transform layer normalizes both formats via `normalizeAtlasKeys()` |
| Atlas `Call Summary` contains disposition keywords vs Retell uses `disconnection_reason` enum | `ATLAS_DISPOSITION_MAP` keyword-scans summaries; `DISPOSITION_MAP` handles Retell enums |
| Atlas `Dynamic information` is semicolon-delimited key=value vs Retell uses `metadata` object | `parseDynamicInfo()` parses Atlas format; Retell `metadata` accessed directly |
| Atlas `Campaign Name` contains segment hints vs Retell uses `metadata.campaign` | Both paths scan for segment keywords against `SEGMENT_MAP` |
| Atlas `Audio Url` has no Retell equivalent | Stored in `_meta.audioUrl` for Slack notification links |
| Zapier variable syntax `{{field_name}}` vs Airtable field IDs | All Zapier steps reference Airtable field IDs, not names, for robustness |

---

## IV. SENTINEL WEBHOOK DUAL-INGEST ENDPOINTS

| Endpoint | Source | Method | Content-Type |
|---|---|---|---|
| `POST /webhook/retell` | Retell AI (direct) | POST | application/json |
| `POST /webhook/atlas` | Atlas via Zapier | POST | application/json |
| `GET /health` | Monitoring | GET | — |

Both endpoints produce identical Airtable Lead records. The transform layer normalizes field names so downstream Airtable, Slack, and workflow systems are source-agnostic.

---

**Coastal Key Property Management LLC**
1407 SE Legacy Cove Circle, Ste 100, Stuart, FL 34997 | (772) 247-0982
