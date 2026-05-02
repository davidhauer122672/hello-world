/**
 * 30-Day Distribution Plan Engine
 *
 * Realistic distribution plan for three business types across
 * 40+ audience segments.  Aligned with Peak-Time Intelligence
 * Engine scheduling matrix for exact posting windows.
 *
 * Business Types:
 *   1. Coastal Key Estate Management (Home Watch & PM)
 *   2. Coastal Key Property Management Software (SaaS)
 *   3. Coastal Key Software Development (Enterprise)
 */

import { PLATFORMS } from './scheduling-matrix.js';
import { TARGET_SEGMENTS, BUSINESS_TYPES } from './sovereign-marketing-officer.js';

// ── Content Themes by Week ─────────────────────────────────────────────────

export const WEEKLY_THEMES = [
  {
    week: 1,
    theme: 'Authority Establishment & Problem Awareness',
    objective: 'Establish Coastal Key as the AI-powered leader. Surface the top problems that the target audience faces daily.',
    contentFocus: [
      'CEO story: Why I built a 360-agent AI fleet for property management',
      'Problem-agitation: The real cost of undetected water damage in vacant homes',
      'Authority stat: Insurance carriers now require documented inspections',
      'Social proof: Client testimonial on AI-detected leak that saved $47K',
      'Education: 5 things every absentee homeowner must check monthly',
    ],
  },
  {
    week: 2,
    theme: 'Solution Positioning & Trust Building',
    objective: 'Show exactly how Coastal Key solves the problems surfaced in Week 1. Build trust through specifics.',
    contentFocus: [
      'Product demo: Inside a 40-point AI-powered property inspection',
      'Comparison: Traditional home watch vs. AI-powered monitoring (no contest)',
      'Behind the scenes: How 360 AI agents monitor your property 24/7',
      'Case study: From 12 vendor issues to zero in 90 days',
      'Trust builder: Our insurance documentation that saves owners 5-15% on premiums',
    ],
  },
  {
    week: 3,
    theme: 'Conversion & Offer Acceleration',
    objective: 'Drive qualified leads with direct offers. Activate urgency through seasonal and compliance triggers.',
    contentFocus: [
      'Offer launch: Free property assessment for Treasure Coast homeowners',
      'Urgency: Hurricane season is 60 days away — is your vacant property ready?',
      'Software demo: Run 500 properties with the team that struggles with 50',
      'ROI calculator: The math on professional home watch vs. DIY',
      'Testimonial blitz: 3 client stories in 3 days',
    ],
  },
  {
    week: 4,
    theme: 'Retargeting & Relationship Deepening',
    objective: 'Re-engage warm leads. Deepen relationships with audience. Set up Month 2 pipeline.',
    contentFocus: [
      'FAQ crusher: Top 7 questions about AI property management — answered',
      'Thought leadership: The future of property management is autonomous',
      'Community: Treasure Coast lifestyle content (emotional connection)',
      'Soft sell: What our clients say after 12 months of zero-surprise property management',
      'Preview: What we are building next (software roadmap tease)',
    ],
  },
];

// ── Platform Distribution Matrix ───────────────────────────────────────────

