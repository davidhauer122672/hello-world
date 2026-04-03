/**
 * Transform — Maps call payloads to Airtable Leads fields.
 *
 * Supports TWO ingest sources:
 *   1. Retell AI (call_analyzed webhook) — original pipeline
 *   2. Atlas (Call Completed Zapier trigger) — Project Sentinel pipeline
 *
 * Atlas output fields (per Zapier docs):
 *   Campaign Id, Agent Id, Call Id, Customer Number, Customer Name,
 *   Campaign Name, Agent Name, Campaign Type, Call Summary, Ended At,
 *   Started At, Duration Ms, Duration Seconds, Duration Minutes,
 *   Call Transcript, Audio Url
 *
 * Retell output fields:
 *   call_id, to_number, from_number, direction, disconnection_reason,
 *   transcript, start_timestamp, end_timestamp, duration_ms,
 *   retell_llm_dynamic_variables, metadata
 *
 * Field IDs verified against live schema on 2026-04-02.
 */

// ── Airtable Field IDs (Leads table: tblpNasm0AxreRqLW) ──
const FIELD = {
  LEAD_NAME:        'fldAQJqw8WaAzVJkc',  // singleLineText
  PHONE_NUMBER:     'fld1QyH8hdLQnTm09',  // phoneNumber
  EMAIL:            'fldij0lVW4v7H99J7',  // email
  LEAD_SOURCE:      'fldTebchk2aGVFdzZ',  // singleSelect
  STATUS:           'fldDP6ZMdZnx30iYw',  // singleSelect
  INQUIRY_NOTES:    'fldgqSB4kyR1J6KQI',  // multilineText
  DATE_CAPTURED:    'fld07tUlJKbE3EV1o',  // date
  CALL_DISPOSITION: 'fld6O4IRIKmGfzWHg',  // singleSelect
  SENTINEL_SEGMENT: 'fldIO7nG7Rdjbg1CY',  // singleSelect
  SERVICE_ZONE:     'fldqWoQGCR1M1k3O9',  // singleSelect
  SEQUENCE_STEP:    'fldKNvxsK7YjykNPY',  // singleSelect
  AUDIT_TRAIL:      'fld5GJNlA20mLNQbR',  // multilineText
  PROPERTY_ADDRESS: 'fldM63iz3K8k36Vjh',  // singleLineText
};

// ── Dropdown option mappings ──
const STATUS_NEW = { name: 'New' };
const SEQUENCE_DAY1 = { name: 'Day 1 - Cold Open' };

// Retell disconnection_reason → Airtable Call Disposition
const DISPOSITION_MAP = {
  'user_hangup':       { name: 'Callback' },
  'agent_hangup':      { name: 'Booked' },
  'inactivity_timeout': { name: 'No Answer' },
  'machine_hangup':    { name: 'No Answer' },
  'error':             { name: 'No Answer' },
};

// Atlas Call Summary keyword → Airtable Call Disposition
const ATLAS_DISPOSITION_MAP = {
  'booked':           { name: 'Booked' },
  'callback':         { name: 'Callback' },
  'not interested':   { name: 'Not Interested' },
  'disqualified':     { name: 'Disqualified' },
  'no answer':        { name: 'No Answer' },
  'voicemail':        { name: 'No Answer' },
};

// Service zone keyword → Airtable dropdown name
const ZONE_MAP = {
  'vero_beach':       { name: 'Vero Beach' },
  'vero beach':       { name: 'Vero Beach' },
  'sebastian':        { name: 'Sebastian' },
  'fort_pierce':      { name: 'Fort Pierce' },
  'fort pierce':      { name: 'Fort Pierce' },
  'port_saint_lucie': { name: 'Port Saint Lucie' },
  'port saint lucie': { name: 'Port Saint Lucie' },
  'jensen_beach':     { name: 'Jensen Beach' },
  'jensen beach':     { name: 'Jensen Beach' },
  'palm_city':        { name: 'Palm City' },
  'palm city':        { name: 'Palm City' },
  'stuart':           { name: 'Stuart' },
  'hobe_sound':       { name: 'Hobe Sound' },
  'hobe sound':       { name: 'Hobe Sound' },
  'jupiter':          { name: 'Jupiter' },
  'north_palm_beach': { name: 'North Palm Beach' },
  'north palm beach': { name: 'North Palm Beach' },
  'treasure_coast':   { name: 'Vero Beach' },
};

