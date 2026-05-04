const NOAA_API = 'https://api.weather.gov/alerts/active';
const MONITORED_ZONES = ['FLZ060', 'FLZ061', 'FLZ062', 'FLZ063'];
const ZONE_MAP = {
  FLZ060: ['Vero Beach', 'Sebastian'],
  FLZ061: ['Fort Pierce', 'Port Saint Lucie'],
  FLZ062: ['Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound'],
  FLZ063: ['Jupiter', 'North Palm Beach']
};

const STORM_EVENTS = [
  'Hurricane Warning', 'Hurricane Watch',
  'Tropical Storm Warning', 'Tropical Storm Watch',
  'Storm Surge Warning', 'Storm Surge Watch',
  'Flood Warning', 'Flood Watch',
  'Severe Thunderstorm Warning', 'Tornado Warning'
];

async function fetchActiveAlerts() {
  const zoneParam = MONITORED_ZONES.join(',');
  const response = await fetch(`${NOAA_API}?zone=${zoneParam}&severity=Moderate,Severe,Extreme`);

  if (!response.ok) {
    throw new Error(`NOAA API error: ${response.status}`);
  }

  const data = await response.json();
  return data.features || [];
}

function parseAlerts(features) {
  return features
    .filter(f => STORM_EVENTS.includes(f.properties.event))
    .map(f => {
      const ugcCodes = f.properties.geocode?.UGC || [];
      const affectedZones = ugcCodes
        .filter(code => ZONE_MAP[code])
        .flatMap(code => ZONE_MAP[code]);

      return {
        event: f.properties.event,
        severity: f.properties.severity,
        urgency: f.properties.urgency,
        headline: f.properties.headline,
        description: f.properties.description,
        onset: f.properties.onset,
        expires: f.properties.expires,
        affected_zones: [...new Set(affectedZones)],
        noaa_zones: ugcCodes.filter(code => MONITORED_ZONES.includes(code)),
        id: f.properties.id
      };
    })
    .filter(a => a.affected_zones.length > 0);
}

async function getAffectedClients(env, zones) {
  const zoneFormula = zones.map(z => `{Zone} = '${z}'`).join(', ');
  const formula = `AND({Status} = 'Active', OR(${zoneFormula}))`;

  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Clients?filterByFormula=${encodeURIComponent(formula)}`,
    {
      headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` }
    }
  );

  const data = await response.json();
  return data.records || [];
}

async function generateStormAdvisory(env, alert) {
  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate a client storm advisory. Alert: ${alert.event}. Severity: ${alert.severity}. Affected zones: ${alert.affected_zones.join(', ')}. Onset: ${alert.onset}. Include pre-storm service availability at $295/event and post-storm inspection at $500/event. Remind clients of complimentary first inspection if not yet scheduled. Close with property damage risk frame.`,
      module_override: 'MODULE_B'
    })
  });

  const data = await response.json();
  return data.output;
}

async function createStormServiceRecords(env, clients, alert) {
  const records = clients.map(client => ({
    fields: {
      'Client': client.fields.Name,
      'Zone': client.fields.Zone,
      'Alert Type': alert.event,
      'Severity': alert.severity,
      'Pre-Storm Status': 'Notified',
      'Post-Storm Inspection': 'Scheduled',
      'Pre-Storm Revenue': '$295',
      'Post-Storm Revenue': '$500',
      'Alert Onset': alert.onset,
      'Created': new Date().toISOString()
    }
  }));

  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  for (const batch of batches) {
    await fetch(`${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Storm%20Service%20Queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: batch })
    });
  }
}

async function notifySlack(env, alert, clientCount) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#operations',
      text: `STORM ALERT | ${alert.event} | ${alert.severity} | Zones: ${alert.affected_zones.join(', ')} | ${clientCount} clients notified | Pre-storm + post-storm services queued | Onset: ${alert.onset}`
    })
  });
}

export async function runStormMonitor(env) {
  const features = await fetchActiveAlerts();
  const alerts = parseAlerts(features);

  if (alerts.length === 0) {
    return { status: 'clear', message: 'No active storm alerts for Treasure Coast zones' };
  }

  const results = [];

  for (const alert of alerts) {
    const clients = await getAffectedClients(env, alert.affected_zones);
    const advisory = await generateStormAdvisory(env, alert);
    await createStormServiceRecords(env, clients, alert);
    await notifySlack(env, alert, clients.length);

    results.push({
      alert: alert.event,
      zones: alert.affected_zones,
      clients_notified: clients.length,
      advisory_generated: true
    });
  }

  return { status: 'alerts_processed', alerts: results };
}

export { fetchActiveAlerts, parseAlerts, ZONE_MAP, MONITORED_ZONES };
