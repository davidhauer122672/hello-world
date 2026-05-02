/**
 * Coastal Key AI Client Building Agent — "Architect"
 *
 * Autonomous AI agent embedded in the mobile app that:
 * - Onboards new property management clients
 * - Builds customized service packages
 * - Generates property management proposals
 * - Creates inspection schedules and maintenance plans
 * - Configures pricing strategies per property/zone
 * - Interfaces with existing clients for account management
 *
 * Powered by Claude claude-sonnet-4-6 / claude-opus-4-6 via ck-api-gateway.
 */

import { api } from '../services/api';
import { store } from '../store/app-store';

const CLIENT_BUILDING_SYSTEM_PROMPT = `You are Architect, the AI Client Building Agent for Coastal Key Property Management.

Your mission: Onboard and retain property management clients with world-class service setup.

ROLE:
- Guide property owners through onboarding
- Build customized management packages
- Configure property profiles, pricing, and inspection schedules
- Handle ongoing client requests and account modifications
- Proactively identify upsell and cross-sell opportunities

SERVICES AVAILABLE:
1. FULL-SERVICE MANAGEMENT: Tenant placement, rent collection, maintenance, inspections, accounting
2. LEASE-ONLY: Tenant screening and lease execution
3. MAINTENANCE-ONLY: Vendor coordination and preventive maintenance
4. STR MANAGEMENT: Short-term rental optimization (Airbnb/VRBO), dynamic pricing, guest services
5. INVESTOR SERVICES: Portfolio reporting, market analysis, acquisition support

ONBOARDING FLOW:
Step 1: Property Details (address, type, bedrooms, condition, current status)
Step 2: Owner Goals (income target, hands-off level, timeline)
Step 3: Service Package Selection (recommend based on goals)
Step 4: Pricing Strategy (zone benchmarks, competitive analysis)
Step 5: Inspection Schedule (initial walkthrough, recurring cadence)
Step 6: Vendor Assignment (maintenance, landscaping, cleaning)
Step 7: Go-Live Checklist (photos, listings, systems configuration)

PRICING ZONES (Monthly Management Fees):
- Zone A (Port St. Lucie): 8-10% of monthly rent
- Zone B (Stuart/Jensen Beach): 9-11% of monthly rent
- Zone C (Jupiter/Tequesta): 10-12% of monthly rent
- Zone D (Palm City/Hobe Sound): 8-10% of monthly rent
- STR Properties: 20-25% of gross booking revenue

Be thorough, patient, and detail-oriented. Confirm each step before proceeding. Always summarize the configured package before finalizing.`;

export interface ClientBuildingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OnboardingState {
  step: number;
  propertyAddress?: string;
  propertyType?: string;
  ownerGoals?: string;
  servicePackage?: string;
  zone?: string;
  pricingTier?: string;
}

export class ClientBuildingAgent {
  private conversationHistory: ClientBuildingMessage[] = [];
  private onboardingState: OnboardingState = { step: 0 };

  async processMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const contextPrompt = this.buildContextPrompt(userMessage);

