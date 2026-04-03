/**
 * Retell Webhook Route — POST /v1/webhook/retell
 *
 * Receives Retell call events, filters for call_analyzed,
 * then splits routing:
 *   - Engaged calls (user_hangup, agent_hangup) → Leads table + Slack
 *   - Failed calls (inactivity_timeout, machine_hangup, error) → Missed/Failed Calls table (QA dashboard)
 *
 * The QA path feeds directly into Sentinel prompt tuning.
 */

import { createRecord, TABLES } from '../services/airtable.js';
import { storeCallTranscript } from '../services/atlas.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse } from '../utils/response.js';

// ── Missed/Failed Calls table (QA dashboard for prompt tuning) ──
const MISSED_CALLS_TABLE = 'tblWW25r6GmsQe3mQ';

// ── Disconnection reasons that indicate failed engagement ──
const FAILED_REASONS = new Set(['inactivity_timeout', 'machine_hangup', 'error']);

// ── Failed reason → Airtable Failure Reason dropdown ──
const FAILURE_REASON_MAP = {
  'inactivity_timeout': 'Inactivity Timeout',
  'machine_hangup':     'Machine Hangup',
  'error':              'Error',
};

// ── Retell disconnection_reason → Airtable Call Disposition ──
const DISPOSITION_MAP = {
  'user_hangup':        'Callback',
  'agent_hangup':       'Booked',
  'inactivity_timeout': 'No Answer',
  'machine_hangup':     'No Answer',
  'error':              'No Answer',
};

// ── Region key → Service Zone dropdown ──
const ZONE_MAP = {
  'vero_beach': 'Vero Beach', 'vero beach': 'Vero Beach',
  'sebastian': 'Sebastian',
  'fort_pierce': 'Fort Pierce', 'fort pierce': 'Fort Pierce',
  'port_saint_lucie': 'Port Saint Lucie', 'port saint lucie': 'Port Saint Lucie',
  'jensen_beach': 'Jensen Beach', 'jensen beach': 'Jensen Beach',
  'palm_city': 'Palm City', 'palm city': 'Palm City',
  'stuart': 'Stuart',
  'hobe_sound': 'Hobe Sound', 'hobe sound': 'Hobe Sound',
  'jupiter': 'Jupiter',
  'north_palm_beach': 'North Palm Beach', 'north palm beach': 'North Palm Beach',
  'treasure_coast': 'Vero Beach',
};

// ── Segment key → Sentinel Segment dropdown ──
const SEGMENT_MAP = {
  'absentee': 'Absentee Homeowner', 'absentee_homeowner': 'Absentee Homeowner',
  'luxury': 'Luxury Property $1M+', 'luxury_property': 'Luxury Property $1M+',
  'investor': 'Investor / Family Office', 'family_office': 'Investor / Family Office',
  'seasonal': 'Seasonal / Snowbird', 'snowbird': 'Seasonal / Snowbird',
  'str': 'STR / Vacation Rental', 'vacation_rental': 'STR / Vacation Rental',
};

