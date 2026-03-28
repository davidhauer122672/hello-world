/**
 * Sentinel Webhook — Cloudflare Worker
 *
 * Receives Retell AI call events, filters for call_analyzed,
 * creates a Lead record in the Coastal Key Master Orchestrator,
 * and posts a Slack notification to the sales channel.
 */

import { transformRetellToAirtable } from './transform.js';
import { createAirtableRecord } from './airtable.js';
import { sendSlackNotification } from './slack.js';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'sentinel-webhook', version: '1.0.0' });
    }

    if (url.pathname !== '/webhook/retell') {
      return json({ error: 'Not found' }, 404);
    }

    try {
      const payload = await request.json();

      // ── Step 1: Filter — only process call_analyzed events ──
      const event = payload.event;
      if (event !== 'call_analyzed') {
        return json({ skipped: true, reason: `Event type '${event}' ignored. Only call_analyzed is processed.` });
      }

      const call = payload.call || payload;

      // ── Step 2: Transform Retell payload → Airtable fields ──
      const fields = transformRetellToAirtable(call);

      // ── Step 3: Create Airtable record ──
      const record = await createAirtableRecord(env, fields);

      // ── Step 4: Slack notification ──
      await sendSlackNotification(env, fields, record, call);

      return json({
        success: true,
        airtable_record_id: record.id,
        lead_name: fields['Lead Name'],
      });

    } catch (err) {
      console.error('Sentinel webhook error:', err);
      return json({ error: 'Internal processing error', detail: err.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
