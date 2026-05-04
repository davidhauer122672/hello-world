/**
 * Sentinel Standard Report Generator — AI Workforce Unit #1
 *
 * Job Description: Converts field inspection notes and photo metadata into
 * a complete Sentinel Standard inspection report across all 47 checkpoints.
 *
 * Routes:
 *   POST /v1/sentinel/generate-report  — Generate full report from field notes
 *   POST /v1/sentinel/generate-summary — Generate owner-facing summary from report
 *   GET  /v1/sentinel/workforce-status — AI Workforce unit status and metrics
 */

import { inference } from '../services/anthropic.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const SENTINEL_CHECKPOINTS = {
  exterior_perimeter: [
    'Roof condition — tiles, shingles, flashing',
    'Gutters and downspouts — clear, attached, draining',
    'Soffits and fascia — intact, no pest intrusion',
    'Windows and doors — sealed, no damage, locks engaged',
    'Landscaping — overgrowth, irrigation heads, drainage',
    'Irrigation system — controller, zones, leaks',
    'Driveway and walkways — cracks, settlement, debris',
    'Exterior lighting — operational, timers set',
  ],
  interior_climate: [
    'HVAC operation — cooling, heating, fan mode',
    'Thermostat — set point, battery, schedule',
    'Humidity — reading, dehumidifier status',
    'Air filters — condition, replacement date',
    'Ceiling fans — operational, direction',
    'Window treatments — position, condition',
    'Odor or mold indicators — visual, olfactory',
  ],
  plumbing: [
    'Faucets and fixtures — flow, drips, corrosion',
    'Toilets — fill, flush, base seal',
    'Water heater — temp, anode, relief valve',
    'Water softener — salt level, regeneration',
    'Dishwasher — door seal, drain, hose',
    'Washing machine — hoses, drain, lint',
  ],
  electrical: [
    'Circuit breaker panel — tripped breakers, labeling',
    'GFCI outlets — test/reset cycle',
    'Smoke detectors — test, battery date',
    'Carbon monoxide detectors — test, battery date',
    'Surge protectors — indicator lights, age',
    'Generator — fuel, start test, transfer switch',
  ],
  security: [
    'Alarm system — armed, battery, monitoring',
    'Locks — front, rear, garage, sliders',
    'Cameras — powered, recording, angles',
    'Motion sensors — battery, coverage',
    'Garage doors — operation, auto-reverse',
    'Safe room or secure storage — access verified',
  ],
  vehicle_boat: [
    'Garage inspection — no leaks, pests, standing water',
    'Battery tender — connected, charging indicator',
    'Tire pressure — within spec',
    'Registration and insurance — currency verified',
  ],
  pool_lanai: [
    'Pool pump and motor — running, pressure, noise',
    'Chemical balance — pH, chlorine, alkalinity',
    'Screen enclosure — tears, frame, door latch',
    'Pool furniture — condition, secured',
    'Lanai cleanliness — debris, mold, drainage',
    'Pool cover — position, condition',
  ],
  vendor_access: [
    'Vendor sign-in — log reviewed',
    'Work completion — verified against scope',
    'Key management — all keys accounted',
    'Invoice review — matched to work performed',
  ],
};

const ZONE_NAMES = {
  exterior_perimeter: 'Exterior Perimeter',
  interior_climate: 'Interior Climate',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  security: 'Security',
  vehicle_boat: 'Vehicle & Boat',
  pool_lanai: 'Pool & Lanai',
  vendor_access: 'Vendor Access Logs',
};

const TOTAL_CHECKPOINTS = Object.values(SENTINEL_CHECKPOINTS).flat().length;

const SYSTEM_PROMPT = `You are the Sentinel Standard Report Generator for Coastal Key Property Management.

You produce institutional-grade property inspection reports from field notes and photo metadata.

Rules:
1. Every claim must be grounded in the provided field notes or photo descriptions. Never invent observations.
2. If a checkpoint zone was not inspected, mark it "NOT INSPECTED — [reason]". Do not fabricate data.
3. Use precise, professional language. No exclamation points. No filler. Reading level: 9th grade.
4. Flag any finding rated WARNING or CRITICAL at the top of the report in a Findings Summary.
5. Each checkpoint gets one of: PASS, ADVISORY (minor, non-urgent), WARNING (needs attention within 30 days), CRITICAL (immediate action required), NOT INSPECTED.
6. Include photo references where provided (e.g., "[Photo 3: kitchen_faucet.jpg]").
7. End with a Recommended Actions section listing items by priority.

Output format: structured JSON with the following shape:
{
  "report_id": "SEN-YYYY-MM-DD-NNNN",
  "property_address": "...",
  "inspection_date": "YYYY-MM-DD",
  "inspector": "...",
  "findings_summary": { "critical": [...], "warning": [...], "advisory": [...] },
  "zones": {
    "zone_name": {
      "status": "PASS|ADVISORY|WARNING|CRITICAL",
      "checkpoints": [
        { "item": "...", "status": "PASS|ADVISORY|WARNING|CRITICAL|NOT INSPECTED", "observation": "...", "photo_ref": "..." }
      ]
    }
  },
  "recommended_actions": [
    { "priority": "CRITICAL|WARNING|ADVISORY", "action": "...", "deadline": "..." }
  ],
  "report_narrative": "A 2-3 paragraph owner-facing summary of the inspection."
}`;

