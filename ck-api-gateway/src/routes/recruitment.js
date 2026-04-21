/**
 * AI Recruitment Engine — Coastal Key Field Staff Hiring
 * Automated pipeline: job posting → screening → scheduling → onboarding
 */

import { jsonResponse, errorResponse } from '../utils/response.js';

const POSITIONS = {
  'FT-001': {
    id: 'FT-001',
    title: 'Field Technician — Home Watch Inspector',
    department: 'Operations',
    type: 'full_time',
    location: 'Treasure Coast, FL',
    zones: ['Vero Beach', 'Sebastian', 'Fort Pierce', 'Port Saint Lucie', 'Stuart'],
    compensation: { range: '$18-$24/hr', type: 'hourly', benefits: true },
    requirements: [
      'Valid Florida driver\'s license and reliable vehicle',
      'Smartphone with camera capability',
      'Ability to pass Level 2 background check',
      'Basic knowledge of residential systems (HVAC, plumbing, electrical)',
      'Physical ability to inspect properties (standing, walking, climbing)',
      'Availability for emergency response calls',
    ],
    preferred: [
      'Home inspection certification (ASHI, InterNACHI)',
      'Property management experience',
      'Bilingual (English/Spanish)',
      'OSHA 10 certification',
    ],
    responsibilities: [
      'Conduct scheduled property inspections per CK SOP',
      'Document findings with timestamped photo reports',
      'Identify and report water, mold, pest, and storm damage risks',
      'Coordinate with vendors for maintenance and repairs',
      'Respond to emergency property alerts within 60 minutes',
      'Maintain inspection equipment and vehicle',
      'Complete digital inspection reports via CK mobile app',
    ],
    status: 'active',
  },
  'FT-002': {
    id: 'FT-002',
    title: 'Senior Field Technician — Territory Lead',
    department: 'Operations',
    type: 'full_time',
    location: 'Treasure Coast, FL',
    zones: ['Stuart', 'Jensen Beach', 'Palm City', 'Hobe Sound', 'Jupiter'],
    compensation: { range: '$24-$32/hr', type: 'hourly', benefits: true },
    requirements: [
      'All FT-001 requirements',
      '2+ years property inspection or home watch experience',
      'Team leadership experience (3+ direct reports)',
      'Advanced knowledge of FL building codes and insurance requirements',
      'Proficiency with property management software',
    ],
    preferred: [
      'NHWA Certified Home Watch Professional',
      'CAM license or equivalent',
      'Storm damage assessment training',
    ],
    responsibilities: [
      'All FT-001 responsibilities',
      'Supervise and train junior field technicians',
      'Manage territory schedule and route optimization',
      'Conduct quality assurance reviews on inspection reports',
      'Handle escalated property issues and client communications',
      'Participate in weekly operations review with AI fleet',
    ],
    status: 'active',
  },
  'FT-003': {
    id: 'FT-003',
    title: 'Maintenance Coordinator',
    department: 'Operations',
    type: 'full_time',
    location: 'Port Saint Lucie, FL (HQ)',
    zones: ['All Treasure Coast'],
    compensation: { range: '$45,000-$55,000/yr', type: 'salary', benefits: true },
    requirements: [
      'Experience coordinating maintenance and repair work',
      'Strong vendor management and negotiation skills',
      'Proficiency with work order management systems',
      'Knowledge of residential maintenance best practices',
      'Excellent communication skills (written and verbal)',
    ],
    preferred: [
      'Property management company experience',
      'EPA 608 certification',
      'HVAC or plumbing trade background',
    ],
    responsibilities: [
      'Manage all maintenance work orders and vendor dispatch',
      'Negotiate vendor contracts and pricing',
      'Track work order completion and quality',
      'Maintain preferred vendor roster and compliance records',
      'Coordinate emergency repairs with field technicians',
      'Generate weekly maintenance reports for operations review',
    ],
    status: 'active',
  },
  'FT-004': {
    id: 'FT-004',
    title: 'Client Success Manager',
    department: 'Sales',
    type: 'full_time',
    location: 'Remote (FL-based preferred)',
    zones: ['All Treasure Coast'],
    compensation: { range: '$50,000-$65,000/yr + commission', type: 'salary', benefits: true },
    requirements: [
      'Client-facing experience in property management or real estate',
      'CRM proficiency (Airtable, Salesforce, or equivalent)',
      'Strong relationship management skills',
      'Ability to handle client escalations with empathy and precision',
      'Data-driven approach to client retention',
    ],
    preferred: [
      'Property management industry experience',
      'Experience with AI-powered customer success tools',
      'Bilingual (English/Spanish)',
    ],
    responsibilities: [
      'Own client onboarding and ongoing relationship management',
      'Monitor client satisfaction metrics and NPS scores',
      'Identify cross-sell and upsell opportunities',
      'Coordinate with operations team on service delivery',
      'Manage quarterly business reviews with key clients',
      'Drive referral program participation',
    ],
    status: 'active',
  },
};

