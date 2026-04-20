/**
 * Coastal Key Collections Agent
 *
 * First-party AR collections agent for past-due property management invoices.
 * Voice-enabled via Retell or equivalent. API-exposed via /v1/collections/*.
 *
 * Governance: FDCPA best practice (voluntary as first-party), TCPA, Florida FCCPA,
 * CFPB Regulation F. PCI-DSS scope minimization (no card data on call).
 *
 * Standards: UiPath collections reference architecture. DEVIQA testing protocol.
 * Fortune 500 AR benchmarks.
 */

// ── Agent Identity ─────────────────────────────────────────────────────────

export const COLLECTIONS_AGENT = {
  id: 'COLL-001',
  name: 'Coastal Key Collections Agent',
  role: 'First-Party Accounts Receivable Voice Agent',
  division: 'FIN',
  reportsTo: 'MCCO-000 Master Orchestrator',
  version: '1.0.0',
  status: 'PRODUCTION_LIVE',
};

// ── Voice Configuration (bugs from incoming diff fixed) ────────────────────

export const VOICE_CONFIG = {
  language: 'en',
  hinglish_mode: false,
  timezone: 'America/New_York',
  dynamic_variables: {
    dynamic_variable_placeholders: {},
  },
  disable_first_message_interruptions: false,
  max_conversation_duration_message: '',
  prompt: {
    prompt: [
      '# Personality',
      '',
      'You are a professional and empathetic first-party accounts receivable agent for Coastal Key Property Management. You represent the company directly, not a third-party collector. You understand property owners are often seasonal residents with complex schedules, and you approach every call with respect and a genuine desire to find a workable solution. You are firm but fair and never resort to intimidation.',
      '',
      '# Environment',
      '',
      'You make outbound calls to property owners with past-due Coastal Key invoices. The account balance, invoice IDs, property address, and contact info are injected as dynamic variables. You verify right-party contact, discuss the outstanding balance, and work out a payment arrangement. You do not process payments on the call. You capture the commitment and route the owner to the secure billing team or portal for card or ACH entry.',
      '',
      '# Tone',
      '',
      'Open with clear identification: "Hi, this is the accounts receivable team at Coastal Key Property Management calling about your account. May I confirm I am speaking with {{customer_name}}?"',
      'Be direct about the purpose and not aggressive: "I am reaching out because we show a past-due balance of ${{balance_due}} on your property management account. I wanted to see if we can work something out together."',
      'If they express hardship: "Thank you for telling me. We have options that might help. May I walk you through them?"',
      'Offer choices, not ultimatums: "You can pay the full amount, set up an installment plan that works with your budget, or request a hardship review."',
      'On commitment: "Thank you for working with us on this. Let me confirm what we have agreed to."',
      'On refusal: "Understood. I will note this on the account. If your situation changes, please contact us at the billing line."',
      'Never raise your voice or become adversarial.',
      '',
      '# Goal',
      '',
      'Verify right-party contact using two factors (last four of account number plus property address confirmation). Discuss the balance. Present options: pay in full via portal, installment plan, or hardship review. Capture amount committed, payment method preference, payment date or plan schedule, and notes. Confirm the arrangement. If the owner disputes any charge, log the dispute and explain that billing will follow up within one business day.',
      '',
      '# Guardrails',
      '',
      '- Never threaten, harass, or use abusive language.',
      '- Never discuss the account with anyone other than the verified account holder.',
      '- Never create false urgency or misrepresent the balance.',
      '- Never ask for full credit card numbers, bank routing, or Social Security numbers.',
      '- If the owner requests to not be contacted again, honor it immediately and confirm on the call.',
      '- Respect call time window 8:00 AM to 9:00 PM local time.',
      '- On dispute, pause collection activity and route to the billing team.',
    ].join('\n'),
    llm: 'glm-45-air-fp8',
    reasoning_effort: 'medium',
    thinking_budget: null,
    temperature: 0.2,
    max_tokens: -1,
    tool_ids: [],
    built_in_tools: {
      end_call: { enabled: true },
    },
  },
  backup_llm_config: { preference: 'default' },
};

// ── Compliance Controls ────────────────────────────────────────────────────

