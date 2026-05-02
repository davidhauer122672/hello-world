/**
 * Peak-Time Intelligence Engine — Enterprise Campaign #1
 *
 * Precision scheduling engine for the 45–65 high-net-worth absentee
 * property owner cohort.  Converts human-readable slot definitions to
 * exact UTC timestamps that Meta, LinkedIn, and platform APIs consume.
 *
 * DST-aware: Apr–Oct → EDT (UTC-4) · Nov–Mar → EST (UTC-5)
 *
 * Platform matrix (all times Eastern):
 *   Instagram/Threads — 9 AM Tue–Fri, 12 PM Sat–Sun
 *   Facebook          — 9 AM Tue–Thu
 *   LinkedIn          — 8 AM Tue–Thu
 *   X/Twitter         — 9 AM Mon–Wed
 *
 * Division integration: every CK division can call generateSchedule()
 * and receive a ready-to-publish array of UTC timestamps + metadata.
 */

// ── Constants ──────────────────────────────────────────────────────────────

export const ENGINE_VERSION = '1.0.0';
export const ENGINE_ID = 'PEAK-TIME-INTEL-001';
export const ENGINE_NAME = 'Peak-Time Intelligence Engine';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Platform scheduling matrix — times in Eastern (ET).
 * Each entry: { days: number[] (0=Sun), hour: number, minute: number }
 */
export const PLATFORM_MATRIX = {
  instagram: {
    label: 'Instagram',
    slots: [
      { days: [2, 3, 4, 5], hour: 9, minute: 0, rationale: 'Before-work scroll — property owners check phones before business day starts' },
      { days: [0, 6], hour: 12, minute: 0, rationale: 'Weekend relaxed browsing — high-net-worth individuals at leisure' },
    ],
  },
  threads: {
    label: 'Threads',
    slots: [
      { days: [2, 3, 4, 5], hour: 9, minute: 0, rationale: 'Mirrors Instagram cadence — same cohort scrolls Threads alongside IG' },
      { days: [0, 6], hour: 12, minute: 0, rationale: 'Weekend engagement window for conversational content' },
    ],
  },
  facebook: {
    label: 'Facebook',
    slots: [
      { days: [2, 3, 4], hour: 9, minute: 0, rationale: '45-65 cohort indexes heavily on Facebook — early business-hour peak engagement' },
    ],
  },
  linkedin: {
    label: 'LinkedIn',
    slots: [
      { days: [2, 3, 4], hour: 8, minute: 0, rationale: 'Investors and family office managers check LinkedIn pre-market — highest-value window for institutional content' },
    ],
  },
  x: {
    label: 'X / Twitter',
    slots: [
      { days: [1, 2, 3], hour: 9, minute: 0, rationale: 'Real estate and investor conversation peaks Eastern morning when the financial day begins' },
    ],
  },
};

export const TARGET_DEMOGRAPHIC = {
  ageRange: '45-65',
  segments: [
    'High-net-worth absentee property owners',
    'Real estate investors',
    'Family office managers',
    'Seasonal residents / snowbirds',
    'Trust trustees (irrevocable, revocable, COOP)',
    'Estate executors',
    'Condominium associations',
    'HOA board members',
    'Commercial real estate brokers',
    'Property portfolio owners',
    'Traveling executives',
    'Vacation home owners',
    'AirBnB property owners',
    'Time share operators',
    'International property owners',
    'Global property management enterprises',
    'National home watch professionals',
  ],
  behaviorInsights: {
    facebook: 'This cohort uses Facebook at higher rates than younger demographics. Business-hour early morning is peak engagement.',
    linkedin: 'Investors and family office managers check LinkedIn pre-market. Highest-value window for institutional and investor segment content.',
    instagram: 'Before-work scroll when property owners check phones before the day starts. Weekend noon for relaxed browsing.',
    threads: 'Companion platform to Instagram. Same scroll behavior, conversational format preferred.',
    x: 'Real estate and investor conversation on X peaks Eastern morning when the financial day begins.',
  },
};

// ── DST Logic ──────────────────────────────────────────────────────────────

/**
 * Determine whether a given date falls within US Eastern Daylight Time.
 * EDT: second Sunday of March → first Sunday of November.
 */
