/**
 * Airtable — Creates a record in the Coastal Key Master Orchestrator Leads table.
 *
 * Base ID:  appUSnNgpDkcEOzhN
 * Table ID: tblpNasm0AxreRqLW
 */

const AIRTABLE_API = 'https://api.airtable.com/v0';

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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields: airtableFields }],
      typecast: true,  // auto-create missing select options (e.g., "Sentinel AI Agent")
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.records[0];
}
