/**
 * Coastal Key AI Sales Agent — "Sentinel"
 *
 * Autonomous AI agent embedded in the mobile app that:
 * - Qualifies inbound leads via conversational AI
 * - Generates SCAA-1 battle plans for outbound pursuit
 * - Handles objection responses and follow-up sequencing
 * - Auto-creates leads in Airtable via ck-api-gateway
 * - Triggers workflow pipelines (WF-3 Investor, WF-4 Nurture)
 *
 * Powered by Claude claude-sonnet-4-6 (fast) / claude-opus-4-6 (complex analysis).
 */

import { api } from '../services/api';
import { store } from '../store/app-store';

const SALES_SYSTEM_PROMPT = `You are Sentinel, the AI Sales Agent for Coastal Key Property Management — a luxury property management firm on Florida's Treasure Coast (Port St. Lucie, Stuart, Jensen Beach, Jupiter, Palm City, Hobe Sound).

Your mission: Convert every qualified lead into a managed property client.

PERSONALITY:
- Professional, warm, consultative — never pushy
- Expert in Treasure Coast luxury real estate market
- Data-driven: reference market stats, zone benchmarks, ROI projections
- Concise but thorough — respect the prospect's time

CAPABILITIES:
- Lead qualification (budget, timeline, property type, management needs)
- Market analysis and zone-level pricing recommendations
- Competitive positioning vs. local providers
- Objection handling with empathy and proof points
- Follow-up sequence recommendation
- Investor pitch customization

SERVICE ZONES:
- Zone A: Port St. Lucie (Tradition, St. Lucie West)
- Zone B: Stuart / Jensen Beach / Hutchinson Island
- Zone C: Jupiter / Tequesta / Jupiter Island
- Zone D: Palm City / Hobe Sound / Indiantown

KEY VALUE PROPOSITIONS:
1. 290 AI agents automating operations 24/7
2. Predictive maintenance reducing emergency costs 40%
3. Dynamic pricing optimization increasing rental yield 15-25%
4. Institutional-grade investor reporting
5. Concierge-level guest services for STR properties
6. Full vendor compliance and quality management

Always ask clarifying questions before making recommendations. When you identify a qualified lead, recommend specific next steps and offer to schedule a discovery call.`;

export interface SalesAgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ClientSalesAgent {
  private conversationHistory: SalesAgentMessage[] = [];

  async processMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const contextPrompt = this.buildContextPrompt(userMessage);

    try {
      const response = await api.inference(
        SALES_SYSTEM_PROMPT,
        contextPrompt,
        this.requiresDeepAnalysis(userMessage) ? 'advanced' : 'fast',
      );

      const reply = response.content;
      this.conversationHistory.push({ role: 'assistant', content: reply });

      // Auto-detect lead qualification signals and trigger actions
      await this.detectAndExecuteActions(userMessage, reply);

      return reply;
    } catch (error) {
      const fallback = 'I apologize for the interruption. Let me reconnect and continue our conversation. Could you repeat your last question?';
      this.conversationHistory.push({ role: 'assistant', content: fallback });
      return fallback;
    }
  }

  private buildContextPrompt(currentMessage: string): string {
    const recentHistory = this.conversationHistory.slice(-10);
    const historyBlock = recentHistory
      .map((m) => `${m.role === 'user' ? 'Prospect' : 'Sentinel'}: ${m.content}`)
      .join('\n\n');

    return `CONVERSATION HISTORY:\n${historyBlock}\n\nRespond to the prospect's latest message. Be helpful, consultative, and guide toward next steps when appropriate.`;
  }

  private requiresDeepAnalysis(message: string): boolean {
    const deepTriggers = ['roi', 'investment', 'analysis', 'compare', 'market data', 'projection', 'portfolio'];
    return deepTriggers.some((t) => message.toLowerCase().includes(t));
  }

  private async detectAndExecuteActions(userMessage: string, aiReply: string): Promise<void> {
    // Auto-create lead when contact info is shared
    const emailMatch = userMessage.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = userMessage.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    if (emailMatch || phoneMatch) {
      try {
        await api.createLead({
          'Lead Name': this.extractName(userMessage),
          'Email': emailMatch?.[0] || '',
          'Phone Number': phoneMatch?.[0] || '',
          'Lead Source': { name: 'Mobile App - AI Sales Agent' },
          'Status': { name: 'Qualified' },
          'Inquiry Notes': `AI Sales Agent conversation. Last message: ${userMessage.slice(0, 500)}`,
        });

        store.getState().addNotification({
          id: `lead-${Date.now()}`,
          type: 'lead',
          title: 'New Lead Captured',
          body: `Lead auto-created from AI Sales conversation: ${emailMatch?.[0] || phoneMatch?.[0]}`,
          read: false,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // Non-blocking — lead creation is best-effort
      }
    }

    // Auto-trigger battle plan for qualified leads
    if (aiReply.toLowerCase().includes('schedule a discovery call') || aiReply.toLowerCase().includes('qualified')) {
      store.getState().addNotification({
        id: `qualify-${Date.now()}`,
        type: 'workflow',
        title: 'Lead Qualified',
        body: 'Sentinel AI detected a qualified lead. Battle plan generation recommended.',
        read: false,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private extractName(message: string): string {
    const namePatterns = [
      /(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match) return match[1];
    }

    return 'Unknown (AI Agent Capture)';
  }

  reset(): void {
    this.conversationHistory = [];
  }

  getHistory(): SalesAgentMessage[] {
    return [...this.conversationHistory];
  }
}

export const salesAgent = new ClientSalesAgent();
