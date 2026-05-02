/**
 * Coastal Key — Cross-Agent Communication JSON Schemas
 *
 * Every message between agents conforms to these schemas.
 * Validation is enforced at the orchestrator gateway.
 */

export const TASK_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'ck://schemas/task-message/v1',
  title: 'Coastal Key Task Message',
  type: 'object',
  required: ['message_id', 'timestamp', 'source', 'target', 'priority', 'type', 'payload'],
  properties: {
    message_id: { type: 'string', format: 'uuid' },
    timestamp: { type: 'string', format: 'date-time' },
    source: { type: 'string', enum: ['orchestrator', 'century', 'ledger', 'acquisition', 'report'] },
    target: { type: 'string', enum: ['orchestrator', 'century', 'ledger', 'acquisition', 'report'] },
    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    type: { type: 'string', enum: ['task', 'event', 'query', 'response', 'escalation'] },
    correlation_id: { type: ['string', 'null'], format: 'uuid' },
    payload: {
      type: 'object',
      required: ['action', 'entity_type'],
      properties: {
        action: { type: 'string' },
        entity_type: { type: 'string', enum: ['property', 'lead', 'vendor', 'financial', 'report', 'system'] },
        entity_id: { type: 'string' },
        data: { type: 'object' },
        metadata: {
          type: 'object',
          properties: {
            retry_count: { type: 'integer', minimum: 0 },
            max_retries: { type: 'integer', default: 3 },
            ttl_seconds: { type: 'integer', default: 3600 },
            idempotency_key: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    routing: {
      type: 'object',
      properties: {
        reply_to: { type: ['string', 'null'] },
        dead_letter: { type: 'string', default: 'orchestrator' },
        trace: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const PROPERTY_EVENT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'ck://schemas/property-event/v1',
  title: 'Property Sensor Event',
  type: 'object',
  required: ['event_type', 'property_id', 'sensor_id', 'value', 'timestamp'],
  properties: {
    event_type: {
      type: 'string',
      enum: [
        'temperature_anomaly', 'humidity_spike', 'water_leak',
        'power_outage', 'security_breach', 'door_open',
        'motion_detected', 'smoke_detected', 'co_detected',
        'hvac_failure', 'pool_chemistry', 'irrigation_fault',
      ],
    },
    property_id: { type: 'string' },
    sensor_id: { type: 'string' },
    value: { type: ['number', 'string', 'boolean'] },
    unit: { type: 'string' },
    threshold: { type: 'number' },
    deviation: { type: 'number' },
    timestamp: { type: 'string', format: 'date-time' },
    location: {
      type: 'object',
      properties: {
        zone: { type: 'string' },
        room: { type: 'string' },
        floor: { type: 'integer' },
      },
    },
  },
};

export const FINANCIAL_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'ck://schemas/financial-transaction/v1',
  title: 'Financial Transaction',
  type: 'object',
  required: ['transaction_type', 'amount', 'currency', 'entity', 'timestamp'],
  properties: {
    transaction_type: {
      type: 'string',
      enum: ['bill_pay', 'vendor_payment', 'client_invoice', 'tax_payment', 'refund', 'transfer', 'expense'],
    },
    amount: { type: 'number', minimum: 0 },
    currency: { type: 'string', default: 'USD' },
    entity: {
      type: 'object',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', enum: ['vendor', 'client', 'tax_authority', 'internal'] },
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    property_id: { type: ['string', 'null'] },
    llc_entity: { type: 'string' },
    category: {
      type: 'string',
      enum: [
        'maintenance', 'utilities', 'insurance', 'taxes', 'management_fee',
        'vendor_services', 'emergency_repair', 'capital_improvement',
        'marketing', 'technology', 'professional_services', 'payroll',
      ],
    },
    requires_approval: { type: 'boolean' },
    approved_by: { type: ['string', 'null'] },
    timestamp: { type: 'string', format: 'date-time' },
    due_date: { type: ['string', 'null'], format: 'date' },
    reference: { type: 'string' },
  },
};

export const LEAD_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'ck://schemas/lead/v1',
  title: 'Acquisition Lead',
  type: 'object',
  required: ['lead_id', 'source', 'score', 'status', 'created_at'],
  properties: {
    lead_id: { type: 'string' },
    source: {
      type: 'string',
      enum: ['scrape_property_appraiser', 'mls_feed', 'referral', 'inbound_web', 'voice_ai', 'direct_mail_response'],
    },
    score: { type: 'integer', minimum: 0, maximum: 100 },
    status: {
      type: 'string',
      enum: ['new', 'enriched', 'contacted', 'qualified', 'transferred', 'converted', 'dead'],
    },
    contact: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        address: { type: 'string' },
      },
    },
    property: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        value: { type: 'number' },
        type: { type: 'string', enum: ['single_family', 'condo', 'luxury', 'str', 'multi_family'] },
        zone: { type: 'string' },
        absentee: { type: 'boolean' },
        seasonal: { type: 'boolean' },
      },
    },
    scoring_breakdown: {
      type: 'object',
      properties: {
        property_value_1m_plus: { type: 'integer' },
        absentee_owner: { type: 'integer' },
        seasonal_address: { type: 'integer' },
        multiple_properties: { type: 'integer' },
        recent_purchase: { type: 'integer' },
      },
    },
    sequence: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['cold_outreach', 'warm_referral', 'reactivation'] },
        current_step: { type: 'integer' },
        total_steps: { type: 'integer' },
        last_touch: { type: 'string', format: 'date-time' },
        next_touch: { type: 'string', format: 'date-time' },
      },
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

export const REPORT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'ck://schemas/report/v1',
  title: 'Client Report',
  type: 'object',
  required: ['report_id', 'type', 'property_id', 'period', 'generated_at'],
  properties: {
    report_id: { type: 'string' },
    type: { type: 'string', enum: ['weekly_property', 'monthly_financial', 'ceo_daily_briefing', 'inspection', 'incident'] },
    property_id: { type: 'string' },
    client_id: { type: 'string' },
    period: {
      type: 'object',
      properties: {
        start: { type: 'string', format: 'date' },
        end: { type: 'string', format: 'date' },
      },
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          narrative: { type: 'string' },
          data: { type: 'object' },
          media: { type: 'array', items: { type: 'string', format: 'uri' } },
        },
      },
    },
    delivery: {
      type: 'object',
      properties: {
        channels: { type: 'array', items: { type: 'string' } },
        sent_at: { type: ['string', 'null'], format: 'date-time' },
        opened_at: { type: ['string', 'null'], format: 'date-time' },
      },
    },
    generated_at: { type: 'string', format: 'date-time' },
  },
};

export function validateMessage(message, schema) {
  const required = schema.required || [];
  const missing = required.filter(field => !(field in message));
  if (missing.length > 0) {
    return { valid: false, errors: missing.map(f => `Missing required field: ${f}`) };
  }
  return { valid: true, errors: [] };
}
