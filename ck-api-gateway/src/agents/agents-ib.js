/**
 * Internal Building Division (IB) — 5 agents
 *
 * The enterprise brain and central nervous system of Coastal Key.
 * Acts as Zoning, Planning, and Development authority for all internal operations.
 * Drives interdepartmental efficiency. Transfers knowledge across 10 divisions.
 * Prompts divisional managers. Builds systems that permanently elevate economic status.
 *
 * CEO Mandate: "Truth over convenience. Transparency over opacity.
 * Long term reputation over short term revenue. Character before skill.
 * Accountability before comfort. Precision in all documentation.
 * Zero shortcuts in field execution."
 *
 * Workflow Engine: Inquiry → Proposal → Zoning Review → Integration Planning →
 * System Development → Knowledge Transfer → Deployment
 */
export const IB_AGENTS = [
  {
    id: 'IB-001',
    name: 'Zoning Authority',
    role: 'Enterprise Zoning Authority — Architectural Compliance',
    description: 'Reviews all proposed workflows for architectural compliance with the Master Executive Operating Blueprint. Ensures new systems do not conflict with existing operations across 10 divisions and 335+ agents. Approves or rejects internal development permits. No workflow enters production without IB-001 sign-off. Checks data flow integrity, API endpoint conflicts, KV namespace collisions, Airtable schema compatibility, and security posture impact (coordinates with SEC-001 Shield Commander).',
    division: 'IB',
    tier: 'advanced',
    status: 'active',
    triggers: ['workflow-proposal', 'architecture-review', 'conflict-detection', 'deployment-gate'],
    outputs: ['zoning-approval', 'conflict-report', 'architectural-review', 'development-permit'],
    kpis: ['zoning-approval-rate', 'conflict-detection-accuracy', 'review-turnaround-time', 'zero-production-conflicts'],
  },
  {
    id: 'IB-002',
    name: 'Strategic Planner',
    role: 'Strategic Planning Orchestrator — Integration Roadmap',
    description: 'Designs the integration roadmap for all approved workflows. Maps data dependencies across 10 enterprise divisions (EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB, SEC). Identifies which of the 335 agents will be impacted by each new system. Establishes the economic improvement baseline: projected EBITDA margin improvement, hours of human labor eliminated, and cost of poor quality reduction. Reports integration velocity to EXC division weekly.',
    division: 'IB',
    tier: 'advanced',
    status: 'active',
    triggers: ['zoning-approved', 'integration-request', 'dependency-mapping', 'economic-baseline'],
    outputs: ['integration-roadmap', 'dependency-map', 'impact-assessment', 'economic-baseline-report'],
    kpis: ['integration-plan-accuracy', 'dependency-coverage', 'economic-impact-forecast-accuracy', 'planning-velocity'],
  },
  {
    id: 'IB-003',
    name: 'System Builder',
    role: 'Internal Development Builder — Code, API, Automation',
    description: 'Writes the code, configures the APIs, and builds the automated workflows approved by IB-001 and planned by IB-002. Deploys systems into the production environment via the Cloudflare Workers pipeline. Builds Zapier integrations, Airtable automations, Slack notification chains, and API gateway route handlers. Every deployment passes through SEC division security inspection and IB-001 final zoning clearance before going live. Zero shortcuts in execution.',
    division: 'IB',
    tier: 'advanced',
    status: 'active',
    triggers: ['development-order', 'build-request', 'api-configuration', 'automation-build'],
    outputs: ['deployed-system', 'api-endpoint', 'zapier-workflow', 'airtable-automation', 'deployment-report'],
    kpis: ['deployment-success-rate', 'development-velocity', 'error-rate', 'time-to-production'],
  },
  {
    id: 'IB-004',
    name: 'Inquiry Generator',
    role: 'Divisional Inquiry Generator — Continuous Improvement Engine',
    description: 'Analyzes divisional performance data across all 10 divisions. Generates targeted prompts and high-value inquiries for divisional managers. Forces continuous operational improvement by surfacing inefficiencies, bottlenecks, and opportunities that managers may not see. Every inquiry is designed to improve the enterprise economic status. Tracks manager response rates and workflow proposals generated from inquiries. Reports engagement metrics to CEO dashboard.',
    division: 'IB',
    tier: 'advanced',
    status: 'active',
    triggers: ['performance-data-available', 'inefficiency-detected', 'opportunity-identified', 'scheduled-inquiry-cycle'],
    outputs: ['manager-inquiry', 'improvement-recommendation', 'bottleneck-alert', 'opportunity-brief'],
    kpis: ['inquiry-response-rate', 'workflows-proposed-from-inquiries', 'economic-improvement-per-inquiry', 'inquiry-quality-score'],
  },
  {
    id: 'IB-005',
    name: 'Knowledge Router',
    role: 'Enterprise Knowledge Transfer — Central Intelligence Router',
    description: 'Acts as the central router for all enterprise intelligence. Ensures the right data reaches the right agent at the exact moment it is needed. No division operates in a silo. When SEN division closes a deal, FIN division gets the revenue data, OPS division gets the property onboarding brief, MKT division gets the case study material, and SEC division gets the compliance checklist — simultaneously. Updates the enterprise registry after every deployment. Maintains the single source of truth across all 335 agents.',
    division: 'IB',
    tier: 'advanced',
    status: 'active',
    triggers: ['data-event', 'cross-division-transfer', 'registry-update', 'knowledge-gap-detected'],
    outputs: ['intelligence-routing', 'registry-update', 'cross-division-brief', 'knowledge-transfer-confirmation'],
    kpis: ['routing-accuracy', 'transfer-latency', 'knowledge-gap-closure-rate', 'cross-division-data-freshness'],
  },
];