// Sentinel segment keyword → Airtable dropdown name
const SEGMENT_MAP = {
  'absentee':          { name: 'Absentee Homeowner' },
  'absentee_homeowner': { name: 'Absentee Homeowner' },
  'luxury':            { name: 'Luxury Property $1M+' },
  'luxury_property':   { name: 'Luxury Property $1M+' },
  'investor':          { name: 'Investor / Family Office' },
  'family_office':     { name: 'Investor / Family Office' },
  'seasonal':          { name: 'Seasonal / Snowbird' },
  'snowbird':          { name: 'Seasonal / Snowbird' },
  'str':               { name: 'STR / Vacation Rental' },
  'vacation_rental':   { name: 'STR / Vacation Rental' },
};

/**
 * Detect whether the payload is from Atlas (Zapier) or Retell (direct webhook).
 *
 * Atlas payloads contain: Campaign Id, Agent Id, Campaign Name, Campaign Type
 * Retell payloads contain: retell_llm_dynamic_variables, disconnection_reason
 */
function isAtlasPayload(call) {
  return !!(call['Campaign Id'] || call['Campaign Name'] || call['Campaign Type']
    || call.campaign_id || call.campaign_name || call.campaign_type);
}

/**
 * Normalize Atlas field names (which use spaces from Zapier) to consistent keys.
 * Atlas outputs: "Campaign Id", "Agent Id", "Call Id", "Customer Number",
 * "Customer Name", "Campaign Name", "Agent Name", "Campaign Type",
 * "Call Summary", "Ended At", "Started At", "Duration Ms",
 * "Duration Seconds", "Duration Minutes", "Call Transcript", "Audio Url"
 */
function normalizeAtlasKeys(call) {
  return {
    campaign_id:      call['Campaign Id']      || call.campaign_id      || '',
    agent_id:         call['Agent Id']         || call.agent_id         || '',
    call_id:          call['Call Id']          || call.call_id          || '',
    customer_number:  call['Customer Number']  || call.customer_number  || '',
    customer_name:    call['Customer Name']    || call.customer_name    || '',
    campaign_name:    call['Campaign Name']    || call.campaign_name    || '',
    agent_name:       call['Agent Name']       || call.agent_name       || '',
    campaign_type:    call['Campaign Type']    || call.campaign_type    || '',
    call_summary:     call['Call Summary']     || call.call_summary     || '',
    ended_at:         call['Ended At']         || call.ended_at         || '',
    started_at:       call['Started At']       || call.started_at       || '',
    duration_ms:      call['Duration Ms']      || call.duration_ms      || 0,
    duration_seconds: call['Duration Seconds'] || call.duration_seconds || 0,
    duration_minutes: call['Duration Minutes'] || call.duration_minutes || 0,
    call_transcript:  call['Call Transcript']  || call.call_transcript  || '',
    audio_url:        call['Audio Url']        || call.audio_url        || '',
    // Pass through dynamic info if present (Atlas "Dynamic information" field)
    dynamic_info:     call['Dynamic information'] || call.dynamic_info  || '',
  };
}

/**
 * Transform an Atlas Call Completed payload into Airtable Leads field values.
 * @param {object} call — The Atlas call object (from Zapier "Call Completed" trigger)
 * @returns {object} — Airtable fields
 */
