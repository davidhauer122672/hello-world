/**
 * AI Automation Agency — Workforce Management System
 *
 * Treats every AI workflow as a labor unit on the org chart.
 * Each unit has: job description, cost, output volume, review cadence, escalation rule.
 *
 * Routes:
 *   GET  /v1/ai-agency/dashboard       — Agency overview: all units, cost, output
 *   GET  /v1/ai-agency/units           — List all AI workforce units
 *   GET  /v1/ai-agency/units/:id       — Single unit detail + performance
 *   POST /v1/ai-agency/units/:id/review — Log a weekly review for a unit
 *   GET  /v1/ai-agency/board-memo      — Generate quarterly AI EBITDA board memo
 *   GET  /v1/ai-agency/sop/:id         — SOP for a unit (manual fallback procedure)
 *   POST /v1/ai-agency/onboard         — Onboard a new AI workforce unit
 */

import { inference } from '../services/anthropic.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const AI_WORKFORCE = {
  'AWU-001': {
    id: 'AWU-001',
    name: 'Sentinel Standard Report Generator',
    status: 'operational',
    deployed: '2026-05-04',
    division: 'OPS',
    manager: 'David Hauer, CEO',
    job_description: 'Converts field inspection notes and photo metadata into complete 47-checkpoint Sentinel Standard inspection reports via Claude.',
    input: 'Field notes (text), photo metadata (filename + description)',
    output: 'Structured JSON report with 47 checkpoints across 8 zones, findings triage, recommended actions, owner-facing narrative',
    endpoint: 'POST /v1/sentinel/generate-report',
    model: 'claude-sonnet-4-6',
    cost: {
      per_unit: '$0.50-1.00',
      monthly_estimate: '$15-30',
      basis: '30 inspections/month at ~2K input + 4K output tokens each',
    },
    output_volume: {
      weekly: '7-15 reports',
      monthly: '30-60 reports',
    },
    hours_saved: {
      per_door_per_month: '0.75-1.5',
      annual_at_50_doors: '450-900 hours',
    },
    revenue_impact: 'Faster owner delivery → higher renewal rate. 5% retention improvement = $9K ARR at 50 doors.',
    review_cadence: 'Weekly — CEO reviews WARNING/CRITICAL findings',
    escalation_rule: 'CRITICAL findings → Slack #ops-alerts + owner notification within 1 hour',
    sop: {
      manual_fallback: 'Inspector fills paper checklist template (47 items). Office staff types into report template (Word). CEO reviews. Sent to owner via email. Time: 45-90 minutes per report.',
      dependencies: ['Claude API (Anthropic)', 'Airtable (storage)', 'Slack (escalation)'],
      failure_mode: 'If Claude API is down, queue field notes in Airtable with status PENDING_REPORT. Process when API returns. Owner notification delayed but not lost.',
    },
    kpis: {
      report_generation_time: { target: '<30 seconds', unit: 'seconds' },
      grounding_accuracy: { target: '100% — no hallucinated observations', unit: 'percent' },
      owner_delivery_within_24h: { target: '95%', unit: 'percent' },
      critical_escalation_time: { target: '<1 hour', unit: 'minutes' },
    },
    reviews: [],
  },

  'AWU-002': {
    id: 'AWU-002',
    name: 'Owner Monthly Statement Narrator',
    status: 'planned',
    deployed: null,
    division: 'FIN',
    manager: 'David Hauer, CEO',
    job_description: 'Generates professional monthly property statement narratives from financial data, inspection summaries, and vendor activity logs.',
    input: 'Monthly financial data (revenue, expenses, net), inspection count, vendor invoices, maintenance tickets resolved',
    output: 'Professional 200-400 word narrative summarizing the month\'s activity, financials, and upcoming items',
    endpoint: 'POST /v1/ai-agency/units/AWU-002/execute (planned)',
    model: 'claude-sonnet-4-6',
    cost: {
      per_unit: '$0.15-0.30',
      monthly_estimate: '$8-15',
      basis: '50 statements/month at ~1K input + 1K output tokens',
    },
    output_volume: {
      weekly: 'N/A — monthly cycle',
      monthly: '50 statements',
    },
    hours_saved: {
      per_door_per_month: '0.25-0.5',
      annual_at_50_doors: '150-300 hours',
    },
    revenue_impact: 'Owner retention. Fewer support questions. Professional appearance → referral generation.',
    review_cadence: 'Monthly — CEO spot-checks 5 random statements before batch send',
    escalation_rule: 'Any statement with negative net income flagged for CEO review before send',
    sop: {
      manual_fallback: 'Bookkeeper pulls financials from Airtable. CEO writes narrative paragraph. Merged into PDF template. Time: 15-25 minutes per statement.',
      dependencies: ['Claude API', 'Airtable (financial data)', 'PDF generation'],
      failure_mode: 'If Claude is down, send statement with financials only (no narrative). Flag for follow-up.',
    },
    kpis: {
      statements_generated: { target: '50/month', unit: 'count' },
      ceo_review_pass_rate: { target: '95%', unit: 'percent' },
      owner_satisfaction: { target: 'No complaints re: accuracy', unit: 'qualitative' },
    },
    reviews: [],
  },

  'AWU-003': {
    id: 'AWU-003',
    name: 'Inbound Lead Qualifier',
    status: 'planned',
    deployed: null,
    division: 'SEN',
    manager: 'David Hauer, CEO',
    job_description: 'Qualifies inbound leads from website, MCP server, and referrals. Scores by property value, service tier fit, geographic match, and urgency. Routes to appropriate response cadence.',
    input: 'Lead data (name, email, phone, property address, source, notes)',
    output: 'Lead score (1-100), tier recommendation, response priority (immediate/same-day/standard), enrichment notes',
    endpoint: 'POST /v1/ai-agency/units/AWU-003/execute (planned)',
    model: 'claude-sonnet-4-6',
    cost: {
      per_unit: '$0.10-0.20',
      monthly_estimate: '$5-10',
      basis: '50 leads/month at ~500 input + 500 output tokens',
    },
    output_volume: {
      weekly: '10-15 leads',
      monthly: '40-60 leads',
    },
    hours_saved: {
      per_lead: '0.5-1.0 hours',
      annual_at_50_leads_month: '300-600 hours',
    },
    revenue_impact: 'Faster speed-to-lead → higher conversion. 10% conversion improvement at $300 MRR avg = $18K ARR.',
    review_cadence: 'Weekly — review lead scores vs actual conversion outcomes',
    escalation_rule: 'Score >80 with Premium/FAM tier fit → immediate Slack + SMS to CEO',
    sop: {
      manual_fallback: 'CEO reviews each lead email/form manually. Google property address. Estimate tier. Reply within business hours. Time: 15-30 minutes per lead.',
      dependencies: ['Claude API', 'Airtable (Leads table)', 'Slack (#sales-alerts)'],
      failure_mode: 'If Claude is down, all leads default to "standard" priority. CEO reviews manually within 4 hours.',
    },
    kpis: {
      qualification_time: { target: '<10 seconds', unit: 'seconds' },
      score_accuracy: { target: '80% correlation with conversion outcome', unit: 'percent' },
      speed_to_first_response: { target: '<30 minutes for high-score leads', unit: 'minutes' },
    },
    reviews: [],
  },

  'AWU-004': {
    id: 'AWU-004',
    name: 'Vendor Compliance Verifier',
    status: 'planned',
    deployed: null,
    division: 'VEN',
    manager: 'David Hauer, CEO',
    job_description: 'Verifies vendor onboarding documents (W-9, COI, license) for completeness and expiry. Flags gaps. Sends renewal reminders 30 days before expiry.',
    input: 'Vendor record with document metadata (type, upload date, expiry date)',
    output: 'Compliance status (compliant/gap/expiring), missing documents list, renewal reminders',
    endpoint: 'POST /v1/ai-agency/units/AWU-004/execute (planned)',
    model: 'claude-haiku-4-5-20251001',
    cost: {
      per_unit: '$0.02-0.05',
      monthly_estimate: '$2-5',
      basis: '100 vendor checks/month at minimal tokens (structured data check)',
    },
    output_volume: {
      weekly: '5-10 vendor checks + renewal scans',
      monthly: '20-40 vendor verifications',
    },
    hours_saved: {
      per_vendor: '0.5-1.0 hours',
      annual_at_30_vendors: '180-360 hours',
    },
    revenue_impact: 'E&O exposure reduction. Compliance documentation for insurance. Audit readiness.',
    review_cadence: 'Monthly — review all vendor compliance gaps',
    escalation_rule: 'Expired COI → immediate Slack #ops-alerts. Vendor suspended from dispatch until resolved.',
    sop: {
      manual_fallback: 'Office manager maintains spreadsheet of vendor docs. Manual calendar reminders for renewals. Time: 30-60 minutes per new vendor, 10 minutes per renewal check.',
      dependencies: ['Airtable (Vendors table)', 'Slack (#ops-alerts)'],
      failure_mode: 'Monthly manual audit of all vendor records. No vendor dispatched without current COI.',
    },
    kpis: {
      compliance_rate: { target: '100% — no dispatches to non-compliant vendors', unit: 'percent' },
      renewal_reminder_lead_time: { target: '30 days before expiry', unit: 'days' },
      gap_detection_accuracy: { target: '100%', unit: 'percent' },
    },
    reviews: [],
  },

  'AWU-005': {
    id: 'AWU-005',
    name: 'Storm Documentation Packager',
    status: 'planned',
    deployed: null,
    division: 'OPS',
    manager: 'David Hauer, CEO',
    job_description: 'Generates pre-storm preparation checklists and post-storm assessment documentation packages from field notes, photos, and weather data. Formats for insurance submission.',
    input: 'Property data, storm name/date, pre/post inspection notes, photo inventory',
    output: 'Insurance-grade documentation package: timestamped photos index, damage assessment, remediation recommendations, claim support narrative',
    endpoint: 'POST /v1/ai-agency/units/AWU-005/execute (planned)',
    model: 'claude-sonnet-4-6',
    cost: {
      per_unit: '$1.00-2.00',
      monthly_estimate: '$5-20 (episodic)',
      basis: 'Storm events are seasonal. 5-10 properties per event.',
    },
    output_volume: {
      weekly: 'Episodic — 0 in calm weather, 5-10 during named storms',
      monthly: '0-20 packages',
    },
    hours_saved: {
      per_property_per_event: '2-4 hours',
      per_storm_at_50_doors: '100-200 hours',
    },
    revenue_impact: 'Insurance recovery speed. Brand differentiation ("storm-ready"). Owner trust during crisis.',
    review_cadence: 'Post-event — CEO reviews all packages before submission',
    escalation_rule: 'CRITICAL damage → immediate Slack #ops-alerts + owner phone call',
    sop: {
      manual_fallback: 'Inspector documents damage with phone photos. CEO writes assessment narrative. Compiled into PDF with timestamps. Submitted to insurer. Time: 2-4 hours per property.',
      dependencies: ['Claude API', 'Airtable', 'R2 (photo storage)'],
      failure_mode: 'Manual documentation per SOP. Photos still captured; narrative written by CEO.',
    },
    kpis: {
      package_generation_time: { target: '<5 minutes', unit: 'minutes' },
      insurance_submission_within: { target: '48 hours of all-clear', unit: 'hours' },
      claim_support_completeness: { target: '100% — all required fields populated', unit: 'percent' },
    },
    reviews: [],
  },

  'AWU-006': {
    id: 'AWU-006',
    name: 'Maintenance Ticket Triage',
    status: 'planned',
    deployed: null,
    division: 'OPS',
    manager: 'David Hauer, CEO',
    job_description: 'Triages inbound maintenance requests by urgency, category, and vendor match. Auto-dispatches routine items. Escalates emergencies.',
    input: 'Maintenance request (description, property, photos, reporter)',
    output: 'Triage: urgency (emergency/urgent/routine), category (plumbing/electrical/HVAC/general), recommended vendor, estimated response time',
    endpoint: 'POST /v1/ai-agency/units/AWU-006/execute (planned)',
    model: 'claude-haiku-4-5-20251001',
    cost: {
      per_unit: '$0.03-0.08',
      monthly_estimate: '$3-8',
      basis: '100 tickets/month at minimal tokens',
    },
    output_volume: {
      weekly: '20-30 tickets',
      monthly: '80-120 tickets',
    },
    hours_saved: {
      per_ticket: '0.25-0.5 hours',
      annual_at_100_tickets_month: '300-600 hours',
    },
    revenue_impact: 'Faster resolution → lower vacancy days. Owner satisfaction. Vendor efficiency.',
    review_cadence: 'Weekly — review triage accuracy and response times',
    escalation_rule: 'Emergency (water leak, no AC in summer, security breach) → immediate dispatch + Slack + owner notification',
    sop: {
      manual_fallback: 'CEO/office manager reads each request. Categorizes. Calls appropriate vendor. Time: 10-20 minutes per ticket.',
      dependencies: ['Claude API', 'Airtable (Maintenance table)', 'Slack'],
      failure_mode: 'All tickets default to "urgent" queue. Manual triage within 2 hours.',
    },
    kpis: {
      triage_time: { target: '<15 seconds', unit: 'seconds' },
      category_accuracy: { target: '90%', unit: 'percent' },
      emergency_detection_rate: { target: '100% — zero missed emergencies', unit: 'percent' },
    },
    reviews: [],
  },

  'AWU-007': {
    id: 'AWU-007',
    name: 'Lease Redlining Assistant',
    status: 'planned',
    deployed: null,
    division: 'FIN',
    manager: 'David Hauer, CEO',
    job_description: 'Reviews lease documents against Coastal Key playbook. Flags non-standard clauses, missing provisions, and liability exposure. Suggests redline edits.',
    input: 'Lease document text, property type, tenant profile',
    output: 'Clause-by-clause review with flags (standard/non-standard/missing/risk), suggested edits, summary of exposure',
    endpoint: 'POST /v1/ai-agency/units/AWU-007/execute (planned)',
    model: 'claude-opus-4-6',
    cost: {
      per_unit: '$2.00-5.00',
      monthly_estimate: '$10-25',
      basis: '5 leases/month at ~10K input + 3K output tokens on Opus',
    },
    output_volume: {
      weekly: '1-2 leases',
      monthly: '4-8 leases',
    },
    hours_saved: {
      per_lease: '1-2 hours',
      annual_at_5_leases_month: '60-120 hours',
    },
    revenue_impact: 'Legal cost reduction ($200-500/lease in attorney time). Downside containment.',
    review_cadence: 'Per-lease — CEO reviews every redline before execution',
    escalation_rule: 'Any clause flagged HIGH RISK → attorney review required before signing',
    sop: {
      manual_fallback: 'CEO reviews lease manually against checklist. Attorney reviews non-standard clauses. Time: 1-2 hours per lease + attorney fees.',
      dependencies: ['Claude API (Opus tier)'],
      failure_mode: 'All leases routed to attorney. No AI-only lease approval permitted.',
    },
    kpis: {
      review_time: { target: '<2 minutes', unit: 'minutes' },
      clause_detection_accuracy: { target: '95%', unit: 'percent' },
      attorney_escalation_rate: { target: '<20% of leases', unit: 'percent' },
    },
    reviews: [],
  },
};

