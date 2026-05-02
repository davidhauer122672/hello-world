const CERTIFICATION_TRACKS = [
  {
    id: 'CERT-HW',
    name: 'Home Watch Professional',
    division: 'OPS',
    modules: 8,
    hours: 24,
    levels: ['Foundation', 'Certified', 'Master'],
    skills: ['property inspection', 'storm preparation', 'vendor coordination', 'client reporting'],
    prerequisite: null,
  },
  {
    id: 'CERT-PM',
    name: 'Property Management Excellence',
    division: 'OPS',
    modules: 12,
    hours: 40,
    levels: ['Foundation', 'Certified', 'Master'],
    skills: ['tenant management', 'maintenance coordination', 'lease administration', 'financial reporting', 'FL landlord-tenant law'],
    prerequisite: null,
  },
  {
    id: 'CERT-IR',
    name: 'Investor Relations Specialist',
    division: 'FIN',
    modules: 10,
    hours: 32,
    levels: ['Foundation', 'Certified', 'Master'],
    skills: ['ROI analysis', 'cap rate calculation', 'investor communications', 'portfolio management', 'market forecasting'],
    prerequisite: 'CERT-PM',
  },
  {
    id: 'CERT-HP',
    name: 'Hurricane Preparedness Commander',
    division: 'OPS',
    modules: 6,
    hours: 18,
    levels: ['Foundation', 'Certified'],
    skills: ['storm tracking', 'shutter installation', 'emergency communication', 'insurance documentation', 'FEMA coordination'],
    prerequisite: null,
  },
  {
    id: 'CERT-LP',
    name: 'Luxury Property Concierge',
    division: 'SEN',
    modules: 10,
    hours: 30,
    levels: ['Foundation', 'Certified', 'Master'],
    skills: ['high-net-worth client service', 'estate management', 'concierge coordination', 'privacy protocols', 'luxury vendor network'],
    prerequisite: 'CERT-HW',
  },
];

const RECRUITMENT_PIPELINE = {
  stages: [
    { id: 'SOURCING', name: 'Sourcing', avgDays: 14 },
    { id: 'SCREENING', name: 'Screening', avgDays: 7 },
    { id: 'INTERVIEW', name: 'Interview', avgDays: 10 },
    { id: 'ASSESSMENT', name: 'Skills Assessment', avgDays: 5 },
    { id: 'OFFER', name: 'Offer', avgDays: 3 },
    { id: 'ONBOARDING', name: 'Onboarding', avgDays: 14 },
  ],
  divisionNeeds: {
    OPS: { openRoles: 3, priority: 'high', skills: ['property inspection', 'maintenance coordination', 'FL licensed'] },
    SEN: { openRoles: 2, priority: 'medium', skills: ['sales experience', 'CRM proficiency', 'real estate knowledge'] },
    MKT: { openRoles: 1, priority: 'medium', skills: ['content creation', 'social media', 'SEO'] },
    FIN: { openRoles: 1, priority: 'low', skills: ['bookkeeping', 'QuickBooks', 'property accounting'] },
    TEC: { openRoles: 2, priority: 'high', skills: ['Cloudflare Workers', 'API development', 'Airtable'] },
  },
  capacityModel: {
    currentHeadcount: 12,
    targetHeadcount: 20,
    avgCostPerHire: 4500,
    avgTimeToFill: 42,
    retentionRate: 0.88,
  },
};

const REFERRAL_TIERS = [
  {
    id: 'BRONZE',
    name: 'Bronze Partner',
    threshold: 1,
    reward: 250,
    rewardType: 'cash',
    benefits: ['Thank-you package', '$250 per closed referral'],
  },
  {
    id: 'SILVER',
    name: 'Silver Partner',
    threshold: 3,
    reward: 500,
    rewardType: 'cash',
    benefits: ['Priority service', '$500 per closed referral', 'Quarterly newsletter feature'],
  },
  {
    id: 'GOLD',
    name: 'Gold Partner',
    threshold: 7,
    reward: 750,
    rewardType: 'cash',
    benefits: ['VIP service tier', '$750 per closed referral', 'Annual appreciation dinner', 'Co-branded marketing'],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum Partner',
    threshold: 15,
    reward: 1000,
    rewardType: 'cash',
    benefits: ['White-glove service', '$1,000 per closed referral', 'Revenue share option', 'Advisory board seat', 'Custom referral portal'],
  },
];

function getGrowthDashboard() {
  const totalModules = CERTIFICATION_TRACKS.reduce((s, t) => s + t.modules, 0);
  const totalHours = CERTIFICATION_TRACKS.reduce((s, t) => s + t.hours, 0);
  const openRoles = Object.values(RECRUITMENT_PIPELINE.divisionNeeds).reduce((s, d) => s + d.openRoles, 0);

  return {
    platform: 'Coastal Key Growth Platform',
    version: '1.0.0',
    learning: {
      tracks: CERTIFICATION_TRACKS.length,
      totalModules,
      totalHours,
      levels: ['Foundation', 'Certified', 'Master'],
    },
    recruitment: {
      pipelineStages: RECRUITMENT_PIPELINE.stages.length,
      openRoles,
      currentHeadcount: RECRUITMENT_PIPELINE.capacityModel.currentHeadcount,
      targetHeadcount: RECRUITMENT_PIPELINE.capacityModel.targetHeadcount,
    },
    referral: {
      tiers: REFERRAL_TIERS.length,
      maxRewardPerReferral: REFERRAL_TIERS[REFERRAL_TIERS.length - 1].reward,
    },
    timestamp: new Date().toISOString(),
  };
}

export {
  CERTIFICATION_TRACKS,
  RECRUITMENT_PIPELINE,
  REFERRAL_TIERS,
  getGrowthDashboard,
};
