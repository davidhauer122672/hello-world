# ReTell AI — Custom Function Framework
**Version**: 1.0.0 | **Classification**: Production-Ready | **Standard**: Red Bull Racing Optimization

> Every function is tested, every path is mapped, every failure mode has a handler. No dead ends.

---

## Architecture Overview

```
                    ┌──────────────┐
                    │  ReTell AI   │
                    │  Voice Agent │
                    └──────┬───────┘
                           │
                    call_analyzed event
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────┴────────┐     ┌─────────┴─────────┐
     │ sentinel-webhook │     │  ck-api-gateway    │
     │   (primary)      │     │  /v1/retell        │
     │   Cloudflare     │     │  (backup + Atlas)  │
     └────────┬─────────┘     └─────────┬──────────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────┴──────┐
                    │  ROUTER     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
        │ Airtable  │ │ Slack  │ │ Atlas AI │
        │ (records) │ │(alerts)│ │ (revival)│
        └───────────┘ └────────┘ └──────────┘
```

---

## Custom Functions

### Function 1: `transfer_call_to_tracey`

**Purpose**: Live transfer to Tracey Hunter when prospect qualifies
**Trigger**: Agent determines prospect meets 2+ qualification criteria

#### Configuration
```json
{
  "name": "transfer_call_to_tracey",
  "description": "Transfer call to Tracey Hunter for qualified prospects",
  "parameters": {
    "type": "object",
    "properties": {
      "prospect_name": {
        "type": "string",
        "description": "Full name of the prospect"
      },
      "qualification_reason": {
        "type": "string",
        "description": "Why this prospect qualifies for transfer"
      },
      "property_details": {
        "type": "string",
        "description": "Property address or description discussed"
      }
    },
    "required": ["prospect_name", "qualification_reason"]
  },
  "execution": {
    "type": "transfer_call",
    "destination": "+17727638900",
    "whisper_message": "Incoming qualified lead: {{prospect_name}}. Reason: {{qualification_reason}}"
  }
}
```

#### Qualification Criteria (2 of 5 required)
1. Owns property in Treasure Coast service area
2. Property is vacant or seasonally occupied
3. Expressed interest in property management or home watch
4. Currently dissatisfied with existing property oversight
5. Investment property valued at $500K+

#### Test Scenarios
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Qualified lead | "I own a home in Stuart, vacant 8 months/year" | Transfer initiated, whisper played |
| Single criteria | "I have a house in Jensen Beach" | Continue conversation, gather more info |
| Not qualified | "I'm renting an apartment" | Polite close, no transfer |
| Hostile/DNC | "Stop calling me" | End call immediately, add to DNC |

---

### Function 2: `end_call`

**Purpose**: Gracefully terminate call with proper disposition tagging
**Trigger**: Conversation concludes or termination conditions met

#### Configuration
```json
{
  "name": "end_call",
  "description": "End the call with appropriate disposition and follow-up tagging",
  "parameters": {
    "type": "object",
    "properties": {
      "disposition": {
        "type": "string",
        "enum": [
          "booked",
          "callback_requested",
          "not_interested",
          "wrong_number",
          "voicemail",
          "do_not_call",
          "no_answer"
        ],
        "description": "Call outcome disposition"
      },
      "follow_up_required": {
        "type": "boolean",
        "description": "Whether this contact needs follow-up"
      },
      "notes": {
        "type": "string",
        "description": "Summary notes for CRM"
      }
    },
    "required": ["disposition"]
  },
  "execution": {
    "type": "end_call",
    "post_actions": [
      "log_to_airtable",
      "send_slack_notification",
      "update_campaign_stats"
    ]
  }
}
```

#### Disposition Routing

