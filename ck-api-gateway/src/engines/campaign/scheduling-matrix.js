/**
 * Platform Scheduling Matrix — Peak-Time Intelligence Engine
 *
 * Precision posting schedule for the 45–65 high-net-worth cohort:
 *   Instagram & Threads: 9 AM ET Tue–Fri · 12 PM ET Sat–Sun
 *   Facebook:            9 AM ET Tue–Thu
 *   LinkedIn:            8 AM ET Tue–Thu
 *   X/Twitter:           9 AM ET Mon–Wed
 *
 * Every slot includes behavioral rationale specific to the target demographic.
 */

import { easternToUTC, getTimezoneLabel, getTimezoneAbbr, toBufferTimestamp as toUTCTimestamp } from './dst-handler.js';

// ── Day Constants ──────────────────────────────────────────────────────────

export const DAYS = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Platform Definitions ───────────────────────────────────────────────────

export const PLATFORMS = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    publishEngine: 'claude-ai',
    slots: [
      {
        days: [DAYS.TUE, DAYS.WED, DAYS.THU, DAYS.FRI],
        hour: 9,
        minute: 0,
        rationale: 'Before-work scroll — property owners check phones before the business day starts. Peak mobile engagement for 45-65 HNW demographic.',
        contentType: 'carousel, reel, static image',
      },
      {
        days: [DAYS.SAT, DAYS.SUN],
        hour: 12,
        minute: 0,
        rationale: 'Weekend relaxed browsing — high-net-worth individuals at leisure. Longer dwell time, higher save rates on educational content.',
        contentType: 'carousel, story, lifestyle imagery',
      },
    ],
  },

  threads: {
    id: 'threads',
    label: 'Threads',
    publishEngine: 'claude-ai',
    slots: [
      {
        days: [DAYS.TUE, DAYS.WED, DAYS.THU, DAYS.FRI],
        hour: 9,
        minute: 0,
        rationale: 'Mirrors Instagram cadence — same cohort scrolls Threads alongside IG. Conversational format drives higher reply rates.',
        contentType: 'text post, thread, poll',
      },
      {
        days: [DAYS.SAT, DAYS.SUN],
        hour: 12,
        minute: 0,
        rationale: 'Weekend engagement window — conversational content performs best when audience has time to reply.',
        contentType: 'text post, discussion prompt',
      },
    ],
  },

  facebook: {
    id: 'facebook',
    label: 'Facebook',
    publishEngine: 'claude-ai',
    slots: [
      {
        days: [DAYS.TUE, DAYS.WED, DAYS.THU],
        hour: 9,
        minute: 0,
        rationale: '45-65 cohort uses Facebook at higher rates than younger demographics. Business-hour early morning is peak engagement for this age group.',
        contentType: 'link post, video, photo album, live',
      },
    ],
  },

  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    publishEngine: 'claude-ai',
    slots: [
      {
        days: [DAYS.TUE, DAYS.WED, DAYS.THU],
        hour: 8,
        minute: 0,
        rationale: 'Investors and family office managers check LinkedIn pre-market. Highest-value window for institutional and investor segment content.',
        contentType: 'article, document, text post, poll',
      },
    ],
  },

  x: {
    id: 'x',
    label: 'X / Twitter',
    publishEngine: 'claude-ai',
    slots: [
      {
        days: [DAYS.MON, DAYS.TUE, DAYS.WED],
        hour: 9,
        minute: 0,
        rationale: 'Real estate and investor conversation on X peaks Eastern morning when the financial day begins. Thread format drives thought-leadership reach.',
        contentType: 'tweet, thread, quote tweet',
      },
    ],
  },
};

// ── Schedule Generation ────────────────────────────────────────────────────

/**
 * Generate the complete posting schedule for a date range.
 *
 * @param {string} startDate   YYYY-MM-DD
 * @param {number} days        Number of days (default 30)
 * @param {string[]} platforms Platform IDs to include (default: all)
 * @returns {Array<Object>} Sorted schedule entries with UTC timestamps
 */