const SUMMARY_SYSTEM_PROMPT = `You are the owner communications writer for Coastal Key Property Management.

You receive a structured Sentinel Standard inspection report and produce a professional, reassuring owner-facing summary email.

Rules:
1. Lead with the property address and inspection date.
2. State the overall status clearly: all clear, minor advisories, or items requiring attention.
3. If there are WARNING or CRITICAL findings, state them plainly with recommended next steps.
4. Close with "Your property is in our care. Every visit. Every time."
5. No exclamation points. No filler phrases. Professional and calm.
6. Under 300 words.`;

// ── POST /v1/sentinel/generate-report ───────────────────────────────

export async function handleGenerateReport(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  const { property_address, inspection_date, inspector, field_notes, photos } = body;

  if (!property_address || !field_notes) {
    return errorResponse('"property_address" and "field_notes" are required.', 400);
  }

  const date = inspection_date || new Date().toISOString().split('T')[0];
  const reportId = `SEN-${date}-${String(Date.now()).slice(-4)}`;

  const photoContext = photos && photos.length
    ? `\n\nPhoto metadata:\n${photos.map((p, i) => `Photo ${i + 1}: ${p.filename} — ${p.description || 'no description'}`).join('\n')}`
    : '';

  const prompt = `Generate a Sentinel Standard inspection report.

Property: ${property_address}
Date: ${date}
Inspector: ${inspector || 'Field Team'}
Report ID: ${reportId}

Field notes from the inspection:
${field_notes}${photoContext}

The Sentinel Standard has ${TOTAL_CHECKPOINTS} checkpoints across ${Object.keys(SENTINEL_CHECKPOINTS).length} zones:
${Object.entries(SENTINEL_CHECKPOINTS).map(([zone, items]) =>
    `${ZONE_NAMES[zone]} (${items.length} checks):\n${items.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}`
  ).join('\n\n')}

Generate the complete structured report. Ground every observation in the field notes. If a zone has no notes, mark checkpoints as NOT INSPECTED.`;

  try {
    const result = await inference(env, {
      system: SYSTEM_PROMPT,
      prompt,
      tier: 'standard',
      maxTokens: 4096,
    });

    let report;
    try {
      const content = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      report = JSON.parse(content);
    } catch {
      report = { raw_output: result.content, parse_error: true };
    }

    writeAudit(env, ctx, {
      route: '/v1/sentinel/generate-report',
      action: 'report_generated',
      report_id: reportId,
      property: property_address,
      model: result.model,
      cached: result.cached,
      checkpoints: TOTAL_CHECKPOINTS,
    });

    return jsonResponse({
      report_id: reportId,
      property_address,
      inspection_date: date,
      inspector: inspector || 'Field Team',
      total_checkpoints: TOTAL_CHECKPOINTS,
      zones: Object.keys(SENTINEL_CHECKPOINTS).length,
      model: result.model,
      report,
    });
  } catch (err) {
    return errorResponse(`Report generation failed: ${err.message}`, 502);
  }
}

// ── POST /v1/sentinel/generate-summary ──────────────────────────────

export async function handleGenerateSummary(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  const { report } = body;
  if (!report) return errorResponse('"report" object is required.', 400);

  try {
    const result = await inference(env, {
      system: SUMMARY_SYSTEM_PROMPT,
      prompt: `Generate the owner-facing summary for this inspection report:\n\n${JSON.stringify(report, null, 2)}`,
      tier: 'fast',
      maxTokens: 1024,
    });

    writeAudit(env, ctx, {
      route: '/v1/sentinel/generate-summary',
      action: 'summary_generated',
      report_id: report.report_id,
      model: result.model,
    });

    return jsonResponse({
      report_id: report.report_id,
      summary: result.content,
      model: result.model,
    });
  } catch (err) {
    return errorResponse(`Summary generation failed: ${err.message}`, 502);
  }
}

// ── GET /v1/sentinel/workforce-status ───────────────────────────────

export function handleSentinelWorkforceStatus() {
  return jsonResponse({
    unit: 'AI Workforce Unit #1',
    name: 'Sentinel Standard Report Generator',
    status: 'operational',
    version: '1.0.0',
    job_description: 'Converts field inspection notes and photo metadata into complete Sentinel Standard inspection reports across 47 checkpoints in 8 zones.',
    monthly_cost_estimate: '$15-30 (Claude API usage at ~$0.50-1.00 per report, 30 inspections/month)',
    weekly_output: '7-15 reports',
    review_cadence: 'Weekly — CEO reviews flagged WARNING/CRITICAL findings',
    escalation_rule: 'CRITICAL findings auto-escalate to Slack #ops-alerts and owner notification within 1 hour',
    capabilities: [
      'Field notes → structured 47-checkpoint report',
      'Photo metadata grounding (no hallucinated observations)',
      'Findings triage: PASS / ADVISORY / WARNING / CRITICAL',
      'Owner-facing summary generation (sub-300 words)',
      'Audit trail via AI Log',
    ],
    checkpoints: TOTAL_CHECKPOINTS,
    zones: Object.entries(ZONE_NAMES).map(([key, name]) => ({
      zone: name,
      checkpoints: SENTINEL_CHECKPOINTS[key].length,
    })),
    endpoints: [
      'POST /v1/sentinel/generate-report — Full report from field notes',
      'POST /v1/sentinel/generate-summary — Owner summary from report',
      'GET  /v1/sentinel/workforce-status — This status endpoint',
    ],
  });
}