// ── GET /v1/ai-agency/dashboard ─────────────────────────────────────

export function handleAgencyDashboard() {
  const units = Object.values(AI_WORKFORCE);
  const operational = units.filter(u => u.status === 'operational');
  const planned = units.filter(u => u.status === 'planned');

  const totalMonthlyCost = units.reduce((sum, u) => {
    const match = u.cost.monthly_estimate.match(/\$(\d+)-(\d+)/);
    return match ? sum + (parseInt(match[1]) + parseInt(match[2])) / 2 : sum;
  }, 0);

  const totalAnnualHoursSaved = units.reduce((sum, u) => {
    const key = Object.keys(u.hours_saved).find(k => k.includes('annual'));
    if (!key) return sum;
    const match = String(u.hours_saved[key]).match(/(\d+)-(\d+)/);
    return match ? sum + (parseInt(match[1]) + parseInt(match[2])) / 2 : sum;
  }, 0);

  return jsonResponse({
    agency: 'Coastal Key AI Automation Agency',
    doctrine: 'Every AI workflow is a labor unit. Job description. Cost. Output. Review. Escalation.',
    status: 'operational',
    workforce: {
      total_units: units.length,
      operational: operational.length,
      planned: planned.length,
      units: units.map(u => ({
        id: u.id,
        name: u.name,
        status: u.status,
        division: u.division,
        monthly_cost: u.cost.monthly_estimate,
        hours_saved: u.hours_saved,
      })),
    },
    economics: {
      total_monthly_ai_cost: `$${Math.round(totalMonthlyCost)}`,
      total_annual_hours_saved: `${Math.round(totalAnnualHoursSaved)} hours`,
      effective_hourly_rate: `$${(totalMonthlyCost * 12 / totalAnnualHoursSaved).toFixed(2)}/hour`,
      human_equivalent_cost: `$${Math.round(totalAnnualHoursSaved * 35)}/year at $35/hr`,
      ai_cost_vs_human: `${((totalMonthlyCost * 12) / (totalAnnualHoursSaved * 35) * 100).toFixed(1)}% of human cost`,
    },
    review_schedule: {
      weekly: 'CEO reviews operational unit output (WARNING/CRITICAL findings)',
      monthly: 'AI Workforce performance review (hours saved, errors, clean rate)',
      quarterly: 'AI EBITDA board memo (margin contribution, ROI, expansion plan)',
    },
    rule: 'No workflow ships to production without a paired SOP that a human can execute manually if AI is unavailable.',
    endpoints: [
      'GET  /v1/ai-agency/dashboard — This overview',
      'GET  /v1/ai-agency/units — All units with full detail',
      'GET  /v1/ai-agency/units/:id — Single unit',
      'POST /v1/ai-agency/units/:id/review — Log weekly review',
      'GET  /v1/ai-agency/board-memo — Quarterly AI EBITDA memo',
      'GET  /v1/ai-agency/sop/:id — Manual fallback SOP',
      'POST /v1/ai-agency/onboard — Register new unit',
    ],
  });
}