export function transformAtlasToAirtable(call) {
  const atlas = normalizeAtlasKeys(call);

  // ── Lead Name — use Customer Name, fall back to phone, then call ID ──
  const leadName = atlas.customer_name
    || atlas.customer_number
    || `Sentinel Lead ${atlas.call_id || 'unknown'}`;

  // ── Phone ──
  const phone = atlas.customer_number;

  // ── Transcript — prefer full transcript, fall back to summary ──
  const transcript = atlas.call_transcript || atlas.call_summary || '';

  // ── Date ──
  const dateCaptured = atlas.started_at
    ? new Date(atlas.started_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // ── Duration ──
  const durationSec = atlas.duration_seconds
    || Math.round((atlas.duration_ms || 0) / 1000);

  // ── Call Disposition — derive from Call Summary keywords ──
  let disposition = null;
  if (atlas.call_summary) {
    const summaryLower = atlas.call_summary.toLowerCase();
    for (const [keyword, value] of Object.entries(ATLAS_DISPOSITION_MAP)) {
      if (summaryLower.includes(keyword)) {
        disposition = value;
        break;
      }
    }
  }

  // ── Sentinel Segment — derive from Campaign Name or dynamic info ──
  let segment = null;
  const campaignLower = (atlas.campaign_name + ' ' + atlas.dynamic_info).toLowerCase();
  for (const [keyword, value] of Object.entries(SEGMENT_MAP)) {
    if (campaignLower.includes(keyword)) {
      segment = value;
      break;
    }
  }

  // ── Service Zone — derive from dynamic info ──
  let zone = null;
  const dynamicLower = atlas.dynamic_info.toLowerCase();
  for (const [keyword, value] of Object.entries(ZONE_MAP)) {
    if (dynamicLower.includes(keyword)) {
      zone = value;
      break;
    }
  }

  // ── Audit Trail ──
  const auditEntry = [
    `[${new Date().toISOString()}]`,
    `Atlas call_completed received.`,
    `Call ID: ${atlas.call_id}.`,
    `Campaign: ${atlas.campaign_name}.`,
    `Agent: ${atlas.agent_name} (${atlas.agent_id}).`,
    `Duration: ${durationSec}s.`,
    atlas.campaign_type ? `Type: ${atlas.campaign_type}.` : '',
  ].filter(Boolean).join(' ');

  // ── Build Airtable fields ──
  const fields = {
    'Lead Name': leadName,
    'Status': STATUS_NEW,
    'Lead Source': { name: 'Atlas Sentinel Campaign' },
    'Date Captured': dateCaptured,
    'Inquiry Notes': transcript ? truncate(transcript, 100000) : (atlas.call_summary || ''),
    'Audit Trail/Activity Log': auditEntry,
    'Sequence Step': SEQUENCE_DAY1,
  };

  if (phone) fields['Phone Number'] = phone;
  if (disposition) fields['Call Disposition'] = disposition;
  if (segment) fields['Sentinel Segment'] = segment;
  if (zone) fields['Service Zone'] = zone;

  // Parse dynamic info for email and property address (key=value;key=value format)
  if (atlas.dynamic_info) {
    const pairs = parseDynamicInfo(atlas.dynamic_info);
    if (pairs.email) fields['Email'] = pairs.email;
    if (pairs.property_address) fields['Property Address'] = pairs.property_address;
    if (pairs.service_zone && !zone) {
      const parsedZone = ZONE_MAP[pairs.service_zone.toLowerCase()];
      if (parsedZone) fields['Service Zone'] = parsedZone;
    }
    if (pairs.segment && !segment) {
      const parsedSegment = SEGMENT_MAP[pairs.segment.toLowerCase()];
      if (parsedSegment) fields['Sentinel Segment'] = parsedSegment;
    }
  }

  // Attach metadata for Slack notifications
  fields._meta = {
    durationSec,
    callId: atlas.call_id,
    transcript,
    source: 'atlas',
    campaignName: atlas.campaign_name,
    agentName: atlas.agent_name,
    audioUrl: atlas.audio_url,
  };

  return fields;
}

/**
 * Parse Atlas "Dynamic information about the customer" field.
 * Format: "key=value;key=value" or "key=value\nkey=value"
 */
function parseDynamicInfo(info) {
  const pairs = {};
  if (!info) return pairs;
  const entries = info.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  for (const entry of entries) {
    const eqIdx = entry.indexOf('=');
    if (eqIdx > 0) {
      const key = entry.slice(0, eqIdx).trim().toLowerCase().replace(/\s+/g, '_');
      pairs[key] = entry.slice(eqIdx + 1).trim();
    }
  }
  return pairs;
}

/**
 * Transform a Retell call object into Airtable Leads field values.
 * @param {object} call — The Retell call object from call_analyzed event
 * @returns {object} — Airtable fields keyed by field name
 */
export function transformRetellToAirtable(call) {
  // ── Auto-detect Atlas payloads and route accordingly ──
  if (isAtlasPayload(call)) {
    return transformAtlasToAirtable(call);
  }

  const dynVars = call.retell_llm_dynamic_variables || {};
  const metadata = call.metadata || {};

  // ── Lead Name ──
  const customerName = dynVars.customer_name || dynVars.name || '';
  const phone = resolvePhone(call);
  const leadName = customerName || phone || `Sentinel Lead ${call.call_id || 'unknown'}`;

  // ── Transcript ──
  const transcript = normalizeTranscript(call.transcript);

  // ── Date ──
  const dateCaptured = call.start_timestamp
    ? new Date(call.start_timestamp).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // ── Duration ──
  const durationSec = computeDuration(call);

  // ── Audit Trail ──
  const auditEntry = [
    `[${new Date().toISOString()}]`,
    `Sentinel call_analyzed received.`,
    `Call ID: ${call.call_id || 'N/A'}.`,
    `Duration: ${durationSec}s.`,
    call.disconnection_reason ? `Disconnect: ${call.disconnection_reason}.` : '',
  ].filter(Boolean).join(' ');

  // ── Build Airtable fields ──
  const fields = {
    'Lead Name': leadName,
    'Status': STATUS_NEW,
    'Lead Source': { name: 'Sentinel AI Agent' },
    'Date Captured': dateCaptured,
    'Inquiry Notes': transcript ? truncate(transcript, 100000) : '',
    'Audit Trail/Activity Log': auditEntry,
    'Sequence Step': SEQUENCE_DAY1,
  };

  if (phone) fields['Phone Number'] = phone;

  const email = dynVars.email || dynVars.customer_email || '';
  if (email) fields['Email'] = email;

  const address = dynVars.property_address || metadata.property_address || '';
  if (address) fields['Property Address'] = address;

  const disposition = DISPOSITION_MAP[call.disconnection_reason];
  if (disposition) fields['Call Disposition'] = disposition;

  const segmentKey = (metadata.campaign || dynVars.segment || '').toLowerCase();
  const segment = SEGMENT_MAP[segmentKey];
  if (segment) fields['Sentinel Segment'] = segment;

  const zoneKey = (metadata.region || metadata.service_zone || dynVars.service_zone || '').toLowerCase();
  const zone = ZONE_MAP[zoneKey];
  if (zone) fields['Service Zone'] = zone;

  fields._meta = { durationSec, callId: call.call_id || 'N/A', transcript, source: 'retell' };

  return fields;
}

function resolvePhone(call) {
  if (call.direction === 'inbound') {
    return call.from_number || call.to_number || '';
  }
  return call.to_number || call.from_number || '';
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

function computeDuration(call) {
  if (call.duration_ms) return Math.round(call.duration_ms / 1000);
  if (call.start_timestamp && call.end_timestamp) {
    return Math.round((call.end_timestamp - call.start_timestamp) / 1000);
  }
  return 0;
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 20) + '\n\n[TRUNCATED AT LIMIT]';
}