export async function handleRetellWebhook(request, env, ctx) {
  const payload = await request.json();

  // ── Filter: only call_analyzed ──
  const event = payload.event;
  if (event !== 'call_analyzed') {
    return jsonResponse({ skipped: true, reason: `Event '${event}' ignored.` });
  }

  const call = payload.call || payload;
  const dynVars = call.retell_llm_dynamic_variables || {};
  const metadata = call.metadata || {};

  // ── Resolve fields ──
  const phone = call.direction === 'inbound'
    ? (call.from_number || call.to_number || '')
    : (call.to_number || call.from_number || '');

  const leadName = dynVars.customer_name || dynVars.name || phone || `Sentinel Lead ${call.call_id || 'unknown'}`;
  const transcript = normalizeTranscript(call.transcript);
  const durationSec = call.duration_ms
    ? Math.round(call.duration_ms / 1000)
    : (call.start_timestamp && call.end_timestamp)
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : 0;

  const dateCaptured = call.start_timestamp
    ? new Date(call.start_timestamp).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const auditEntry = `[${new Date().toISOString()}] Sentinel call_analyzed received. Call ID: ${call.call_id || 'N/A'}. Duration: ${durationSec}s.`;

  // ── Build Airtable fields ──
  const fields = {
    'Lead Name': leadName,
    'Status': { name: 'New' },
    'Lead Source': { name: 'Sentinel AI Agent' },
    'Date Captured': dateCaptured,
    'Sequence Step': { name: 'Day 1 - Cold Open' },
    'Audit Trail/Activity Log': auditEntry,
  };

  if (phone) fields['Phone Number'] = phone;
  if (dynVars.email || dynVars.customer_email) fields['Email'] = dynVars.email || dynVars.customer_email;
  if (dynVars.property_address || metadata.property_address) {
    fields['Property Address'] = dynVars.property_address || metadata.property_address;
  }
  if (transcript) fields['Inquiry Notes'] = transcript.slice(0, 100000);

  const disposition = DISPOSITION_MAP[call.disconnection_reason];
  if (disposition) fields['Call Disposition'] = { name: disposition };

  const segmentKey = (metadata.campaign || dynVars.segment || '').toLowerCase();
  if (SEGMENT_MAP[segmentKey]) fields['Sentinel Segment'] = { name: SEGMENT_MAP[segmentKey] };

  const zoneKey = (metadata.region || metadata.service_zone || dynVars.service_zone || '').toLowerCase();
  if (ZONE_MAP[zoneKey]) fields['Service Zone'] = { name: ZONE_MAP[zoneKey] };

  // ── SPLIT ROUTING: Failed calls → QA table, Engaged calls → Leads ──
  const isFailed = FAILED_REASONS.has(call.disconnection_reason);

  if (isFailed) {
    // ── Route to Missed/Failed Calls table (QA dashboard) ──
    const failedFields = {
      'Call Reference': call.call_id || `sentinel-${Date.now()}`,
      'Failure Reason': { name: FAILURE_REASON_MAP[call.disconnection_reason] || 'No Answer' },
      'Call Duration (seconds)': durationSec,
      'QA Status': { name: 'Pending Review' },
    };

    if (phone) failedFields['Phone Number'] = phone;
    if (transcript) failedFields['Transcript'] = transcript.slice(0, 100000);
    if (call.direction) failedFields['Call Direction'] = { name: call.direction === 'inbound' ? 'Inbound' : 'Outbound' };
    if (call.start_timestamp) failedFields['Call Timestamp'] = new Date(call.start_timestamp).toISOString();
    if (SEGMENT_MAP[segmentKey]) failedFields['Sentinel Segment'] = { name: SEGMENT_MAP[segmentKey] };
    if (ZONE_MAP[zoneKey]) failedFields['Service Zone'] = { name: ZONE_MAP[zoneKey] };

    const failedRecord = await createRecord(env, MISSED_CALLS_TABLE, failedFields);

    // Also create a lead record (for pipeline completeness) and link it
    const leadRecord = await createRecord(env, TABLES.LEADS, fields);

    // Link the failed call record to the lead (fire-and-forget)
    ctx.waitUntil(
      fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${MISSED_CALLS_TABLE}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ id: failedRecord.id, fields: { 'Related Lead': [leadRecord.id] } }] }),
      }).catch(err => console.error('Failed to link records:', err))
    );

    // Archive failed call to Atlas (fire-and-forget)
    if (env.ATLAS_DATA_API_URL) {
      ctx.waitUntil(
        storeCallTranscript(env, {
          call_id: call.call_id,
          agent_id: dynVars.agent_id || metadata.agent_id,
          agent_name: dynVars.agent_name || metadata.agent_name,
          campaign: metadata.campaign || 'th-sentinel',
          phone_number: phone,
          contact_name: leadName,
          direction: call.direction,
          start_timestamp: call.start_timestamp,
          end_timestamp: call.end_timestamp,
          duration_seconds: durationSec,
          disconnection_reason: call.disconnection_reason,
          disposition: FAILURE_REASON_MAP[call.disconnection_reason] || 'No Answer',
          transcript_raw: Array.isArray(call.transcript) ? call.transcript : [],
          transcript_text: transcript,
          service_zone: ZONE_MAP[zoneKey] || null,
          sentinel_segment: SEGMENT_MAP[segmentKey] || null,
          property_address: dynVars.property_address || metadata.property_address,
          dynamic_variables: dynVars,
          metadata: metadata,
          airtable_lead_id: leadRecord.id,
        }).catch(err => console.error('Atlas failed call archive failed:', err))
      );
    }

    // Slack alert for failed calls (different format)
    if (env.SLACK_WEBHOOK_URL) {
      ctx.waitUntil(sendSlackFailedAlert(env, call.call_id, phone, call.disconnection_reason, durationSec, transcript, failedRecord.id));
    }

    writeAudit(env, ctx, {
      route: '/v1/webhook/retell',
      path: 'missed_failed',
      callId: call.call_id,
      failedRecordId: failedRecord.id,
      leadRecordId: leadRecord.id,
      reason: call.disconnection_reason,
      durationSec,
    });

    return jsonResponse({
      success: true,
      routed_to: 'missed_failed_calls',
      missed_call_record_id: failedRecord.id,
      lead_record_id: leadRecord.id,
      failure_reason: call.disconnection_reason,
    });
  }

  // ── Engaged call → Leads table (standard path) ──
  const record = await createRecord(env, TABLES.LEADS, fields);

  // ── Archive to Atlas (fire-and-forget) ──
  if (env.ATLAS_DATA_API_URL) {
    ctx.waitUntil(
      storeCallTranscript(env, {
        call_id: call.call_id,
        agent_id: dynVars.agent_id || metadata.agent_id,
        agent_name: dynVars.agent_name || metadata.agent_name,
        campaign: metadata.campaign || 'th-sentinel',
        phone_number: phone,
        contact_name: leadName,
        direction: call.direction,
        start_timestamp: call.start_timestamp,
        end_timestamp: call.end_timestamp,
        duration_seconds: durationSec,
        disconnection_reason: call.disconnection_reason,
        disposition: disposition,
        transcript_raw: Array.isArray(call.transcript) ? call.transcript : [],
        transcript_text: transcript,
        service_zone: ZONE_MAP[zoneKey] || null,
        sentinel_segment: SEGMENT_MAP[segmentKey] || null,
        property_address: dynVars.property_address || metadata.property_address,
        dynamic_variables: dynVars,
        metadata: metadata,
        airtable_lead_id: record.id,
      }).catch(err => console.error('Atlas transcript archive failed:', err))
    );
  }

  // ── Slack notification (fire-and-forget) ──
  if (env.SLACK_WEBHOOK_URL) {
    ctx.waitUntil(sendSlackAlert(env, leadName, phone, disposition, SEGMENT_MAP[segmentKey], durationSec, transcript, record.id));
  }

  writeAudit(env, ctx, {
    route: '/v1/webhook/retell',
    path: 'lead_created',
    callId: call.call_id,
    recordId: record.id,
    leadName,
    disposition: disposition || 'unknown',
    durationSec,
  });

  return jsonResponse({
    success: true,
    routed_to: 'leads',
    airtable_record_id: record.id,
    lead_name: leadName,
  });
}

