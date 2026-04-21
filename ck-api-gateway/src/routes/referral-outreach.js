/**
 * Automated Referral Outreach Engine — Coastal Key Enterprise
 * Targets: Investors, Insurance Companies, Attorneys, Accountants
 * Autonomous campaign management with AI-generated personalized outreach
 */

import { jsonResponse, errorResponse } from '../utils/response.js';

const REFERRAL_SEGMENTS = {
  investors: {
    id: 'investors',
    name: 'Real Estate Investors & Family Offices',
    priority: 1,
    channels: ['email', 'linkedin', 'phone', 'direct_mail'],
    cadence: { initial: 'Day 0', followUp: ['Day 3', 'Day 7', 'Day 14', 'Day 30'] },
    qualificationCriteria: [
      'Owns 3+ properties in Treasure Coast market',
      'Portfolio value >$500K',
      'Active buyer within last 24 months',
      'Located in Martin, St. Lucie, or Indian River County',
    ],
    valueProposition: 'Protect and maximize your Treasure Coast investment portfolio with AI-powered property oversight that prevents the $4K-$47K damage events that destroy ROI.',
    targetMetrics: {
      monthlyOutreach: 100,
      responseRate: '15-20%',
      conversionRate: '5-8%',
      averageDealValue: '$395/mo per property',
    },
    outreachTemplates: [
      {
        id: 'INV-01',
        type: 'initial_email',
        subject: 'Your {propertyCount} Treasure Coast properties — are they protected right now?',
        hook: 'risk_awareness',
      },
      {
        id: 'INV-02',
        type: 'follow_up_1',
        subject: 'The $47,000 leak that could have been a $200 inspection',
        hook: 'case_study',
      },
      {
        id: 'INV-03',
        type: 'follow_up_2',
        subject: 'How investors with 5+ properties save 40% on oversight costs',
        hook: 'portfolio_pricing',
      },
    ],
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance Companies & Adjusters',
    priority: 2,
    channels: ['email', 'phone', 'partnership_portal'],
    cadence: { initial: 'Day 0', followUp: ['Day 5', 'Day 14', 'Day 30', 'Day 60'] },
    qualificationCriteria: [
      'Writes homeowners or landlord policies in FL',
      'Active in Martin, St. Lucie, or Indian River counties',
      'Minimum 50 policies in Treasure Coast market',
    ],
    valueProposition: 'Reduce claims by 40-60% through proactive AI-monitored property inspections. Our timestamped photo documentation and predictive risk assessments protect both the property and the policy.',
    targetMetrics: {
      monthlyOutreach: 50,
      responseRate: '10-15%',
      conversionRate: '3-5%',
      averageDealValue: 'Referral fee $50-$150 per referred client',
    },
    outreachTemplates: [
      {
        id: 'INS-01',
        type: 'initial_email',
        subject: 'Reducing FL homeowner claims with AI-powered property monitoring',
        hook: 'claims_reduction',
      },
      {
        id: 'INS-02',
        type: 'follow_up_1',
        subject: 'Our policyholders get timestamped proof of property condition',
        hook: 'documentation',
      },
    ],
  },
  attorneys: {
    id: 'attorneys',
    name: 'Real Estate Attorneys & Estate Planners',
    priority: 3,
    channels: ['email', 'linkedin', 'networking_events', 'direct_mail'],
    cadence: { initial: 'Day 0', followUp: ['Day 7', 'Day 21', 'Day 45'] },
    qualificationCriteria: [
      'Practices real estate, estate planning, or probate law',
      'Located in or serves Treasure Coast, FL',
      'Handles property transactions or trust administration',
    ],
    valueProposition: 'Your clients\' vacant and seasonal properties need professional oversight. We provide the institutional-grade property monitoring that protects estates, trust assets, and investment properties between transactions.',
    targetMetrics: {
      monthlyOutreach: 75,
      responseRate: '8-12%',
      conversionRate: '4-6%',
      averageDealValue: 'Referral fee $75-$200 per client',
    },
    outreachTemplates: [
      {
        id: 'ATT-01',
        type: 'initial_email',
        subject: 'Protecting your clients\' Treasure Coast properties while they\'re away',
        hook: 'fiduciary_duty',
      },
      {
        id: 'ATT-02',
        type: 'follow_up_1',
        subject: 'Estate and trust property oversight — AI-powered documentation',
        hook: 'estate_protection',
      },
    ],
  },
  accountants: {
    id: 'accountants',
    name: 'CPAs & Financial Advisors',
    priority: 4,
    channels: ['email', 'linkedin', 'referral_network'],
    cadence: { initial: 'Day 0', followUp: ['Day 7', 'Day 21', 'Day 45'] },
    qualificationCriteria: [
      'Serves real estate investors or property owners',
      'Located in or serves Treasure Coast, FL',
      'Minimum 20 clients with FL real estate holdings',
    ],
    valueProposition: 'Your clients\' rental properties and seasonal homes generate income and tax benefits — but unmonitored damage destroys both. Coastal Key\'s AI-powered oversight protects property value and ensures proper expense documentation for tax purposes.',
    targetMetrics: {
      monthlyOutreach: 50,
      responseRate: '8-12%',
      conversionRate: '3-5%',
      averageDealValue: 'Referral fee $50-$125 per client',
    },
    outreachTemplates: [
      {
        id: 'CPA-01',
        type: 'initial_email',
        subject: 'Helping your clients protect (and document) their FL property investments',
        hook: 'tax_documentation',
      },
      {
        id: 'CPA-02',
        type: 'follow_up_1',
        subject: 'Property maintenance records your clients\' accountant will love',
        hook: 'expense_tracking',
      },
    ],
  },
  realtors: {
    id: 'realtors',
    name: 'Real Estate Agents & Brokerages',
    priority: 5,
    channels: ['email', 'linkedin', 'networking_events', 'co_marketing'],
    cadence: { initial: 'Day 0', followUp: ['Day 5', 'Day 14', 'Day 30'] },
    qualificationCriteria: [
      'Active FL real estate license',
      'Sells properties in Treasure Coast market',
      'Minimum 10 transactions per year',
    ],
    valueProposition: 'Keep your past buyers\' properties protected, and they\'ll remember you when it\'s time to sell. We offer white-label property monitoring that keeps your brand in front of homeowners year-round.',
    targetMetrics: {
      monthlyOutreach: 100,
      responseRate: '12-18%',
      conversionRate: '6-10%',
      averageDealValue: 'Referral fee $50-$100 per client',
    },
    outreachTemplates: [
      {
        id: 'REA-01',
        type: 'initial_email',
        subject: 'A service your buyers will thank you for recommending',
        hook: 'client_retention',
      },
    ],
  },
};

