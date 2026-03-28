/**
 * Slack — Posts Sentinel lead notification to the sales channel.
 */

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
    console.error(`Slack notification failed (${response.status}): ${await response.text()}`);
  }
}
