# Retell AI Deployment Guide — Tracey Hunter Sentinel Campaign

## STEP 1: Create the Retell AI Agent

### Navigate to Retell Dashboard → Agents → Create New Agent

**Agent Settings:**
| Setting | Value |
|---------|-------|
| Agent Name | `TH-SENTINEL-[001-040]` |
| Voice | `Professional Female — Warm` (e.g., "Stella" or "Maya") |
| Language | English (US) |
| Model | GPT-4o or Claude Sonnet (latest available) |
| Response Speed | Balanced (natural conversation pacing) |
| Interruption Sensitivity | Medium-High (allow natural interruptions) |
| End Call After Silence | 8 seconds |
| Max Call Duration | 180 seconds (3 minutes) |
| Voicemail Detection | Enabled |
| Voicemail Action | Leave message (use voicemail script) |

### System Prompt
Copy the entire **SYSTEM PROMPT** section from `retell-agent-prompt.md` into the Retell agent's **Prompt** field. Replace `[AGENT_NAME]` with the agent's assigned name from the roster in `campaign-config.json`.

---

## STEP 2: Configure Call Transfer (Critical)

In Retell Dashboard → Agent → **Functions/Tools**:

### Add Transfer Function:
```json
{
  "name": "transfer_call_to_tracey",
  "description": "Transfer a qualified lead to Tracey Hunter's cell phone for live conversation",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "Brief reason for transfer (e.g., 'Qualified seller, 3-month timeline, $450K waterfront property in Stuart')"
      }
    },
    "required": ["reason"]
  },
  "transfer_phone_number": "DEPLOY_TRANSFER_PHONE_E164",
  "transfer_message": "Hi Tracey, I have a warm lead on the line — [reason]. Connecting you now."
}
```

### Add End Call Function:
```json
{
  "name": "end_call",
  "description": "End the call when the conversation is complete, prospect requests DNC, or prospect is not interested",
  "parameters": {
    "type": "object",
    "properties": {
      "disposition": {
        "type": "string",
        "enum": ["not_interested", "callback_scheduled", "dnc_request", "wrong_number", "voicemail_left", "no_answer", "conversation_complete"]
      },
      "notes": {
        "type": "string",
        "description": "Brief summary of the call outcome"
      }
    },
    "required": ["disposition"]
  }
}
```

---

## STEP 3: Configure Webhook (Airtable Integration)

In Retell Dashboard → Settings → Webhooks:

### Post-Call Webhook URL:
```
https://hooks.airtable.com/workflows/v1/YOUR_WEBHOOK_ID
```

### Webhook Payload Mapping:
```json
{
  "call_id": "{{call.id}}",
  "agent_id": "{{agent.id}}",
  "agent_name": "{{agent.name}}",
  "contact_name": "{{call.to_name}}",
  "phone_dialed": "{{call.to_number}}",
  "call_date": "{{call.start_time | date: '%m/%d/%Y'}}",
  "call_start_time": "{{call.start_time | date: '%I:%M %p'}}",
  "call_duration_seconds": "{{call.duration}}",
  "call_outcome": "{{call.disposition}}",
  "transfer_completed": "{{call.transferred}}",
  "call_summary": "{{call.summary}}",
  "call_transcript": "{{call.transcript}}",
  "qualification_data": {
    "buyer_or_seller": "{{call.extracted.buyer_or_seller}}",
    "timeline": "{{call.extracted.timeline}}",
    "property_value": "{{call.extracted.property_value}}",
    "motivation": "{{call.extracted.motivation}}",
    "property_address": "{{call.extracted.property_address}}"
  }
}
```

---

## STEP 4: Configure Campaign Schedule

In Retell Dashboard → Campaigns → Create New Campaign:

| Setting | Value |
|---------|-------|
| Campaign Name | `Tracey Hunter Sentinel Sales — Spring/Summer 2026` |
| Start Date | March 28, 2026 |
| End Date | September 28, 2026 |
| Active Days | Monday through Saturday |
| Start Time | 10:00 AM ET |
| End Time | 3:00 PM ET |
| Timezone | America/New_York (Eastern) |
| Concurrent Agents | 40 |
| Calls Per Agent Per Hour | 10-12 |
| Max Retries Per Number | 3 |
| Retry Interval | 48 hours |
| Caller ID | {{transfer_phone_number}} |

