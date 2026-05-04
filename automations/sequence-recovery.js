const SEQUENCE_CONFIG = {
  total_touches: 6,
  sequence_days: 14,
  completion_threshold: 85,
  recovery_trigger_touch: 4
};

async function identifyAtRiskLeads(env) {
  const formula = encodeURIComponent(
    `AND({Sequence Step} >= ${SEQUENCE_CONFIG.recovery_trigger_touch}, {Connected} = FALSE(), {Recovery Status} = '')`
  );

  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Leads?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  return data.records || [];
}

function calculateSequenceHealth(lead) {
  const step = parseInt(lead.fields['Sequence Step']) || 0;
  const connected = lead.fields.Connected === true;
  const completionRate = (step / SEQUENCE_CONFIG.total_touches) * 100;
  const remaining = SEQUENCE_CONFIG.total_touches - step;

  return {
    lead_id: lead.id,
    lead_name: lead.fields.Name,
    segment: lead.fields.Segment,
    zone: lead.fields.Zone,
    current_step: step,
    total_steps: SEQUENCE_CONFIG.total_touches,
    completion_rate: completionRate.toFixed(1),
    remaining_touches: remaining,
    connected,
    at_risk: !connected && completionRate < SEQUENCE_CONFIG.completion_threshold
  };
}

async function generateWinBackScript(env, health) {
  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate a win-back call script for a lead that has not connected after ${health.current_step} of ${health.total_steps} attempts. Lead: ${health.lead_name}. Segment: ${health.segment}. Zone: ${health.zone}. This is a senior closer recovery call. Open with urgency and property risk. Reference previous outreach attempts without being aggressive. Close with complimentary first inspection offer.`,
      module_override: 'MODULE_A'
    })
  });
  const data = await response.json();
  return data.output;
}

async function reassignToSeniorCloser(env, leadId, script) {
  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Leads/${leadId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Assigned To': 'Senior Closer',
          'Recovery Script': script,
          'Recovery Status': 'Reassigned',
          'Recovery Timestamp': new Date().toISOString()
        }
      })
    }
  );
}

async function logRecovery(env, health, action) {
  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Recovery%20Log`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Lead': health.lead_name,
          'Segment': health.segment,
          'Zone': health.zone,
          'Completion Rate': `${health.completion_rate}%`,
          'Step': health.current_step,
          'Action': action,
          'Timestamp': new Date().toISOString()
        }
      })
    }
  );
}

async function notifySlack(env, health) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#sales-team',
      text: `SEQUENCE RECOVERY | ${health.lead_name} | ${health.segment} | ${health.zone} | ${health.completion_rate}% completion (${health.current_step}/${health.total_steps}) | Reassigned to senior closer with win-back script`
    })
  });
}

export async function runSequenceRecovery(env) {
  const leads = await identifyAtRiskLeads(env);
  const results = [];

  for (const lead of leads) {
    const health = calculateSequenceHealth(lead);

    if (!health.at_risk) continue;

    const script = await generateWinBackScript(env, health);
    await reassignToSeniorCloser(env, lead.id, script);
    await logRecovery(env, health, 'Senior closer reassignment');
    await notifySlack(env, health);

    results.push({
      lead: health.lead_name,
      completion_rate: health.completion_rate,
      action: 'reassigned'
    });
  }

  return {
    status: 'completed',
    leads_evaluated: leads.length,
    recoveries_initiated: results.length,
    details: results
  };
}

export { SEQUENCE_CONFIG, calculateSequenceHealth };
