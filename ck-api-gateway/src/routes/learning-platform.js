/**
 * Learning Platform Routes — Coastal Key Academy
 * Online learning platform for home watch & property management
 * Three pricing tiers: Starter, Professional, Enterprise
 */

import { jsonResponse, errorResponse } from '../utils/response.js';

const PRICING_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 47,
    interval: 'month',
    annualPrice: 470,
    tagline: 'Launch your home watch business',
    features: [
      'Home Watch Fundamentals (12 modules)',
      'Property Inspection Checklists',
      'Basic Business Setup Templates',
      'Insurance & Licensing Guide (FL)',
      'Community Forum Access',
      'Monthly Group Q&A Call',
    ],
    modules: 12,
    certificationIncluded: false,
    supportLevel: 'community',
    targetAudience: 'Aspiring home watch entrepreneurs',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 197,
    interval: 'month',
    annualPrice: 1970,
    tagline: 'Scale with AI-powered operations',
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced Property Management (24 modules)',
      'AI Operations Playbook',
      'Coastal Key SOP Library (47 procedures)',
      'Vendor Management Framework',
      'Client Acquisition Templates',
      'Financial Modeling Spreadsheets',
      'Weekly Live Coaching Session',
      'Private Slack Community',
      'CK Certified Professional Badge',
    ],
    modules: 36,
    certificationIncluded: true,
    supportLevel: 'priority',
    targetAudience: 'Active home watch and property management operators',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 497,
    interval: 'month',
    annualPrice: 4970,
    tagline: 'Full franchise-ready AI platform access',
    features: [
      'Everything in Professional',
      'Full AI Agent Fleet Training (383-agent architecture)',
      'Franchise Operations Manual',
      'Territory Analysis & Market Entry Playbook',
      'White-Label Client Portal Setup',
      'Dedicated Success Manager',
      'API Access to CK Platform',
      'Custom AI Agent Configuration',
      'Revenue Optimization Engine Access',
      'Quarterly Strategy Sessions with CEO',
      'Investor Pitch Deck Templates',
      'Acquisition Due Diligence Framework',
    ],
    modules: 60,
    certificationIncluded: true,
    supportLevel: 'dedicated',
    targetAudience: 'Multi-territory operators and franchise candidates',
  },
};

