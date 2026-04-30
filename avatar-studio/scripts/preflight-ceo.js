#!/usr/bin/env node
'use strict';

// Preflight gate — validates that the CEO self-likeness source files listed
// in the built spec 04 exist on disk before any render call. The list of
// required files is derived from the spec itself (subject.selfInputs.sourceFiles)
// rather than hardcoded, so main's canonical CEO spec remains the source of
// truth. Build 04 aborts if any file is missing.
//
// Glob segments in the spec (e.g. "video-reference/*.mov") are handled by
// requiring at least one match in the parent directory.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BUILT_DIR = path.join(REPO_ROOT, 'avatar-studio', 'specs', 'built');
const DEFAULT_CEO_SPEC_BASENAME = '04-ceo-avatar.json';

function loadCeoSpec(basename) {
  const fp = path.join(BUILT_DIR, basename || DEFAULT_CEO_SPEC_BASENAME);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function resolveSourceFile(repoRoot, pattern) {
  const abs = path.isAbsolute(pattern) ? pattern : path.join(repoRoot, pattern);
  const base = path.basename(abs);
  if (base.includes('*')) {
    const dir = path.dirname(abs);
    if (!fs.existsSync(dir)) return { pattern, resolved: null, dir };
    const rx = new RegExp('^' + base.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    const hit = fs.readdirSync(dir).find((f) => rx.test(f));
    return { pattern, resolved: hit ? path.join(dir, hit) : null, dir };
  }
  return { pattern, resolved: fs.existsSync(abs) ? abs : null, dir: path.dirname(abs) };
}

function runPreflight({ ceoSpecBasename, repoRoot } = {}) {
  const root = repoRoot || REPO_ROOT;
  const spec = loadCeoSpec(ceoSpecBasename);
  if (!spec) {
    return {
      ok: false,
      specMissing: true,
      spec: null,
      results: [],
      missing: [{ pattern: ceoSpecBasename || DEFAULT_CEO_SPEC_BASENAME, resolved: null, dir: BUILT_DIR }],
    };
  }
  const patterns = (spec.subject && spec.subject.selfInputs && spec.subject.selfInputs.sourceFiles) || [];
  const results = patterns.map((p) => resolveSourceFile(root, p));
  const missing = results.filter((r) => !r.resolved);
  return { ok: missing.length === 0, specMissing: false, spec, results, missing };
}

function formatReport(report) {
  const lines = [];
  if (report.specMissing) {
    lines.push('CEO self-likeness preflight: built spec not found.');
    lines.push(`  Expected ${path.join('avatar-studio/specs/built', DEFAULT_CEO_SPEC_BASENAME)}`);
    lines.push('  Run `npm run avatar:build` first.');
    return lines.join('\n');
  }
  lines.push(`CEO self-likeness preflight: ${report.spec.id}`);
  for (const r of report.results) {
    if (r.resolved) {
      lines.push(`  OK   ${r.pattern} -> ${path.relative(REPO_ROOT, r.resolved)}`);
    } else {
      lines.push(`  FAIL ${r.pattern} (dir ${path.relative(REPO_ROOT, r.dir)})`);
    }
  }
  if (!report.ok) {
    lines.push('');
    lines.push('Build 04 (CEO self-likeness) requires every source file declared in');
    lines.push('subject.selfInputs.sourceFiles. The render pipeline must abort rather');
    lines.push('than substitute likeness from any other source.');
  }
  return lines.join('\n');
}

if (require.main === module) {
  const report = runPreflight();
  process.stdout.write(formatReport(report) + '\n');
  process.exit(report.ok ? 0 : 1);
}

module.exports = { runPreflight, formatReport, resolveSourceFile, BUILT_DIR, REPO_ROOT };