| Disposition | Airtable Table | Slack Channel | Follow-up |
|-------------|---------------|---------------|-----------|
| `booked` | Leads | #sales-alerts | None — appointment confirmed |
| `callback_requested` | Leads | #sales-alerts | Schedule callback within 24h |
| `not_interested` | Missed/Failed | — | Add to 90-day nurture drip |
| `wrong_number` | Missed/Failed | — | Remove from campaign |
| `voicemail` | Missed/Failed | — | Retry in 48 hours (max 3 attempts) |
| `do_not_call` | DNC List | #compliance-alerts | Permanent suppression |
| `no_answer` | Missed/Failed | — | Retry next business day |

---

### Function 3: `classify_objection` (Claude-powered)

**Purpose**: Real-time objection classification and reframe delivery
**Trigger**: Prospect raises an objection during conversation

#### Configuration
```json
{
  "name": "classify_objection",
  "description": "Classify prospect objection and provide scripted reframe",
  "parameters": {
    "type": "object",
    "properties": {
      "objection_text": {
        "type": "string",
        "description": "The exact words the prospect used"
      },
      "conversation_context": {
        "type": "string",
        "description": "Brief context of conversation so far"
      }
    },
    "required": ["objection_text"]
  },
  "execution": {
    "type": "api_call",
    "endpoint": "https://ck-api-gateway.david-e59.workers.dev/v1/objections/classify",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{WORKER_AUTH_TOKEN}}"
    }
  }
}
```

#### Objection Types & Scripted Reframes

| Type | Keyword Triggers | Reframe |
|------|-----------------|---------|
| `competition_neighbor` | "neighbor", "friend does it", "someone already" | "That's great they have someone looking out. Many of our clients actually came to us after a neighbor's recommendation — they wanted the same peace of mind but with documented inspections and real-time reporting." |
| `price` | "expensive", "cost", "too much", "budget" | "I understand cost matters. Our clients find that the cost of one undetected water leak or AC failure exceeds our entire annual service fee. It's less about the price and more about what you're protecting." |
| `urgency_absence` | "not right now", "maybe later", "not urgent" | "Makes sense — nothing feels urgent until something goes wrong. The owners who come to us after a problem always say the same thing: 'I wish I'd started sooner.' Would it make sense to at least have a conversation about what coverage looks like?" |
| `delay_think` | "think about it", "let me consider", "talk to my spouse" | "Of course — it's a decision worth thinking through. Can I send you a quick overview so you have something to reference? What email would be best?" |
| `delay_next_season` | "next season", "not until fall", "when I come back" | "A lot of our seasonal clients start coverage before they leave. That way your home is monitored from day one of your absence. Would it help to set up a quick call with Tracey to map out a timeline?" |
| `competition_pm_company` | "already have a company", "using someone", "property manager" | "Understood — and if they're doing a great job, that's perfect. We often work alongside existing managers as an extra layer of oversight. Is there anything about your current coverage you wish was better?" |

#### Test Scenarios
| Input | Expected Classification | Latency Target |
|-------|------------------------|----------------|
| "My neighbor watches my house" | `competition_neighbor` | <50ms (keyword) |
| "That's way too expensive for us" | `price` | <50ms (keyword) |
| "I need to think about it first" | `delay_think` | <50ms (keyword) |
| "We already use a management company but they miss things" | `competition_pm_company` | <50ms (keyword) |
| "I just don't see why I'd need this right now" | `urgency_absence` | <200ms (Claude) |
| "My accountant needs to review our expenses first" | Fallback → Claude | <500ms (Claude API) |

---

## Webhook Event Processing

### Event: `call_analyzed`

This is the only event that triggers processing. All other events are ignored silently.

#### Processing Pipeline

```
call_analyzed received
        │
        ├── Validate webhook signature (HMAC-SHA256)
        │
        ├── Extract: call_id, duration, transcript, disposition, metadata
        │
        ├── Determine routing:
        │   ├── Failed? (inactivity_timeout, machine_hangup, error)
        │   │   └── Route to Missed/Failed Calls table
        │   │       └── Slack alert to QA channel
        │   │
        │   └── Engaged? (user_hangup, agent_hangup, call_transfer)
        │       └── Route to Leads table
        │           └── Slack alert to #sales-alerts
        │           └── Atlas AI sync (fire-and-forget)
        │
        └── Audit log entry (KV, 30-day TTL)
```