const COURSE_CATALOG = {
  fundamentals: {
    id: 'fundamentals',
    title: 'Home Watch Fundamentals',
    tier: 'starter',
    modules: [
      { id: 'F-01', title: 'What is Home Watch — Industry Overview', duration: 45, type: 'video' },
      { id: 'F-02', title: 'Florida Licensing & Insurance Requirements', duration: 60, type: 'video' },
      { id: 'F-03', title: 'Property Inspection Standards (NHWA)', duration: 55, type: 'video' },
      { id: 'F-04', title: 'Risk Assessment — Water, Mold, Pest, Storm', duration: 50, type: 'video' },
      { id: 'F-05', title: 'Client Onboarding Process', duration: 40, type: 'video' },
      { id: 'F-06', title: 'Inspection Report Writing', duration: 45, type: 'workshop' },
      { id: 'F-07', title: 'Emergency Response Protocols', duration: 35, type: 'video' },
      { id: 'F-08', title: 'Seasonal Property Care — Hurricane Prep', duration: 50, type: 'video' },
      { id: 'F-09', title: 'Vendor Coordination Basics', duration: 30, type: 'video' },
      { id: 'F-10', title: 'Pricing Your Services', duration: 40, type: 'workshop' },
      { id: 'F-11', title: 'Marketing for Home Watch — Getting First Clients', duration: 55, type: 'video' },
      { id: 'F-12', title: 'Business Entity Setup & Accounting Basics', duration: 45, type: 'video' },
    ],
  },
  advanced_pm: {
    id: 'advanced_pm',
    title: 'Advanced Property Management',
    tier: 'professional',
    modules: [
      { id: 'AP-01', title: 'Scaling from Home Watch to Full PM', duration: 60, type: 'video' },
      { id: 'AP-02', title: 'Tenant Screening & Lease Management', duration: 55, type: 'video' },
      { id: 'AP-03', title: 'Maintenance Workflow Automation', duration: 50, type: 'workshop' },
      { id: 'AP-04', title: 'Financial Management — Trust Accounts & Escrow', duration: 65, type: 'video' },
      { id: 'AP-05', title: 'Fair Housing Compliance', duration: 45, type: 'video' },
      { id: 'AP-06', title: 'Vendor Contract Negotiation', duration: 40, type: 'video' },
      { id: 'AP-07', title: 'Client Retention & Expansion Strategy', duration: 50, type: 'video' },
      { id: 'AP-08', title: 'Technology Stack for Modern PM', duration: 55, type: 'workshop' },
      { id: 'AP-09', title: 'Revenue Optimization — Dynamic Pricing', duration: 45, type: 'video' },
      { id: 'AP-10', title: 'STR Management — Airbnb & VRBO', duration: 60, type: 'video' },
      { id: 'AP-11', title: 'Insurance Claims & Liability Management', duration: 50, type: 'video' },
      { id: 'AP-12', title: 'Building a Referral Network', duration: 40, type: 'video' },
      { id: 'AP-13', title: 'Data-Driven Decision Making', duration: 45, type: 'workshop' },
      { id: 'AP-14', title: 'Staff Hiring & Training Systems', duration: 55, type: 'video' },
      { id: 'AP-15', title: 'Investor Relations & Reporting', duration: 50, type: 'video' },
      { id: 'AP-16', title: 'Market Analysis — Finding Your Niche', duration: 45, type: 'video' },
      { id: 'AP-17', title: 'Operations Dashboard & KPI Tracking', duration: 40, type: 'workshop' },
      { id: 'AP-18', title: 'Crisis Management & Business Continuity', duration: 50, type: 'video' },
      { id: 'AP-19', title: 'Legal Compliance — FL Statutes 468 & 83', duration: 55, type: 'video' },
      { id: 'AP-20', title: 'Accounting & Tax Strategy for PM Companies', duration: 60, type: 'video' },
      { id: 'AP-21', title: 'Building SOPs — The Ferrari Standard', duration: 45, type: 'workshop' },
      { id: 'AP-22', title: 'Client Communication Automation', duration: 40, type: 'video' },
      { id: 'AP-23', title: 'Portfolio Growth — 50 to 200 Doors', duration: 55, type: 'video' },
      { id: 'AP-24', title: 'Exit Strategy & Valuation', duration: 50, type: 'video' },
    ],
  },
  ai_operations: {
    id: 'ai_operations',
    title: 'AI-Powered Property Operations',
    tier: 'enterprise',
    modules: [
      { id: 'AI-01', title: 'AI Agent Architecture — 383-Unit Fleet Design', duration: 75, type: 'video' },
      { id: 'AI-02', title: 'Building Your First AI Agent Division', duration: 60, type: 'workshop' },
      { id: 'AI-03', title: 'MCCO Sovereign Governance Framework', duration: 55, type: 'video' },
      { id: 'AI-04', title: 'Automated Lead Qualification & Routing', duration: 50, type: 'workshop' },
      { id: 'AI-05', title: 'Voice AI — Retell & Atlas Integration', duration: 65, type: 'video' },
      { id: 'AI-06', title: 'Content Automation Pipeline', duration: 55, type: 'workshop' },
      { id: 'AI-07', title: 'Financial Engine — AI-Driven Pricing', duration: 50, type: 'video' },
      { id: 'AI-08', title: 'Intelligence Officer Fleet Deployment', duration: 45, type: 'video' },
      { id: 'AI-09', title: 'Franchise Architecture & Replication', duration: 70, type: 'video' },
      { id: 'AI-10', title: 'API Gateway — Building Your Platform', duration: 60, type: 'workshop' },
      { id: 'AI-11', title: 'Cloudflare Edge Deployment', duration: 45, type: 'workshop' },
      { id: 'AI-12', title: 'Revenue Attribution & LTV Modeling', duration: 55, type: 'video' },
      { id: 'AI-13', title: 'Acquisition Due Diligence Automation', duration: 50, type: 'video' },
      { id: 'AI-14', title: 'Territory Density Strategy', duration: 45, type: 'video' },
      { id: 'AI-15', title: 'Investor Deck & Series A Preparation', duration: 60, type: 'video' },
      { id: 'AI-16', title: 'Building the Digital Twin Dashboard', duration: 55, type: 'workshop' },
      { id: 'AI-17', title: 'Compliance Automation — TCPA, Fair Housing', duration: 45, type: 'video' },
      { id: 'AI-18', title: 'Multi-Market Expansion Playbook', duration: 65, type: 'video' },
      { id: 'AI-19', title: 'CEO Operating System — 5 Min/Day Dashboard', duration: 40, type: 'video' },
      { id: 'AI-20', title: 'Capstone — Launch Your AI-Powered PM Company', duration: 90, type: 'workshop' },
    ],
  },
};

const ENROLLMENT_STATS = {
  totalStudents: 0,
  activeStudents: 0,
  completionRate: 0,
  averageRating: 0,
  certificationsIssued: 0,
  revenueGenerated: 0,
  byTier: {
    starter: { enrolled: 0, active: 0, completed: 0, revenue: 0 },
    professional: { enrolled: 0, active: 0, completed: 0, revenue: 0 },
    enterprise: { enrolled: 0, active: 0, completed: 0, revenue: 0 },
  },
};

