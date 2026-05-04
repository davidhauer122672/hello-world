const SNOWBIRD_PHASES = {
  'initial': {
    month: 10, day: 1,
    label: 'Pre-Arrival Inspection Offer',
    subject_template: (zone) => `Your ${zone} Property - Pre-Arrival Inspection Available`,
    prompt_context: 'pre-arrival inspection offer with complimentary first inspection'
  },
  '30day': {
    month: 11, day: 1,
    label: '30-Day Service Confirmation',
    subject_template: (zone) => `30-Day Property Status Update - ${zone}`,
    prompt_context: 'service confirmation and storm season recap'
  },
  '60day': {
    month: 12, day: 1,
    label: '60-Day Upsell Opportunity',
    subject_template: (zone) => `Service Recommendation for ${zone} Property`,
    prompt_context: 'property status update and service upsell to weekly ($395/month)'
  },
  '90day': {
    month: 1, day: 1,
    label: '90-Day Season Wrap-Up',
    subject_template: (zone) => `Season Wrap-Up - Year-Round Monitoring Options`,
    prompt_context: 'season wrap-up and year-round monitoring pitch'
  }
};

function getCurrentPhase() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const [phase, config] of Object.entries(SNOWBIRD_PHASES)) {
    if (config.month === month && config.day === day) {
      return { phase, config, date: now.toISOString().split('T')[0] };
    }
  }
  return null;
}

async function getSeasonalLeads(env) {
  const formula = encodeURIComponent("OR({Segment} = 'Seasonal', {Segment} = 'Snowbird')");
  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Leads?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  return data.records || [];
}

async function generatePersonalizedContent(env, lead, phase) {
  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate a ${phase.config.label} email for ${lead.fields.Name} in ${lead.fields.Zone}. Property value: ${lead.fields['Property Value']}. Phase: ${phase.config.prompt_context}. Personalize to property and zone. Close with risk of unmonitored property during ${phase.phase === '90day' ? 'off-season' : 'seasonal transition'}.`,
      module_override: 'MODULE_A'
    })
  });
  const data = await response.json();
  return data.output;
}

async function sendToConstantContact(env, lead, content, phase) {
  const year = new Date().getFullYear();
  await fetch(`${env.CONSTANT_CONTACT_API}/emails/activities`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CONSTANT_CONTACT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contact_list: `Snowbird Season ${year}`,
      email_address: lead.fields.Email,
      subject: phase.config.subject_template(lead.fields.Zone),
      body: content
    })
  });
}

async function updateLeadRecord(env, recordId, phase) {
  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Leads/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Snowbird Phase': phase.phase,
          'Last Snowbird Touch': phase.date
        }
      })
    }
  );
}

async function notifySlack(env, phase, leadCount) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#operations',
      text: `SNOWBIRD ${phase.phase.toUpperCase()} TRIGGER | ${leadCount} seasonal leads contacted | Phase: ${phase.config.label} | Date: ${phase.date}`
    })
  });
}

export async function runSnowbirdScheduler(env) {
  const phase = getCurrentPhase();
  if (!phase) {
    return { status: 'no_trigger', message: 'Today is not a snowbird trigger date' };
  }

  const leads = await getSeasonalLeads(env);
  if (leads.length === 0) {
    return { status: 'no_leads', phase: phase.phase };
  }

  let processed = 0;
  for (const lead of leads) {
    const content = await generatePersonalizedContent(env, lead, phase);
    await sendToConstantContact(env, lead, content, phase);
    await updateLeadRecord(env, lead.id, phase);
    processed++;
  }

  await notifySlack(env, phase, processed);

  return {
    status: 'completed',
    phase: phase.phase,
    label: phase.config.label,
    leads_contacted: processed,
    date: phase.date
  };
}

export { SNOWBIRD_PHASES, getCurrentPhase };