### Airtable Field Mapping

| ReTell Field | Airtable Field | Field ID | Transform |
|-------------|----------------|----------|-----------|
| `call_id` | Call ID | `fldCallId` | Direct |
| `agent_id` | Agent | `fldAgent` | Map to agent name |
| `from_number` | Phone | `fldPhone` | Format E.164 |
| `to_number` | Contact Phone | `fldContactPhone` | Format E.164 |
| `duration_ms` | Duration | `fldDuration` | ms → "Xm Ys" |
| `disconnect_reason` | Disposition | `fldDisposition` | Map via table |
| `transcript` | Transcript | `fldTranscript` | Normalize format |
| `call_analysis.summary` | Summary | `fldSummary` | Direct |
| `call_analysis.sentiment` | Sentiment | `fldSentiment` | Direct |
| `metadata.zone` | Zone | `fldZone` | Map to service area |
| `metadata.segment` | Segment | `fldSegment` | Map to lead segment |
| `start_timestamp` | Call Date | `fldCallDate` | ISO 8601 |
| `retell_llm_dynamic_variables` | Custom Data | `fldCustom` | JSON stringify |

---

## Deployment Pipeline

### Pre-Deploy Checklist

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | Webhook secret configured | `wrangler secret list` | RETELL_WEBHOOK_SECRET present |
| 2 | Airtable API key valid | `curl -H "Authorization: Bearer $KEY" https://api.airtable.com/v0/appUSnNgpDkcEOzhN` | 200 OK |
| 3 | Slack webhook active | `curl -X POST $SLACK_URL -d '{"text":"test"}'` | "ok" |
| 4 | Transform tests pass | `cd sentinel-webhook && npm test` | 0 failures |
| 5 | Gateway tests pass | `npm run test:gateway` | 0 failures |

### Deploy Sequence

```bash
# 1. Run tests
npm run test:sentinel && npm run test:gateway

# 2. Deploy sentinel webhook
cd sentinel-webhook && wrangler deploy

# 3. Deploy API gateway (backup endpoint)
cd ../ck-api-gateway && wrangler deploy

# 4. Verify endpoints
curl -X POST https://sentinel-webhook.david-e59.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"event":"call_analyzed","call":{"call_id":"test"}}'

# 5. Monitor Slack for test notification
```

### Rollback
```bash
# Instant rollback to previous deployment
wrangler rollback --name sentinel-webhook
wrangler rollback --name ck-api-gateway
```

---

## Campaign Parameters

| Parameter | Value |
|-----------|-------|
| Concurrent agents | 40 |
| Calling window | Mon–Sat, 10 AM – 3 PM ET |
| Max call duration | 180 seconds |
| Silence timeout | 8 seconds |
| Daily call target | 2,400 |
| Connection target | 480 (20%) |
| Qualified lead target | 24 (5% of connections) |
| Transfer target | 8 (33% of qualified) |
| Appointment target | 4 (50% of transfers) |
| Model | claude-sonnet-4-6 |
| Voice | Professional Female Warm |
| TCPA compliance | Enabled (DNC scrub, disclosure, recording consent) |

---

## Monitoring & Alerting

| Event | Channel | Alert Level |
|-------|---------|-------------|
| New qualified lead | #sales-alerts | Normal (green) |
| Call transferred to Tracey | #sales-alerts | High (gold) |
| Failed call (error) | #tech-alerts | Warning (red) |
| DNC request | #compliance-alerts | Critical (red) |
| Daily KPI rollup | #exec-briefing | Info (blue) |
| Connection rate <15% | #ops-alerts | Warning (orange) |
| Agent error rate >5% | #tech-alerts | Critical (red) |
