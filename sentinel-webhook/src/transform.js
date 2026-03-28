/**
 * Transform — Maps Retell call_analyzed payload to Airtable Leads fields.
 *
 * Field IDs verified against live schema on 2026-03-28.
 * Every mapping references the exact Airtable field ID.
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

// ── Dropdown option mappings (verified choice IDs from live schema) ──
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
  'treasure_coast':   { name: 'Vero Beach' },  // default zone
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
 * Transform a Retell call object into Airtable Leads field values.
 * @param {object} call — The Retell call object from call_analyzed event
 * @returns {object} — Airtable fields keyed by field name (for readability + API)
 */
export function transformRetellToAirtable(call) {
  const dynVars = call.retell_llm_dynamic_variables || {};
  const metadata = call.metadata || {};

  // ── Lead Name ──
  const customerName = dynVars.customer_name || dynVars.name || '';
  const phone = resolvePhone(call);
  const leadName = customerName || phone || `Sentinel Lead ${call.call_id || 'unknown'}`;

  // ── Transcript (truncate to Airtable's 100k char limit) ──
  const transcript = normalizeTranscript(call.transcript);

  // ── Date ──
  const dateCaptured = call.start_timestamp
    ? new Date(call.start_timestamp).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // ── Call duration for audit trail ──
  const durationSec = computeDuration(call);

  // ── Audit Trail entry ──
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
    'Lead Source': { name: 'Sentinel AI Agent' },  // auto-created via typecast on first record
    'Date Captured': dateCaptured,
    'Inquiry Notes': transcript ? truncate(transcript, 100000) : '',
    'Audit Trail/Activity Log': auditEntry,
    'Sequence Step': SEQUENCE_DAY1,
  };

  // ── Phone ──
  if (phone) {
    fields['Phone Number'] = phone;
  }

  // ── Email ──
  const email = dynVars.email || dynVars.customer_email || '';
  if (email) {
    fields['Email'] = email;
  }

  // ── Property Address ──
  const address = dynVars.property_address || metadata.property_address || '';
  if (address) {
    fields['Property Address'] = address;
  }

  // ── Call Disposition ──
  const disposition = DISPOSITION_MAP[call.disconnection_reason];
  if (disposition) {
    fields['Call Disposition'] = disposition;
  }

  // ── Sentinel Segment ──
  const segmentKey = (metadata.campaign || dynVars.segment || '').toLowerCase();
  const segment = SEGMENT_MAP[segmentKey];
  if (segment) {
    fields['Sentinel Segment'] = segment;
  }

  // ── Service Zone ──
  const zoneKey = (metadata.region || metadata.service_zone || dynVars.service_zone || '').toLowerCase();
  const zone = ZONE_MAP[zoneKey];
  if (zone) {
    fields['Service Zone'] = zone;
  }

  // Attach raw duration for Slack
  fields._meta = { durationSec, callId: call.call_id || 'N/A', transcript };

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
