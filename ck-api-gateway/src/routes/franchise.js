/**
 * White-Label Franchise Configuration — Phase 5
 *
 *   GET  /v1/franchise/config      — Return the franchise template configuration
 *   POST /v1/franchise/provision   — Provision a new franchise territory
 *   GET  /v1/franchise/territories — List all defined franchise territories
 *
 * Enables Coastal Key to license its property management platform
 * to franchise operators across Florida, each running under their
 * own brand with territory-locked service zones.
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

// ── Service zones grouped by territory ──────────────────────────────────────

const SERVICE_ZONES = {
  'Treasure Coast': {
    territory: 'treasure_coast',
    zones: ['Vero Beach', 'Sebastian', 'Fort Pierce', 'Port Saint Lucie', 'Jensen Beach', 'Hutchinson Island', 'Fellsmere', 'Tradition'],
    availability: 'claimed',
    operator: 'Coastal Key Property Management',
  },
  'Martin County': {
    territory: 'martin_county',
    zones: ['Stuart', 'Palm City', 'Indiantown', 'Hobe Sound', 'Jupiter Island'],
    availability: 'claimed',
    operator: 'Coastal Key Property Management',
  },
  'Palm Beach North': {
    territory: 'palm_beach_north',
    zones: ['Jupiter', 'Palm Beach Gardens', 'Juno Beach', 'Tequesta', 'North Palm Beach'],
    availability: 'available',
    operator: null,
  },
  'Space Coast': {
    territory: 'space_coast',
    zones: ['Melbourne', 'Cocoa Beach', 'Merritt Island', 'Palm Bay', 'Satellite Beach', 'Indialantic'],
    availability: 'available',
    operator: null,
  },
  'Southwest Florida': {
    territory: 'southwest_florida',
    zones: ['Naples', 'Marco Island', 'Bonita Springs', 'Estero', 'Fort Myers Beach', 'Sanibel'],
    availability: 'available',
    operator: null,
  },
  'Tampa Bay': {
    territory: 'tampa_bay',
    zones: ['Tampa', 'St. Petersburg', 'Clearwater', 'Sarasota', 'Bradenton', 'Siesta Key'],
    availability: 'available',
    operator: null,
  },
  'First Coast': {
    territory: 'first_coast',
    zones: ['Jacksonville', 'St. Augustine', 'Ponte Vedra Beach', 'Amelia Island', 'Fernandina Beach'],
    availability: 'available',
    operator: null,
  },
  'Central Florida': {
    territory: 'central_florida',
    zones: ['Orlando', 'Kissimmee', 'Winter Park', 'Celebration', 'Davenport'],
    availability: 'available',
    operator: null,
  },
};

// ── Franchise tier definitions ──────────────────────────────────────────────

const FRANCHISE_TIERS = {
  starter: {
    name: 'Starter',
    maxZones: 3,
    includedAgents: ['SCAA-1', 'CK-SEO-1'],
    monthlyBase: 2500,
    revenueSharePct: 8,
    features: ['lead_capture', 'basic_crm', 'seo_optimization', 'email_templates'],
    supportLevel: 'email',
    onboardingWeeks: 2,
  },
  growth: {
    name: 'Growth',
    maxZones: 8,
    includedAgents: ['SCAA-1', 'CK-SEO-1', 'CK-CONTENT-1', 'CK-PRICING-1'],
    monthlyBase: 5500,
    revenueSharePct: 6,
    features: ['lead_capture', 'advanced_crm', 'seo_optimization', 'content_generation', 'dynamic_pricing', 'call_analytics', 'email_sequences', 'reporting_dashboard'],
    supportLevel: 'priority_email_phone',
    onboardingWeeks: 4,
  },
  enterprise: {
    name: 'Enterprise',
    maxZones: 20,
    includedAgents: ['SCAA-1', 'CK-SEO-1', 'CK-CONTENT-1', 'CK-PRICING-1', 'CK-SOCIAL-1', 'CK-PODCAST-1', 'CK-VIDEO-1', 'CK-RETELL-1'],
    monthlyBase: 12000,
    revenueSharePct: 4,
    features: ['lead_capture', 'advanced_crm', 'seo_optimization', 'content_generation', 'dynamic_pricing', 'call_analytics', 'email_sequences', 'reporting_dashboard', 'video_production', 'podcast_production', 'retell_voice_agents', 'investor_pipeline', 'white_label_portal', 'api_marketplace_access'],
    supportLevel: 'dedicated_account_manager',
    onboardingWeeks: 6,
  },
};

// ── Florida compliance requirements ─────────────────────────────────────────

const COMPLIANCE_REQUIREMENTS = {
  state: 'Florida',
  license: 'Florida Community Association Manager (CAM) License — Chapter 468, Part VIII, F.S.',
  insurance: {
    generalLiability: '$1,000,000 per occurrence / $2,000,000 aggregate',
    professionalLiability: '$1,000,000 per occurrence',
    workersCompensation: 'Required if 4+ employees',
    fidelityBond: 'Required for CAM — minimum $50,000',
  },
  regulations: [
    'Florida Statute 718 — Condominium Act compliance',
    'Florida Statute 720 — HOA governance compliance',
    'Florida Landlord-Tenant Law — Chapter 83, Part II, F.S.',
    'Fair Housing Act compliance (federal + Florida Fair Housing Act)',
    'Security deposit handling — F.S. 83.49',
    'DBPR continuing education — 20 hours biennially',
  ],
  dataPrivacy: 'Florida Information Protection Act (FIPA) — § 501.171, F.S.',
};

export function handleFranchiseConfig(request, env, ctx) {
  const availableTerritories = Object.entries(SERVICE_ZONES)
    .filter(([, data]) => data.availability === 'available')
    .map(([name, data]) => ({
      name,
      territory: data.territory,
      zones: data.zones,
      zoneCount: data.zones.length,
    }));

  const config = {
    platform: 'Coastal Key Franchise Platform',
    version: '5.0.0',
    brand: {
      name: '{{FRANCHISE_NAME}}',
      tagline: '{{TAGLINE}}',
      colors: { primary: '#0B3D6B', secondary: '#D4A853', accent: '#2E8B57', background: '#FFFFFF', text: '#1A1A1A' },
      logoUrl: '{{LOGO_URL}}',
      faviconUrl: '{{FAVICON_URL}}',
      domain: '{{SUBDOMAIN}}.coastalkey-pm.com',
      customDomain: '{{CUSTOM_DOMAIN}}',
    },
    availableTerritories,
    tiers: FRANCHISE_TIERS,
    agentAllocation: {
      description: 'AI agents included per tier. Additional agents available as add-ons.',
      addOnPricing: { 'CK-CONTENT-1': 800, 'CK-PRICING-1': 600, 'CK-SOCIAL-1': 500, 'CK-PODCAST-1': 700, 'CK-VIDEO-1': 900, 'CK-RETELL-1': 1200 },
    },
    featureFlags: {
      enableRetellVoice: false, enableInvestorPipeline: false, enableVideoProduction: false,
      enablePodcastProduction: false, enableApiMarketplace: false, enableWhiteLabelPortal: true,
      enableDynamicPricing: false, enableCallAnalytics: false, enableAdvancedReporting: false,
      enableConstantContactIntegration: true, enableSlackNotifications: true,
    },
    compliance: COMPLIANCE_REQUIREMENTS,
    infrastructure: {
      hosting: 'Cloudflare Workers — edge-deployed per franchise',
      kvNamespacePrefix: '{{TERRITORY_ID}}',
      auditRetentionDays: 30,
      dataResidency: 'US',
    },
  };

  writeAudit(env, ctx, { route: '/v1/franchise/config', action: 'config_viewed' });
  return jsonResponse({ config });
}

export async function handleFranchiseProvision(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { franchiseName, territory, zones, contactEmail, tier } = body;

  if (!franchiseName || typeof franchiseName !== 'string' || franchiseName.trim().length < 2) {
    return errorResponse('"franchiseName" is required and must be at least 2 characters.', 400);
  }
  if (!territory || typeof territory !== 'string') return errorResponse('"territory" is required.', 400);
  if (!Array.isArray(zones) || zones.length === 0) return errorResponse('"zones" must be a non-empty array.', 400);
  if (!contactEmail || typeof contactEmail !== 'string' || !contactEmail.includes('@')) {
    return errorResponse('"contactEmail" must be a valid email.', 400);
  }
  if (!tier || !FRANCHISE_TIERS[tier]) {
    return errorResponse(`"tier" must be one of: ${Object.keys(FRANCHISE_TIERS).join(', ')}.`, 400);
  }

  const territoryEntry = Object.entries(SERVICE_ZONES).find(([, data]) => data.territory === territory);
  if (!territoryEntry) {
    return errorResponse(`Unknown territory "${territory}".`, 400);
  }

  const [territoryName, territoryData] = territoryEntry;

  if (territoryData.availability === 'claimed') {
    return errorResponse(`Territory "${territoryName}" is already claimed by ${territoryData.operator}.`, 409);
  }

  const invalidZones = zones.filter(z => !territoryData.zones.includes(z));
  if (invalidZones.length > 0) {
    return errorResponse(`Zones not found in territory: ${invalidZones.join(', ')}.`, 400);
  }

  const tierConfig = FRANCHISE_TIERS[tier];
  if (zones.length > tierConfig.maxZones) {
    return errorResponse(`Tier "${tierConfig.name}" allows max ${tierConfig.maxZones} zones. Requested: ${zones.length}.`, 400);
  }

  const allClaimedZones = Object.values(SERVICE_ZONES)
    .filter(data => data.availability === 'claimed')
    .flatMap(data => data.zones);
  const overlappingZones = zones.filter(z => allClaimedZones.includes(z));
  if (overlappingZones.length > 0) {
    return errorResponse(`Zone overlap detected: ${overlappingZones.join(', ')}.`, 409);
  }

  const subdomain = franchiseName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const kvPrefix = `franchise:${territory}:${subdomain}`;
  const estimatedMonthlyCost = tierConfig.monthlyBase + (zones.length * 150);

  const provisioningPlan = {
    status: 'pending_approval',
    franchise: { name: franchiseName.trim(), territory: territoryName, territoryId: territory, contactEmail, tier: tierConfig.name },
    zones: { requested: zones, count: zones.length, maxAllowed: tierConfig.maxZones, remaining: tierConfig.maxZones - zones.length },
    allocatedAgents: tierConfig.includedAgents,
    infrastructure: {
      subdomain: `${subdomain}.coastalkey-pm.com`,
      kvNamespacePrefix: kvPrefix,
      auditNamespace: `${kvPrefix}:audit`,
      sessionsNamespace: `${kvPrefix}:sessions`,
      cacheNamespace: `${kvPrefix}:cache`,
    },
    cost: {
      monthlyBase: tierConfig.monthlyBase,
      zoneOverhead: zones.length * 150,
      estimatedMonthly: estimatedMonthlyCost,
      estimatedAnnual: estimatedMonthlyCost * 12,
      revenueSharePct: tierConfig.revenueSharePct,
      currency: 'USD',
    },
    features: tierConfig.features,
    supportLevel: tierConfig.supportLevel,
    onboarding: {
      estimatedWeeks: tierConfig.onboardingWeeks,
      includes: ['Platform configuration and branding setup', 'Agent training and customization', 'CRM data migration assistance', 'Compliance documentation review', 'Go-live support and monitoring'],
    },
    compliance: COMPLIANCE_REQUIREMENTS,
    nextSteps: ['Review this provisioning plan with your team', 'Sign the Coastal Key Franchise Agreement', 'Submit CAM license verification for your territory', 'Complete onboarding payment ($5,000 one-time setup)', 'Schedule kickoff call with your dedicated onboarding specialist'],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  writeAudit(env, ctx, { route: '/v1/franchise/provision', action: 'provision_plan_created', franchiseName: franchiseName.trim(), territory, zones, tier, contactEmail, estimatedMonthlyCost });
  return jsonResponse({ provisioningPlan }, 201);
}

export function handleFranchiseTerritories(request, env, ctx) {
  const territories = Object.entries(SERVICE_ZONES).map(([name, data]) => ({
    name, territory: data.territory, zones: data.zones, zoneCount: data.zones.length,
    availability: data.availability, operator: data.operator,
  }));
  const summary = {
    total: territories.length,
    claimed: territories.filter(t => t.availability === 'claimed').length,
    available: territories.filter(t => t.availability === 'available').length,
    totalZones: territories.reduce((sum, t) => sum + t.zoneCount, 0),
  };
  writeAudit(env, ctx, { route: '/v1/franchise/territories', action: 'territories_listed' });
  return jsonResponse({ territories, summary });
}
