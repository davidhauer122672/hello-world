const VALID_PRICING = {
  amounts: {
    0: 'First Inspection (Complimentary)',
    95: 'Property Mgmt Oversight',
    195: 'Monthly Home Watch',
    295: 'Biweekly Home Watch / Pre-Storm',
    395: 'Weekly Home Watch',
    500: 'Post-Storm Services'
  },
  percentages: {
    10: 'STR Oversight'
  },
  display_formats: [
    '$395/month', '$295/month', '$195/month', 'from $95/month',
    '10% of gross rental income',
    '$295/event', '$500/event', 'Complimentary'
  ]
};

function detectPricingDrift(text) {
  const violations = [];

  const dollarPattern = /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  let match;
  while ((match = dollarPattern.exec(text)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (!VALID_PRICING.amounts.hasOwnProperty(Math.round(amount))) {
      violations.push({
        type: 'invalid_amount',
        severity: 'critical',
        found: match[0],
        amount,
        position: match.index,
        message: `"${match[0]}" is not a valid Coastal Key price point`,
        valid_amounts: Object.entries(VALID_PRICING.amounts).map(([k, v]) => `$${k} (${v})`)
      });
    }
  }

  const percentPattern = /(\d+(?:\.\d+)?)\s*%/g;
  while ((match = percentPattern.exec(text)) !== null) {
    const pct = parseFloat(match[1]);
    if (!VALID_PRICING.percentages.hasOwnProperty(pct)) {
      const context = text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30);
      if (context.toLowerCase().includes('rental') || context.toLowerCase().includes('str') || context.toLowerCase().includes('income') || context.toLowerCase().includes('gross')) {
        violations.push({
          type: 'invalid_percentage',
          severity: 'critical',
          found: match[0],
          percentage: pct,
          position: match.index,
          message: `"${match[0]}" does not match STR rate of 10%`
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    amounts_found: (text.match(dollarPattern) || []).length,
    timestamp: new Date().toISOString()
  };
}

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

async function blockPublish(env, tableId, recordId, violations) {
  await fetch(`${AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        'Status': 'Needs Revision',
        'Notes': `PRICING DRIFT DETECTED:\n${violations.map(v => v.message).join('\n')}`
      }
    })
  });
}

async function alertSlack(env, violations, recordId) {
  const details = violations.map(v => `- CRITICAL: ${v.message} (found at position ${v.position})`).join('\n');
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#ai-drafts',
      text: `PRICING DRIFT ALERT | Record: ${recordId}\nPublish blocked until corrected.\n${details}`
    })
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { status: 405 });
    }

    const body = await request.json();
    const { content, record_id, table_id } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'content required' }), { status: 400 });
    }

    const result = detectPricingDrift(content);

    if (!result.passed && record_id && table_id) {
      await blockPublish(env, table_id, record_id, result.violations);
      await alertSlack(env, result.violations, record_id);
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
