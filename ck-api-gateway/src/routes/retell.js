/**
 * Retell Webhook Route — POST /v1/webhook/retell
 *
 * Receives Retell call events, filters for call_analyzed,
 * creates a Lead record, sends Slack notification.
 * This is the gateway-integrated version of the standalone sentinel-webhook.
 */

import { createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse } from '../utils/response.js';

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

  // ── Create lead ──
  const record = await createRecord(env, TABLES.LEADS, fields);

  // ── Slack notification (fire-and-forget) ──
  if (env.SLACK_WEBHOOK_URL) {
    ctx.waitUntil(sendSlackAlert(env, leadName, phone, disposition, SEGMENT_MAP[segmentKey], durationSec, transcript, record.id));
  }

  writeAudit(env, ctx, {
    route: '/v1/webhook/retell',
    callId: call.call_id,
    recordId: record.id,
    leadName,
    disposition: disposition || 'unknown',
    durationSec,
  });

  return jsonResponse({
    success: true,
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
