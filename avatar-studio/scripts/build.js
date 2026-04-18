#!/usr/bin/env node
'use strict';

// Build script — reads avatar-studio/specs/*.spec.json, runs content-policy,
// runs CEO preflight for specs that require self-likeness source files, and
// writes build artifacts to avatar-studio/build/. Exits non-zero on policy
// violation or preflight failure (used by CI regression guard).

const fs = require('fs');
const path = require('path');
const { checkSpec, formatViolations } = require('../lib/content-policy');
const { runPreflight, formatReport } = require('./preflight-ceo');

const STUDIO_ROOT = path.resolve(__dirname, '..');
const SPECS_DIR = path.join(STUDIO_ROOT, 'specs');
const BUILD_DIR = path.join(STUDIO_ROOT, 'build');

function loadSpecs() {
  if (!fs.existsSync(SPECS_DIR)) return [];
  return fs
    .readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith('.spec.json'))
    .sort()
    .map((f) => {
      const fp = path.join(SPECS_DIR, f);
      const raw = fs.readFileSync(fp, 'utf8');
      return { file: f, path: fp, spec: JSON.parse(raw) };
    });
}

function ensureBuildDir() {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Build semantics:
//   - content-policy violation   -> always fails the build (exit 1)
//   - preflight failure for 04   -> that spec is SKIPPED (render call blocked);
//                                   other specs still build, exit remains 0
//   - no specs at all             -> fails the build

function buildAll() {
  const loaded = loadSpecs();
  if (loaded.length === 0) {
    return {
      ok: false,
      built: [],
      policyViolations: [{ file: '<none>', violations: [{ kind: 'schema', missing: ['<no-specs>'] }] }],
      skipped: [],
      preflightReport: null,
    };
  }

  const policyViolations = [];
  const skipped = [];
  const eligible = [];
  let preflightReport = null;

  for (const { file, spec } of loaded) {
    const violations = checkSpec(spec);
    if (violations.length > 0) {
      policyViolations.push({ file, violations });
      continue;
    }
    if (spec.requires_ceo_source_files) {
      if (!preflightReport) preflightReport = runPreflight();
      if (!preflightReport.ok) {
        skipped.push({ file, reason: 'preflight-ceo: CEO source files missing' });
        continue;
      }
    }
    eligible.push({ file, spec });
  }

  if (policyViolations.length > 0) {
    return { ok: false, built: [], policyViolations, skipped, preflightReport };
  }

  ensureBuildDir();
  const built = [];
  for (const { file, spec } of eligible) {
    const outName = file.replace(/\.spec\.json$/, '.prompt.json');
    const outPath = path.join(BUILD_DIR, outName);
    fs.writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n');
    built.push({ file, spec, outPath });
  }
  return { ok: true, built, policyViolations, skipped, preflightReport };
}

if (require.main === module) {
  const result = buildAll();
  for (const v of result.policyViolations) {
    process.stderr.write(`\n${v.file}:\n${formatViolations(v.violations)}\n`);
  }
  if (result.preflightReport && !result.preflightReport.ok) {
    process.stderr.write('\n' + formatReport(result.preflightReport) + '\n');
  }
  for (const s of result.skipped) {
    process.stderr.write(`SKIPPED ${s.file}: ${s.reason}\n`);
  }
  if (!result.ok) {
    process.stderr.write(`\nBUILD FAILED (${result.policyViolations.length} spec(s) rejected by content policy)\n`);
    process.exit(1);
  }
  process.stdout.write(`avatar-studio: built ${result.built.length} spec(s), skipped ${result.skipped.length} -> ${path.relative(process.cwd(), BUILD_DIR)}\n`);
}

module.exports = { buildAll, loadSpecs, SPECS_DIR, BUILD_DIR };
