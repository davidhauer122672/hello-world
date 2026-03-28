/**
 * Coastal Key — Slack Notification Service
 * Sends structured notifications to Slack for agent events,
 * governance alerts, and operational updates.
 */

export class SlackNotifier {
  constructor(env) {
    this.webhookUrl = env.SLACK_WEBHOOK_URL;
  }

  /** Send a structured block message to Slack */
  async send(blocks, text = 'Coastal Key Agent OS Notification') {
    if (!this.webhookUrl) return { ok: false, error: 'No webhook URL configured' };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, blocks })
    });

    return { ok: response.ok, status: response.status };
  }

  /** Agent status change notification */
  async notifyAgentStatusChange(agent, oldStatus, newStatus) {
    const color = newStatus === 'active' ? '#00C851' :
                  newStatus === 'error' ? '#FF4444' :
                  newStatus === 'paused' ? '#FFBB33' : '#2196F3';

    return this.send([
      { type: 'header', text: { type: 'plain_text', text: '🔄 Agent Status Change' } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Agent:*\n${agent.codename} (${agent.id})` },
        { type: 'mrkdwn', text: `*Division:*\n${agent.division_name}` },
        { type: 'mrkdwn', text: `*Status:*\n${oldStatus} → ${newStatus}` },
        { type: 'mrkdwn', text: `*Tier:*\n${agent.tier}` }
      ]},
      { type: 'context', elements: [
        { type: 'mrkdwn', text: `Coastal Key Agent OS | ${new Date().toISOString()}` }
      ]}
    ]);
  }

  /** Governance violation alert */
  async notifyGovernanceViolation(violation) {
    return this.send([
      { type: 'header', text: { type: 'plain_text', text: '⚠️ Governance Violation Detected' } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Agent:*\n${violation.agentId}` },
        { type: 'mrkdwn', text: `*Action:*\n${violation.actionType}` },
        { type: 'mrkdwn', text: `*Risk Level:*\n${violation.riskLevel}` },
        { type: 'mrkdwn', text: `*Violations:*\n${violation.violations.map(v => v.reason).join('\n')}` }
      ]},
      { type: 'context', elements: [
        { type: 'mrkdwn', text: `Sovereign Governance Compendium | ${new Date().toISOString()}` }
      ]}
    ]);
  }

  /** CEO escalation alert */
  async notifyCEOEscalation(event) {
    return this.send([
      { type: 'header', text: { type: 'plain_text', text: '🔴 CEO ESCALATION — Level 4 Critical Event' } },
      { type: 'section', text: {
        type: 'mrkdwn',
        text: `*Event:* ${event.type}\n*Source Agent:* ${event.agentId}\n*Description:* ${event.description}\n*Amount:* ${event.amount ? '$' + event.amount.toLocaleString() : 'N/A'}`
      }},
      { type: 'section', text: {
        type: 'mrkdwn',
        text: `*Action Required:* CEO David Hauer must approve or deny this action.\n*Governance Rule:* POL-001 — CEO Decision Reduction Protocol (1% threshold)`
      }},
      { type: 'context', elements: [
        { type: 'mrkdwn', text: `CRITICAL | Sovereign Governance Compendium | ${new Date().toISOString()}` }
      ]}
    ]);
  }

  /** Workflow completion notification */
  async notifyWorkflowComplete(workflow) {
    return this.send([
      { type: 'header', text: { type: 'plain_text', text: '✅ Workflow Completed' } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Workflow:*\n${workflow.name}` },
        { type: 'mrkdwn', text: `*Agents Involved:*\n${workflow.agents.join(', ')}` },
        { type: 'mrkdwn', text: `*Duration:*\n${workflow.durationMs}ms` },
        { type: 'mrkdwn', text: `*Result:*\n${workflow.result}` }
      ]}
    ]);
  }

  /** Daily fleet summary */
  async notifyDailySummary(summary) {
    return this.send([
      { type: 'header', text: { type: 'plain_text', text: '📊 Daily Agent Fleet Summary' } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Active Agents:*\n${summary.active}/40` },
        { type: 'mrkdwn', text: `*Tasks Completed:*\n${summary.tasksCompleted}` },
        { type: 'mrkdwn', text: `*System Health:*\n${summary.healthPercent}%` },
        { type: 'mrkdwn', text: `*Governance Violations:*\n${summary.violations}` }
      ]},
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*API Tokens Used:*\n${summary.tokensUsed.toLocaleString()}` },
        { type: 'mrkdwn', text: `*Leads Generated:*\n${summary.leadsGenerated}` },
        { type: 'mrkdwn', text: `*Revenue Impact:*\n$${summary.revenueImpact.toLocaleString()}` },
        { type: 'mrkdwn', text: `*Capital Growth:*\n${summary.capitalGrowthPercent}%` }
      ]}
    ]);
  }
}
