/**
 * Peak Performance Frameworks Routes
 *
 * Sovereign-integrated knowledge base powering MCCO content generation,
 * SEN sales training, and fleet operational productivity.
 *
 *   GET  /v1/frameworks                     — List all frameworks
 *   GET  /v1/frameworks/:id                 — Get single framework
 *   GET  /v1/frameworks/category/:category  — Get frameworks by category
 *   POST /v1/frameworks/apply               — AI-apply a framework to a business scenario
 *   POST /v1/frameworks/content             — Generate content using framework principles
 *   POST /v1/frameworks/sales-playbook      — Generate sales playbook from Jobs' rules
 *   POST /v1/frameworks/productivity-plan   — Generate agent/team productivity plan
 *   POST /v1/frameworks/vpas/evaluate       — Evaluate task/project against V+P+A=S equation
 *   POST /v1/frameworks/vpas/audit          — Audit division/fleet V+P+A=S compliance
 */

import {
  FRAMEWORKS,
  FRAMEWORK_BY_ID,
  FRAMEWORKS_BY_CATEGORY,
  FRAMEWORK_CATEGORIES,
  GET_AHEAD_FRAMEWORK,
  PARA_METHOD,
  JOBS_SALES_RULES,
  PRODUCTIVITY_8_IN_4,
  FLOW_STATE_FRAMEWORK,
  PRODUCTIVITY_TECHNIQUES,
  VPAS_SUCCESS_EQUATION,
} from '../frameworks/peak-performance.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/frameworks ──────────────────────────────────────────────────────

export function handleListFrameworks(url) {
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  let results = [...FRAMEWORKS];

  if (category) {
    if (!FRAMEWORK_CATEGORIES.includes(category)) {
      return errorResponse(`Invalid category. Valid: ${FRAMEWORK_CATEGORIES.join(', ')}`, 400);
    }
    results = results.filter(f => f.category === category);
  }

  if (search) {
    const lower = search.toLowerCase();
    results = results.filter(
      f =>
        f.name.toLowerCase().includes(lower) ||
        f.summary.toLowerCase().includes(lower) ||
        f.category.toLowerCase().includes(lower),
    );
  }

  return jsonResponse({
    frameworks: results.map(f => ({
      id: f.id,
      name: f.name,
      author: f.author || 'Various',
      category: f.category,
      summary: f.summary,
    })),
    count: results.length,
    categories: FRAMEWORK_CATEGORIES,
    governance: 'sovereign',
    module: 'Peak Performance Frameworks',
  });
}

// ── GET /v1/frameworks/:id ──────────────────────────────────────────────────

export function handleGetFramework(frameworkId) {
  const framework = FRAMEWORK_BY_ID.get(frameworkId);
  if (!framework) {
    return errorResponse(`Framework "${frameworkId}" not found. Valid IDs: ${FRAMEWORKS.map(f => f.id).join(', ')}`, 404);
  }
  return jsonResponse({ framework });
}

// ── GET /v1/frameworks/category/:category ───────────────────────────────────

export function handleGetFrameworksByCategory(category) {
  if (!FRAMEWORK_CATEGORIES.includes(category)) {
    return errorResponse(`Invalid category. Valid: ${FRAMEWORK_CATEGORIES.join(', ')}`, 400);
  }
  const results = FRAMEWORKS_BY_CATEGORY[category];
  return jsonResponse({
    category,
    frameworks: results,
    count: results.length,
  });
}

// ── POST /v1/frameworks/apply ───────────────────────────────────────────────