const SCREENING_CRITERIA = {
  required: [
    { criterion: 'background_check', weight: 0.25, passThreshold: 'clear' },
    { criterion: 'drivers_license', weight: 0.15, passThreshold: 'valid_fl' },
    { criterion: 'availability', weight: 0.15, passThreshold: 'meets_schedule' },
    { criterion: 'location', weight: 0.15, passThreshold: 'within_territory' },
  ],
  scored: [
    { criterion: 'experience_years', weight: 0.10, maxScore: 10 },
    { criterion: 'certifications', weight: 0.08, maxScore: 10 },
    { criterion: 'references', weight: 0.07, maxScore: 10 },
    { criterion: 'technical_assessment', weight: 0.05, maxScore: 10 },
  ],
};

const PIPELINE_STAGES = [
  { id: 'applied', name: 'Applied', sla: '24h review' },
  { id: 'ai_screened', name: 'AI Screened', sla: 'Immediate' },
  { id: 'phone_screen', name: 'Phone Screen', sla: '48h' },
  { id: 'interview', name: 'Interview', sla: '5 business days' },
  { id: 'assessment', name: 'Technical Assessment', sla: '3 business days' },
  { id: 'background_check', name: 'Background Check', sla: '7 business days' },
  { id: 'offer', name: 'Offer Extended', sla: '24h' },
  { id: 'onboarding', name: 'Onboarding', sla: '14 days' },
  { id: 'active', name: 'Active Employee', sla: null },
];

export function handleRecruitmentDashboard() {
  return jsonResponse({
    engine: 'Coastal Key AI Recruitment Engine',
    version: '1.0.0',
    openPositions: Object.values(POSITIONS).filter(p => p.status === 'active').length,
    positions: Object.values(POSITIONS),
    pipeline: {
      stages: PIPELINE_STAGES,
      candidates: { total: 0, byStage: {} },
    },
    screeningCriteria: SCREENING_CRITERIA,
    metrics: {
      timeToHire: { target: '14 days', current: null },
      costPerHire: { target: '$500', current: null },
      offerAcceptanceRate: { target: '85%', current: null },
      qualityOfHire: { target: '4.5/5 at 90 days', current: null },
      retentionRate: { target: '90% at 6 months', current: null },
    },
    aiCapabilities: [
      'Resume parsing and keyword extraction',
      'Automated screening against position requirements',
      'Candidate scoring and ranking',
      'Interview scheduling via calendar integration',
      'Reference check automation',
      'Onboarding document generation',
      'Training module assignment based on role',
    ],
    status: 'active',
  });
}

export function handleRecruitmentPositions(url) {
  const department = url.searchParams.get('department');
  const status = url.searchParams.get('status') || 'active';
  let positions = Object.values(POSITIONS);
  if (department) positions = positions.filter(p => p.department.toLowerCase() === department.toLowerCase());
  if (status) positions = positions.filter(p => p.status === status);
  return jsonResponse({ positions, count: positions.length });
}

export function handleRecruitmentPosition(positionId) {
  const position = POSITIONS[positionId];
  if (!position) return errorResponse(`Position not found: ${positionId}`, 404);
  return jsonResponse(position);
}

export async function handleRecruitmentApply(request, env, ctx) {
  const body = await request.json();
  const { positionId, name, email, phone, resumeText, coverLetter, location, yearsExperience } = body;

  if (!positionId || !name || !email || !phone) {
    return errorResponse('Missing required fields: positionId, name, email, phone', 400);
  }
  if (!POSITIONS[positionId]) {
    return errorResponse(`Invalid position: ${positionId}`, 400);
  }

  const position = POSITIONS[positionId];
  const application = {
    id: `APP-${Date.now()}`,
    positionId,
    positionTitle: position.title,
    candidate: { name, email, phone, location, yearsExperience },
    resumeText: resumeText || null,
    coverLetter: coverLetter || null,
    stage: 'applied',
    aiScreeningScore: null,
    appliedAt: new Date().toISOString(),
    timeline: [{ stage: 'applied', timestamp: new Date().toISOString() }],
  };

  if (env.AUDIT_LOG) {
    ctx.waitUntil(
      env.AUDIT_LOG.put(`recruitment:${application.id}`, JSON.stringify(application), { expirationTtl: 86400 * 180 })
    );
  }

  return jsonResponse({ application, message: 'Application received. AI screening will process within 24 hours.' }, 201);
}

