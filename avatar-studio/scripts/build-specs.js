#!/usr/bin/env node
/**
 * Build all avatar specs: validate, emit JSON, emit pasteable prompt.
 *
 * Usage: node avatar-studio/scripts/build-specs.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildAvatarSpec, renderPrompt } = require('../../lib/avatar-spec');

const SPEC_DIR = path.join(__dirname, '..', 'specs');
const PROMPT_DIR = path.join(__dirname, '..', 'prompts');
const JSON_OUT_DIR = path.join(__dirname, '..', 'specs', 'built');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function main() {
  ensureDir(PROMPT_DIR);
  ensureDir(JSON_OUT_DIR);

  const entries = fs.readdirSync(SPEC_DIR)
    .filter((f) => f.endsWith('.config.js'))
    .sort();

  const results = [];
  for (const entry of entries) {
    const configPath = path.join(SPEC_DIR, entry);
    const config = require(configPath);
    const spec = buildAvatarSpec(config);
    const prompt = renderPrompt(spec);

    const base = entry.replace(/\.config\.js$/, '');
    const jsonPath = path.join(JSON_OUT_DIR, `${base}.json`);
    const promptPath = path.join(PROMPT_DIR, `${base}.prompt.md`);

    fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2));
    fs.writeFileSync(promptPath, prompt);
    results.push({ id: spec.id, jsonPath, promptPath });
    console.log(`[built] ${spec.id}`);
    console.log(`        json   -> ${path.relative(process.cwd(), jsonPath)}`);
    console.log(`        prompt -> ${path.relative(process.cwd(), promptPath)}`);
  }

  const indexPath = path.join(JSON_OUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    generated: new Date().toISOString(),
    count: results.length,
    specs: results.map((r) => ({ id: r.id, json: path.relative(path.dirname(indexPath), r.jsonPath) })),
  }, null, 2));
  console.log(`\n[index] ${results.length} spec(s) -> ${path.relative(process.cwd(), indexPath)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('avatar-studio build failed:', err.message);
    process.exit(1);
  }
}

module.exports = { main };