export function handleLearningDashboard() {
  return jsonResponse({
    platform: 'Coastal Key Academy',
    tagline: 'The definitive education platform for AI-powered property management',
    version: '1.0.0',
    tiers: Object.values(PRICING_TIERS),
    courseCount: Object.keys(COURSE_CATALOG).length,
    totalModules: Object.values(COURSE_CATALOG).reduce((sum, c) => sum + c.modules.length, 0),
    stats: ENROLLMENT_STATS,
    certifications: [
      { id: 'CK-HWP', name: 'CK Certified Home Watch Professional', tier: 'professional', requirements: 'Complete all Starter + Professional modules, pass final assessment' },
      { id: 'CK-AIO', name: 'CK AI Operations Specialist', tier: 'enterprise', requirements: 'Complete all modules across all tiers, submit capstone project' },
    ],
    status: 'active',
  });
}

export function handleLearningPricing() {
  return jsonResponse({
    platform: 'Coastal Key Academy',
    currency: 'USD',
    tiers: Object.values(PRICING_TIERS),
    comparison: {
      starter: { monthlyTotal: 47, annualSavings: 94, bestFor: 'New entrepreneurs exploring home watch' },
      professional: { monthlyTotal: 197, annualSavings: 394, bestFor: 'Active operators scaling their business' },
      enterprise: { monthlyTotal: 497, annualSavings: 994, bestFor: 'Multi-territory operators and franchise candidates' },
    },
    guarantees: [
      '30-day money-back guarantee on all tiers',
      'Lifetime access to purchased course content',
      'Free updates as curriculum evolves',
    ],
  });
}

export function handleLearningCourses(url) {
  const tier = url.searchParams.get('tier');
  let courses = Object.values(COURSE_CATALOG);
  if (tier && PRICING_TIERS[tier]) {
    const tierOrder = ['starter', 'professional', 'enterprise'];
    const maxIndex = tierOrder.indexOf(tier);
    const allowedTiers = tierOrder.slice(0, maxIndex + 1);
    courses = courses.filter(c => allowedTiers.includes(c.tier));
  }
  return jsonResponse({
    courses,
    totalModules: courses.reduce((sum, c) => sum + c.modules.length, 0),
    totalDuration: courses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m.duration, 0), 0),
  });
}

export function handleLearningCourse(courseId) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return errorResponse(`Course not found: ${courseId}`, 404);
  const tier = PRICING_TIERS[course.tier];
  return jsonResponse({
    ...course,
    tierRequired: tier.name,
    tierPrice: tier.price,
    totalDuration: course.modules.reduce((sum, m) => sum + m.duration, 0),
  });
}

export async function handleLearningEnroll(request, env, ctx) {
  const body = await request.json();
  const { email, name, tier, paymentMethod } = body;

  if (!email || !name || !tier) {
    return errorResponse('Missing required fields: email, name, tier', 400);
  }
  if (!PRICING_TIERS[tier]) {
    return errorResponse(`Invalid tier: ${tier}. Valid: starter, professional, enterprise`, 400);
  }

  const selectedTier = PRICING_TIERS[tier];
  const enrollment = {
    id: `ENR-${Date.now()}`,
    email,
    name,
    tier,
    tierName: selectedTier.name,
    price: selectedTier.price,
    interval: selectedTier.interval,
    status: 'pending_payment',
    enrolledAt: new Date().toISOString(),
    coursesUnlocked: Object.values(COURSE_CATALOG)
      .filter(c => {
        const tierOrder = ['starter', 'professional', 'enterprise'];
        return tierOrder.indexOf(c.tier) <= tierOrder.indexOf(tier);
      })
      .map(c => c.id),
  };

  if (env.AUDIT_LOG) {
    ctx.waitUntil(
      env.AUDIT_LOG.put(`enrollment:${enrollment.id}`, JSON.stringify(enrollment), { expirationTtl: 86400 * 365 })
    );
  }

  return jsonResponse({ enrollment, message: `Enrollment initiated for ${selectedTier.name} tier` }, 201);
}

export function handleLearningStats() {
  return jsonResponse({
    platform: 'Coastal Key Academy',
    stats: ENROLLMENT_STATS,
    revenue: {
      mrr: 0,
      arr: 0,
      target: { mrr: 50000, arr: 600000 },
      breakdown: {
        starter: { subscribers: 0, mrr: 0 },
        professional: { subscribers: 0, mrr: 0 },
        enterprise: { subscribers: 0, mrr: 0 },
      },
    },
  });
}