const REFERRAL_PROGRAM = {
  tiers: [
    { name: 'Referral Partner', minReferrals: 1, commission: '10%', perks: ['Co-branded materials'] },
    { name: 'Silver Partner', minReferrals: 5, commission: '12%', perks: ['Co-branded materials', 'Quarterly lunch'] },
    { name: 'Gold Partner', minReferrals: 15, commission: '15%', perks: ['Co-branded materials', 'Monthly lunch', 'Priority client support'] },
    { name: 'Platinum Partner', minReferrals: 30, commission: '18%', perks: ['All Gold perks', 'Annual retreat invitation', 'Custom integration'] },
  ],
  tracking: {
    method: 'unique_referral_code',
    attribution: '90_day_cookie',
    payment: 'monthly_on_client_payment',
  },
};

export function handleReferralDashboard() {
  return jsonResponse({
    engine: 'Coastal Key Referral Outreach Engine',
    version: '1.0.0',
    segments: Object.values(REFERRAL_SEGMENTS).map(s => ({
      id: s.id,
      name: s.name,
      priority: s.priority,
      channels: s.channels,
      targetMetrics: s.targetMetrics,
    })),
    referralProgram: REFERRAL_PROGRAM,
    campaignStatus: {
      active: 0,
      paused: 0,
      completed: 0,
      totalOutreachSent: 0,
      totalResponses: 0,
      totalReferrals: 0,
      totalRevenue: 0,
    },
    automationRules: [
      'New leads auto-enrolled in segment-specific sequence',
      'Non-responsive contacts move to quarterly check-in after 60 days',
      'Positive responses trigger immediate SEN-009 Investor Hawk or SEN-014 Referral Engine follow-up',
      'All outreach logged to AUDIT_LOG with 180-day retention',
      'TCPA/DNC compliance enforced on all phone outreach',
    ],
    status: 'active',
  });
}

export function handleReferralSegments(url) {
  const priority = url.searchParams.get('priority');
  let segments = Object.values(REFERRAL_SEGMENTS);
  if (priority) segments = segments.filter(s => s.priority === parseInt(priority));
  return jsonResponse({ segments, count: segments.length });
}

export function handleReferralSegment(segmentId) {
  const segment = REFERRAL_SEGMENTS[segmentId];
  if (!segment) return errorResponse(`Segment not found: ${segmentId}`, 404);
  return jsonResponse(segment);
}