export function isEDT(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-indexed

  // Jan, Feb, Dec → always EST
  if (month < 2 || month > 10) return false;
  // Apr through Sep → always EDT
  if (month > 2 && month < 10) return true;

  if (month === 2) {
    // March: EDT starts second Sunday at 2:00 AM ET
    const marchFirst = new Date(Date.UTC(year, 2, 1));
    const firstDow = marchFirst.getUTCDay();
    const secondSunday = firstDow === 0 ? 8 : 15 - firstDow;
    // Transition at 2 AM EST = 07:00 UTC
    const transitionUTC = new Date(Date.UTC(year, 2, secondSunday, 7, 0, 0));
    return date >= transitionUTC;
  }

  if (month === 10) {
    // November: EDT ends first Sunday at 2:00 AM EDT
    const novFirst = new Date(Date.UTC(year, 10, 1));
    const firstDow = novFirst.getUTCDay();
    const firstSunday = firstDow === 0 ? 1 : 8 - firstDow;
    // Transition at 2 AM EDT = 06:00 UTC
    const transitionUTC = new Date(Date.UTC(year, 10, firstSunday, 6, 0, 0));
    return date < transitionUTC;
  }

  return false;
}

/**
 * Convert Eastern time hour to UTC hour for a given date.
 * EDT (Apr–Oct): UTC-4 → add 4 hours
 * EST (Nov–Mar): UTC-5 → add 5 hours
 */
export function easternToUTC(date, easternHour, easternMinute = 0) {
  const offset = isEDT(date) ? 4 : 5;
  const utcHour = easternHour + offset;
  const result = new Date(date);
  result.setUTCHours(utcHour, easternMinute, 0, 0);
  return result;
}

/**
 * Get the timezone label for a given date.
 */
export function getTimezoneLabel(date) {
  return isEDT(date) ? 'EDT (UTC-4)' : 'EST (UTC-5)';
}

// ── Schedule Generation ────────────────────────────────────────────────────

/**
 * Generate a complete posting schedule for a date range.
 *
 * @param {Object} options
 * @param {string} options.startDate  — ISO date string (YYYY-MM-DD)
 * @param {number} options.days       — Number of days to schedule (default: 30)
 * @param {string[]} options.platforms — Platforms to include (default: all)
 * @param {string} options.campaignId — Campaign identifier
 * @param {string} options.division   — Requesting division code
 * @returns {Object} Schedule with UTC timestamps
 */
