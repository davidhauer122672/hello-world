/**
 * Leads Routes — CRUD + AI enrichment for the Leads table (tblpNasm0AxreRqLW).
 *
 *   POST /v1/leads        — Create a new lead
 *   GET  /v1/leads/:id    — Fetch a lead by Airtable record ID
 *   POST /v1/leads/enrich — AI-generate battle plan + segment analysis for a lead
 */

import { createRecord, getRecord, updateRecord, TABLES } from '../services/airtable.js';
import { inference } from '../services/anthropic.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * POST /v1/leads/public — Create a lead from the public website contact form.
 * No auth required. Rate-limited by IP. Accepts simple JSON body.
 */
export async function handlePublicLead(request, env, ctx) {
  let body;
  try { body = await request.json(); }
  catch { return errorResponse('Request body must be valid JSON.', 400); }

  const name = sanitize(body.name, 200);
  const email = sanitize(body.email, 200);
  const phone = sanitize(body.phone, 30);
  const zone = sanitize(body.zone, 100);
  const message = sanitize(body.message, 5000);

  if (!name && !email && !phone) {
    return errorResponse('At least one of name, email, or phone is required.', 400);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email format.', 400);
  }

  if (phone && phone.replace(/\D/g, '').length < 10) {
    return errorResponse('Phone number must have at least 10 digits.', 400);
  }

  const fields = {
    'Lead Name': name,
    'Email': email,
    'Phone Number': phone,
    'Service Zone': zone,
    'Inquiry Notes': message,
    'Lead Source': { name: 'Website' },
    'Status': { name: 'New' },
    'Date Captured': new Date().toISOString().split('T')[0],
    'Audit Trail/Activity Log': `${new Date().toISOString()} — Website inquiry submitted via coastalkey-pm.com contact form.`,
  };

  const record = await createRecord(env, TABLES.LEADS, fields);

  writeAudit(env, ctx, {
    route: '/v1/leads/public',
    action: 'create',
    recordId: record.id,
    leadName: name,
    source: 'website',
  });

  return jsonResponse({ success: true, id: record.id }, 201);
}

/**
 * POST /v1/leads — Create a new lead.
 * Body: Airtable field name → value map.
 */
export async function handleCreateLead(request, env, ctx) {
  const body = await request.json();

  if (!body.fields || typeof body.fields !== 'object') {
    return errorResponse('Request body must contain a "fields" object.', 400);
  }

  // Default status to "New" if not provided
  if (!body.fields['Status']) {
    body.fields['Status'] = { name: 'New' };
  }

  // Default date captured to today
  if (!body.fields['Date Captured']) {
    body.fields['Date Captured'] = new Date().toISOString().split('T')[0];
  }

  const record = await createRecord(env, TABLES.LEADS, body.fields);

  writeAudit(env, ctx, {
    route: '/v1/leads',
    action: 'create',
    recordId: record.id,
    leadName: body.fields['Lead Name'] || 'unnamed',
  });

  return jsonResponse({ success: true, record }, 201);
}

/**
 * GET /v1/leads/:id — Fetch a lead by record ID.
 */
export async function handleGetLead(recordId, env) {
  if (!recordId || !recordId.startsWith('rec')) {
    return errorResponse('Invalid record ID. Must start with "rec".', 400);
  }

  const record = await getRecord(env, TABLES.LEADS, recordId);
  return jsonResponse({ record });
}

/**
 * POST /v1/leads/enrich — AI-enrich a lead with battle plan + analysis.
 *
 * Body:
 *   recordId (string, required) — Airtable record ID of the lead
 *   type     (string, optional) — "battle_plan" | "investor_analysis" | "segment_analysis"
 */
