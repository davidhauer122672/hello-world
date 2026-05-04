/**
 * Peak-Time Intelligence Engine — Campaign #1
 *
 * Precision scheduling matrix for 45-65 HNW absentee property owners,
 * investors, and family office managers. Every post fires at the exact
 * UTC timestamp Buffer needs, with automatic DST handling.
 *
 * Platform Matrix:
 *   Instagram/Threads — 9 AM ET  Tue-Fri, 12 PM ET Sat-Sun
 *   Facebook          — 9 AM ET  Tue-Thu
 *   LinkedIn          — 8 AM ET  Tue-Thu
 *   X/Twitter         — 9 AM ET  Mon-Wed
 *
 * DST Rules:
 *   Apr-Oct → EDT (UTC-4)
 *   Nov-Mar → EST (UTC-5)
 */

// ── DST Detection ────────────────────────────────────────────────

/**
 * Determine if a given UTC date falls within US Eastern Daylight Time.
 * EDT: Second Sunday of March 2:00 AM → First Sunday of November 2:00 AM.
 * @param {Date} date
 * @returns {boolean}
 */
function isEDT(date) {
  const year = date.getUTCFullYear();
  const mar = new Date(Date.UTC(year, 2, 1));
  const marDay = mar.getUTCDay();
  const dstStart = new Date(Date.UTC(year, 2, 8 + (7 - marDay) % 7, 6, 0, 0));
  const nov = new Date(Date.UTC(year, 10, 1));
  const novDay = nov.getUTCDay();
  const dstEnd = new Date(Date.UTC(year, 10, 1 + (7 - novDay) % 7, 6, 0, 0));
  return date >= dstStart && date < dstEnd;
}

/**
 * Get the current ET offset in hours (4 for EDT, 5 for EST).
 * @param {Date} date
 * @returns {number}
 */
function etOffset(date) {
  return isEDT(date) ? 4 : 5;
}

/**
 * Convert an Eastern Time hour to a UTC hour for a given date.
 * @param {Date} date — reference date for DST lookup
 * @param {number} etHour — hour in Eastern Time (0-23)
 * @returns {number} — hour in UTC (0-23)
 */
function etToUTC(date, etHour) {
  return (etHour + etOffset(date)) % 24;
}

// ── Scheduling Matrix ────────────────────────────────────────────

/**
 * Platform-specific scheduling rules.
 * dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
const SCHEDULE_MATRIX = {
  instagram: {
    label: 'Instagram',
    slots: [
      { days: [2, 3, 4, 5], etHour: 9, etMinute: 0 },
      { days: [0, 6],       etHour: 12, etMinute: 0 },
    ],
  },
  threads: {
    label: 'Threads',
    slots: [
      { days: [2, 3, 4, 5], etHour: 9, etMinute: 0 },
      { days: [0, 6],       etHour: 12, etMinute: 0 },
    ],
  },
  facebook: {
    label: 'Facebook',
    slots: [
      { days: [2, 3, 4], etHour: 9, etMinute: 0 },
    ],
  },
  linkedin: {
    label: 'LinkedIn',
    slots: [
      { days: [2, 3, 4], etHour: 8, etMinute: 0 },
    ],
  },
  x: {
    label: 'X / Twitter',
    slots: [
      { days: [1, 2, 3], etHour: 9, etMinute: 0 },
    ],
  },
  twitter: {
    label: 'X / Twitter',
    slots: [
      { days: [1, 2, 3], etHour: 9, etMinute: 0 },
    ],
  },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Core Scheduling Functions ────────────────────────────────────

/**
 * Find the next valid publish slot for a platform from a given start date.
 * @param {string} platform — instagram, facebook, linkedin, x, threads
 * @param {Date} [after] — find slots after this date (default: now)
 * @returns {{ utc: string, unix: number, et: string, platform: string, day: string, dst: string } | null}
 */
export function nextSlot(platform, after = new Date()) {
  const key = platform.toLowerCase().replace(/\s+/g, '');
  const config = SCHEDULE_MATRIX[key];
  if (!config) return null;

  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(after.getTime() + offset * 86400000);
    const dow = candidate.getUTCDay();

    for (const slot of config.slots) {
      if (!slot.days.includes(dow)) continue;

      const utcHour = etToUTC(candidate, slot.etHour);
      const scheduled = new Date(Date.UTC(
        candidate.getUTCFullYear(),
        candidate.getUTCMonth(),
        candidate.getUTCDate(),
        utcHour,
        slot.etMinute,
        0,
      ));

      if (scheduled <= after) continue;

      const dst = isEDT(scheduled) ? 'EDT' : 'EST';
      return {
        utc: scheduled.toISOString(),
        unix: Math.floor(scheduled.getTime() / 1000),
        et: `${slot.etHour}:${String(slot.etMinute).padStart(2, '0')} ${dst}`,
        platform: config.label,
        day: DAY_NAMES[dow],
        dst,
      };
    }
  }
  return null;
}