export const DISTRIBUTION_CHANNELS = {
  organic: {
    instagram: {
      postsPerWeek: 6,
      formats: ['Carousel (education)', 'Reel (demos/tours)', 'Story (behind-the-scenes)', 'Static image (quotes/stats)'],
      primarySegments: ['Seasonal Home Owners', 'Vacation Home Owners', 'AirBnB Owners', 'Estate Owners'],
      contentPillars: ['AI-Powered Protection', 'Treasure Coast Lifestyle', 'Results & Social Proof'],
    },
    threads: {
      postsPerWeek: 6,
      formats: ['Text post (opinions)', 'Thread (breakdowns)', 'Poll (engagement)', 'Reply strategy'],
      primarySegments: ['Real Estate Professionals', 'Property Portfolio Owners', 'Traveling Executives'],
      contentPillars: ['CEO Journey & Company Culture', 'Property Owner Education'],
    },
    facebook: {
      postsPerWeek: 3,
      formats: ['Link post (blog/landing page)', 'Video (client stories)', 'Photo album (inspections)', 'Live (Q&A)'],
      primarySegments: ['Seasonal Home Owners', 'Condominium Associations', 'HOAs', 'Vacation Home Owners', 'Board of Directors'],
      contentPillars: ['AI-Powered Protection', 'Property Owner Education', 'Results & Social Proof'],
    },
    linkedin: {
      postsPerWeek: 3,
      formats: ['Article (thought leadership)', 'Document/carousel (data)', 'Text post (insights)', 'Poll (industry)'],
      primarySegments: ['Absentee Investors', 'Family Office Managers', 'Real Estate Brokers', 'Commercial RE Agents', 'International Property Owners', 'Global PM Enterprises'],
      contentPillars: ['AI-Powered Protection', 'CEO Journey & Company Culture', 'Property Owner Education'],
    },
    x: {
      postsPerWeek: 3,
      formats: ['Tweet (hooks/stats)', 'Thread (breakdowns)', 'Quote tweet (industry commentary)'],
      primarySegments: ['Absentee Investors', 'Real Estate Professionals', 'Traveling Executives', 'Board of Directors'],
      contentPillars: ['CEO Journey & Company Culture', 'Property Owner Education', 'AI-Powered Protection'],
    },
  },

  paid: {
    metaAds: {
      weeklyBudget: '$500-$2,000',
      platforms: ['Facebook', 'Instagram'],
      objective: 'Lead generation — Free property assessment offer',
      targeting: 'Interest: real estate investing, property management, home insurance. Age: 45-65. Income: $150K+. Behavior: frequent travelers, second home owners.',
      segments: ['Seasonal Home Owners', 'Absentee Investors', 'Vacation Home Owners'],
    },
    linkedinAds: {
      weeklyBudget: '$300-$1,500',
      platforms: ['LinkedIn'],
      objective: 'Software demo requests — AI property management platform',
      targeting: 'Title: Property Manager, Real Estate Broker, HOA President, COO. Company: RE firms, PM companies, HOA management. Size: 11-500 employees.',
      segments: ['Real Estate Brokers', 'HOAs', 'Condominium Associations', 'Global PM Enterprises'],
    },
    googleAds: {
      weeklyBudget: '$400-$1,800',
      platforms: ['Google Search', 'Display Network'],
      objective: 'Capture high-intent search traffic',
      targeting: 'Keywords: "home watch service Florida", "AI property management software", "vacant property monitoring", "absentee owner property management"',
      segments: ['Home Watch Seekers', 'Software Buyers', 'Insurance-motivated owners'],
    },
  },

  directOutreach: {
    email: {
      sendsPerWeek: 3,
      format: '90-day drip sequence + weekly newsletter',
      segments: ['Warm leads', 'Past inquiries', 'Referral network'],
    },
    directMail: {
      sendsPerMonth: 1,
      format: 'Premium postcard with QR code to landing page',
      segments: ['Absentee owners in target zip codes (34994, 34996, 34997, 34957, 33458)'],
    },
    partnerships: {
      activitiesPerWeek: 2,
      format: 'Co-marketing, referral agreements, joint webinars',
      segments: ['Trust attorneys', 'Insurance agents', 'Real estate agents', 'Financial advisors'],
    },
  },
};

// ── 30-Day Calendar ────────────────────────────────────────────────────────