export function generateScheduleSlots(startDate, days = 30, platforms = null) {
  const activePlatforms = platforms || Object.keys(PLATFORMS);
  const start = new Date(`${startDate}T12:00:00Z`);
  const slots = [];

  for (let d = 0; d < days; d++) {
    const current = new Date(start);
    current.setUTCDate(current.getUTCDate() + d);
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getUTCDay();

    for (const platformId of activePlatforms) {
      const platform = PLATFORMS[platformId];
      if (!platform) continue;

      for (const slot of platform.slots) {
        if (!slot.days.includes(dayOfWeek)) continue;

        const utcTime = easternToUTC(dateStr, slot.hour, slot.minute);
        const tzAbbr = getTimezoneAbbr(utcTime);
        const tzLabel = getTimezoneLabel(utcTime);

        slots.push({
          slotId: `${platformId}-${dateStr}-${String(slot.hour).padStart(2, '0')}${String(slot.minute).padStart(2, '0')}`,
          date: dateStr,
          dayOfWeek: DAY_NAMES[dayOfWeek],
          dayIndex: dayOfWeek,
          platform: platformId,
          platformLabel: platform.label,
          easternTime: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')} ${tzAbbr}`,
          utcTimestamp: utcTime.toISOString(),
          publishTimestamp: toUTCTimestamp(utcTime),
          timezone: tzLabel,
          utcOffset: tzAbbr === 'EDT' ? '-04:00' : '-05:00',
          rationale: slot.rationale,
          contentType: slot.contentType,
          publishEngine: platform.publishEngine,
        });
      }
    }
  }

  // Chronological sort
  slots.sort((a, b) => new Date(a.utcTimestamp) - new Date(b.utcTimestamp));
  return slots;
}

/**
 * Get weekly post counts per platform.
 */
export function getWeeklyPostCounts() {
  const counts = {};
  for (const [id, platform] of Object.entries(PLATFORMS)) {
    let weekly = 0;
    for (const slot of platform.slots) {
      weekly += slot.days.length;
    }
    counts[id] = { label: platform.label, postsPerWeek: weekly };
  }

  const total = Object.values(counts).reduce((sum, c) => sum + c.postsPerWeek, 0);
  return { platforms: counts, totalPerWeek: total, totalPer30Days: Math.round(total * (30 / 7)) };
}

/**
 * Get the next available posting slot for a specific platform.
 */
export function getNextSlot(platformId) {
  const platform = PLATFORMS[platformId];
  if (!platform) return null;

  const now = new Date();

  for (let d = 0; d < 8; d++) {
    const check = new Date(now);
    check.setUTCDate(check.getUTCDate() + d);
    const dateStr = check.toISOString().split('T')[0];
    const dayOfWeek = check.getUTCDay();

    for (const slot of platform.slots) {
      if (!slot.days.includes(dayOfWeek)) continue;

      const utcTime = easternToUTC(dateStr, slot.hour, slot.minute);
      if (utcTime <= now) continue;

      return {
        platform: platformId,
        platformLabel: platform.label,
        date: dateStr,
        dayOfWeek: DAY_NAMES[dayOfWeek],
        easternTime: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')} ${getTimezoneAbbr(utcTime)}`,
        utcTimestamp: utcTime.toISOString(),
        publishTimestamp: toUTCTimestamp(utcTime),
      };
    }
  }

  return null;
}

/**
 * Get next slots across all platforms.
 */
export function getAllNextSlots() {
  const result = {};
  for (const platformId of Object.keys(PLATFORMS)) {
    result[platformId] = getNextSlot(platformId);
  }
  return result;
}

/**
 * Validate that a proposed posting time aligns with the matrix.
 * Returns { valid: boolean, reason: string }
 */
export function validateSlot(platformId, dateStr, hour, minute) {
  const platform = PLATFORMS[platformId];
  if (!platform) return { valid: false, reason: `Unknown platform: ${platformId}` };

  const date = new Date(`${dateStr}T12:00:00Z`);
  const dayOfWeek = date.getUTCDay();

  for (const slot of platform.slots) {
    if (slot.days.includes(dayOfWeek) && slot.hour === hour && slot.minute === (minute || 0)) {
      return { valid: true, reason: 'Slot matches Peak-Time Intelligence Matrix' };
    }
  }

  return {
    valid: false,
    reason: `${DAY_NAMES[dayOfWeek]} ${String(hour).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')} ET does not match any ${platform.label} slot in the matrix`,
  };
}
