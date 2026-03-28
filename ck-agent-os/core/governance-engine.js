/**
 * Coastal Key — Governance Enforcement Engine
 * Enforces the Sovereign Governance Compendium across all 40 agents.
 * Every action passes through governance checks before execution.
 */

const RISK_LEVELS = {
  ROUTINE: 1,
  ELEVATED: 2,
  HIGH: 3,
  CRITICAL: 4
};

const RISK_APPROVALS = {
  1: 'self',
  2: 'division_controller',
  3: 'master_orchestrator',
  4: 'ceo'
};

const COMPLIANCE_MANDATES = [
  'TCPA', 'DNC Registry', 'CAN-SPAM', 'CCPA',
  'Fair Housing Act', 'RESPA', 'SOC 2 Type II'
];

export class GovernanceEngine {
  constructor(env) {
    this.env = env;
    this.auditBuffer = [];
    this.policyViolations = [];
    this.qualityGates = new Map();
  }

  /**
   * Evaluate whether an action is permitted under the Sovereign Governance Compendium.
   * @param {Object} action - The proposed action
   * @param {string} action.agentId - Agent requesting the action
   * @param {string} action.type - Action type
   * @param {number} action.riskLevel - Risk level 1-4
   * @param {Object} action.payload - Action details
   * @returns {Object} { approved: boolean, reason: string, requiredApproval: string }
   */
  async evaluateAction(action) {
    const checks = await Promise.all([
      this.checkRiskLevel(action),
      this.checkComplianceRules(action),
      this.checkQualityGate(action),
      this.checkCapitalImpact(action),
      this.checkCEOThreshold(action)
    ]);

    const failures = checks.filter(c => !c.passed);

    if (failures.length > 0) {
      await this.logViolation(action, failures);
      return {
        approved: false,
        reason: failures.map(f => f.reason).join('; '),
        requiredApproval: this.getHighestApproval(failures),
        violations: failures
      };
    }

    await this.logApproval(action);
    return {
      approved: true,
      reason: 'All governance checks passed',
      requiredApproval: RISK_APPROVALS[action.riskLevel] || 'self',
      auditId: `GOV-${Date.now()}-${action.agentId}`
    };
  }

  /** Check if action's risk level has proper approval chain */
  async checkRiskLevel(action) {
    const level = action.riskLevel || 1;
    if (level < 1 || level > 4) {
      return { passed: false, reason: `Invalid risk level: ${level}`, rule: 'SGC-005' };
    }

    if (level === 4 && !action.ceoApproval) {
      return {
        passed: false,
        reason: 'Level 4 Critical action requires CEO David Hauer approval',
        rule: 'SGC-005',
        escalation: true
      };
    }

    if (level === 3 && !action.orchestratorApproval) {
      return {
        passed: false,
        reason: 'Level 3 High action requires Master Orchestrator approval',
        rule: 'SGC-005'
      };
    }

    return { passed: true, rule: 'SGC-005' };
  }

  /** Check compliance with regulatory mandates */
  async checkComplianceRules(action) {
    const complianceActions = [
      'outbound_call', 'email_send', 'sms_send', 'data_export',
      'lead_contact', 'marketing_publish', 'financial_transaction'
    ];

    if (complianceActions.includes(action.type)) {
      if (action.type === 'outbound_call' || action.type === 'lead_contact') {
        if (!action.payload?.dncChecked) {
          return { passed: false, reason: 'DNC registry check required before outbound contact', rule: 'TCPA' };
        }
        if (!action.payload?.consentVerified && action.type === 'sms_send') {
          return { passed: false, reason: 'Prior express consent required for SMS', rule: 'TCPA' };
        }
      }

      if (action.type === 'email_send' && !action.payload?.unsubscribeLink) {
        return { passed: false, reason: 'CAN-SPAM requires unsubscribe mechanism', rule: 'CAN-SPAM' };
      }

      if (action.type === 'marketing_publish') {
        if (action.payload?.content && this.containsFairHousingViolation(action.payload.content)) {
          return { passed: false, reason: 'Content violates Fair Housing Act guidelines', rule: 'Fair Housing Act' };
        }
      }
    }

    return { passed: true, rule: 'compliance' };
  }