export async function handleEnrichLead(request, env, ctx) {
  const body = await request.json();

  if (!body.recordId) {
    return errorResponse('"recordId" is required.', 400);
  }

  // Fetch current lead data
  const lead = await getRecord(env, TABLES.LEADS, body.recordId);
  const fields = lead.fields;
  const enrichType = body.type || 'battle_plan';

  const leadContext = [
    `Lead Name: ${fields['Lead Name'] || 'Unknown'}`,
    `Phone: ${fields['Phone Number'] || 'N/A'}`,
    `Email: ${fields['Email'] || 'N/A'}`,
    `Segment: ${fields['Sentinel Segment'] || 'Not classified'}`,
    `Service Zone: ${fields['Service Zone'] || 'N/A'}`,
    `Property Address: ${fields['Property Address'] || 'N/A'}`,
    `Property Value: ${fields['Property Value'] || 'N/A'}`,
    `Call Disposition: ${fields['Call Disposition'] || 'N/A'}`,
    `Sequence Step: ${fields['Sequence Step'] || 'N/A'}`,
    `Inquiry Notes: ${(fields['Inquiry Notes'] || '').slice(0, 2000)}`,
  ].join('\n');

  let system, prompt;

  if (enrichType === 'battle_plan') {
    system = `You are SCAA-1, the Sentinel Campaign Acquisition Architect for Coastal Key Property Management. You create hyper-personalized outbound sales battle plans for the Treasure Coast luxury property management market. Your outputs are concise, actionable, and designed for a human closer to execute within 48 hours.`;
    prompt = `Generate a SCAA-1 Battle Plan for this lead. Include: (1) Opening hook tailored to their segment, (2) Three key value propositions specific to their property/zone, (3) Objection handling for top 3 likely objections, (4) Recommended next action and timeline, (5) Email draft for follow-up.\n\nLead Data:\n${leadContext}`;
  } else if (enrichType === 'investor_analysis') {
    system = `You are the Coastal Key Investor Relations AI. You analyze property investment opportunities on the Treasure Coast and create compelling investor-grade summaries. Focus on ROI, market position, and competitive advantages.`;
    prompt = `Create an investor presentation recommendation for this lead. Include: (1) Investment thesis, (2) Market analysis for their service zone, (3) Projected ROI framework, (4) Competitive positioning vs local providers, (5) Recommended presentation template.\n\nLead Data:\n${leadContext}`;
  } else {
    system = `You are the Coastal Key Segment Analyst. You classify and analyze leads for the Treasure Coast property management market. Your analysis drives personalized outreach sequences.`;
    prompt = `Provide a segment analysis for this lead. Include: (1) Segment confirmation or reclassification with reasoning, (2) Pain point mapping, (3) Decision timeline estimate, (4) Recommended sequence modifications, (5) Cross-sell opportunities.\n\nLead Data:\n${leadContext}`;
  }

  const result = await inference(env, {
    system,
    prompt,
    tier: enrichType === 'investor_analysis' ? 'advanced' : 'standard',
    maxTokens: 3000,
    cacheKey: `enrich:${body.recordId}:${enrichType}`,
    cacheTtl: 7200,
  });

  // Write enrichment back to the lead record
  const updateFields = {};
  if (enrichType === 'battle_plan') {
    const auditAppend = `\n[${new Date().toISOString()}] SCAA-1 Battle Plan generated via ck-api-gateway. Model: ${result.model}. Cached: ${result.cached}.`;
    updateFields['Audit Trail/Activity Log'] = (fields['Audit Trail/Activity Log'] || '') + auditAppend;
  } else if (enrichType === 'investor_analysis') {
    const auditAppend = `\n[${new Date().toISOString()}] Investor analysis generated. Model: ${result.model}.`;
    updateFields['Audit Trail/Activity Log'] = (fields['Audit Trail/Activity Log'] || '') + auditAppend;
  }

  if (Object.keys(updateFields).length > 0) {
    ctx.waitUntil(
      updateRecord(env, TABLES.LEADS, body.recordId, updateFields)
        .catch(err => console.error('Lead update failed:', err))
    );
  }

  // Log to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Sentinel: ${enrichType} — ${fields['Lead Name'] || 'Unknown'} — ${new Date().toISOString()}`,
      'Module': { name: 'Sentinel' },
      'Request Type': { name: enrichType },
      'Input Brief': leadContext.slice(0, 10000),
      'Output Text': result.content.slice(0, 10000),
      'Model Used': { name: result.model },
      'Timestamp': new Date().toISOString(),
      'Status': { name: 'Completed' },
      'Leads': [body.recordId],
    }).catch(err => console.error('AI Log write failed:', err))
  );

  writeAudit(env, ctx, {
    route: '/v1/leads/enrich',
    enrichType,
    recordId: body.recordId,
    model: result.model,
    cached: result.cached,
  });

  return jsonResponse({
    enrichment: result.content,
    type: enrichType,
    model: result.model,
    cached: result.cached,
    recordId: body.recordId,
  });
}

function sanitize(value, maxLen) {
  if (value == null) return '';
  return String(value).trim().slice(0, maxLen).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
