/**
 * Coastal Key Master Orchestrator — Core Engine
 *
 * Central delegation engine that coordinates Century, Ledger, Acquisition,
 * and Report agents. Zero human intervention except financial transfers >$5K
 * and direct client interface (David + Tracy only).
 *
 * Standards: Ferrari precision, Red Bull optimization, SpaceX engineering
 */

// ── Agent Registry ─────────────────────────────────────────────────────────

export const ORCHESTRATOR_AGENTS = {
  CENTURY: {
    id: 'ORK-CENTURY-001',
    name: 'Century Agent',
    role: 'Property Sensor Monitoring & Autonomous Maintenance Dispatch',
    status: 'active',
    priority: 1,
    capabilities: [
      'iot_sensor_monitoring',
      'anomaly_detection',
      'maintenance_dispatch',
      'vendor_coordination',
      'emergency_escalation',
      'predictive_maintenance',
    ],
    triggers: {
      temperature_anomaly: { threshold: '±5°F from setpoint', action: 'investigate_and_dispatch' },
      humidity_spike: { threshold: '>65% sustained 2h', action: 'mold_prevention_protocol' },
      water_leak: { threshold: 'any sensor trigger', action: 'emergency_shutoff_and_dispatch' },
      power_outage: { threshold: 'loss detected', action: 'generator_check_and_notify' },
      security_breach: { threshold: 'door/window sensor after hours', action: 'verify_and_escalate' },
      scheduled_inspection: { threshold: 'cron-based', action: 'dispatch_inspector' },
    },
    escalation: {
      level1: 'auto_dispatch_vendor',
      level2: 'notify_tracy',
      level3: 'notify_david_emergency',
    },
  },

  LEDGER: {
    id: 'ORK-LEDGER-001',
    name: 'Ledger Agent',
    role: 'Automated Bill Pay, Tax Compliance & Multi-LLC Accounting',
    status: 'active',
    priority: 2,
    capabilities: [
      'automated_bill_pay',
      'tax_compliance_tracking',
      'multi_llc_accounting',
      'expense_categorization',
      'revenue_reconciliation',
      'financial_reporting',
      'vendor_payment_scheduling',
    ],
    rules: {
      auto_pay_threshold: 5000,
      human_approval_above: 5000,
      tax_filing_reminders: ['quarterly_estimated', 'annual_1099', 'annual_return'],
      reconciliation_frequency: 'daily',
      report_frequency: 'weekly',
    },
    llc_entities: [
      { name: 'Coastal Key Enterprise LLC', ein: 'primary', type: 'operating' },
      { name: 'CK Property Holdings LLC', ein: 'secondary', type: 'asset_holding' },
    ],
    escalation: {
      transfer_above_5k: 'require_david_approval',
      tax_deadline_7d: 'notify_david',
      anomalous_expense: 'flag_and_hold',
    },
  },

  ACQUISITION: {
    id: 'ORK-ACQUISITION-001',
    name: 'Acquisition Agent',
    role: 'HNW Real Estate Data Scraping & Outbound Lead Generation',
    status: 'active',
    priority: 3,
    capabilities: [
      'hnw_data_scraping',
      'property_record_analysis',
      'absentee_owner_identification',
      'outbound_sequence_generation',
      'lead_scoring',
      'crm_pipeline_management',
      'market_intelligence',
    ],
    data_sources: [
      'county_property_appraiser',
      'mls_feed',
      'public_records',
      'building_permits',
      'ownership_transfers',
      'tax_delinquency_lists',
    ],
    lead_scoring: {
      property_value_1m_plus: 30,
      absentee_owner: 25,
      seasonal_address: 20,
      multiple_properties: 15,
      recent_purchase: 10,
    },
    outbound_sequences: {
      cold_outreach: { steps: 7, duration_days: 45, channels: ['email', 'direct_mail', 'voice_ai'] },
      warm_referral: { steps: 4, duration_days: 14, channels: ['email', 'voice_ai'] },
      reactivation: { steps: 5, duration_days: 30, channels: ['email', 'sms'] },
    },
    rate_limits: {
      scraping: { requests_per_minute: 10, daily_cap: 5000 },
      outbound_email: { per_hour: 50, per_day: 200 },
      voice_calls: { concurrent: 40, per_day: 2400 },
    },
  },

  REPORT: {
    id: 'ORK-REPORT-001',
    name: 'Report Agent',
    role: 'AI-Narrated Weekly Video Updates for Property Owners',
    status: 'active',
    priority: 4,
    capabilities: [
      'data_aggregation',
      'narrative_generation',
      'video_compilation',
      'client_delivery',
      'dashboard_snapshot',
      'trend_analysis',
    ],
    report_types: {
      weekly_property: {
        audience: 'property_owner',
        frequency: 'weekly',
        content: ['inspection_summary', 'maintenance_log', 'photo_evidence', 'upcoming_actions'],
        format: 'ai_narrated_video',
        delivery: ['email', 'client_portal'],
      },
      monthly_financial: {
        audience: 'property_owner',
        frequency: 'monthly',
        content: ['income_statement', 'expense_breakdown', 'occupancy_metrics', 'market_comparison'],
        format: 'pdf_with_narration',
        delivery: ['email', 'client_portal'],
      },
      ceo_daily_briefing: {
        audience: 'david_only',
        frequency: 'daily',
        content: ['fleet_status', 'revenue_snapshot', 'pipeline_health', 'risk_flags'],
        format: 'dashboard_digest',
        delivery: ['dashboard', 'sms'],
      },
    },
  },
};

