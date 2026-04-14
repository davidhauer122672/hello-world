#!/usr/bin/env node

/**
 * Initialize Data Files
 *
 * Creates the data/ directory and all required JSON seed files if they
 * don't already exist. Run this before first server start or include in
 * deployment buildCommand to ensure all subsystems start with valid state.
 *
 * Files created:
 *   - data/appointments.json
 *   - data/ceo-standup-log.json
 *   - data/content-calendar.json
 *   - data/drip-sequences.json
 *   - data/visual-briefs.json
 *   - data/call-logs.json
 *   - data/ai-log.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const SEED_FILES = [
  'appointments.json',
  'ceo-standup-log.json',
  'content-calendar.json',
  'drip-sequences.json',
  'visual-briefs.json',
  'call-logs.json',
  'ai-log.json',
];

function init() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[init-data] Created data directory: ${DATA_DIR}`);
  }

  let created = 0;
  let existed = 0;

  for (const file of SEED_FILES) {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, '[]', 'utf8');
      console.log(`[init-data] Created: data/${file}`);
      created++;
    } else {
      existed++;
    }
  }

  console.log(`[init-data] Done — ${created} created, ${existed} already existed`);
}

init();