// ── GET /v1/ai-agency/units ─────────────────────────────────────────

export function handleListUnits(url) {
  const status = url?.searchParams?.get('status');
  let units = Object.values(AI_WORKFORCE);
  if (status) units = units.filter(u => u.status === status);

  return jsonResponse({
    count: units.length,
    units,
  });
}

// ── GET /v1/ai-agency/units/:id ─────────────────────────────────────

export function handleGetUnit(unitId) {
  const unit = AI_WORKFORCE[unitId.toUpperCase()];
  if (!unit) return errorResponse(`Unit ${unitId} not found.`, 404);
  return jsonResponse(unit);
}

// ── POST /v1/ai-agency/units/:id/review ─────────────────────────────

export async function handleUnitReview(request, unitId, env, ctx) {
  const unit = AI_WORKFORCE[unitId.toUpperCase()];
  if (!unit) return errorResponse(`Unit ${unitId} not found.`, 404);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  const review = {
    date: new Date().toISOString(),
    reviewer: body.reviewer || 'CEO',
    period: body.period || 'weekly',
    reports_generated: body.reports_generated || 0,
    errors_caught: body.errors_caught || 0,
    errors_missed: body.errors_missed || 0,
    hours_saved_estimate: body.hours_saved_estimate || 0,
    clean_rate: body.reports_generated > 0
      ? `${(((body.reports_generated - (body.errors_missed || 0)) / body.reports_generated) * 100).toFixed(1)}%`
      : 'N/A',
    notes: body.notes || '',
    disposition: body.disposition || 'satisfactory',
  };

  unit.reviews.push(review);

  writeAudit(env, ctx, {
    route: `/v1/ai-agency/units/${unitId}/review`,
    action: 'unit_review',
    unit_id: unitId,
    unit_name: unit.name,
    disposition: review.disposition,
  });

  return jsonResponse({ unit_id: unitId, review });
}

