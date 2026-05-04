const VARIANT_STYLES = {
  A: {
    label: 'Risk Statement Lead',
    instruction: 'Style: direct risk statement about unmonitored property. Open with what the homeowner stands to lose.'
  },
  B: {
    label: 'Value Proposition Lead',
    instruction: 'Style: value proposition and service benefit lead-in. Open with what the homeowner gains from professional oversight.'
  }
};

async function generateHookVariant(env, lead, variant) {
  const style = VARIANT_STYLES[variant];
  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate opening hook VARIANT ${variant} for outbound call. Lead: ${lead.name}. Segment: ${lead.segment}. Zone: ${lead.zone}. Property value: ${lead.property_value}. ${style.instruction}`,
      module_override: 'MODULE_A'
    })
  });
  const data = await response.json();
  return data.output;
}

function randomAssignment() {
  return Math.random() < 0.5 ? 'A' : 'B';
}

async function createTest(env, lead) {
  const [hookA, hookB] = await Promise.all([
    generateHookVariant(env, lead, 'A'),
    generateHookVariant(env, lead, 'B')
  ]);

  const selected = randomAssignment();
  const testId = `AB-${Date.now()}-${lead.id.slice(-4)}`;

  await updateLeadWithTest(env, lead.id, {
    hookA, hookB, selected, testId
  });

  await logTest(env, {
    testId,
    leadName: lead.name,
    segment: lead.segment,
    zone: lead.zone,
    hookA, hookB,
    selected
  });

  return {
    test_id: testId,
    selected_variant: selected,
    active_hook: selected === 'A' ? hookA : hookB
  };
}

async function updateLeadWithTest(env, recordId, test) {
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
          'Hook Variant A': test.hookA,
          'Hook Variant B': test.hookB,
          'Active Hook': test.selected === 'A' ? test.hookA : test.hookB,
          'Selected Variant': test.selected,
          'AB Test ID': test.testId
        }
      })
    }
  );
}

async function logTest(env, test) {
  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/AB%20Test%20Log`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Test ID': test.testId,
          'Lead': test.leadName,
          'Segment': test.segment,
          'Zone': test.zone,
          'Variant A': test.hookA,
          'Variant B': test.hookB,
          'Selected': test.selected,
          'Outcome': 'Pending',
          'Created': new Date().toISOString()
        }
      })
    }
  );
}

async function recordOutcome(env, testId, outcome) {
  const formula = encodeURIComponent(`{Test ID} = '${testId}'`);
  const findResponse = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/AB%20Test%20Log?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const findData = await findResponse.json();
  const record = findData.records?.[0];

  if (record) {
    await fetch(
      `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/AB%20Test%20Log/${record.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Outcome': outcome,
            'Resolved': new Date().toISOString()
          }
        })
      }
    );
  }

  return { test_id: testId, outcome, recorded: !!record };
}

async function getWinRates(env) {
  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/AB%20Test%20Log?filterByFormula=${encodeURIComponent("{Outcome} != 'Pending'")}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  const records = data.records || [];

  const stats = { A: { total: 0, converted: 0 }, B: { total: 0, converted: 0 } };
  records.forEach(r => {
    const variant = r.fields.Selected;
    const converted = r.fields.Outcome === 'Converted';
    if (stats[variant]) {
      stats[variant].total++;
      if (converted) stats[variant].converted++;
    }
  });

  const rateA = stats.A.total > 0 ? (stats.A.converted / stats.A.total * 100).toFixed(1) : '0';
  const rateB = stats.B.total > 0 ? (stats.B.converted / stats.B.total * 100).toFixed(1) : '0';

  return {
    variant_a: { ...stats.A, conversion_rate: rateA, style: VARIANT_STYLES.A.label },
    variant_b: { ...stats.B, conversion_rate: rateB, style: VARIANT_STYLES.B.label },
    winner: parseFloat(rateA) > parseFloat(rateB) ? 'A' : parseFloat(rateB) > parseFloat(rateA) ? 'B' : 'Tied',
    total_tests: records.length
  };
}

export { createTest, recordOutcome, getWinRates, VARIANT_STYLES };