  /** Enforce 3-stage quality gate for external outputs */
  async checkQualityGate(action) {
    const externalActions = [
      'content_publish', 'email_send', 'marketing_publish',
      'investor_report', 'client_communication', 'social_post'
    ];

    if (externalActions.includes(action.type)) {
      const gateId = `${action.agentId}-${action.type}-${Date.now()}`;
      const gate = this.qualityGates.get(action.payload?.gateId);

      if (!gate || gate.stage < 3) {
        return {
          passed: false,
          reason: `External output requires 3-stage quality gate. Current stage: ${gate?.stage || 0}/3`,
          rule: 'SGC-004',
          gateId
        };
      }
    }

    return { passed: true, rule: 'SGC-004' };
  }

  /** Verify action has a tagged capital impact category */
  async checkCapitalImpact(action) {
    const validCategories = [
      'Direct Revenue', 'Cost Optimization', 'Market Expansion',
      'Asset Appreciation', 'Risk Reduction', 'Operational Efficiency'
    ];

    if (action.riskLevel >= 2 && !action.capitalImpact) {
      return {
        passed: false,
        reason: 'All elevated+ actions must tag a Capital Impact Category (POL-002)',
        rule: 'SGC-002'
      };
    }

    if (action.capitalImpact && !validCategories.includes(action.capitalImpact)) {
      return {
        passed: false,
        reason: `Invalid Capital Impact Category: ${action.capitalImpact}`,
        rule: 'SGC-002'
      };
    }

    return { passed: true, rule: 'SGC-002' };
  }

  /** Check if action exceeds CEO threshold ($500K) */
  async checkCEOThreshold(action) {
    const amount = action.payload?.amount || 0;
    if (amount > 500000 && !action.ceoApproval) {
      return {
        passed: false,
        reason: `Capital deployment of $${amount.toLocaleString()} exceeds CEO threshold ($500K). CEO David Hauer approval required.`,
        rule: 'POL-001',
        escalation: true
      };
    }
    return { passed: true, rule: 'POL-001' };
  }

  /** Register a quality gate passage */
  async passQualityGate(gateId, stage, reviewer, score) {
    const gate = this.qualityGates.get(gateId) || { stages: [], created: Date.now() };

    if (score < 8.5) {
      return { passed: false, reason: `Quality score ${score} below minimum 8.5` };
    }

    gate.stages.push({ stage, reviewer, score, timestamp: Date.now() });
    gate.stage = stage;
    this.qualityGates.set(gateId, gate);

    return { passed: true, stage, gateId };
  }

  /** Check content for Fair Housing Act violations */
  containsFairHousingViolation(content) {
    const prohibitedTerms = [
      'exclusive neighborhood', 'family-friendly only', 'no children',
      'perfect for singles', 'christian community', 'ethnic',
      'walking distance to church'
    ];
    const lower = content.toLowerCase();
    return prohibitedTerms.some(term => lower.includes(term));
  }

  getHighestApproval(failures) {
    if (failures.some(f => f.escalation)) return 'ceo';
    if (failures.some(f => f.rule === 'SGC-005' && f.reason.includes('Master Orchestrator'))) return 'master_orchestrator';
    return 'division_controller';
  }

  async logViolation(action, failures) {
    const entry = {
      type: 'governance_violation',
      agentId: action.agentId,
      actionType: action.type,
      riskLevel: action.riskLevel,
      violations: failures.map(f => ({ rule: f.rule, reason: f.reason })),
      timestamp: new Date().toISOString()
    };

    this.policyViolations.push(entry);

    if (this.env?.AUDIT_LOG) {
      await this.env.AUDIT_LOG.put(
        `violation:${Date.now()}:${action.agentId}`,
        JSON.stringify(entry),
        { expirationTtl: 90 * 86400 }
      );
    }
  }

  async logApproval(action) {
    const entry = {
      type: 'governance_approval',
      agentId: action.agentId,
      actionType: action.type,
      riskLevel: action.riskLevel,
      approval: RISK_APPROVALS[action.riskLevel],
      timestamp: new Date().toISOString()
    };

    if (this.env?.AUDIT_LOG) {
      await this.env.AUDIT_LOG.put(
        `approval:${Date.now()}:${action.agentId}`,
        JSON.stringify(entry),
        { expirationTtl: 90 * 86400 }
      );
    }
  }

  /** Get governance compliance report */
  getComplianceReport() {
    return {
      totalViolations: this.policyViolations.length,
      recentViolations: this.policyViolations.slice(-20),
      activeQualityGates: this.qualityGates.size,
      complianceMandates: COMPLIANCE_MANDATES,
      riskFramework: RISK_LEVELS,
      approvalChain: RISK_APPROVALS
    };
  }
}

export { RISK_LEVELS, RISK_APPROVALS, COMPLIANCE_MANDATES };