### Contact List Upload:
Upload contact lists in CSV format with these headers:
```
first_name,last_name,phone_number,property_address,city,state,zip,lead_source
```

---

## STEP 5: Compliance Configuration

### TCPA Compliance Checklist:
- [ ] Caller ID displays {{transfer_phone_number}} (Tracey's business number)
- [ ] AI disclosure: Agent identifies as AI when asked
- [ ] Do Not Call scrubbing: All lists scrubbed against National DNC Registry
- [ ] State DNC compliance: Florida-specific regulations applied
- [ ] Time restrictions: Calls only between 10AM-3PM ET (within 8AM-9PM federal window)
- [ ] Opt-out mechanism: Immediate removal on request
- [ ] Call recording disclosure: Agent states if required by jurisdiction
- [ ] Consent documentation: Records maintained in Airtable

### DNC Processing:
When a prospect requests DNC removal:
1. Agent immediately confirms removal
2. Webhook fires with `disposition: "dnc_request"`
3. Airtable automation updates Lead Status to "Do Not Call"
4. Number is added to internal suppression list
5. Number is permanently excluded from all future campaigns

---

## STEP 6: Airtable Automation Setup

### Automation 1: Post-Call Record Creation
**Trigger:** Webhook received from Retell
**Action:** Create record in `TH Sentinel - Call Log`
**Field Mapping:**
- Call ID → `call_id`
- Agent ID → `agent_id`
- Contact Name → `contact_name`
- Phone Dialed → `phone_dialed`
- Call Date → `call_date`
- Call Start Time → `call_start_time`
- Call Duration (sec) → `call_duration_seconds`
- Call Outcome → `call_outcome`
- Transfer Completed → `transfer_completed`
- Call Summary → `call_summary`

### Automation 2: Lead Contact Upsert
**Trigger:** New record in Call Log WHERE Call Outcome = "Connected - Qualified"
**Action:** Find or Create record in `TH Sentinel - Lead Contacts`
**Match Field:** Phone Number
**Update Fields:** Lead Status → "Qualifying", Lead Source → "Cold Call - Outbound"

### Automation 3: Agent Performance Update
**Trigger:** New record in Call Log
**Action:** Find record in `TH Sentinel - Agent Performance` by Agent ID
**Action:** Update counters (Total Calls Made +1, conditionally update connections/qualified/transfers)

### Automation 4: Daily Analytics Rollup
**Trigger:** Scheduled daily at 3:15 PM ET
**Action:** Count today's Call Log records, aggregate by outcome
**Action:** Create record in `TH Sentinel - Campaign Analytics`

---

## STEP 7: Launch Verification Checklist

### Pre-Launch (Complete before going live):
- [ ] All 40 agents created and configured in Retell
- [ ] System prompt tested with 10+ sample calls
- [ ] Transfer function tested — confirmed Tracey receives calls at {{transfer_phone_number}}
- [ ] Voicemail detection tested and voicemail script verified
- [ ] Webhook integration tested — records appearing in Airtable
- [ ] DNC scrubbing completed on all contact lists
- [ ] TCPA compliance review completed
- [ ] Caller ID verified ({{transfer_phone_number}})
- [ ] Campaign schedule confirmed: Mon-Sat, 10AM-3PM ET
- [ ] Airtable automations tested end-to-end
- [ ] Contact lists uploaded (minimum 10,000 records for launch week)
- [ ] Tracey briefed on expected call volume and transfer protocol

### Post-Launch Monitoring (First 48 hours):
- [ ] Monitor connection rates (target: 20%+)
- [ ] Monitor qualification rates (target: 5%+ of connections)
- [ ] Monitor transfer success rate (target: 90%+ when attempted)
- [ ] Review call transcripts for quality assurance
- [ ] Verify Airtable records are populating correctly
- [ ] Check for any DNC complaints
- [ ] Confirm Tracey is receiving transferred calls
