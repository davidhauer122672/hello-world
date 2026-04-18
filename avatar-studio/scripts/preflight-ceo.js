#!/usr/bin/env node
'use strict';

// Preflight gate — validates that the CEO self-likeness source files exist in
// manus-documents/ceo/ before any render call. Build 04 (Master Orchestrator)
// aborts loudly if any required file is missing. Called automatically by
// avatar-studio/scripts/build.js and also runnable standalone.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CEO_DIR = path.join(REPO_ROOT, 'manus-documents', 'ceo');

const REQUIRED = [
  { name: 'Reference front portrait', patterns: ['reference-front.jpg', 'reference-front.jpeg', 'reference-front.png'] },
  { name: 'Reference side profile',   patterns: ['reference-side.jpg',  'reference-side.jpeg',  'reference-side.png'] },
  { name: 'Voice sample',              patterns: ['voice-sample.wav', 'voice-sample.mp3', 'voice-sample.m4a'] },
  { name: 'CEO bio',                   patterns: ['bio.md'] },
];

function firstExisting(dir, patterns) {
  for (const p of patterns) {
    const fp = path.join(dir, p);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

function runPreflight({ dir = CEO_DIR } = {}) {
  const results = [];
  let dirExists = fs.existsSync(dir);
  for (const entry of REQUIRED) {
    const found = dirExists ? firstExisting(dir, entry.patterns) : null;
    results.push({ name: entry.name, patterns: entry.patterns, found });
  }
  const missing = results.filter((r) => !r.found);
  return { dir, dirExists, results, missing, ok: dirExists && missing.length === 0 };
}

function formatReport(report) {
  const lines = [];
  lines.push(`CEO self-likeness preflight: ${report.dir}`);
  if (!report.dirExists) {
    lines.push(`  MISSING DIRECTORY: ${report.dir}`);
  }
  for (const r of report.results) {
    if (r.found) {
      lines.push(`  OK   ${r.name} -> ${path.relative(REPO_ROOT, r.found)}`);
    } else {
      lines.push(`  FAIL ${r.name} (accepted: ${r.patterns.join(', ')})`);
    }
  }
  if (!report.ok) {
    lines.push('');
    lines.push('Build 04 (Master Orchestrator) requires all CEO source files.');
    lines.push('Place them in manus-documents/ceo/ and re-run.');
  }
  return lines.join('\n');
}

if (require.main === module) {
  const report = runPreflight();
  process.stdout.write(formatReport(report) + '\n');
  process.exit(report.ok ? 0 : 1);
}

module.exports = { runPreflight, formatReport, REQUIRED, CEO_DIR };
