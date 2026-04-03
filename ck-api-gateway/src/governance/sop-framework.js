/**
 * Coastal Key Enterprise — SOP Framework
 *
 * AI-Agentic Operations Filter: Converts legacy schedule-based SOPs into
 * condition-based, IoT-triggered, LLM-automated workflows.
 *
 * References the Sovereign Governance Compendium for compliance alignment.
 */

import { MORAL_PRINCIPALS, GOVERNANCE_PRINCIPLES, AGENT_GOVERNANCE_DIRECTIVE } from './compendium.js';

// ── SOP Lifecycle States ─────────────────────────────────────────────────────

export const SOP_STATES = {
  LEGACY: 'legacy',
  EVALUATED: 'evaluated',
  MODERNIZED: 'modernized',
  AUTOMATED: 'automated',
  MONITORED: 'monitored'
};

// ── AI-Agentic Operations Filter ─────────────────────────────────────────────

export const AGENTIC_FILTER = {
  stages: [
    {
      id: 'ingest',
      name: 'Ingestion',
      description: 'Ingest legacy SOP documentation and schedule-based rules',
      output: 'Structured SOP object with identified bottlenecks'
    },
    {
      id: 'sift',
      name: 'Sifting',
      description: 'AI evaluates SOP against real-time data, flags low-efficiency schedule-based rules',
      output: 'Efficiency score and modernization candidates'
    },
    {
      id: 'generate',
      name: 'Generation',
      description: 'AI generates modern condition-based SOP replacing schedule triggers with data triggers',
      output: 'New SOP with event-driven workflow definition'
    },
    {
      id: 'execute',
      name: 'Execution',
      description: 'Convert new SOP into executable automated workflow code',
      output: 'Deployed automation with zero human intervention required'
    }
  ],

  complianceCheck: (sop) => ({
    governanceAligned: GOVERNANCE_PRINCIPLES.every(p => sop.respects?.includes(p.id)),
    principalAssigned: !!MORAL_PRINCIPALS[sop.moralPrincipal],
    directiveEmbedded: !!sop.governanceDirective
  })
};

// ── Core SOP Templates ───────────────────────────────────────────────────────

export const SOP_TEMPLATES = {
  emergencyMaintenance: {
    id: 'SOP-MAINT-001',
    name: 'Emergency Maintenance Resolution',
    moralPrincipal: 'service',
    legacy: 'Homeowner calls → office logs ticket → dispatch reviews next business day → contractor assigned',
    modernized: {
      trigger: 'IoT sensor anomaly OR tenant/owner report via app',
      workflow: [
        'AI classifies severity (1-5) within 30 seconds',
        'Auto-dispatch nearest qualified vendor from approved list',
        'Owner notified via push notification with ETA',
        'Contractor confirms via app — GPS tracking activated',
        'Photo documentation auto-captured and filed',
        'Invoice auto-processed, owner report generated',
        'Satisfaction survey deployed 24h post-resolution'
      ],
      kpis: ['response-time-seconds', 'resolution-time-hours', 'owner-satisfaction-score']
    }
  },

  propertyInspection: {
    id: 'SOP-INSP-001',
    name: 'Property Inspection Protocol',
    moralPrincipal: 'stewardship',
    legacy: 'Scheduled monthly drive-by → paper checklist → email summary to owner',
    modernized: {
      trigger: 'Condition-based: weather event, occupancy change, maintenance completion, or 30-day interval',
      workflow: [
        'AI generates inspection priority queue based on risk factors',
        'Mobile checklist with photo/video capture requirements',
        'AI analyzes photos for damage detection',
        'Automated report generation with before/after comparison',
        'Owner receives cinematic property status report via app',
        'Any issues auto-escalate to maintenance SOP'
      ],
      kpis: ['inspection-completion-rate', 'issue-detection-accuracy', 'report-delivery-time']
    }
  },

  leadConversion: {
    id: 'SOP-LEAD-001',
    name: 'Lead Conversion Pipeline',
    moralPrincipal: 'service',
    legacy: 'Cold call list → manual dialing → paper notes → follow-up when remembered',
    modernized: {
      trigger: 'lead.created event from any source (Retell, web form, referral, campaign)',
      workflow: [
        'AI scores lead within 60 seconds of creation',
        'Battle plan auto-generated with personalized talking points',
        'Multi-channel sequence initiated (email day 1, SMS day 2, call day 3)',
        'AI monitors engagement signals and re-scores',
        'Hot leads auto-escalated to human closer with full dossier',
        'Nurture sequence for non-converters (90-day WF-4 pipeline)',
        'Conversion analytics logged to dashboard'
      ],
      kpis: ['score-accuracy', 'conversion-rate', 'time-to-first-contact', 'pipeline-velocity']
    }
  },

  securityMonitoring: {
    id: 'SOP-SEC-001',
    name: 'Continuous Security Monitoring',
    moralPrincipal: 'security',
    legacy: 'Weekly system check → quarterly security audit → annual penetration test',
    modernized: {
      trigger: 'Continuous — 50 Intelligence Officers scanning 24/7/365',
      workflow: [
        'ALPHA squad monitors infrastructure health every 60 seconds',
        'BRAVO squad validates data integrity across all 38 Airtable tables',
        'CHARLIE squad scans for security anomalies and unauthorized access',
        'DELTA squad monitors revenue operations for financial discrepancies',
        'ECHO squad tracks performance metrics against SLA thresholds',
        'Any anomaly triggers auto-repair attempt before human escalation',
        'All events logged to sovereign audit trail with 30-day retention'
      ],
      kpis: ['uptime-percentage', 'threat-detection-time', 'auto-repair-success-rate', 'audit-coverage']
    }
  }
};

// ── Event Types for Workflow Engine ──────────────────────────────────────────

export const WORKFLOW_EVENTS = [
  'lead.created',
  'lead.scored',
  'lead.converted',
  'lead.lost',
  'skill.executed',
  'skill.completed',
  'skill.failed',
  'content.generated',
  'content.published',
  'content.scheduled',
  'property.inspection.due',
  'property.maintenance.requested',
  'property.maintenance.completed',
  'system.error',
  'system.repair.initiated',
  'system.repair.completed',
  'agent.deployed',
  'agent.suspended',
  'agent.governance.violation',
  'subscription.created',
  'subscription.upgraded',
  'subscription.cancelled',
  'campaign.call.completed',
  'campaign.lead.qualified',
  'intelligence.scan.completed',
  'intelligence.anomaly.detected'
];