export async function handleRecruitmentScreen(request, env, ctx) {
  const body = await request.json();
  const { applicationId, resumeText, positionId } = body;

  if (!applicationId || !resumeText || !positionId) {
    return errorResponse('Missing required fields: applicationId, resumeText, positionId', 400);
  }

  const position = POSITIONS[positionId];
  if (!position) return errorResponse(`Invalid position: ${positionId}`, 400);

  const prompt = `You are an expert HR screening assistant for Coastal Key Property Management, a luxury home watch and property management company on the Treasure Coast of Florida.

Evaluate this candidate's resume against the position requirements. Score each category 1-10.

POSITION: ${position.title}
REQUIREMENTS: ${position.requirements.join('; ')}
PREFERRED: ${position.preferred.join('; ')}

RESUME TEXT:
${resumeText}

Respond in JSON format:
{
  "overallScore": <1-10>,
  "recommendation": "advance|hold|reject",
  "scores": {
    "experienceMatch": <1-10>,
    "skillsMatch": <1-10>,
    "locationFit": <1-10>,
    "certifications": <1-10>,
    "cultureFit": <1-10>
  },
  "strengths": ["..."],
  "concerns": ["..."],
  "suggestedQuestions": ["..."]
}`;

  try {
    const { inference } = await import('../services/anthropic.js');
    const result = await inference(env, {
      prompt,
      systemPrompt: 'You are an HR screening assistant. Return only valid JSON.',
      maxTokens: 1000,
      temperature: 0.3,
    });

    let screening;
    try {
      screening = JSON.parse(result.text);
    } catch {
      screening = { rawResponse: result.text, overallScore: null, recommendation: 'manual_review' };
    }

    const screeningResult = {
      applicationId,
      positionId,
      screening,
      screenedAt: new Date().toISOString(),
      model: result.model || 'claude-sonnet-4-6',
    };

    if (env.AUDIT_LOG) {
      ctx.waitUntil(
        env.AUDIT_LOG.put(`screening:${applicationId}`, JSON.stringify(screeningResult), { expirationTtl: 86400 * 180 })
      );
    }

    return jsonResponse(screeningResult);
  } catch (err) {
    return errorResponse(`Screening failed: ${err.message}`, 500);
  }
}

export function handleRecruitmentPipeline() {
  return jsonResponse({
    pipeline: PIPELINE_STAGES,
    candidates: { total: 0, byStage: {} },
    metrics: {
      averageTimeInStage: {},
      conversionRates: {},
      bottlenecks: [],
    },
  });
}

export function handleRecruitmentOnboarding() {
  return jsonResponse({
    onboardingChecklist: [
      { id: 'OB-01', task: 'Complete W-4 and I-9 forms', category: 'legal', sla: 'Day 1' },
      { id: 'OB-02', task: 'Background check clearance received', category: 'compliance', sla: 'Pre-start' },
      { id: 'OB-03', task: 'Equipment issued (phone, tablet, inspection kit)', category: 'equipment', sla: 'Day 1' },
      { id: 'OB-04', task: 'Vehicle insurance verification', category: 'compliance', sla: 'Day 1' },
      { id: 'OB-05', task: 'CK Academy — Fundamentals course enrollment', category: 'training', sla: 'Day 1' },
      { id: 'OB-06', task: 'Shadow ride with senior technician (3 properties)', category: 'training', sla: 'Week 1' },
      { id: 'OB-07', task: 'Complete first solo inspection (supervised)', category: 'training', sla: 'Week 1' },
      { id: 'OB-08', task: 'CK mobile app setup and training', category: 'technology', sla: 'Day 1' },
      { id: 'OB-09', task: 'Emergency response protocol review', category: 'safety', sla: 'Day 2' },
      { id: 'OB-10', task: 'Territory familiarization drive', category: 'operations', sla: 'Week 1' },
      { id: 'OB-11', task: 'Client interaction guidelines review', category: 'service', sla: 'Day 2' },
      { id: 'OB-12', task: 'Pass Fundamentals quiz (80% minimum)', category: 'training', sla: 'Week 2' },
      { id: 'OB-13', task: 'Complete 5 supervised inspections', category: 'training', sla: 'Week 2' },
      { id: 'OB-14', task: 'Full clearance for solo operations', category: 'operations', sla: 'Week 3' },
    ],
    trainingModules: [
      'CK Academy Fundamentals (12 modules)',
      'Inspection SOP Training (hands-on)',
      'Emergency Response Certification',
      'Client Communication Standards',
      'Mobile App and Reporting Training',
    ],
    equipmentKit: [
      'CK-branded polo shirts (3)',
      'Inspection flashlight (LED, waterproof)',
      'Moisture meter',
      'Digital thermometer / hygrometer',
      'Inspection tablet (pre-loaded with CK app)',
      'First aid kit',
      'PPE kit (gloves, shoe covers, mask)',
      'Vehicle magnetic signs (CK branding)',
    ],
  });
}
