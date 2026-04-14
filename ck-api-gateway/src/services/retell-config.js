/**
 * Custom ReTell Function Framework — V1
 *
 * Production-ready configuration for ReTell AI voice agents.
 * Includes function definitions, test scenarios, and deployment pipeline.
 *
 * Integrates with: Airtable (CRM), Slack (alerts), Atlas AI (campaigns).
 */

const RETELL_CONFIG_META = {
  id: 'CK-RETELL-V1',
  title: 'Coastal Key ReTell Function Framework',
  version: '1.0.0',
  platform: 'ReTell AI (retellai.com)',
  totalFunctions: 8,
  totalTestScenarios: 12,
};

const CUSTOM_FUNCTIONS = [
  {
    id: 'FN-001',
    name: 'check_property_availability',
    description: 'Check if a property management slot is available for a new client',
    trigger: 'Caller asks about availability or wants to sign up for property management',
    parameters: {
      type: 'object',
      properties: {
        property_address: { type: 'string', description: 'Full street address of the property' },
        property_type: { type: 'string', enum: ['single_family', 'condo', 'townhouse', 'multi_family'], description: 'Type of property' },
        owner_status: { type: 'string', enum: ['seasonal', 'full_time', 'investor'], description: 'Owner residency pattern' },
      },
      required: ['property_address', 'property_type'],
    },
    response: {
      available: 'boolean',
      estimated_fee: 'string',
      next_steps: 'string',
      assessment_date: 'string',
    },
    webhookUrl: '/v1/retell/check-availability',
    timeout: 5000,
  },
  {
    id: 'FN-002',
    name: 'schedule_property_assessment',
    description: 'Schedule a property walkthrough/assessment for a potential new client',
    trigger: 'Caller agrees to move forward with property assessment',
    parameters: {
      type: 'object',
      properties: {
        caller_name: { type: 'string', description: 'Full name of the property owner' },
        phone: { type: 'string', description: 'Callback phone number' },
        email: { type: 'string', description: 'Email address' },
        property_address: { type: 'string', description: 'Property address for assessment' },
        preferred_date: { type: 'string', description: 'Preferred assessment date (ISO format)' },
        preferred_time: { type: 'string', enum: ['morning', 'afternoon', 'evening'], description: 'Preferred time window' },
      },
      required: ['caller_name', 'phone', 'property_address'],
    },
    response: {
      confirmed: 'boolean',
      assessment_id: 'string',
      scheduled_datetime: 'string',
      confirmation_sent: 'boolean',
    },
    webhookUrl: '/v1/retell/schedule-assessment',
    timeout: 8000,
    sideEffects: ['Create Airtable lead record', 'Send confirmation SMS', 'Notify ops manager via Slack'],
  },
  {
    id: 'FN-003',
    name: 'lookup_owner_account',
    description: 'Look up existing property owner account for status inquiries',
    trigger: 'Existing client calls to check on their property or account',
    parameters: {
      type: 'object',
      properties: {
        identifier: { type: 'string', description: 'Phone number, email, or property address' },
        identifier_type: { type: 'string', enum: ['phone', 'email', 'address'], description: 'Type of identifier provided' },
      },
      required: ['identifier', 'identifier_type'],
    },
    response: {
      found: 'boolean',
      owner_name: 'string',
      property_count: 'number',
      account_status: 'string',
      last_inspection: 'string',
      open_work_orders: 'number',
      next_scheduled_service: 'string',
    },
    webhookUrl: '/v1/retell/lookup-owner',
    timeout: 5000,
  },
  {
    id: 'FN-004',
    name: 'create_work_order',
    description: 'Create a maintenance work order for an existing client property',
    trigger: 'Owner reports an issue or requests maintenance',
    parameters: {
      type: 'object',
      properties: {
        owner_id: { type: 'string', description: 'Owner account ID' },
        property_address: { type: 'string', description: 'Property needing service' },
        issue_type: { type: 'string', enum: ['plumbing', 'electrical', 'hvac', 'pest', 'landscaping', 'structural', 'appliance', 'other'], description: 'Category of issue' },
        description: { type: 'string', description: 'Detailed description of the issue' },
        urgency: { type: 'string', enum: ['routine', 'urgent', 'emergency'], description: 'How urgent is the issue' },
      },
      required: ['property_address', 'issue_type', 'description', 'urgency'],
    },
    response: {
      work_order_id: 'string',
      estimated_response: 'string',
      vendor_assigned: 'string',
      owner_notified: 'boolean',
    },
    webhookUrl: '/v1/retell/create-work-order',
    timeout: 8000,
    sideEffects: ['Create Airtable work order', 'Dispatch vendor notification', 'Send owner confirmation', 'Log to Slack #ops-alerts'],
  },
  {
    id: 'FN-005',
    name: 'get_pricing_info',
    description: 'Provide pricing information for property management services',
    trigger: 'Caller asks about pricing, fees, or cost',
    parameters: {
      type: 'object',
      properties: {
        property_type: { type: 'string', enum: ['single_family', 'condo', 'townhouse', 'multi_family'] },
        service_level: { type: 'string', enum: ['ai_monitoring', 'sensor_monitoring', 'full_management'] },
        property_count: { type: 'number', description: 'Number of properties (for multi-property discount)' },
      },
      required: ['service_level'],
    },
    response: {
      monthly_fee: 'string',
      setup_fee: 'string',
      included_services: 'array',
      volume_discount: 'string',
    },
    webhookUrl: '/v1/retell/get-pricing',
    timeout: 3000,
  },
  {
    id: 'FN-006',
    name: 'transfer_to_human',
    description: 'Transfer the call to a human agent when AI cannot resolve',
    trigger: 'Caller requests human agent, or issue requires human judgment',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Why the transfer is needed' },
        department: { type: 'string', enum: ['sales', 'operations', 'billing', 'emergency'], description: 'Target department' },
        caller_summary: { type: 'string', description: 'Brief summary of the conversation so far' },
      },
      required: ['reason', 'department'],
    },
    response: {
      transferred: 'boolean',
      agent_name: 'string',
      wait_time: 'string',
    },
    webhookUrl: '/v1/retell/transfer',
    timeout: 3000,
  },
  {
    id: 'FN-007',
    name: 'check_sensor_status',
    description: 'Check real-time sensor readings for a monitored property',
    trigger: 'Owner asks about their property sensors, alerts, or conditions',
    parameters: {
      type: 'object',
      properties: {
        property_address: { type: 'string', description: 'Property address to check' },
        sensor_type: { type: 'string', enum: ['all', 'water', 'humidity', 'temperature', 'security'], description: 'Specific sensor type or all' },
      },
      required: ['property_address'],
    },
    response: {
      property_status: 'string',
      sensors: 'array',
      last_alert: 'string',
      overall_health: 'string',
    },
    webhookUrl: '/v1/retell/sensor-status',
    timeout: 5000,
  },
  {
    id: 'FN-008',
    name: 'schedule_seasonal_activation',
    description: 'Schedule seasonal property activation or deactivation',
    trigger: 'Owner is arriving or departing and needs property prepared',
    parameters: {
      type: 'object',
      properties: {
        property_address: { type: 'string', description: 'Property address' },
        activation_type: { type: 'string', enum: ['activate', 'deactivate'], description: 'Opening or closing the property' },
        target_date: { type: 'string', description: 'Date to complete activation/deactivation (ISO format)' },
        special_requests: { type: 'string', description: 'Any special instructions' },
      },
      required: ['property_address', 'activation_type', 'target_date'],
    },
    response: {
      scheduled: 'boolean',
      activation_id: 'string',
      checklist_items: 'number',
      estimated_cost: 'string',
    },
    webhookUrl: '/v1/retell/seasonal-activation',
    timeout: 5000,
    sideEffects: ['Create activation work order', 'Schedule vendor visits', 'Send owner confirmation with checklist'],
  },
];