// ── Priority Queue Engine ──────────────────────────────────────────────────

export const PRIORITY_MATRIX = {
  critical: {
    level: 1,
    response_sla: '5_minutes',
    agents: ['CENTURY'],
    examples: ['water_leak', 'security_breach', 'power_outage', 'fire_alarm'],
    action: 'immediate_dispatch_plus_notify',
  },
  high: {
    level: 2,
    response_sla: '30_minutes',
    agents: ['CENTURY', 'LEDGER'],
    examples: ['hvac_failure', 'payment_overdue_30d', 'vendor_no_show'],
    action: 'dispatch_and_monitor',
  },
  medium: {
    level: 3,
    response_sla: '4_hours',
    agents: ['ACQUISITION', 'LEDGER', 'CENTURY'],
    examples: ['scheduled_maintenance', 'new_lead_scored', 'bill_due_7d'],
    action: 'queue_and_process',
  },
  low: {
    level: 4,
    response_sla: '24_hours',
    agents: ['REPORT', 'ACQUISITION'],
    examples: ['weekly_report_generation', 'market_data_refresh', 'content_creation'],
    action: 'batch_and_execute',
  },
};

// ── Cross-Agent Communication Schema ───────────────────────────────────────

export const MESSAGE_SCHEMA = {
  version: '1.0.0',
  envelope: {
    message_id: 'string:uuid',
    timestamp: 'string:iso8601',
    source_agent: 'string:agent_id',
    target_agent: 'string:agent_id|orchestrator',
    priority: 'enum:critical|high|medium|low',
    type: 'enum:task|event|query|response|escalation',
    correlation_id: 'string:uuid|null',
  },
  payload: {
    action: 'string',
    entity_type: 'enum:property|lead|vendor|financial|report',
    entity_id: 'string',
    data: 'object',
    metadata: {
      retry_count: 'number',
      max_retries: 'number:3',
      ttl_seconds: 'number:3600',
      idempotency_key: 'string:uuid',
    },
  },
  routing: {
    reply_to: 'string:agent_id|null',
    dead_letter: 'orchestrator',
    trace: 'array:string',
  },
};

// ── Trigger-Action Sequences ───────────────────────────────────────────────