// ── GET /v1/ai-agency/board-memo ────────────────────────────────────

export async function handleBoardMemo(request, env, ctx) {
  const units = Object.values(AI_WORKFORCE);
  const operational = units.filter(u => u.status === 'operational');

  const prompt = `Generate a one-page quarterly board memo on AI's contribution to Coastal Key's operating margin.

AI Workforce Units (${units.length} total, ${operational.length} operational):
${units.map(u => `- ${u.id} ${u.name} [${u.status}]: ${u.cost.monthly_estimate}/month, saves ${JSON.stringify(u.hours_saved)}, impact: ${u.revenue_impact}`).join('\n')}

Format as a professional board memo with:
1. Executive Summary (2 sentences)
2. AI Workforce Cost Summary (table: unit, monthly cost, hours saved, effective rate)
3. Revenue and Margin Impact (quantified where possible)
4. Risk and Compliance Status (E&O coverage, audit trail, SOP coverage)
5. Next Quarter Plan (which planned units to activate, expected ROI)
6. Recommendation

Keep it under 500 words. No filler. Numbers-driven.`;

  try {
    const result = await inference(env, {
      system: 'You are a CFO writing a board memo for a property management firm. Professional, numbers-driven, no filler.',
      prompt,
      tier: 'standard',
      maxTokens: 2048,
    });

    writeAudit(env, ctx, {
      route: '/v1/ai-agency/board-memo',
      action: 'board_memo_generated',
      model: result.model,
    });

    return jsonResponse({
      type: 'quarterly_ai_ebitda_memo',
      generated: new Date().toISOString(),
      model: result.model,
      memo: result.content,
    });
  } catch (err) {
    return errorResponse(`Memo generation failed: ${err.message}`, 502);
  }
}