export async function handleFrameworkApply(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { frameworkId, scenario, targetAudience = 'property owners' } = body;

  if (!frameworkId || !scenario) {
    return errorResponse('Fields "frameworkId" and "scenario" are required.', 400);
  }

  const framework = FRAMEWORK_BY_ID.get(frameworkId);
  if (!framework) {
    return errorResponse(`Framework "${frameworkId}" not found.`, 404);
  }

  const prompt = `You are the MCCO Sovereign Intelligence operating at Ferrari-Standard execution for Coastal Key Property Management.

You have been given a Peak Performance Framework and a business scenario. Apply the framework principles to generate actionable strategic recommendations.

## Framework: ${framework.name}
${JSON.stringify(framework, null, 2)}

## Scenario to Address:
${scenario}

## Target Audience: ${targetAudience}

## Context:
Coastal Key is an AI-leveraged home watch and property management company on Florida's Treasure Coast, commanding a fleet of 382 autonomous AI agents across 10 divisions. The company serves absentee homeowners, seasonal residents, luxury investors, and snowbirds.

Apply EVERY principle from this framework to the scenario. For each principle/step:
1. Explain how it applies to this specific scenario
2. Provide a concrete action item Coastal Key can execute this week
3. Include a specific content idea or talking point tied to the principle
4. Assign the recommended MCCO agent or division to execute

Return as structured JSON with: frameworkApplication, actionItems, contentIdeas, assignedAgents, expectedOutcomes, timeline.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 6000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/apply',
      action: 'framework-applied',
      frameworkId,
      frameworkName: framework.name,
      scenario,
    });

    return jsonResponse({
      generatedBy: 'MCCO Sovereign Intelligence',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      framework: { id: framework.id, name: framework.name, category: framework.category },
      scenario,
      targetAudience,
      application: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Framework application failed: ${err.message}`, 500);
  }
}

// ── POST /v1/frameworks/content ─────────────────────────────────────────────