function normalizeTranscript(transcript) {
  if (!transcript) return '';
  if (typeof transcript === 'string') return transcript;
  if (Array.isArray(transcript)) {
    return transcript
      .map(t => `${(t.role || t.speaker || 'unknown').toUpperCase()}: ${t.content || t.text || ''}`)
      .join('\n');
  }
  return JSON.stringify(transcript);
}

async function sendSlackFailedAlert(env, callId, phone, reason, duration, transcript, recordId) {
  const excerpt = transcript ? transcript.slice(0, 500) + (transcript.length > 500 ? '...' : '') : 'No transcript available';
  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${MISSED_CALLS_TABLE}/${recordId}`;

  const message = {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `Failed Sentinel Call — QA Review Needed` } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Call ID:*\n\`${callId || 'N/A'}\`` },
          { type: 'mrkdwn', text: `*Phone:*\n${phone || 'N/A'}` },
          { type: 'mrkdwn', text: `*Failure:*\n${FAILURE_REASON_MAP[reason] || reason}` },
          { type: 'mrkdwn', text: `*Duration:*\n${duration}s` },
        ],
      },
      { type: 'section', text: { type: 'mrkdwn', text: `*Transcript:*\n\`\`\`${excerpt}\`\`\`` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `This call has been routed to the *Missed/Failed Calls* QA dashboard for prompt tuning review.` }] },
      { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Review in Airtable' }, url: airtableLink, style: 'danger' }] },
    ],
  };

  try {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.error('Slack failed call notification failed:', err);
  }
}

async function sendSlackAlert(env, leadName, phone, disposition, segment, duration, transcript, recordId) {
  const excerpt = transcript ? transcript.slice(0, 500) + (transcript.length > 500 ? '...' : '') : 'No transcript';
  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}/${recordId}`;

  const message = {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `New Sentinel Lead: ${leadName}` } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Phone:*\n${phone || 'N/A'}` },
          { type: 'mrkdwn', text: `*Disposition:*\n${disposition || 'Unknown'}` },
          { type: 'mrkdwn', text: `*Segment:*\n${segment || 'Not classified'}` },
          { type: 'mrkdwn', text: `*Duration:*\n${duration}s` },
        ],
      },
      { type: 'section', text: { type: 'mrkdwn', text: `*Transcript excerpt:*\n\`\`\`${excerpt}\`\`\`` } },
      { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View in Airtable' }, url: airtableLink, style: 'primary' }] },
    ],
  };

  try {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.error('Slack notification failed:', err);
  }
}