export function generate30DayPlan(startDate = new Date().toISOString().split('T')[0]) {
  const start = new Date(`${startDate}T12:00:00Z`);
  const days = [];

  for (let d = 0; d < 30; d++) {
    const current = new Date(start);
    current.setUTCDate(current.getUTCDate() + d);
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getUTCDay();
    const weekNum = Math.floor(d / 7) + 1;
    const theme = WEEKLY_THEMES[Math.min(weekNum - 1, 3)];

    const dayPlan = {
      day: d + 1,
      date: dateStr,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      week: weekNum,
      weekTheme: theme.theme,
      platforms: [],
      actions: [],
    };

    // Map platform posting days from the scheduling matrix
    for (const [platformId, platform] of Object.entries(PLATFORMS)) {
      for (const slot of platform.slots) {
        if (slot.days.includes(dayOfWeek)) {
          dayPlan.platforms.push({
            platform: platformId,
            label: platform.label,
            time: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')} ET`,
            contentType: slot.contentType || 'standard post',
          });
        }
      }
    }

    // Add weekly recurring actions
    if (dayOfWeek === 1) { // Monday
      dayPlan.actions.push('Review previous week engagement metrics', 'Plan content for upcoming week');
    }
    if (dayOfWeek === 3) { // Wednesday
      dayPlan.actions.push('Mid-week performance check — adjust ad spend if needed');
    }
    if (dayOfWeek === 5) { // Friday
      dayPlan.actions.push('Schedule next week posts via Peak-Time Intelligence Engine');
    }

    // Add weekly email sends (Mon, Wed, Fri)
    if ([1, 3, 5].includes(dayOfWeek)) {
      dayPlan.actions.push('Email: drip sequence + newsletter segment');
    }

    // Direct mail — first Friday of each 30-day cycle
    if (d < 7 && dayOfWeek === 5) {
      dayPlan.actions.push('Direct mail: Premium postcard drop to target zip codes');
    }

    // Partnership activities — Tuesdays and Thursdays
    if ([2, 4].includes(dayOfWeek)) {
      dayPlan.actions.push('Partnership: outreach to trust attorneys, insurance agents, RE agents');
    }

    days.push(dayPlan);
  }

  return days;
}

// ── Audience Segment Prioritization ────────────────────────────────────────

export function getSegmentPrioritization() {
  const primary = TARGET_SEGMENTS.filter(s => s.priority === 'primary');
  const secondary = TARGET_SEGMENTS.filter(s => s.priority === 'secondary');
  const tertiary = TARGET_SEGMENTS.filter(s => s.priority === 'tertiary');

  return {
    tier1_immediate: {
      label: 'Week 1-2 Focus — Highest Intent, Highest Value',
      segments: primary.map(s => ({ id: s.id, name: s.name, channel: 'All organic + paid' })),
      action: 'Direct targeting via paid ads + organic content optimized for these personas',
    },
    tier2_accelerate: {
      label: 'Week 2-3 Focus — High Value, Needs Nurture',
      segments: secondary.map(s => ({ id: s.id, name: s.name, channel: 'Organic + email drip' })),
      action: 'Organic reach + email nurture sequences + retargeting from Week 1 content',
    },
    tier3_cultivate: {
      label: 'Week 3-4 Focus — Long Cycle, Enterprise Value',
      segments: tertiary.map(s => ({ id: s.id, name: s.name, channel: 'LinkedIn + direct outreach' })),
      action: 'LinkedIn thought leadership + partnership introductions + webinar invitations',
    },
  };
}

// ── Full Distribution Plan Output ──────────────────────────────────────────

export function getDistributionPlan(startDate) {
  const plan = generate30DayPlan(startDate);
  const segmentPriority = getSegmentPrioritization();
  const totalOrganic = Object.values(DISTRIBUTION_CHANNELS.organic).reduce((s, c) => s + c.postsPerWeek, 0);

  return {
    generatedBy: 'SMO-001 — Sovereign Marketing Officer',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    title: 'Enterprise Mass Production Campaign #1 — 30-Day Distribution Plan',
    businessTypes: BUSINESS_TYPES.map(b => ({ id: b.id, name: b.name })),
    targetSegments: {
      total: TARGET_SEGMENTS.length,
      primary: TARGET_SEGMENTS.filter(s => s.priority === 'primary').length,
      secondary: TARGET_SEGMENTS.filter(s => s.priority === 'secondary').length,
      tertiary: TARGET_SEGMENTS.filter(s => s.priority === 'tertiary').length,
    },
    volumeMetrics: {
      organicPostsPerWeek: totalOrganic,
      organicPostsPer30Days: totalOrganic * 4,
      emailsPerWeek: 3,
      directMailPerMonth: 1,
      partnershipActivitiesPerWeek: 2,
      paidChannels: 3,
      totalWeeklyBudgetRange: '$1,200 - $5,300',
    },
    weeklyThemes: WEEKLY_THEMES,
    channels: DISTRIBUTION_CHANNELS,
    segmentPrioritization: segmentPriority,
    calendar: plan,
    peakTimeIntegration: 'All organic posting times sourced from Peak-Time Intelligence Engine. UTC timestamps auto-generated via DST handler.',
    timestamp: new Date().toISOString(),
  };
}