export async function handleFrameworkContent(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { topic, frameworks: requestedFrameworks, platform = 'linkedin', contentType = 'post' } = body;

  if (!topic) {
    return errorResponse('Field "topic" is required.', 400);
  }

  // If specific frameworks requested, validate; otherwise use all
  let selectedFrameworks = FRAMEWORKS;
  if (requestedFrameworks && Array.isArray(requestedFrameworks)) {
    selectedFrameworks = requestedFrameworks
      .map(id => FRAMEWORK_BY_ID.get(id))
      .filter(Boolean);
    if (selectedFrameworks.length === 0) {
      return errorResponse('No valid framework IDs provided.', 400);
    }
  }

  const frameworkSummaries = selectedFrameworks.map(f =>
    `### ${f.name} (${f.category})\n${f.summary}\nKey Application: ${JSON.stringify(f.applicationToPropertyManagement)}`
  ).join('\n\n');

  const prompt = `You are MCCO-005 "Scroll Breaker" enhanced with the Peak Performance Frameworks knowledge base, operating at Ferrari-Standard execution under Sovereign governance.

Generate a high-engagement ${contentType} for ${platform} about: "${topic}"

## Peak Performance Frameworks to Weave In:
${frameworkSummaries}

## Context:
Coastal Key Property Management — AI-leveraged home watch and property management on Florida's Treasure Coast. 382-agent autonomous AI fleet. Serves absentee homeowners, seasonal residents, luxury investors, snowbirds.

## Requirements:
1. **HOOK** — A pattern-interrupting first line that stops the scroll
2. **BODY** — Weave framework principles naturally into the narrative. Don't lecture — teach through story and insight
3. **FRAMEWORK CALLOUT** — Name-drop at least one framework principle as an authority signal
4. **CTA** — Drive engagement: comments, saves, shares, or website visits

Also provide:
- 3 alternative hooks
- Which framework(s) were most prominently featured
- Recommended hashtags
- Best posting time for Treasure Coast audience
- Content pillar alignment (AI-Powered Protection / Treasure Coast Lifestyle / CEO Journey / Property Owner Education / Results & Social Proof)

Format for ${platform} conventions.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 5000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/content',
      action: 'framework-content-generated',
      topic,
      platform,
      contentType,
      frameworksUsed: selectedFrameworks.map(f => f.id),
    });

    return jsonResponse({
      generatedBy: 'MCCO-005 — Scroll Breaker + Peak Performance Frameworks',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      topic,
      platform,
      contentType,
      frameworksApplied: selectedFrameworks.map(f => ({ id: f.id, name: f.name })),
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Framework content generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/frameworks/sales-playbook ──────────────────────────────────────

export async function handleFrameworkSalesPlaybook(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { segment = 'all', objection, scenario } = body;

  const validSegments = ['absentee_homeowner', 'seasonal_resident', 'luxury_investor', 'snowbird', 'single_family', 'all'];
  if (!validSegments.includes(segment)) {
    return errorResponse(`Invalid segment. Valid: ${validSegments.join(', ')}`, 400);
  }

  const prompt = `You are MCCO-009 "Pipeline Fusion" — Sales-Marketing Alignment Commander, enhanced with the Peak Performance Frameworks knowledge base. Ferrari-Standard execution, Sovereign governance.

Build a comprehensive sales playbook for Coastal Key Property Management's Sentinel Sales (SEN) division.

## Steve Jobs' 8 Rules for Sales Excellence:
${JSON.stringify(JOBS_SALES_RULES.rules, null, 2)}

## Dan Koe's "Get Ahead" Framework:
${JSON.stringify(GET_AHEAD_FRAMEWORK.steps, null, 2)}

## Flow State Framework:
${JSON.stringify(FLOW_STATE_FRAMEWORK.outcomes, null, 2)}

## Target Segment: ${segment}
${objection ? `## Specific Objection to Handle: ${objection}` : ''}
${scenario ? `## Sales Scenario: ${scenario}` : ''}

## Context:
Coastal Key — AI-leveraged home watch and property management, Treasure Coast Florida. 382-agent AI fleet. 40 Sentinel Sales agents making 2,400+ calls daily via Retell AI.

## Deliver:

1. **Opening Script** — Apply Jobs Rule #1 (UVP) + Rule #4 (Compelling Story) to craft an irresistible opening
2. **Pain Discovery Questions** — 5 questions based on Jobs Rule #5 (Know Your Audience) that uncover deep pain points
3. **Value Presentation** — Apply Jobs Rule #2 (Benefits Not Features) + Rule #6 (Experience Not Product) to present CK's services
4. **Objection Handling** — Handle top 5 objections using Jobs Rule #8 (Persistence) + Dan Koe's "Embrace Trial and Error"
5. **Closing Framework** — Apply Jobs Rule #7 (Polarize) to create urgency and close
6. **Follow-Up Sequence** — 7-day nurture sequence applying the Seinfeld Strategy (never miss 2 days)
7. **Flow State Tips for Agents** — How SEN agents can enter flow state during call blocks
8. **Productivity Schedule** — Optimal daily call schedule using Pomodoro + Time Blocking + Eat the Frog

Return as structured JSON.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/sales-playbook',
      action: 'sales-playbook-generated',
      agent: 'MCCO-009',
      segment,
    });

    return jsonResponse({
      generatedBy: 'MCCO-009 — Pipeline Fusion + Peak Performance Frameworks',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      segment,
      frameworksApplied: [
        { id: 'FW-003', name: JOBS_SALES_RULES.name },
        { id: 'FW-001', name: GET_AHEAD_FRAMEWORK.name },
        { id: 'FW-005', name: FLOW_STATE_FRAMEWORK.name },
        { id: 'FW-006', name: PRODUCTIVITY_TECHNIQUES.name },
      ],
      salesPlaybook: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Sales playbook generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/frameworks/productivity-plan ───────────────────────────────────

export async function handleFrameworkProductivityPlan(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { division, role = 'agent', goals = [] } = body;

  const validDivisions = ['MCCO', 'EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'all'];
  if (division && !validDivisions.includes(division)) {
    return errorResponse(`Invalid division. Valid: ${validDivisions.join(', ')}`, 400);
  }

  const prompt = `You are MCCO-014 "Quality Shield" — Fleet Inspection & Quality Assurance Commander, enhanced with the Peak Performance Frameworks knowledge base. Ferrari-Standard execution, Sovereign governance.

Build a comprehensive productivity optimization plan for ${division ? `the ${division} division` : 'the entire 382-agent fleet'} at Coastal Key Property Management.

## Available Productivity Frameworks:

### 8 Hours in 4 Hours:
${JSON.stringify(PRODUCTIVITY_8_IN_4.strategies, null, 2)}

### Productivity Techniques:
${JSON.stringify(PRODUCTIVITY_TECHNIQUES.techniques, null, 2)}

### Flow State Framework:
${JSON.stringify(FLOW_STATE_FRAMEWORK.outcomes, null, 2)}

### P.A.R.A. Organizational Method:
${JSON.stringify(PARA_METHOD.components, null, 2)}

### Eisenhower Matrix:
${JSON.stringify(PRODUCTIVITY_TECHNIQUES.techniques.find(t => t.name === 'Eisenhower Matrix'), null, 2)}

## Target: ${division || 'All Divisions'} | Role: ${role}
${goals.length > 0 ? `## Specific Goals: ${goals.join(', ')}` : ''}

## Context:
Coastal Key fleet: 15 MCCO, 20 EXC, 40 SEN, 45 OPS, 30 INT, 47 MKT, 25 FIN, 25 VEN, 25 TEC, 40 WEB agents.

## Deliver:

1. **Daily Operations Schedule** — Optimal time-blocked daily routine using Time Blocking + Pomodoro
2. **Task Prioritization Matrix** — Eisenhower Matrix applied to division-specific tasks
3. **Eat the Frog Assignments** — Top 3 high-impact tasks that should be done first each day
4. **3/3/3 Daily Structure** — 3 deep work items, 3 urgent tasks, 3 maintenance items
5. **Streak Tracking (Seinfeld)** — Key daily habits that must never be broken
6. **P.A.R.A. Knowledge Organization** — How the division should organize its intelligence
7. **Flow State Triggers** — Specific conditions that will put agents into flow state
8. **Parkinson's Law SLAs** — Aggressive but achievable time limits for key tasks
9. **Ferrari Score Targets** — Productivity KPIs tied to the Ferrari-Standard quality benchmark
10. **Weekly Review Cadence** — How to review and optimize the system weekly

Return as structured JSON.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/productivity-plan',
      action: 'productivity-plan-generated',
      agent: 'MCCO-014',
      division: division || 'all',
      role,
    });

    return jsonResponse({
      generatedBy: 'MCCO-014 — Quality Shield + Peak Performance Frameworks',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      division: division || 'all',
      role,
      frameworksApplied: [
        { id: 'FW-004', name: PRODUCTIVITY_8_IN_4.name },
        { id: 'FW-006', name: PRODUCTIVITY_TECHNIQUES.name },
        { id: 'FW-005', name: FLOW_STATE_FRAMEWORK.name },
        { id: 'FW-002', name: PARA_METHOD.name },
      ],
      productivityPlan: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Productivity plan generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/frameworks/vpas/evaluate ──────────────────────────────────────
// Evaluate a task, project, or initiative against the V + P + A = S equation.
// Returns V-SCORE, P-SCORE, A-SCORE, composite S-SCORE, and Ferrari Grade.

export async function handleVPASEvaluate(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { subject, vision, plan, actions, division, context = '' } = body;

  if (!subject) {
    return errorResponse('Field "subject" is required (what is being evaluated).', 400);
  }

  const eq = VPAS_SUCCESS_EQUATION.equation;

  const prompt = `You are the MCCO Sovereign Intelligence operating V + P + A = S evaluation protocol for Coastal Key Property Management.

## V + P + A = S Success Equation (Doctoral Framework FW-007)
${VPAS_SUCCESS_EQUATION.quote}

Formula: ${eq.formula}
Ferrari-Standard Threshold: S-SCORE >= ${eq.variables.S.measurement.ferrariThreshold}

## Evaluation Subject: ${subject}
${division ? `Division: ${division}` : ''}
${context ? `Additional Context: ${context}` : ''}

## Provided Inputs:
${vision ? `Vision Statement: ${vision}` : 'Vision: NOT PROVIDED — evaluate as gap'}
${plan ? `Plan Details: ${plan}` : 'Plan: NOT PROVIDED — evaluate as gap'}
${actions ? `Actions Taken/Planned: ${JSON.stringify(actions)}` : 'Actions: NOT PROVIDED — evaluate as gap'}

## Scoring Criteria:

### Vision (V-SCORE 0-100):
${Object.entries(eq.variables.V.scoringCriteria).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Plan (P-SCORE 0-100):
${Object.entries(eq.variables.P.scoringCriteria).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Action (A-SCORE 0-100):
${Object.entries(eq.variables.A.scoringCriteria).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Success (S-SCORE):
Composite: ${eq.variables.S.measurement.compositeFormula}
Grading: ${JSON.stringify(eq.variables.S.measurement.grading)}

## Deliver as JSON:
{
  "subject": "${subject}",
  "scores": {
    "V_SCORE": <0-100>,
    "P_SCORE": <0-100>,
    "A_SCORE": <0-100>,
    "S_SCORE": <computed>,
    "FERRARI_GRADE": "<elite|operational|developing|failing>"
  },
  "analysis": {
    "vision": { "score": <>, "strengths": [], "gaps": [], "recommendations": [] },
    "plan": { "score": <>, "strengths": [], "gaps": [], "recommendations": [] },
    "action": { "score": <>, "strengths": [], "gaps": [], "recommendations": [] }
  },
  "overallAssessment": "<summary>",
  "criticalGaps": [],
  "actionItems": [],
  "frameworkIntegrations": ["<which other FW-00X frameworks should be applied>"]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/vpas/evaluate',
      action: 'vpas-evaluation',
      subject,
      division: division || 'enterprise',
    });

    return jsonResponse({
      generatedBy: 'MCCO Sovereign Intelligence — V+P+A=S Evaluation Protocol',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      framework: { id: 'FW-007', name: VPAS_SUCCESS_EQUATION.name, classification: 'Doctoral Dissertation Knowledge Asset' },
      subject,
      division: division || 'enterprise',
      evaluation: content,
      equation: eq.formula,
      ferrariThreshold: eq.variables.S.measurement.ferrariThreshold,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`V+P+A=S evaluation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/frameworks/vpas/audit ─────────────────────────────────────────
// Audit a division or the full fleet against V + P + A = S compliance.
// Returns per-division scores, enterprise composite, and APB compliance status.

export async function handleVPASAudit(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { division = 'all', period = '7d', focusAreas = [] } = body;

  const validDivisions = ['MCCO', 'EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'all'];
  if (!validDivisions.includes(division)) {
    return errorResponse(`Invalid division. Valid: ${validDivisions.join(', ')}`, 400);
  }

  const apb = VPAS_SUCCESS_EQUATION.enterpriseAPB;

  const prompt = `You are MCCO-014 "Quality Shield" — Fleet Inspection & Quality Assurance Commander, executing a V + P + A = S compliance audit under Sovereign governance.

## V + P + A = S Enterprise APB
Directive: ${apb.directive}
Scope: ${apb.scope}
Mandates:
${apb.mandates.map((m, i) => `${i + 1}. ${m}`).join('\n')}
Enforcement: ${apb.enforcement}
Escalation: ${apb.escalation}

## Audit Parameters
Division: ${division}
Period: ${period}
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

## Fleet Structure
- 15 MCCO agents (Sovereign Governance)
- 20 EXC agents (Executive)
- 40 SEN agents (Sentinel Sales)
- 45 OPS agents (Operations)
- 30 INT agents (Intelligence)
- 47 MKT agents (Marketing)
- 25 FIN agents (Finance)
- 25 VEN agents (Vendor)
- 25 TEC agents (Technology)
- 40 WEB agents (Web/Digital)
- 50 Intelligence Officers (5 squads)
- 20 Email AI Agents (4 squads)
- 1 AI Trader Agent (FIN-TRADER-001)

## Application Map
${JSON.stringify(VPAS_SUCCESS_EQUATION.applicationToPropertyManagement, null, 2)}

## Deliver as JSON:
{
  "auditType": "V+P+A=S Compliance Audit",
  "division": "${division}",
  "period": "${period}",
  "divisionScores": {
    "<DIVISION_CODE>": {
      "V_SCORE": <0-100>,
      "P_SCORE": <0-100>,
      "A_SCORE": <0-100>,
      "S_SCORE": <computed>,
      "FERRARI_GRADE": "<grade>",
      "agentCount": <n>,
      "complianceRate": "<% of agents meeting APB mandates>",
      "topPerformers": ["<agent IDs>"],
      "attentionRequired": ["<agent IDs>"]
    }
  },
  "enterpriseComposite": {
    "V_SCORE": <avg>,
    "P_SCORE": <avg>,
    "A_SCORE": <avg>,
    "S_SCORE": <computed>,
    "FERRARI_GRADE": "<grade>",
    "totalAgents": 383,
    "apbCompliant": <count>,
    "apbNonCompliant": <count>
  },
  "findings": [],
  "recommendations": [],
  "escalations": [],
  "nextAuditDate": "<date>"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/frameworks/vpas/audit',
      action: 'vpas-fleet-audit',
      agent: 'MCCO-014',
      division,
      period,
    });

    return jsonResponse({
      generatedBy: 'MCCO-014 — Quality Shield + V+P+A=S Audit Protocol',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      framework: { id: 'FW-007', name: VPAS_SUCCESS_EQUATION.name },
      apb: {
        directive: apb.directive,
        mandateCount: apb.mandates.length,
        enforcement: apb.enforcement,
      },
      division,
      period,
      audit: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`V+P+A=S audit failed: ${err.message}`, 500);
  }
}