export const COMPLIANCE_CONTROLS = [
  {
    id: 'CTL-001',
    name: 'Right-Party Contact Verification',
    rule: 'Verify identity with two factors before discussing account',
    source: 'FDCPA Section 805, CFPB Reg F',
    enforcement: 'In-prompt plus post-call audit',
  },
  {
    id: 'CTL-002',
    name: 'Call Time Window',
    rule: 'No calls before 8:00 AM or after 9:00 PM local time',
    source: 'FDCPA 805(a)(1), Florida FCCPA 559.72(17)',
    enforcement: 'Pre-call eligibility check',
  },
  {
    id: 'CTL-003',
    name: 'Call Frequency Cap',
    rule: 'No more than 7 attempts per 7 days per account',
    source: 'CFPB Regulation F 1006.14(b)',
    enforcement: 'Pre-call eligibility check against session log',
  },
  {
    id: 'CTL-004',
    name: 'Mini-Miranda Disclosure',
    rule: 'Clear identification of Coastal Key AR team at call open',
    source: 'UiPath best practice, first-party courtesy',
    enforcement: 'In-prompt opening line',
  },
  {
    id: 'CTL-005',
    name: 'Dispute Handling',
    rule: 'On dispute, pause collection and route to human billing within 1 business day',
    source: 'CFPB Reg F 1006.38',
    enforcement: 'Outcome routing plus audit',
  },
  {
    id: 'CTL-006',
    name: 'Do-Not-Call Honor',
    rule: 'Honor do-not-call requests immediately and suppress future contact',
    source: 'TCPA, FCCPA',
    enforcement: 'Outcome routing to DNC list plus eligibility block',
  },
  {
    id: 'CTL-007',
    name: 'No Payment Data Capture',
    rule: 'Route card, ACH, or SSN entry to secure billing team or portal',
    source: 'PCI-DSS scope minimization',
    enforcement: 'In-prompt guardrail',
  },
];

// ── Benchmark Targets ──────────────────────────────────────────────────────

export const KPI_BASELINE = {
  rightPartyContactRate: { industryP50: 0.25, target: 0.35 },
  promiseToPayRateOnRPC: { industryP50: 0.40, target: 0.55 },
  keptPromiseRate: { industryP50: 0.60, target: 0.75 },
  averageDaysToResolution: { industryP50: 45, target: 28 },
  complaintRate: { industryMax: 0.01, target: 0.0025 },
};

// ── Eligibility Check ──────────────────────────────────────────────────────

export function checkCallEligibility({ localTimeHour, attemptsLast7Days, onDoNotCallList }) {
  if (onDoNotCallList === true) {
    return { eligible: false, reason: 'do_not_call_list', control: 'CTL-006' };
  }
  if (typeof localTimeHour === 'number' && (localTimeHour < 8 || localTimeHour >= 21)) {
    return { eligible: false, reason: 'outside_call_window', control: 'CTL-002' };
  }
  if (typeof attemptsLast7Days === 'number' && attemptsLast7Days >= 7) {
    return { eligible: false, reason: 'frequency_cap_reached', control: 'CTL-003' };
  }
  return { eligible: true };
}

// ── Outcome Taxonomy ───────────────────────────────────────────────────────

export const OUTCOME_TYPES = [
  'paid_in_full',
  'payment_plan',
  'hardship_program',
  'disputed',
  'refused',
  'no_contact',
  'wrong_number',
  'do_not_call',
];

export function validateSession(session) {
  const errors = [];
  if (!session || typeof session !== 'object') {
    errors.push('session_missing');
    return { valid: false, errors };
  }
  if (!session.account_id) errors.push('account_id_required');
  if (!session.outcome) errors.push('outcome_required');
  if (session.outcome && !OUTCOME_TYPES.includes(session.outcome)) errors.push('outcome_invalid');
  if (session.outcome === 'payment_plan' && !session.plan_schedule) errors.push('plan_schedule_required_for_payment_plan');
  if (session.outcome === 'disputed' && !session.dispute_reason) errors.push('dispute_reason_required_for_disputed');
  return { valid: errors.length === 0, errors };
}

// ── Status Builder for Orchestrator Registration ───────────────────────────

export function getCollectionsAgentStatus() {
  return {
    id: COLLECTIONS_AGENT.id,
    name: COLLECTIONS_AGENT.name,
    status: COLLECTIONS_AGENT.status,
    integration: 'Voice plus API',
    complianceControls: COMPLIANCE_CONTROLS.length,
    endpoints: 5,
    governance: 'First-party AR. FDCPA best-practice. TCPA compliant. FCCPA compliant.',
    kpiBaseline: KPI_BASELINE,
    reportsTo: COLLECTIONS_AGENT.reportsTo,
  };
}
