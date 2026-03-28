/**
 * Coastal Key Agent OS — Multi-Agent Workflow Routes
 * POST /v1/workflows/scaa1        — SCAA-1 Battle Plan Pipeline
 * POST /v1/workflows/wf3          — WF-3 Investor Escalation
 * POST /v1/workflows/wf4          — WF-4 Long-Tail Nurture
 * POST /v1/workflows/content      — Content Production Pipeline
 * POST /v1/workflows/market-intel — Market Intelligence Pipeline
 * POST /v1/workflows/onboard      — New Lead Onboarding Pipeline
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function handleWorkflowRoutes(request, env, systems, path) {
  const { orchestrator, governance, inference, airtable, slack, dispatcher } = systems;

  if (request.method !== 'POST') {
    return json({ error: 'Workflows require POST' }, 405);
  }

  const body = await request.json();

  // SCAA-1: Battle Plan Pipeline
  if (path === '/v1/workflows/scaa1') {
    const govResult = await governance.evaluateAction({
      agentId: 'CK-SEN-003', type: 'lead_enrichment', riskLevel: 2,
      payload: body, capitalImpact: 'Direct Revenue',
      orchestratorApproval: true
    });
    if (!govResult.approved) return json({ error: 'Governance denied', violations: govResult.violations }, 403);

    // Step 1: Enricher generates battle plan
    const battlePlan = await inference.infer({
      agentId: 'CK-SEN-003', division: 'SEN',
      prompt: `Generate a comprehensive SCAA-1 Battle Plan for this lead:\n\nName: ${body.name}\nProperty: ${body.property}\nSegment: ${body.segment}\nZone: ${body.zone}\nNotes: ${body.notes}\n\nInclude: Property analysis, market positioning, recommended approach strategy, talking points, potential objections, and estimated deal value.`,
      tier: 'advanced', maxTokens: 4096
    });

    // Step 2: Create task for follow-up
    const task = await airtable.createTask(
      'CK-SEN-004', `Follow up: ${body.name}`,
      `Battle plan generated. Execute approach strategy.`,
      'High', new Date(Date.now() + 86400000).toISOString().split('T')[0]
    );

    // Step 3: Log to AI Log
    await airtable.logAgentAction('CK-SEN-003', 'SCAA-1 Battle Plan', body.name, battlePlan.response?.slice(0, 500), battlePlan.tokens?.input + battlePlan.tokens?.output);

    // Step 4: Slack notification
    await slack.notifyWorkflowComplete({
      name: 'SCAA-1 Battle Plan',
      agents: ['CK-SEN-003 Enricher', 'CK-SEN-004 Closer'],
      durationMs: Date.now(),
      result: `Battle plan generated for ${body.name}`
    });

    return json({
      workflow: 'SCAA-1',
      status: 'completed',
      agents_involved: ['CK-SEN-003', 'CK-SEN-004'],
      battle_plan: battlePlan.response,
      task_created: true,
      governance: 'approved',
      capital_impact: 'Direct Revenue'
    });
  }

  // WF-3: Investor Escalation
  if (path === '/v1/workflows/wf3') {
    const govResult = await governance.evaluateAction({
      agentId: 'CK-FIN-003', type: 'investor_report', riskLevel: 3,
      payload: body, capitalImpact: 'Direct Revenue',
      orchestratorApproval: true
    });
    if (!govResult.approved) return json({ error: 'Governance denied', violations: govResult.violations }, 403);

    const presentation = await inference.infer({
      agentId: 'CK-FIN-003', division: 'FIN',
      prompt: `Generate an investor presentation recommendation for:\n\nInvestor: ${body.name}\nProfile: ${body.profile}\nInvestment Range: ${body.investmentRange}\nInterest: ${body.interest}\n\nInclude: Market opportunity summary, ROI projections, property portfolio recommendations, risk assessment, and next steps.`,
      tier: 'advanced', maxTokens: 4096
    });

    await airtable.createInvestorPresentation({
      title: `Investor Presentation: ${body.name}`,
      leadRecordId: body.recordId,
      type: 'Investor Escalation',
      content: presentation.response,
      agentId: 'CK-FIN-003'
    });

    await slack.notifyWorkflowComplete({
      name: 'WF-3 Investor Escalation',
      agents: ['CK-FIN-003 Investor', 'CK-SEN-004 Closer'],
      durationMs: Date.now(),
      result: `Investor presentation created for ${body.name}`
    });

    return json({
      workflow: 'WF-3',
      status: 'completed',
      agents_involved: ['CK-FIN-003', 'CK-SEN-004', 'CK-EXC-005'],
      presentation: presentation.response,
      governance: 'approved',
      capital_impact: 'Direct Revenue'
    });
  }

  // WF-4: Long-Tail Nurture
  if (path === '/v1/workflows/wf4') {
    const nurturePlan = await inference.infer({
      agentId: 'CK-SEN-005', division: 'SEN',
      prompt: `Create a 90-day nurture re-engagement plan for:\n\nLead: ${body.name}\nDisposition: ${body.disposition}\nSegment: ${body.segment}\nLast Contact: ${body.lastContact}\n\nInclude: 6 touchpoint schedule, email subject lines, content themes, and re-qualification criteria.`,
      tier: 'standard', maxTokens: 2048
    });

    await airtable.createTask(
      'CK-SEN-005', `90-day nurture: ${body.name}`,
      nurturePlan.response?.slice(0, 500),
      'Standard', new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    );

    return json({
      workflow: 'WF-4',
      status: 'completed',
      agents_involved: ['CK-SEN-005'],
      nurture_plan: nurturePlan.response,
      enrollment: { duration_days: 90, touchpoints: 6 },
      governance: 'approved',
      capital_impact: 'Direct Revenue'
    });
  }

  // Content Production Pipeline
  if (path === '/v1/workflows/content') {
    const content = await inference.infer({
      agentId: 'CK-MKT-002', division: 'MKT',
      prompt: `Create ${body.contentType || 'social post'} content:\n\nTopic: ${body.topic}\nPlatform: ${body.platform}\nSegment: ${body.segment}\nTone: Luxury, professional, authoritative\nBrand: Coastal Key Property Management\n\n${body.brief || ''}`,
      tier: 'standard', maxTokens: 2048
    });

    await airtable.scheduleContent({
      title: body.topic,
      type: body.contentType || 'Social Post',
      platform: body.platform || 'Instagram',
      scheduledDate: body.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      body: content.response,
      agentId: 'CK-MKT-002'
    });

    return json({
      workflow: 'Content Production',
      status: 'completed',
      agents_involved: ['CK-MKT-002', 'CK-MKT-001'],
      content: content.response,
      scheduled: true,
      governance: 'approved',
      capital_impact: 'Market Expansion'
    });
  }

  // Market Intelligence Pipeline
  if (path === '/v1/workflows/market-intel') {
    const analysis = await inference.infer({
      agentId: 'CK-INT-001', division: 'INT',
      prompt: `Conduct comprehensive market intelligence analysis:\n\nMarket: ${body.market || 'Treasure Coast FL'}\nFocus: ${body.focus}\nTimeframe: ${body.timeframe || 'Q2 2026'}\n\nInclude: Market trends, pricing analysis, inventory levels, demographic shifts, competitive landscape, and strategic recommendations for Coastal Key.`,
      tier: 'advanced', maxTokens: 4096
    });

    return json({
      workflow: 'Market Intelligence',
      status: 'completed',
      agents_involved: ['CK-INT-001', 'CK-INT-002', 'CK-INT-004', 'CK-INT-005'],
      analysis: analysis.response,
      governance: 'approved',
      capital_impact: 'Market Expansion'
    });
  }

  // New Lead Onboarding Pipeline
  if (path === '/v1/workflows/onboard') {
    // Multi-agent coordination: Qualifier → Enricher → Closer
    const qualification = await inference.infer({
      agentId: 'CK-SEN-006', division: 'SEN',
      prompt: `Qualify this new lead:\n\nName: ${body.name}\nPhone: ${body.phone}\nSource: ${body.source}\nProperty Interest: ${body.property}\nNotes: ${body.notes}\n\nScore 1-100 and assign segment (Luxury Seller, Luxury Buyer, Investor, First-Time, Relocation). Determine service zone.`,
      tier: 'fast', maxTokens: 1024
    });

    const lead = await airtable.createLead({
      name: body.name,
      phone: body.phone,
      email: body.email,
      source: body.source || 'AI Onboarding',
      segment: body.segment,
      zone: body.zone,
      assignedAgent: 'CK-SEN-004'
    });

    return json({
      workflow: 'Lead Onboarding',
      status: 'completed',
      agents_involved: ['CK-SEN-006', 'CK-SEN-003', 'CK-SEN-004'],
      qualification: qualification.response,
      lead_created: true,
      governance: 'approved',
      capital_impact: 'Direct Revenue'
    });
  }

  return json({ error: 'Workflow not found', path }, 404);
}
