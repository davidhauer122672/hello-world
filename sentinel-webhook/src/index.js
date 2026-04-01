/**
 * Sentinel Webhook — Cloudflare Worker
 *
 * Receives Retell AI call events, filters for call_analyzed,
 * creates a Lead record in the Coastal Key Master Orchestrator,
 * and posts a Slack notification to the sales channel.
 */

import { transformRetellToAirtable } from './transform.js';
import { createAirtableRecord, createMissedCallRecord } from './airtable.js';
import { sendSlackNotification, sendSlackFailedCallNotification } from './slack.js';

// ── Disconnection reasons that indicate failed engagement ──
const FAILED_REASONS = new Set(['inactivity_timeout', 'machine_hangup', 'error']);

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
      // ── Step 0: Verify webhook signature (if secret configured) ──
      const rawBody = await request.text();
      if (env.RETELL_WEBHOOK_SECRET) {
        const signature = request.headers.get('x-retell-signature') || '';
        const isValid = await verifyWebhookSignature(rawBody, signature, env.RETELL_WEBHOOK_SECRET);
        if (!isValid) {
          return json({ error: 'Invalid webhook signature' }, 401);
        }
      }

      const payload = JSON.parse(rawBody);

      // ── Step 1: Filter — only process call_analyzed events ──
      const event = payload.event;
      if (event !== 'call_analyzed') {
        return json({ skipped: true, reason: `Event type '${event}' ignored. Only call_analyzed is processed.` });
      }

      const call = payload.call || payload;

      // ── Step 2: Transform Retell payload → Airtable fields ──
      const fields = transformRetellToAirtable(call);

      // ── Step 3: Split routing — failed calls go to QA table ──
      const isFailed = FAILED_REASONS.has(call.disconnection_reason);

      if (isFailed) {
        // Route to Missed/Failed Calls QA dashboard
        const failedRecord = await createMissedCallRecord(env, call, fields);
        // Also create lead for pipeline completeness
        const leadRecord = await createAirtableRecord(env, fields);
        // Slack alert for QA
        await sendSlackFailedCallNotification(env, call, failedRecord);

        return json({
          success: true,
          routed_to: 'missed_failed_calls',
          missed_call_record_id: failedRecord.id,
          lead_record_id: leadRecord.id,
          failure_reason: call.disconnection_reason,
        });
      }

      // ── Standard path: engaged calls → Leads ──
      const record = await createAirtableRecord(env, fields);

      // ── Step 4: Slack notification ──
      await sendSlackNotification(env, fields, record, call);

      return json({
        success: true,
        routed_to: 'leads',
        airtable_record_id: record.id,
        lead_name: fields['Lead Name'],
      });

    } catch (err) {
      console.error('Sentinel webhook error:', err);
      return json({ error: 'Internal processing error' }, 500);
    }
  },
};

/**
 * Verify Retell webhook HMAC-SHA256 signature.
 */
async function verifyWebhookSignature(body, signature, secret) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    // Constant-time comparison
    if (signature.length !== expected.length) return false;
    let result = 0;
    for (let i = 0; i < expected.length; i++) {
      result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
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
    'Access-Control-Allow-Origin': 'https://retell.ai',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}
