/**
 * Airtable — Creates records in the Coastal Key Master Orchestrator.
 *
 * Base ID:  appUSnNgpDkcEOzhN
 * Leads Table ID:        tblpNasm0AxreRqLW
 * Missed/Failed Calls:   tblWW25r6GmsQe3mQ
 */

const AIRTABLE_API = 'https://api.airtable.com/v0';
const MISSED_CALLS_TABLE_ID = 'tblWW25r6GmsQe3mQ';

/**
 * Retry a fetch with exponential backoff (max 3 attempts).
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw lastError;
}

const FAILURE_REASON_MAP = {
  'inactivity_timeout': 'Inactivity Timeout',
  'machine_hangup':     'Machine Hangup',
  'error':              'Error',
};

/**
 * Create a single record in the Leads table.
 * @param {object} env — Cloudflare Worker env bindings
 * @param {object} fields — Airtable field name → value map
 * @returns {object} — Created record { id, fields, createdTime }
 */
export async function createAirtableRecord(env, fields) {
  const baseId = env.AIRTABLE_BASE_ID;
  const tableId = env.AIRTABLE_TABLE_ID;
  const apiKey = env.AIRTABLE_API_KEY;

  if (!apiKey) throw new Error('AIRTABLE_API_KEY secret is not configured.');

  // Strip internal _meta before sending to Airtable
  const airtableFields = { ...fields };
  delete airtableFields._meta;

  const url = `${AIRTABLE_API}/${baseId}/${tableId}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields: airtableFields }],
      typecast: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.records[0];
}

/**
 * Create a record in the Missed/Failed Calls QA table.
 * @param {object} env — Cloudflare Worker env bindings
 * @param {object} call — Raw Retell call object
 * @param {object} fields — Transformed fields (for extracting meta)
 * @returns {object} — Created record
 */
export async function createMissedCallRecord(env, call, fields) {
  const baseId = env.AIRTABLE_BASE_ID;
  const apiKey = env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error('AIRTABLE_API_KEY secret is not configured.');

  const meta = fields._meta || {};
  const phone = fields['Phone Number'] || '';
  const transcript = meta.transcript || '';

  const failedFields = {
    'Call Reference': call.call_id || `sentinel-${Date.now()}`,
    'Failure Reason': { name: FAILURE_REASON_MAP[call.disconnection_reason] || 'No Answer' },
    'Call Duration (seconds)': meta.durationSec || 0,
    'QA Status': { name: 'Pending Review' },
  };

  if (phone) failedFields['Phone Number'] = phone;
  if (transcript) failedFields['Transcript'] = transcript.slice(0, 100000);
  if (call.direction) failedFields['Call Direction'] = { name: call.direction === 'inbound' ? 'Inbound' : 'Outbound' };
  if (call.start_timestamp) failedFields['Call Timestamp'] = new Date(call.start_timestamp).toISOString();

  const segmentValue = fields['Sentinel Segment'];
  if (segmentValue) failedFields['Sentinel Segment'] = segmentValue;

  const zoneValue = fields['Service Zone'];
  if (zoneValue) failedFields['Service Zone'] = zoneValue;

  const url = `${AIRTABLE_API}/${baseId}/${MISSED_CALLS_TABLE_ID}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields: failedFields }],
      typecast: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable Missed Calls API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.records[0];
}