const TEST_SCENARIOS = [
  { id: 'TS-01', function: 'FN-001', scenario: 'New caller asks if PM is available for their condo in Stuart', input: { property_address: '123 Ocean Blvd, Stuart, FL 34994', property_type: 'condo', owner_status: 'seasonal' }, expectedOutcome: 'Returns availability = true, estimated fee, next steps' },
  { id: 'TS-02', function: 'FN-002', scenario: 'Caller wants to schedule assessment for next Tuesday morning', input: { caller_name: 'John Smith', phone: '555-0123', property_address: '456 Palm Dr, PSL, FL 34952', preferred_time: 'morning' }, expectedOutcome: 'Creates lead in Airtable, schedules assessment, sends SMS confirmation' },
  { id: 'TS-03', function: 'FN-003', scenario: 'Existing owner calls from 555-0456 to check on property', input: { identifier: '555-0456', identifier_type: 'phone' }, expectedOutcome: 'Returns owner account with property status, open work orders' },
  { id: 'TS-04', function: 'FN-004', scenario: 'Owner reports water leak under kitchen sink — urgent', input: { property_address: '789 Coastal Way, Vero Beach, FL 32963', issue_type: 'plumbing', description: 'Water leak under kitchen sink, water pooling on floor', urgency: 'urgent' }, expectedOutcome: 'Creates work order, dispatches plumber, notifies owner, posts to Slack' },
  { id: 'TS-05', function: 'FN-005', scenario: 'Caller asks how much full management costs for a single family home', input: { property_type: 'single_family', service_level: 'full_management', property_count: 1 }, expectedOutcome: 'Returns pricing info with all included services' },
  { id: 'TS-06', function: 'FN-006', scenario: 'Caller is angry about a billing issue and demands a human', input: { reason: 'Billing dispute — owner believes they were overcharged', department: 'billing', caller_summary: 'Owner John Smith claims $200 charge on April invoice is incorrect' }, expectedOutcome: 'Transfers to billing with full context summary' },
  { id: 'TS-07', function: 'FN-007', scenario: 'Owner wants to check if all sensors are working at their vacant property', input: { property_address: '321 River Rd, Jensen Beach, FL 34957', sensor_type: 'all' }, expectedOutcome: 'Returns all sensor readings with status and last alert time' },
  { id: 'TS-08', function: 'FN-008', scenario: 'Snowbird arriving November 15, wants property activated', input: { property_address: '654 Beach St, Stuart, FL 34994', activation_type: 'activate', target_date: '2026-11-15' }, expectedOutcome: 'Schedules 8-step activation, assigns vendors, sends checklist to owner' },
  { id: 'TS-09', function: 'FN-001', scenario: 'Property outside service area (Orlando)', input: { property_address: '100 International Dr, Orlando, FL 32819', property_type: 'condo' }, expectedOutcome: 'Returns availability = false with explanation and referral' },
  { id: 'TS-10', function: 'FN-004', scenario: 'Emergency — security alarm triggered at 2 AM', input: { property_address: '789 Coastal Way, Vero Beach, FL 32963', issue_type: 'other', description: 'Security alarm triggered, motion detected on camera', urgency: 'emergency' }, expectedOutcome: 'Creates emergency work order, dispatches security, calls owner immediately' },
  { id: 'TS-11', function: 'FN-003', scenario: 'Lookup with invalid phone number', input: { identifier: '000-0000', identifier_type: 'phone' }, expectedOutcome: 'Returns found = false with graceful "account not found" message' },
  { id: 'TS-12', function: 'FN-008', scenario: 'Owner departing April 30, wants property winterized', input: { property_address: '654 Beach St, Stuart, FL 34994', activation_type: 'deactivate', target_date: '2026-04-30', special_requests: 'Turn off water heater, set AC to 78' }, expectedOutcome: 'Schedules deactivation with special instructions included' },
];

