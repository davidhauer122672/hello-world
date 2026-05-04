function isLastBusinessDayOfQuarter() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const quarterEnds = [3, 6, 9, 12];

  if (!quarterEnds.includes(month)) return null;

  const lastDay = new Date(today.getFullYear(), month, 0).getDate();
  const lastDate = new Date(today.getFullYear(), month - 1, lastDay);

  while (lastDate.getDay() === 0 || lastDate.getDay() === 6) {
    lastDate.setDate(lastDate.getDate() - 1);
  }

  if (today.getDate() !== lastDate.getDate()) return null;

  return {
    quarter: `Q${Math.ceil(month / 3)}`,
    year: today.getFullYear(),
    date: today.toISOString().split('T')[0]
  };
}

async function fetchQuarterlyKPIs(env) {
  const formula = encodeURIComponent("IS_SAME(CREATED_TIME(), TODAY(), 'quarter')");
  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/KPI%20Events?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  return data.records || [];
}

async function fetchInferenceCosts(env) {
  const formula = encodeURIComponent("IS_SAME({Date}, TODAY(), 'quarter')");
  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Inference%20Cost%20Log?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  return data.records || [];
}

function aggregateMetrics(kpiEvents, costRecords) {
  const stats = {
    total_dials: 0,
    connections: 0,
    bookings: 0,
    closes: 0,
    investor_flags: 0,
    content_published: 0,
    total_inference_cost: 0,
    zones: {},
    segments: {}
  };

  kpiEvents.forEach(r => {
    const fields = r.fields;
    if (fields.metric === 'call_disposition') {
      stats.total_dials++;
      if (fields.connected) stats.connections++;
      if (fields.booked) stats.bookings++;
      if (fields.investor_flagged) stats.investor_flags++;

      const zone = fields.zone || 'Unknown';
      stats.zones[zone] = stats.zones[zone] || { dials: 0, connects: 0, bookings: 0 };
      stats.zones[zone].dials++;
      if (fields.connected) stats.zones[zone].connects++;
      if (fields.booked) stats.zones[zone].bookings++;

      const segment = fields.segment || 'Unknown';
      stats.segments[segment] = stats.segments[segment] || { dials: 0, connects: 0, bookings: 0 };
      stats.segments[segment].dials++;
      if (fields.connected) stats.segments[segment].connects++;
      if (fields.booked) stats.segments[segment].bookings++;
    }
    if (fields.metric === 'content_published') stats.content_published++;
  });

  costRecords.forEach(r => {
    stats.total_inference_cost += parseFloat(r.fields['Est Cost USD'] || 0);
  });

  stats.connect_rate = stats.total_dials > 0
    ? ((stats.connections / stats.total_dials) * 100).toFixed(1) : '0';
  stats.book_rate = stats.connections > 0
    ? ((stats.bookings / stats.connections) * 100).toFixed(1) : '0';
  stats.total_inference_cost = stats.total_inference_cost.toFixed(2);

  return stats;
}

async function generateReport(env, quarterInfo, stats) {
  const zoneBreakdown = Object.entries(stats.zones)
    .map(([z, d]) => `${z}: ${d.dials} dials, ${d.connects} connects, ${d.bookings} bookings`)
    .join('. ');

  const segmentBreakdown = Object.entries(stats.segments)
    .map(([s, d]) => `${s}: ${d.dials} dials, ${d.connects} connects, ${d.bookings} bookings`)
    .join('. ');

  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate a board-ready quarterly executive report for Coastal Key Treasure Coast Asset Management. Quarter: ${quarterInfo.quarter} ${quarterInfo.year}. Data: Total dials: ${stats.total_dials}. Connect rate: ${stats.connect_rate}%. Book rate: ${stats.book_rate}%. Investor flags: ${stats.investor_flags}. Content published: ${stats.content_published}. AI inference cost: $${stats.total_inference_cost}. Zone breakdown: ${zoneBreakdown}. Segment breakdown: ${segmentBreakdown}. Format as: EXECUTIVE SUMMARY, KEY METRICS TABLE, SEGMENT PERFORMANCE, ZONE ANALYSIS, CONTENT OPERATIONS, AI COST EFFICIENCY, RECOMMENDATIONS. Under 1500 words. Close with forward-looking risk assessment.`,
      module_override: 'MODULE_C'
    })
  });
  const data = await response.json();
  return data.output;
}

async function deliverReport(env, quarterInfo, report, stats) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#executive',
      text: `${quarterInfo.quarter} ${quarterInfo.year} QUARTERLY REPORT | Dials: ${stats.total_dials} | Connect: ${stats.connect_rate}% | Content: ${stats.content_published} | AI Cost: $${stats.total_inference_cost} | Full report emailed to CEO`
    })
  });

  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Quarterly%20Reports`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Quarter': `${quarterInfo.quarter} ${quarterInfo.year}`,
          'Report': report,
          'Total Dials': stats.total_dials,
          'Connect Rate': stats.connect_rate,
          'Content Published': stats.content_published,
          'AI Cost': stats.total_inference_cost,
          'Generated': new Date().toISOString()
        }
      })
    }
  );
}

export async function runQuarterlyRollup(env) {
  const quarterInfo = isLastBusinessDayOfQuarter();
  if (!quarterInfo) {
    return { status: 'not_quarter_end', message: 'Today is not the last business day of a quarter' };
  }

  const [kpiEvents, costRecords] = await Promise.all([
    fetchQuarterlyKPIs(env),
    fetchInferenceCosts(env)
  ]);

  const stats = aggregateMetrics(kpiEvents, costRecords);
  const report = await generateReport(env, quarterInfo, stats);
  await deliverReport(env, quarterInfo, report, stats);

  return {
    status: 'delivered',
    quarter: `${quarterInfo.quarter} ${quarterInfo.year}`,
    metrics: stats,
    report_length: report.length
  };
}

export { isLastBusinessDayOfQuarter, aggregateMetrics };