export const TRIGGER_ACTIONS = {
  'sensor.temperature_anomaly': {
    trigger: 'IoT sensor reports temperature deviation >5°F from setpoint',
    sequence: [
      { step: 1, agent: 'CENTURY', action: 'verify_sensor_reading', timeout: '2m' },
      { step: 2, agent: 'CENTURY', action: 'check_hvac_status', timeout: '1m' },
      { step: 3, agent: 'CENTURY', action: 'dispatch_hvac_vendor', condition: 'if_confirmed' },
      { step: 4, agent: 'REPORT', action: 'notify_owner', template: 'temp_alert' },
      { step: 5, agent: 'LEDGER', action: 'create_maintenance_po', condition: 'if_dispatched' },
    ],
  },
  'sensor.water_leak': {
    trigger: 'Water sensor activated at any monitored property',
    sequence: [
      { step: 1, agent: 'CENTURY', action: 'emergency_water_shutoff', timeout: '30s' },
      { step: 2, agent: 'CENTURY', action: 'dispatch_emergency_plumber', timeout: '5m' },
      { step: 3, agent: 'REPORT', action: 'emergency_notify_owner', priority: 'critical' },
      { step: 4, agent: 'LEDGER', action: 'file_insurance_claim_draft', condition: 'if_damage_detected' },
      { step: 5, agent: 'CENTURY', action: 'schedule_followup_inspection', delay: '24h' },
    ],
  },
  'lead.new_hnw_identified': {
    trigger: 'Acquisition Agent scores lead >70 points',
    sequence: [
      { step: 1, agent: 'ACQUISITION', action: 'enrich_lead_data', timeout: '5m' },
      { step: 2, agent: 'ACQUISITION', action: 'start_outbound_sequence', template: 'cold_outreach' },
      { step: 3, agent: 'REPORT', action: 'add_to_ceo_briefing', section: 'pipeline' },
    ],
  },
  'lead.qualified': {
    trigger: 'Lead meets 2+ qualification criteria from voice AI call',
    sequence: [
      { step: 1, agent: 'ACQUISITION', action: 'transfer_to_tracy', priority: 'high' },
      { step: 2, agent: 'LEDGER', action: 'prepare_service_agreement', template: 'standard' },
      { step: 3, agent: 'REPORT', action: 'log_conversion_event' },
    ],
  },
  'financial.bill_received': {
    trigger: 'Vendor invoice received via email or API',
    sequence: [
      { step: 1, agent: 'LEDGER', action: 'categorize_expense', timeout: '1m' },
      { step: 2, agent: 'LEDGER', action: 'match_to_property', timeout: '1m' },
      { step: 3, agent: 'LEDGER', action: 'auto_pay_or_queue', condition: 'amount <= 5000 auto_pay | amount > 5000 queue_for_approval' },
      { step: 4, agent: 'REPORT', action: 'update_financial_dashboard' },
    ],
  },
  'financial.transfer_approval': {
    trigger: 'Payment >$5,000 requires human approval',
    sequence: [
      { step: 1, agent: 'LEDGER', action: 'prepare_transfer_summary' },
      { step: 2, agent: 'LEDGER', action: 'send_approval_request', channel: 'sms_david' },
      { step: 3, agent: 'LEDGER', action: 'await_approval', timeout: '24h' },
      { step: 4, agent: 'LEDGER', action: 'execute_or_cancel', condition: 'approved execute | timeout escalate' },
    ],
  },
  'inspection.scheduled': {
    trigger: 'Scheduled property inspection due',
    sequence: [
      { step: 1, agent: 'CENTURY', action: 'dispatch_inspector', timeout: '1h' },
      { step: 2, agent: 'CENTURY', action: 'collect_inspection_data', timeout: '2h' },
      { step: 3, agent: 'REPORT', action: 'generate_inspection_report', format: 'photo_narrative' },
      { step: 4, agent: 'REPORT', action: 'deliver_to_owner', channel: 'email_plus_portal' },
      { step: 5, agent: 'CENTURY', action: 'flag_maintenance_items', condition: 'if_issues_found' },
    ],
  },
  'client.onboarding': {
    trigger: 'New client signs service agreement',
    sequence: [
      { step: 1, agent: 'LEDGER', action: 'create_client_account', timeout: '5m' },
      { step: 2, agent: 'CENTURY', action: 'register_property_sensors', timeout: '1h' },
      { step: 3, agent: 'CENTURY', action: 'schedule_initial_inspection', delay: '48h' },
      { step: 4, agent: 'REPORT', action: 'send_welcome_package', template: 'onboarding' },
      { step: 5, agent: 'ACQUISITION', action: 'remove_from_outbound', action_type: 'suppress' },
    ],
  },
  'report.weekly_cycle': {
    trigger: 'Weekly report generation cron (Sunday 6 PM)',
    sequence: [
      { step: 1, agent: 'CENTURY', action: 'aggregate_week_sensor_data', timeout: '10m' },
      { step: 2, agent: 'LEDGER', action: 'aggregate_week_financials', timeout: '10m' },
      { step: 3, agent: 'REPORT', action: 'compile_narratives', timeout: '15m' },
      { step: 4, agent: 'REPORT', action: 'generate_video_updates', timeout: '30m' },
      { step: 5, agent: 'REPORT', action: 'deliver_to_all_clients', timeout: '1h' },
    ],
  },
  'emergency.hurricane_protocol': {
    trigger: 'NWS hurricane warning for service area',
    sequence: [
      { step: 1, agent: 'CENTURY', action: 'activate_storm_protocol_all_properties' },
      { step: 2, agent: 'CENTURY', action: 'verify_shutters_generators_supplies' },
      { step: 3, agent: 'REPORT', action: 'mass_notify_owners', template: 'hurricane_prep' },
      { step: 4, agent: 'LEDGER', action: 'pre_authorize_emergency_fund', amount: 25000 },
      { step: 5, agent: 'CENTURY', action: 'schedule_post_storm_inspections', delay: 'after_all_clear' },
    ],
  },
};