const DEPLOYMENT_PIPELINE = {
  stages: [
    { stage: 'Development', environment: 'Local', actions: ['Define functions', 'Build webhook handlers', 'Unit test each function'] },
    { stage: 'Staging', environment: 'Cloudflare Workers (staging)', actions: ['Deploy webhook endpoints', 'Test with ReTell playground', 'Verify Airtable/Slack integrations'] },
    { stage: 'UAT', environment: 'ReTell test agent', actions: ['End-to-end call testing', 'All 12 test scenarios', 'Measure latency and accuracy'] },
    { stage: 'Production', environment: 'ReTell production agent', actions: ['Deploy to live agent', 'Monitor first 50 calls', 'Iterate based on call recordings'] },
  ],
  rollbackPlan: 'Disable function in ReTell dashboard → calls fall back to agent script → no disruption',
  monitoringKPIs: ['Function call success rate (target > 95%)', 'Average function latency (target < 3s)', 'Caller satisfaction post-call (target > 4.5/5)'],
};

// ── Public API ──

export function getRetellFramework() {
  return {
    ...RETELL_CONFIG_META,
    functions: CUSTOM_FUNCTIONS.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      trigger: f.trigger,
      timeout: f.timeout,
    })),
    testScenarios: TEST_SCENARIOS.length,
    deploymentStages: DEPLOYMENT_PIPELINE.stages.length,
    status: 'production-ready',
  };
}

export function getRetellFunction(functionId) {
  return CUSTOM_FUNCTIONS.find(f => f.id === functionId) || null;
}

export function getRetellFunctions() {
  return {
    framework: RETELL_CONFIG_META.title,
    totalFunctions: CUSTOM_FUNCTIONS.length,
    functions: CUSTOM_FUNCTIONS,
  };
}

export function getRetellTests() {
  return {
    framework: RETELL_CONFIG_META.title,
    totalScenarios: TEST_SCENARIOS.length,
    scenarios: TEST_SCENARIOS,
    coverage: `${new Set(TEST_SCENARIOS.map(t => t.function)).size} of ${CUSTOM_FUNCTIONS.length} functions covered`,
  };
}

export function getRetellPipeline() {
  return {
    framework: RETELL_CONFIG_META.id,
    pipeline: DEPLOYMENT_PIPELINE,
  };
}