/**
 * Generate the next N publish slots for a platform.
 * @param {string} platform
 * @param {number} count
 * @param {Date} [after]
 * @returns {Array}
 */
export function nextSlots(platform, count = 7, after = new Date()) {
  const results = [];
  let cursor = after;
  for (let i = 0; i < count; i++) {
    const slot = nextSlot(platform, cursor);
    if (!slot) break;
    results.push(slot);
    cursor = new Date(new Date(slot.utc).getTime() + 60000);
  }
  return results;
}

/**
 * Generate a full cross-platform schedule for a campaign batch.
 * Returns the next slot for every platform, sorted chronologically.
 * @param {string[]} platforms — array of platform names
 * @param {Date} [after]
 * @returns {Array}
 */
export function campaignSchedule(platforms, after = new Date()) {
  return platforms
    .map(p => nextSlot(p, after))
    .filter(Boolean)
    .sort((a, b) => a.unix - b.unix);
}

/**
 * Generate the full 7-day schedule across all platforms.
 * This is the master view for Campaign #1.
 * @param {Date} [after]
 * @returns {object}
 */
export function weeklySchedule(after = new Date()) {
  const allPlatforms = ['instagram', 'threads', 'facebook', 'linkedin', 'x'];
  const schedule = {};

  for (const platform of allPlatforms) {
    schedule[platform] = nextSlots(platform, 14, after);
  }

  const allSlots = Object.values(schedule).flat().sort((a, b) => a.unix - b.unix);

  return {
    campaign: 'Peak-Time Intelligence Engine — Campaign #1',
    target: '45-65 HNW Absentee Owners / Investors / Family Office',
    generated: new Date().toISOString(),
    dst: isEDT(after) ? 'EDT (UTC-4)' : 'EST (UTC-5)',
    platforms: schedule,
    timeline: allSlots,
    stats: {
      totalSlots: allSlots.length,
      platformBreakdown: Object.fromEntries(
        Object.entries(schedule).map(([k, v]) => [k, v.length]),
      ),
    },
  };
}

/**
 * Convert a post date + platform into the exact Buffer-compatible
 * Unix timestamp for scheduling.
 * @param {string} dateStr — YYYY-MM-DD
 * @param {string} platform
 * @returns {{ scheduled_at: string, utc: string, et: string, valid: boolean, reason?: string }}
 */
export function bufferTimestamp(dateStr, platform) {
  const key = platform.toLowerCase().replace(/\s+/g, '');
  const config = SCHEDULE_MATRIX[key];
  if (!config) {
    return { scheduled_at: null, utc: null, et: null, valid: false, reason: `Unknown platform: ${platform}` };
  }

  const date = new Date(`${dateStr}T12:00:00Z`);
  if (isNaN(date.getTime())) {
    return { scheduled_at: null, utc: null, et: null, valid: false, reason: `Invalid date: ${dateStr}` };
  }

  const dow = date.getUTCDay();
  const matchingSlot = config.slots.find(s => s.days.includes(dow));

  if (!matchingSlot) {
    const validDays = config.slots.flatMap(s => s.days.map(d => DAY_NAMES[d]));
    return {
      scheduled_at: null, utc: null, et: null, valid: false,
      reason: `${config.label} does not fire on ${DAY_NAMES[dow]}. Valid: ${validDays.join(', ')}`,
    };
  }

  const utcHour = etToUTC(date, matchingSlot.etHour);
  const scheduled = new Date(Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    utcHour, matchingSlot.etMinute, 0,
  ));

  const dst = isEDT(scheduled) ? 'EDT' : 'EST';
  return {
    scheduled_at: Math.floor(scheduled.getTime() / 1000).toString(),
    utc: scheduled.toISOString(),
    et: `${matchingSlot.etHour}:${String(matchingSlot.etMinute).padStart(2, '0')} ${dst}`,
    valid: true,
  };
}

/**
 * Return the full scheduling matrix as a reference.
 */
export function getMatrix() {
  const now = new Date();
  const dst = isEDT(now) ? 'EDT (UTC-4)' : 'EST (UTC-5)';

  return {
    engine: 'Peak-Time Intelligence Engine',
    campaign: '#1 — Mass Production',
    target_demographic: '45-65 HNW Absentee Property Owners, Investors, Family Office Managers',
    current_dst: dst,
    matrix: Object.fromEntries(
      Object.entries(SCHEDULE_MATRIX).map(([key, config]) => [
        key,
        {
          label: config.label,
          windows: config.slots.map(s => ({
            days: s.days.map(d => DAY_NAMES[d]),
            time_et: `${s.etHour}:${String(s.etMinute).padStart(2, '0')} ET`,
            time_utc: `${etToUTC(now, s.etHour)}:${String(s.etMinute).padStart(2, '0')} UTC`,
          })),
        },
      ]),
    ),
  };
}
