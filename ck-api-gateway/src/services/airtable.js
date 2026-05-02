/**
 * Airtable Service — CRUD operations for the Coastal Key Master Orchestrator.
 *
 * Base: appUSnNgpDkcEOzhN
 * All table IDs verified against live schema 2026-03-28.
 */

const AIRTABLE_API = 'https://api.airtable.com/v0';

// ── Verified Table IDs ──
export const TABLES = {
  LEADS:                'tblpNasm0AxreRqLW',
  CLIENTS:              'tblMaMdzP9FXjWbsL',
  PROPERTIES:           'tblT0wq21qxU1KJNM',
  CONTACTS:             'tblLAzR9CdNhrYa95',
  TASKS:                'tbl5kGQ81WObMHTup',
  SALES_CAMPAIGNS:      'tblxClRECEijLysHi',
  CONTENT_CALENDAR:     'tblEPr4f2lMz6ruxF',
  AI_LOG:               'tblZ0bgRmH7KQiZyf',
  VIDEO_PRODUCTION:     'tbl8dvykC4yTiLDBa',
  PODCAST_PRODUCTION:   'tbl2nRbeo2vHjm1Qr',
  INVESTOR_PRESENTATIONS: 'tblJdcuwF1U2SK8PB',
  MAINTENANCE_RECORDS:  'tblWNOfq1OCK4kAnA',
  MAINTENANCE_REQUESTS: 'tblVhVdsQmnblFclI',
  INSPECTIONS:          'tblAZqNDIbBnxPNQn',
  CONCIERGE_REQUESTS:   'tblrtZrImuSIWA54o',
  BOOKINGS:             'tbl75OsuFTHVx8J0l',
  GUEST_FEEDBACK:       'tblNQAfPTdeo3clmn',
  VENDOR_COMPLIANCE:    'tbl2rTYKSdC65kmYp',
  COMPETITIVE_INTEL:    'tbl5Xpu6tyb7WjtvB',
  DEPLOYMENT_TRACKER:   'tblGkLHXDiUkKttXq',
  NOTEBOOKLM_IMPORTS:   'tblmk7HdK3nn7RBaH',
  INCOMPLETE_LEADS:     'tblYh4Rg4NxkRstJl',
  MISSED_FAILED_CALLS:  'tblWW25r6GmsQe3mQ',
  PROPERTY_INTELLIGENCE:'tblHxObVO2ldeSxDo',
  TH_CALL_LOG:          'tbl1a2YPUpZvnRKbi',
  TH_AGENT_PERFORMANCE: 'tblzTUg9QXQnZmA4I',
  TH_CAMPAIGN_ANALYTICS:'tblSkigMl8YSYN16u',
  TH_LEAD_CONTACTS:     'tbl0XVTVz3qambhog',
  // ── Remaining Tables (wired 2026-03-31) ──
  OWNERS:               'tblQHBNEB2qmJL93z',
  SERVICE_PROVIDERS:     'tblngg2GLe9WzJ1I7',
  COMMUNICATIONS:       'tblJQUZJU9DiqCnRG',
  CONSULTATIONS:        'tblVAfA6cMLhbqYcT',
  STORM_PROTOCOLS:      'tbl4KNqlFzEA4Frka',
  AMENITIES:            'tblHpTEAxYoN8nOlH',
  LEASE_APPLICATIONS:   'tblDCiTSI7wmU4GJO',
  FEMA_DEPLOYMENT:      'tblqitX2wwJLOwLQ3',
  VENDORS:              'tblYk94NsfZ8cGgxP',
  SOURCE_REFRESH:       'tblv7T4KFSEXavlCQ',
  COMPETITOR_DATA:      'tblDqhWAKzJM0E8F5',
  MARKET_DATA:          'tblVjGvL1UYin5U2h',
  PORTFOLIO_DATA:       'tblaRlV25mTmeZdzQ',
  REGULATORY_DATA:      'tblyyEjxqQjEmO16T',
  // ── Slack Integration (wired 2026-04-05) ──
  SLACK_INTEGRATIONS:   'tbluSdmSXReoqcROr',
};

/**
 * Create a record in a table.
 * @param {object} env
 * @param {string} tableId
 * @param {object} fields — Field name → value map
 * @param {boolean} [typecast=true] — Auto-create select options
 * @returns {object} — Created record
 */
export async function createRecord(env, tableId, fields, typecast = true) {
  const url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${tableId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: airtableHeaders(env),
    body: JSON.stringify({ records: [{ fields }], typecast }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable create error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.records[0];
}

/**
 * Get a record by ID.
 * @param {object} env
 * @param {string} tableId
 * @param {string} recordId
 * @returns {object} — Record
 */
export async function getRecord(env, tableId, recordId) {
  const url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${tableId}/${recordId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: airtableHeaders(env),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable get error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Update a record (PATCH — partial update).
 * @param {object} env
 * @param {string} tableId
 * @param {string} recordId
 * @param {object} fields — Fields to update
 * @returns {object} — Updated record
 */
export async function updateRecord(env, tableId, recordId, fields) {
  const url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${tableId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: airtableHeaders(env),
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
      typecast: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable update error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.records[0];
}

/**
 * List records with optional filter formula.
 * @param {object} env
 * @param {string} tableId
 * @param {object} [options]
 * @param {string} [options.filterByFormula]
 * @param {string[]} [options.fields] — Field names to return
 * @param {number} [options.maxRecords=100]
 * @param {string} [options.sort] — Field name to sort by
 * @returns {object[]} — Array of records
 */
export async function listRecords(env, tableId, options = {}) {
  const params = new URLSearchParams();
  if (options.filterByFormula) params.set('filterByFormula', options.filterByFormula);
  if (options.maxRecords) params.set('maxRecords', String(options.maxRecords));
  if (options.fields) options.fields.forEach(f => params.append('fields[]', f));
  if (options.sort) params.set('sort[0][field]', options.sort);

  const url = `${AIRTABLE_API}/${env.AIRTABLE_BASE_ID}/${tableId}?${params}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: airtableHeaders(env),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable list error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.records;
}

function airtableHeaders(env) {
  if (!env.AIRTABLE_API_KEY) throw new Error('AIRTABLE_API_KEY secret is not configured.');
  return {
    'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}