// ── GET /v1/ai-agency/sop/:id ───────────────────────────────────────

export function handleUnitSOP(unitId) {
  const unit = AI_WORKFORCE[unitId.toUpperCase()];
  if (!unit) return errorResponse(`Unit ${unitId} not found.`, 404);

  return jsonResponse({
    unit_id: unit.id,
    unit_name: unit.name,
    sop: {
      title: `Manual Fallback SOP: ${unit.name}`,
      purpose: `Procedure to execute ${unit.name} tasks manually when AI is unavailable.`,
      manual_procedure: unit.sop.manual_fallback,
      dependencies: unit.sop.dependencies,
      failure_mode: unit.sop.failure_mode,
      estimated_manual_time: unit.hours_saved,
      rule: 'This SOP must be executable by any trained staff member without AI assistance.',
    },
  });
}

// ── POST /v1/ai-agency/onboard ──────────────────────────────────────

export async function handleOnboardUnit(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  const required = ['name', 'division', 'job_description', 'monthly_cost_estimate', 'manual_fallback_sop'];
  const missing = required.filter(f => !body[f]);
  if (missing.length) return errorResponse(`Missing required fields: ${missing.join(', ')}`, 400);

  const id = `AWU-${String(Object.keys(AI_WORKFORCE).length + 1).padStart(3, '0')}`;

  const unit = {
    id,
    name: body.name,
    status: 'planned',
    deployed: null,
    division: body.division,
    manager: body.manager || 'David Hauer, CEO',
    job_description: body.job_description,
    input: body.input || 'TBD',
    output: body.output || 'TBD',
    endpoint: body.endpoint || `POST /v1/ai-agency/units/${id}/execute (planned)`,
    model: body.model || 'claude-sonnet-4-6',
    cost: {
      per_unit: body.cost_per_unit || 'TBD',
      monthly_estimate: body.monthly_cost_estimate,
      basis: body.cost_basis || 'TBD',
    },
    output_volume: body.output_volume || { weekly: 'TBD', monthly: 'TBD' },
    hours_saved: body.hours_saved || { per_unit: 'TBD' },
    revenue_impact: body.revenue_impact || 'TBD',
    review_cadence: body.review_cadence || 'Weekly — CEO review',
    escalation_rule: body.escalation_rule || 'TBD',
    sop: {
      manual_fallback: body.manual_fallback_sop,
      dependencies: body.dependencies || [],
      failure_mode: body.failure_mode || 'Manual execution per SOP.',
    },
    kpis: body.kpis || {},
    reviews: [],
  };

  AI_WORKFORCE[id] = unit;

  writeAudit(env, ctx, {
    route: '/v1/ai-agency/onboard',
    action: 'unit_onboarded',
    unit_id: id,
    unit_name: unit.name,
  });

  return jsonResponse({ onboarded: true, unit }, 201);
}