export function generateSchedule(options = {}) {
  const {
    startDate = new Date().toISOString().split('T')[0],
    days = 30,
    platforms = Object.keys(PLATFORM_MATRIX),
    campaignId = 'CAMPAIGN-001',
    division = 'MKT',
  } = options;

  const start = new Date(startDate + 'T00:00:00Z');
  const schedule = [];
  const platformSummary = {};

  for (const platform of platforms) {
    const config = PLATFORM_MATRIX[platform];
    if (!config) continue;
    platformSummary[platform] = { label: config.label, postCount: 0, slots: [] };
  }

  for (let d = 0; d < days; d++) {
    const current = new Date(start);
    current.setUTCDate(current.getUTCDate() + d);
    const dayOfWeek = current.getUTCDay();
    const dateStr = current.toISOString().split('T')[0];

    for (const platform of platforms) {
      const config = PLATFORM_MATRIX[platform];
      if (!config) continue;

      for (const slot of config.slots) {
        if (!slot.days.includes(dayOfWeek)) continue;

        const utcTime = easternToUTC(current, slot.hour, slot.minute);
        const tz = getTimezoneLabel(current);

        const entry = {
          date: dateStr,
          dayOfWeek: DAY_NAMES[dayOfWeek],
          platform,
          platformLabel: config.label,
          easternTime: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')} ${tz.split(' ')[0]}`,
          utcTimestamp: utcTime.toISOString(),
          publishTimestamp: utcTime.toISOString(),
          timezone: tz,
          utcOffset: isEDT(current) ? '-04:00' : '-05:00',
          rationale: slot.rationale,
          campaignId,
          division,
          cohort: TARGET_DEMOGRAPHIC.ageRange,
          slotId: `${platform}-${dateStr}-${slot.hour}${String(slot.minute).padStart(2, '0')}`,
        };

        schedule.push(entry);
        platformSummary[platform].postCount++;

        const slotLabel = `${DAY_NAMES[dayOfWeek]} ${entry.easternTime}`;
        if (!platformSummary[platform].slots.includes(slotLabel)) {
          platformSummary[platform].slots.push(slotLabel);
        }
      }
    }
  }

  // Sort chronologically
  schedule.sort((a, b) => new Date(a.utcTimestamp) - new Date(b.utcTimestamp));

  return {
    engine: ENGINE_NAME,
    engineId: ENGINE_ID,
    version: ENGINE_VERSION,
    campaignId,
    requestingDivision: division,
    targetDemographic: TARGET_DEMOGRAPHIC,
    dateRange: {
      start: startDate,
      end: new Date(start.getTime() + (days - 1) * 86400000).toISOString().split('T')[0],
      days,
    },
    dstNote: 'Apr–Oct → EDT (UTC-4) · Nov–Mar → EST (UTC-5). All timestamps auto-converted.',
    platformMatrix: PLATFORM_MATRIX,
    platformSummary,
    totalPosts: schedule.length,
    schedule,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get the next optimal posting slot for a given platform from now.
 */
export function getNextSlot(platform) {
  const config = PLATFORM_MATRIX[platform];
  if (!config) return null;

  const now = new Date();
  // Look ahead 7 days max
  for (let d = 0; d < 7; d++) {
    const check = new Date(now);
    check.setUTCDate(check.getUTCDate() + d);
    const dayOfWeek = check.getUTCDay();

    for (const slot of config.slots) {
      if (!slot.days.includes(dayOfWeek)) continue;

      const utcTime = easternToUTC(check, slot.hour, slot.minute);
      if (utcTime > now) {
        return {
          platform,
          platformLabel: config.label,
          date: check.toISOString().split('T')[0],
          dayOfWeek: DAY_NAMES[dayOfWeek],
          easternTime: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')} ${getTimezoneLabel(check).split(' ')[0]}`,
          utcTimestamp: utcTime.toISOString(),
          timezone: getTimezoneLabel(check),
          rationale: slot.rationale,
        };
      }
    }
  }

  return null;
}

/**
 * Get all next slots across all platforms.
 */
export function getAllNextSlots() {
  const result = {};
  for (const platform of Object.keys(PLATFORM_MATRIX)) {
    result[platform] = getNextSlot(platform);
  }
  return result;
}

/**
 * Division integration — every division can request schedule data
 * specific to their operational needs.
 */
export function getDivisionSchedule(divisionCode, options = {}) {
  const divisionPlatformMap = {
    MKT: ['instagram', 'threads', 'facebook', 'linkedin', 'x'],
    SEN: ['facebook', 'linkedin'],
    EXC: ['linkedin', 'x'],
    OPS: ['facebook', 'instagram'],
    INT: ['linkedin', 'x'],
    FIN: ['linkedin'],
    VEN: ['facebook', 'linkedin'],
    TEC: ['x', 'linkedin'],
    WEB: ['instagram', 'threads', 'facebook', 'linkedin', 'x'],
    MCCO: ['instagram', 'threads', 'facebook', 'linkedin', 'x'],
  };

  const platforms = divisionPlatformMap[divisionCode] || Object.keys(PLATFORM_MATRIX);

  return generateSchedule({
    ...options,
    platforms,
    division: divisionCode,
  });
}

// ── Contact Windows, Seasonal, and Blackout Data ─────────────────────────

export const CONTACT_WINDOWS = {
  voice: { days: [1, 2, 3, 4, 5], startHour: 9, endHour: 17, label: 'Mon-Fri 9AM-5PM ET' },
  email: { days: [1, 2, 3, 4, 5], startHour: 7, endHour: 20, label: 'Mon-Fri 7AM-8PM ET' },
  sms:   { days: [1, 2, 3, 4, 5], startHour: 9, endHour: 18, label: 'Mon-Fri 9AM-6PM ET' },
  social: { days: [0, 1, 2, 3, 4, 5, 6], startHour: 8, endHour: 21, label: 'Daily 8AM-9PM ET' },
};

export const SEASONAL_ADJUSTMENTS = {
  snowbird: { months: [11, 0, 1, 2, 3], multiplier: 1.4, label: 'Snowbird Season (Nov-Mar)' },
  summer:   { months: [5, 6, 7], multiplier: 0.7, label: 'Summer Low (Jun-Aug)' },
};

export const BLACKOUT_DATES = [
  { date: '01-01', name: "New Year's Day" },
  { date: '01-20', name: 'Martin Luther King Jr. Day' },
  { date: '02-17', name: "Presidents' Day" },
  { date: '05-26', name: 'Memorial Day' },
  { date: '07-04', name: 'Independence Day' },
  { date: '09-01', name: 'Labor Day' },
  { date: '10-13', name: 'Columbus Day' },
  { date: '11-11', name: 'Veterans Day' },
  { date: '11-27', name: 'Thanksgiving' },
  { date: '12-25', name: 'Christmas Day' },
  { date: '12-31', name: "New Year's Eve" },
];

export function getOptimalTime(channel, dateStr) {
  const window = CONTACT_WINDOWS[channel];
  if (!window) return { channel, available: false, reason: 'Unknown channel' };

  const date = new Date(dateStr + 'T12:00:00Z');
  const mmdd = dateStr.slice(5);
  const blackout = BLACKOUT_DATES.find(b => b.date === mmdd);
  if (blackout) {
    return { channel, date: dateStr, blackout: true, holiday: blackout.name };
  }

  const dayOfWeek = date.getUTCDay();
  if (!window.days.includes(dayOfWeek)) {
    return { channel, date: dateStr, available: false, reason: `${channel} not available on ${DAY_NAMES[dayOfWeek]}` };
  }

  const month = date.getUTCMonth();
  let seasonMultiplier = 1.0;
  let currentSeason = 'standard';
  if (SEASONAL_ADJUSTMENTS.snowbird.months.includes(month)) {
    seasonMultiplier = SEASONAL_ADJUSTMENTS.snowbird.multiplier;
    currentSeason = 'snowbird';
  } else if (SEASONAL_ADJUSTMENTS.summer.months.includes(month)) {
    seasonMultiplier = SEASONAL_ADJUSTMENTS.summer.multiplier;
    currentSeason = 'summer';
  }

  const midHour = Math.floor((window.startHour + window.endHour) / 2);
  const utcTime = easternToUTC(date, midHour);

  return {
    channel,
    date: dateStr,
    dayOfWeek: DAY_NAMES[dayOfWeek],
    window: `${window.startHour}:00-${window.endHour}:00 ET`,
    optimalHour: midHour,
    utcTimestamp: utcTime.toISOString(),
    timezone: getTimezoneLabel(date),
    engagementScore: parseFloat((0.75 * seasonMultiplier).toFixed(2)),
    season: currentSeason,
    seasonMultiplier,
    recommendation: `Best ${channel} window: ${midHour}:00 ET on ${DAY_NAMES[dayOfWeek]}`,
  };
}

export function getPeakTimeDashboard() {
  const now = new Date();
  const month = now.getUTCMonth();
  let currentSeason = 'standard';
  if (SEASONAL_ADJUSTMENTS.snowbird.months.includes(month)) currentSeason = 'snowbird';
  else if (SEASONAL_ADJUSTMENTS.summer.months.includes(month)) currentSeason = 'summer';

  const channels = Object.entries(CONTACT_WINDOWS).map(([key, val]) => ({
    channel: key,
    ...val,
    windowCount: val.days.length,
  }));

  return {
    engine: 'Peak-Time Intelligence',
    engineId: ENGINE_ID,
    version: ENGINE_VERSION,
    channels,
    totalWindows: channels.reduce((sum, c) => sum + c.windowCount, 0),
    currentSeason,
    blackoutDatesCount: BLACKOUT_DATES.length,
    timestamp: now.toISOString(),
  };
}

// ── All Points Bulletin Generator ──────────────────────────────────────────

/**
 * Generate the All Points Bulletin for the entire enterprise.
 * This is the official scheduling directive from the CEO.
 */
export function generateAllPointsBulletin() {
  const now = new Date();
  const bulletinId = `APB-${Date.now()}`;

  return {
    bulletinId,
    classification: 'ALL POINTS BULLETIN',
    priority: 'SOVEREIGN-OVERRIDE',
    issuedBy: 'CEO — Coastal Key Enterprise',
    effectiveDate: now.toISOString(),
    status: 'EFFECTIVE IMMEDIATELY',

    directive: {
      title: 'Enterprise Mass Production Campaign #1: The Peak-Time Intelligence Engine',
      summary: 'Precision scheduling matrix for the 45-65 year old high-net-worth absentee property owner cohort. All divisions comply immediately.',
    },

    targetDemographic: TARGET_DEMOGRAPHIC,

    schedulingMatrix: {
      instagram: {
        platform: 'Instagram',
        schedule: 'Tue–Fri 9:00 AM ET, Sat–Sun 12:00 PM ET',
        rationale: 'Before-work scroll when property owners check phones before the day starts. Evening slots on weekends when they are more relaxed.',
      },
      threads: {
        platform: 'Threads',
        schedule: 'Tue–Fri 9:00 AM ET, Sat–Sun 12:00 PM ET',
        rationale: 'Mirrors Instagram cadence for the same high-net-worth cohort.',
      },
      facebook: {
        platform: 'Facebook',
        schedule: 'Tue–Thu 9:00 AM ET',
        rationale: 'This cohort uses Facebook at higher rates than younger demographics. Business-hour early morning is peak engagement for this age group.',
      },
      linkedin: {
        platform: 'LinkedIn',
        schedule: 'Tue–Thu 8:00 AM ET',
        rationale: 'Investors and family office managers check LinkedIn pre-market. This is the highest-value window for institutional and investor segment content.',
      },
      x: {
        platform: 'X / Twitter',
        schedule: 'Mon–Wed 9:00 AM ET',
        rationale: 'Real estate and investor conversation on X peaks Eastern morning when the financial day begins.',
      },
    },

    dstPolicy: {
      rule: 'Automatic DST handling — zero manual intervention required.',
      edt: { months: 'April through October', offset: 'UTC-4', label: 'EDT' },
      est: { months: 'November through March', offset: 'UTC-5', label: 'EST' },
      implementation: 'Every post is converted to the exact UTC timestamp the platform API needs. No exceptions.',
    },

    divisionOrders: {
      TEC: {
        division: 'Technology',
        priority: 'FRONT / FOCUSED',
        orders: [
          'Integrate Peak-Time Intelligence Engine into API gateway immediately',
          'Ensure all UTC conversions pass DST boundary tests',
          'Wire Claude AI publishing engine to platform matrix',
          'Monitor first 72 hours of automated scheduling for accuracy',
        ],
      },
      MKT: {
        division: 'Marketing',
        priority: 'FRONT / FOCUSED',
        orders: [
          'All content production aligned to Peak-Time schedule effective immediately',
          'Content calendar must reference engine-generated UTC timestamps',
          'CMO to validate first 7-day schedule output',
          'Social Scribe (MKT-002) and Content Architect (MKT-001) to audit platform-specific formatting',
        ],
      },
      MCCO: {
        division: 'MCCO Command',
        orders: [
          'Calendar Command (MCCO-004) to integrate Peak-Time timestamps into 30-day calendars',
          'Scroll Breaker (MCCO-005) to tag all posts with optimal posting windows',
          'Quality Shield (MCCO-014) to audit Ferrari-compliance of scheduling output',
        ],
      },
      SEN: {
        division: 'Sentinel Sales',
        orders: [
          'Align outbound call cadence with post-publish windows for maximum cohort overlap',
          'LinkedIn and Facebook engagement windows inform follow-up timing',
        ],
      },
      EXC: {
        division: 'Executive',
        orders: [
          'CEO standup to include Peak-Time Engine status in daily briefing',
          'Campaign performance dashboards to reflect engine metrics',
        ],
      },
      OPS: {
        division: 'Operations',
        orders: [
          'Property showcase posts follow Instagram/Facebook schedule',
          'Inspection completion announcements timed to platform windows',
        ],
      },
      INT: {
        division: 'Intelligence',
        orders: [
          'Monitor engagement data by time slot for continuous optimization',
          'Flag any slot underperformance within 48 hours',
        ],
      },
      FIN: {
        division: 'Finance',
        orders: [
          'LinkedIn-focused investor content follows 8 AM Tue-Thu schedule',
          'ROI reporting on paid amplification aligned to organic schedule',
        ],
      },
      VEN: {
        division: 'Vendor Management',
        orders: [
          'Vendor spotlight content follows Facebook/LinkedIn cadence',
          'Partner co-marketing posts aligned to engine schedule',
        ],
      },
      WEB: {
        division: 'Website Development',
        orders: [
          'Website CTAs and landing pages refresh timed to posting schedule',
          'Blog publish times aligned with LinkedIn pre-market window',
        ],
      },
    },

    complianceRequirement: 'All divisions acknowledge receipt and integrate within 24 hours. MCCO-014 Quality Shield performs first audit at T+48 hours.',
    executionStandard: 'ferrari',
    governance: 'sovereign',
    timestamp: now.toISOString(),
  };
}