export async function handleReferralGenerate(request, env, ctx) {
  const body = await request.json();
  const { segmentId, contactName, companyName, context } = body;

  if (!segmentId || !contactName) {
    return errorResponse('Missing required fields: segmentId, contactName', 400);
  }

  const segment = REFERRAL_SEGMENTS[segmentId];
  if (!segment) return errorResponse(`Invalid segment: ${segmentId}`, 400);

  const prompt = `You are the outreach specialist for Coastal Key Property Management, a luxury AI-powered home watch and property management company on the Treasure Coast of Florida (Martin, St. Lucie, Indian River counties).

Generate a personalized outreach email for this referral target:

SEGMENT: ${segment.name}
VALUE PROPOSITION: ${segment.valueProposition}
CONTACT: ${contactName}${companyName ? ` at ${companyName}` : ''}
ADDITIONAL CONTEXT: ${context || 'None provided'}

Write a professional, warm email that:
1. Opens with a relevant hook specific to their profession
2. Clearly articulates the value of referring clients to Coastal Key
3. Mentions the referral commission structure
4. Includes a clear call-to-action
5. Is under 200 words
6. Sounds human, not templated

Return JSON:
{
  "subject": "...",
  "body": "...",
  "followUpSuggestion": "...",
  "bestChannel": "..."
}`;

  try {
    const { inference } = await import('../services/anthropic.js');
    const result = await inference(env, {
      prompt,
      systemPrompt: 'You are a B2B outreach specialist. Return only valid JSON.',
      maxTokens: 800,
      temperature: 0.7,
    });

    let outreach;
    try {
      outreach = JSON.parse(result.text);
    } catch {
      outreach = { rawResponse: result.text };
    }

    const record = {
      id: `REF-${Date.now()}`,
      segmentId,
      contactName,
      companyName,
      outreach,
      generatedAt: new Date().toISOString(),
      status: 'draft',
    };

    if (env.AUDIT_LOG) {
      ctx.waitUntil(
        env.AUDIT_LOG.put(`referral:${record.id}`, JSON.stringify(record), { expirationTtl: 86400 * 180 })
      );
    }

    return jsonResponse(record, 201);
  } catch (err) {
    return errorResponse(`Outreach generation failed: ${err.message}`, 500);
  }
}

export async function handleReferralEnroll(request, env, ctx) {
  const body = await request.json();
  const { partnerName, partnerEmail, partnerPhone, companyName, segment, referralSource } = body;

  if (!partnerName || !partnerEmail || !segment) {
    return errorResponse('Missing required fields: partnerName, partnerEmail, segment', 400);
  }
  if (!REFERRAL_SEGMENTS[segment]) {
    return errorResponse(`Invalid segment: ${segment}`, 400);
  }

  const partner = {
    id: `RP-${Date.now()}`,
    partnerName,
    partnerEmail,
    partnerPhone: partnerPhone || null,
    companyName: companyName || null,
    segment,
    referralCode: `CK-${segment.toUpperCase().slice(0, 3)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    tier: REFERRAL_PROGRAM.tiers[0].name,
    referrals: 0,
    revenue: 0,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    referralSource: referralSource || 'direct',
  };

  if (env.AUDIT_LOG) {
    ctx.waitUntil(
      env.AUDIT_LOG.put(`partner:${partner.id}`, JSON.stringify(partner), { expirationTtl: 86400 * 365 })
    );
  }

  return jsonResponse({ partner, message: `Referral partner enrolled. Code: ${partner.referralCode}` }, 201);
}

export function handleReferralProgram() {
  return jsonResponse({
    program: REFERRAL_PROGRAM,
    segments: Object.keys(REFERRAL_SEGMENTS),
    stats: {
      totalPartners: 0,
      activePartners: 0,
      totalReferrals: 0,
      totalCommissionsPaid: 0,
      averageReferralsPerPartner: 0,
      topSegment: null,
    },
  });
}

export function handleReferralCampaigns() {
  return jsonResponse({
    campaigns: Object.values(REFERRAL_SEGMENTS).map(s => ({
      segmentId: s.id,
      segmentName: s.name,
      status: 'ready',
      cadence: s.cadence,
      channels: s.channels,
      templates: s.outreachTemplates.length,
      metrics: s.targetMetrics,
    })),
    totalCampaigns: Object.keys(REFERRAL_SEGMENTS).length,
    automationStatus: 'ready',
  });
}