    try {
      const response = await api.inference(
        CLIENT_BUILDING_SYSTEM_PROMPT,
        contextPrompt,
        this.requiresDeepAnalysis(userMessage) ? 'advanced' : 'fast',
      );

      const reply = response.content;
      this.conversationHistory.push({ role: 'assistant', content: reply });

      // Track onboarding progress
      this.updateOnboardingState(userMessage, reply);

      // Auto-execute actions based on conversation state
      await this.executeAutomatedActions(userMessage, reply);

      return reply;
    } catch (error) {
      const fallback = 'I encountered a brief interruption. Let me continue helping you set up your property management. Where were we?';
      this.conversationHistory.push({ role: 'assistant', content: fallback });
      return fallback;
    }
  }

  private buildContextPrompt(currentMessage: string): string {
    const recentHistory = this.conversationHistory.slice(-12);
    const historyBlock = recentHistory
      .map((m) => `${m.role === 'user' ? 'Client' : 'Architect'}: ${m.content}`)
      .join('\n\n');

    const stateBlock = `ONBOARDING STATE: Step ${this.onboardingState.step}/7
Property: ${this.onboardingState.propertyAddress || 'Not set'}
Type: ${this.onboardingState.propertyType || 'Not set'}
Goals: ${this.onboardingState.ownerGoals || 'Not set'}
Package: ${this.onboardingState.servicePackage || 'Not set'}
Zone: ${this.onboardingState.zone || 'Not set'}`;

    return `${stateBlock}\n\nCONVERSATION HISTORY:\n${historyBlock}\n\nContinue the onboarding conversation. Guide the client to the next step.`;
  }

  private requiresDeepAnalysis(message: string): boolean {
    const triggers = ['pricing', 'comparison', 'market', 'portfolio', 'roi', 'strategy', 'recommend'];
    return triggers.some((t) => message.toLowerCase().includes(t));
  }

  private updateOnboardingState(userMessage: string, aiReply: string): void {
    const lower = userMessage.toLowerCase();

    // Detect address sharing
    if (/\d+\s+\w+\s+(st|street|ave|avenue|dr|drive|ln|lane|blvd|ct|court|way|rd|road)/i.test(userMessage)) {
      this.onboardingState.propertyAddress = userMessage.trim();
      if (this.onboardingState.step < 1) this.onboardingState.step = 1;
    }

    // Detect property type
    const typeMatch = lower.match(/(single family|condo|townhouse|multi-family|duplex|apartment|villa|estate)/);
    if (typeMatch) {
      this.onboardingState.propertyType = typeMatch[1];
      if (this.onboardingState.step < 1) this.onboardingState.step = 1;
    }

    // Detect zone
    const zonePatterns: Record<string, string> = {
      'port st. lucie': 'Zone A',
      'tradition': 'Zone A',
      'stuart': 'Zone B',
      'jensen beach': 'Zone B',
      'jupiter': 'Zone C',
      'tequesta': 'Zone C',
      'palm city': 'Zone D',
      'hobe sound': 'Zone D',
    };

    for (const [area, zone] of Object.entries(zonePatterns)) {
      if (lower.includes(area)) {
        this.onboardingState.zone = zone;
        break;
      }
    }

    // Detect service package selection
    const packageMatch = lower.match(/(full.?service|lease.?only|maintenance.?only|str|short.?term|investor)/);
    if (packageMatch) {
      this.onboardingState.servicePackage = packageMatch[1];
      if (this.onboardingState.step < 3) this.onboardingState.step = 3;
    }

    // Auto-advance step based on AI reply content
    if (aiReply.toLowerCase().includes('step 2') || aiReply.toLowerCase().includes('owner goals')) {
      this.onboardingState.step = Math.max(this.onboardingState.step, 2);
    }
    if (aiReply.toLowerCase().includes('pricing') && this.onboardingState.step >= 3) {
      this.onboardingState.step = Math.max(this.onboardingState.step, 4);
    }
    if (aiReply.toLowerCase().includes('go-live') || aiReply.toLowerCase().includes('finalize')) {
      this.onboardingState.step = 7;
    }
  }

  private async executeAutomatedActions(userMessage: string, aiReply: string): Promise<void> {
    // When onboarding reaches pricing stage, auto-fetch zone benchmarks
    if (this.onboardingState.step === 4 && this.onboardingState.zone) {
      try {
        await api.getPricingZones();
      } catch {
        // Non-blocking
      }
    }

    // When onboarding completes, create the client lead
    if (this.onboardingState.step === 7) {
      try {
        const emailMatch = this.conversationHistory
          .map((m) => m.content)
          .join(' ')
          .match(/[\w.-]+@[\w.-]+\.\w+/);

        await api.createLead({
          'Lead Name': this.extractClientName(),
          'Email': emailMatch?.[0] || '',
          'Property Address': this.onboardingState.propertyAddress || '',
          'Service Zone': this.onboardingState.zone || '',
          'Lead Source': { name: 'Mobile App - AI Client Builder' },
          'Status': { name: 'Onboarding' },
          'Inquiry Notes': `AI Client Builder onboarding complete. Package: ${this.onboardingState.servicePackage}. Property: ${this.onboardingState.propertyAddress}`,
        });

        store.getState().addNotification({
          id: `onboard-${Date.now()}`,
          type: 'lead',
          title: 'Client Onboarding Complete',
          body: `New client onboarded via AI: ${this.onboardingState.propertyAddress}`,
          read: false,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // Non-blocking
      }
    }
  }

  private extractClientName(): string {
    const allText = this.conversationHistory.map((m) => m.content).join(' ');
    const namePatterns = [
      /(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];

    for (const pattern of namePatterns) {
      const match = allText.match(pattern);
      if (match) return match[1];
    }

    return 'New Client (AI Onboarding)';
  }

  getOnboardingProgress(): { step: number; total: number; state: OnboardingState } {
    return { step: this.onboardingState.step, total: 7, state: { ...this.onboardingState } };
  }

  reset(): void {
    this.conversationHistory = [];
    this.onboardingState = { step: 0 };
  }

  getHistory(): ClientBuildingMessage[] {
    return [...this.conversationHistory];
  }
}

export const clientBuildingAgent = new ClientBuildingAgent();
