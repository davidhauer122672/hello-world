/**
 * Sentinel Webhook — Cloudflare Worker
 *
 * Dual-ingest pipeline supporting both Retell AI and Atlas platforms:
 *
 *   POST /webhook/retell  — Retell AI call_analyzed events (direct webhook)
 *   POST /webhook/atlas   — Atlas Call Completed events (via Zapier)
 *
 * Both routes transform call data → Airtable Lead record → Slack notification.
 * The transform layer auto-detects payload format and normalizes field names.
 */

import { transformRetellToAirtable, transformAtlasToAirtable } from './transform.js';
import { createAirtableRecord, createMissedCallRecord } from './airtable.js';
import { sendSlackNotification, sendSlackFailedCallNotification } from './slack.js';

// ── Disconnection reasons that indicate failed engagement (Retell) ──
const FAILED_REASONS = new Set(['inactivity_timeout', 'machine_hangup', 'error']);

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST' && request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        service: 'sentinel-webhook',
        version: '2.0.0',
        endpoints: ['/webhook/retell', '/webhook/atlas'],
      });
    }

    // ── Atlas Call Completed (from Zapier trigger) ──
    if (url.pathname === '/webhook/atlas' && request.method === 'POST') {
      return handleAtlasWebhook(request, env);
    }

    // ── Retell call_analyzed (direct webhook) ──
    if (url.pathname === '/webhook/retell' && request.method === 'POST') {
      return handleRetellWebhook(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },
};

// ── Atlas Handler ────────────────────────────────────────────────────────────

async function handleAtlasWebhook(request, env) {
  try {
    const payload = await request.json();

    // Atlas payloads from Zapier arrive as flat objects with the Call Completed fields
    const fields = transformAtlasToAirtable(payload);

    // Atlas calls are pre-qualified — route directly to Leads
    const record = await createAirtableRecord(env, fields);
    await sendSlackNotification(env, fields, record, payload);

    return json({
      success: true,
      source: 'atlas',
      routed_to: 'leads',
      airtable_record_id: record.id,
      lead_name: fields['Lead Name'],
      campaign: fields._meta?.campaignName || '',
    });

  } catch (err) {
    console.error('Atlas webhook error:', err);
    return json({ error: 'Atlas processing error', detail: err.message }, 500);
  }
}

// ── Retell Handler ───────────────────────────────────────────────────────────

async function handleRetellWebhook(request, env) {
  try {
    const payload = await request.json();

    // Filter — only process call_analyzed events
    const event = payload.event;
    if (event !== 'call_analyzed') {
      return json({ skipped: true, reason: `Event type '${event}' ignored. Only call_analyzed is processed.` });
    }

    const call = payload.call || payload;
    const fields = transformRetellToAirtable(call);

    // Split routing — failed calls go to QA table
    const isFailed = FAILED_REASONS.has(call.disconnection_reason);

    if (isFailed) {
      const failedRecord = await createMissedCallRecord(env, call, fields);
      const leadRecord = await createAirtableRecord(env, fields);
      await sendSlackFailedCallNotification(env, call, failedRecord);

      return json({
        success: true,
        source: 'retell',
        routed_to: 'missed_failed_calls',
        missed_call_record_id: failedRecord.id,
        lead_record_id: leadRecord.id,
        failure_reason: call.disconnection_reason,
      });
    }

    const record = await createAirtableRecord(env, fields);
    await sendSlackNotification(env, fields, record, call);

    return json({
      success: true,
      source: 'retell',
      routed_to: 'leads',
      airtable_record_id: record.id,
      lead_name: fields['Lead Name'],
    });

  } catch (err) {
    console.error('Sentinel webhook error:', err);
    return json({ error: 'Internal processing error', detail: err.message }, 500);
  }
}

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
