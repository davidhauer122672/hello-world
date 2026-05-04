const DERIVATIVE_TEMPLATE = [
  { asset: 1, label: 'Full script (original)', platform: 'YouTube' },
  { asset: 2, label: '60-second short-form hook cut', platform: 'Instagram' },
  { asset: 3, label: 'LinkedIn long-form article adaptation', platform: 'LinkedIn' },
  { asset: 4, label: 'Instagram carousel outline (5-7 slides)', platform: 'Instagram' },
  { asset: 5, label: 'Facebook post (short form, 150 words)', platform: 'Facebook' },
  { asset: 6, label: 'Email newsletter segment', platform: 'Email' },
  { asset: 7, label: 'Podcast talking point expansion', platform: 'Podcast' },
  { asset: 8, label: 'YouTube description and chapter breakdown', platform: 'YouTube' }
];

const SCHEDULE_SPREAD_DAYS = 14;

function generatePublishSchedule(derivativeCount) {
  const schedule = [];
  const baseDate = new Date();
  const interval = Math.floor(SCHEDULE_SPREAD_DAYS / derivativeCount);

  for (let i = 0; i < derivativeCount; i++) {
    const postDate = new Date(baseDate);
    postDate.setDate(postDate.getDate() + (i * interval));

    if (postDate.getDay() === 0) postDate.setDate(postDate.getDate() + 1);
    if (postDate.getDay() === 6) postDate.setDate(postDate.getDate() + 2);

    schedule.push({
      date: postDate.toISOString().split('T')[0],
      time: '10:00',
      day_offset: i * interval
    });
  }
  return schedule;
}

async function generateDerivatives(env, sourceTitle, sourceScript) {
  const response = await fetch(env.NEMOTRON_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Repurpose the following approved content into 8 derivative assets. Source title: ${sourceTitle}. Source script: ${sourceScript}. Generate all 8: ASSET_1: Full script (original). ASSET_2: 60-second short-form hook cut. ASSET_3: LinkedIn long-form article. ASSET_4: Instagram carousel (5-7 slides). ASSET_5: Facebook post (150 words). ASSET_6: Email newsletter segment. ASSET_7: Podcast talking points. ASSET_8: YouTube description and chapters.`,
      module_override: 'MODULE_C'
    })
  });
  const data = await response.json();
  return data.output;
}

function parseDerivatives(nemotronOutput) {
  const assets = [];
  const sections = nemotronOutput.split(/ASSET_\d+:/);

  for (let i = 1; i < sections.length && i <= 8; i++) {
    assets.push({
      ...DERIVATIVE_TEMPLATE[i - 1],
      content: sections[i].trim()
    });
  }
  return assets;
}

async function createContentCalendarEntries(env, assets, sourceTitle) {
  const schedule = generatePublishSchedule(assets.length);

  const records = assets.map((asset, i) => ({
    fields: {
      'Post Date': schedule[i].date,
      'Platform': asset.platform,
      'Caption': asset.content,
      'Content Pillar': 'Brand',
      'Status': 'Draft',
      'Notes': `Auto-syndicated from "${sourceTitle}" (Asset ${asset.asset} of 8: ${asset.label})`,
      'Source Type': 'Cross-Module Syndication'
    }
  }));

  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  for (const batch of batches) {
    await fetch(`${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Content%20Calendar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: batch })
    });
  }

  return { entries_created: records.length, schedule };
}

async function notifySlack(env, sourceTitle, assetCount, schedule) {
  const firstDate = schedule[0].date;
  const lastDate = schedule[schedule.length - 1].date;

  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#content-calendar',
      text: `CONTENT SYNDICATION COMPLETE | "${sourceTitle}" | ${assetCount} derivatives created | Scheduled: ${firstDate} to ${lastDate} | All posted as Draft for CEO review`
    })
  });
}

export async function runContentSyndication(env, sourceTitle, sourceScript) {
  const nemotronOutput = await generateDerivatives(env, sourceTitle, sourceScript);
  const assets = parseDerivatives(nemotronOutput);
  const result = await createContentCalendarEntries(env, assets, sourceTitle);
  await notifySlack(env, sourceTitle, assets.length, result.schedule);

  return {
    status: 'syndicated',
    source: sourceTitle,
    derivatives: assets.length,
    calendar_entries: result.entries_created,
    schedule: result.schedule
  };
}

export { DERIVATIVE_TEMPLATE, generatePublishSchedule };