// ── Human-in-the-Loop Gates ────────────────────────────────────────────────

export const HUMAN_GATES = {
  financial_transfer_above_5k: {
    trigger: 'Any financial transfer >$5,000',
    approver: 'david',
    channel: 'sms',
    timeout: '24h',
    fallback: 'hold_and_re_notify',
  },
  new_client_contract: {
    trigger: 'Service agreement requires signature',
    approver: 'tracy',
    channel: 'email',
    timeout: '48h',
    fallback: 'follow_up_call',
  },
  emergency_spend_above_10k: {
    trigger: 'Emergency repair estimate >$10,000',
    approver: 'david',
    channel: 'phone_call',
    timeout: '2h',
    fallback: 'proceed_with_minimum_scope',
  },
  client_communication: {
    trigger: 'Client requests direct human contact',
    handler: 'tracy_or_david',
    channel: 'phone',
    sla: '4h',
    fallback: 'ai_acknowledge_and_schedule',
  },
};

// ── Orchestrator Decision Engine ───────────────────────────────────────────

export function routeTask(task) {
  const { type, priority, entity_type, amount } = task;

  if (entity_type === 'financial' && amount > 5000) {
    return {
      route: 'human_approval',
      gate: HUMAN_GATES.financial_transfer_above_5k,
      agent: 'LEDGER',
      hold: true,
    };
  }

  const priorityConfig = PRIORITY_MATRIX[priority] || PRIORITY_MATRIX.medium;
  const targetAgent = priorityConfig.agents[0];

  return {
    route: 'agent',
    agent: targetAgent,
    sla: priorityConfig.response_sla,
    action: priorityConfig.action,
    fallback: 'orchestrator_retry',
  };
}

export function executeSequence(triggerId, context) {
  const sequence = TRIGGER_ACTIONS[triggerId];
  if (!sequence) {
    return { error: `Unknown trigger: ${triggerId}`, routed_to: 'dead_letter' };
  }

  return {
    trigger: triggerId,
    steps: sequence.sequence.length,
    sequence: sequence.sequence,
    context,
    initiated_at: new Date().toISOString(),
    status: 'executing',
  };
}
