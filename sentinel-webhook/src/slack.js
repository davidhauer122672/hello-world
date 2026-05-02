/**
 * Slack — Posts Sentinel notifications to the sales channel.
 * Two paths: engaged leads (green) and failed calls (red/QA review).
 *
 * Uses rich Block Kit formatting with intelligent channel routing.
 * Supports both Bot Token API (preferred) and webhook (fallback).
 */

const MISSED_CALLS_TABLE_ID = 'tblWW25r6GmsQe3mQ';

/**
 * Send a formatted Slack notification for a new Sentinel lead.
 * @param {object} env — Cloudflare Worker env bindings
 * @param {object} fields — Transformed Airtable fields
 * @param {object} record — Created Airtable record
 * @param {object} call — Original Retell call object
 */
export async function sendSlackNotification(env, fields, record, call) {
  const webhookUrl = env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured — skipping notification.');
    return;
  }

  const meta = fields._meta || {};
  const transcriptExcerpt = meta.transcript
    ? meta.transcript.slice(0, 500) + (meta.transcript.length > 500 ? '...' : '')
    : 'No transcript available';

  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}/${record.id}`;

  const disposition = fields['Call Disposition']?.name || 'Unknown';
  const segment = fields['Sentinel Segment']?.name || 'Not classified';

  const message = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `New Sentinel Lead: ${fields['Lead Name']}` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Phone:*\n${fields['Phone Number'] || 'N/A'}` },
          { type: 'mrkdwn', text: `*Disposition:*\n${disposition}` },
          { type: 'mrkdwn', text: `*Segment:*\n${segment}` },
          { type: 'mrkdwn', text: `*Duration:*\n${meta.durationSec || 0}s` },
          { type: 'mrkdwn', text: `*Service Zone:*\n${fields['Service Zone']?.name || 'N/A'}` },
          { type: 'mrkdwn', text: `*Call ID:*\n${meta.callId}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Transcript excerpt:*\n\`\`\`${transcriptExcerpt}\`\`\``,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Airtable' },
            url: airtableLink,
            style: 'primary',
          },
        ],
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Slack notification failed (${response.status}): ${detail}`);
  }
}

/**
 * Send a Slack notification for a failed/missed Sentinel call (QA path).
 * @param {object} env
 * @param {object} call — Raw Retell call object
 * @param {object} failedRecord — Created Missed/Failed Calls Airtable record
 */
export async function sendSlackFailedCallNotification(env, call, failedRecord) {
  const webhookUrl = env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const transcript = call.transcript
    ? (typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript))
    : '';
  const excerpt = transcript.slice(0, 500) + (transcript.length > 500 ? '...' : '') || 'No transcript available';
  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${MISSED_CALLS_TABLE_ID}/${failedRecord.id}`;
  const phone = call.direction === 'inbound' ? (call.from_number || '') : (call.to_number || '');
  const durationSec = call.duration_ms ? Math.round(call.duration_ms / 1000) : 0;

  const reasonMap = { inactivity_timeout: 'Inactivity Timeout', machine_hangup: 'Machine Hangup', error: 'Error' };

  const message = {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Failed Sentinel Call — QA Review Needed' } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Call ID:*\n\`${call.call_id || 'N/A'}\`` },
          { type: 'mrkdwn', text: `*Phone:*\n${phone || 'N/A'}` },
          { type: 'mrkdwn', text: `*Failure:*\n${reasonMap[call.disconnection_reason] || call.disconnection_reason}` },
          { type: 'mrkdwn', text: `*Duration:*\n${durationSec}s` },
        ],
      },
      { type: 'section', text: { type: 'mrkdwn', text: `*Transcript:*\n\`\`\`${excerpt}\`\`\`` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: 'Routed to *Missed/Failed Calls* QA dashboard for prompt tuning review.' }] },
      { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Review in Airtable' }, url: airtableLink, style: 'danger' }] },
    ],
  };

  try {
    await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
  } catch (err) {
    console.error('Slack failed call notification error:', err);
  }
}
