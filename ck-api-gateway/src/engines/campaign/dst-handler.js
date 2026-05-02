/**
 * DST Handler — Automatic EDT/EST Switching
 *
 * US Eastern Time Zone daylight saving rules:
 *   EDT (UTC-4): Second Sunday of March → First Sunday of November
 *   EST (UTC-5): First Sunday of November → Second Sunday of March
 *
 * Every post timestamp is converted to exact UTC for platform API consumption.
 * Zero manual intervention. Zero drift. Zero missed windows.
 */

// ── Offset Constants ───────────────────────────────────────────────────────

export const EDT_OFFSET = -4; // UTC-4
export const EST_OFFSET = -5; // UTC-5

// ── Core DST Detection ─────────────────────────────────────────────────────

/**
 * Find the Nth occurrence of a given weekday in a month.
 * @param {number} year
 * @param {number} month  0-indexed (0=Jan, 2=Mar, 10=Nov)
 * @param {number} dow    Day of week (0=Sun)
 * @param {number} nth    Which occurrence (1=first, 2=second)
 * @returns {number} Day of month
 */
function nthDayOfWeek(year, month, dow, nth) {
  const first = new Date(Date.UTC(year, month, 1));
  const firstDow = first.getUTCDay();
  let day = 1 + ((dow - firstDow + 7) % 7);
  day += (nth - 1) * 7;
  return day;
}

/**
 * Get the exact UTC moment when DST springs forward (Mar).
 * Second Sunday of March at 2:00 AM EST = 07:00 UTC.
 */
export function getSpringForwardUTC(year) {
  const day = nthDayOfWeek(year, 2, 0, 2); // 2nd Sunday of March
  return new Date(Date.UTC(year, 2, day, 7, 0, 0)); // 2 AM EST = 7 AM UTC
}

/**
 * Get the exact UTC moment when DST falls back (Nov).
 * First Sunday of November at 2:00 AM EDT = 06:00 UTC.
 */
export function getFallBackUTC(year) {
  const day = nthDayOfWeek(year, 10, 0, 1); // 1st Sunday of November
  return new Date(Date.UTC(year, 10, day, 6, 0, 0)); // 2 AM EDT = 6 AM UTC
}

/**
 * Determine if a UTC date/time falls within EDT (daylight saving).
 *
 * @param {Date} utcDate — Date object in UTC
 * @returns {boolean} true if EDT, false if EST
 */
export function isEDT(utcDate) {
  const year = utcDate.getUTCFullYear();
  const springForward = getSpringForwardUTC(year);
  const fallBack = getFallBackUTC(year);
  return utcDate >= springForward && utcDate < fallBack;
}

/**
 * Get the UTC offset in hours for a given UTC date.
 * @param {Date} utcDate
 * @returns {number} -4 for EDT, -5 for EST
 */
export function getUTCOffset(utcDate) {
  return isEDT(utcDate) ? EDT_OFFSET : EST_OFFSET;
}

/**
 * Get human-readable timezone label.
 * @param {Date} utcDate
 * @returns {string} "EDT (UTC-4)" or "EST (UTC-5)"
 */
export function getTimezoneLabel(utcDate) {
  return isEDT(utcDate)
    ? 'EDT (UTC-4)'
    : 'EST (UTC-5)';
}

/**
 * Get short timezone abbreviation.
 * @param {Date} utcDate
 * @returns {string} "EDT" or "EST"
 */
export function getTimezoneAbbr(utcDate) {
  return isEDT(utcDate) ? 'EDT' : 'EST';
}

// ── Time Conversion ────────────────────────────────────────────────────────

/**
 * Convert Eastern Time (ET) to exact UTC timestamp.
 *
 * Given a date and a local Eastern hour/minute, returns the precise
 * UTC Date accounting for whether that date is in EDT or EST.
 *
 * @param {string} dateStr  — YYYY-MM-DD
 * @param {number} hour     — Eastern hour (0-23)
 * @param {number} minute   — Eastern minute (0-59)
 * @returns {Date} UTC Date object
 */
export function easternToUTC(dateStr, hour, minute = 0) {
  // Create a provisional UTC date at noon to determine DST status for that calendar day
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const offset = getUTCOffset(probe);

  // Eastern to UTC: subtract the negative offset (i.e., add absolute offset)
  const utcHour = hour - offset; // e.g., 9 - (-4) = 13, or 9 - (-5) = 14
  const utc = new Date(`${dateStr}T00:00:00Z`);
  utc.setUTCHours(utcHour, minute, 0, 0);
  return utc;
}

/**
 * Convert UTC timestamp to Eastern Time components.
 *
 * @param {Date} utcDate
 * @returns {{ hour: number, minute: number, abbr: string, label: string, dateStr: string }}
 */
export function utcToEastern(utcDate) {
  const offset = getUTCOffset(utcDate);
  const eastern = new Date(utcDate.getTime() + offset * 3600000);
  return {
    hour: eastern.getUTCHours(),
    minute: eastern.getUTCMinutes(),
    abbr: getTimezoneAbbr(utcDate),
    label: getTimezoneLabel(utcDate),
    dateStr: eastern.toISOString().split('T')[0],
    formatted: `${String(eastern.getUTCHours()).padStart(2, '0')}:${String(eastern.getUTCMinutes()).padStart(2, '0')} ${getTimezoneAbbr(utcDate)}`,
  };
}

/**
 * Format a UTC Date as an ISO 8601 string suitable for publishing APIs.
 * Standard format: "2026-04-14T13:00:00Z"
 *
 * @param {Date} utcDate
 * @returns {string} ISO 8601 UTC string
 */
export function toPublishTimestamp(utcDate) {
  return utcDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Get DST transition dates for a given year.
 * Useful for audit logging and schedule validation.
 *
 * @param {number} year
 * @returns {{ springForward: string, fallBack: string, edtMonths: string, estMonths: string }}
 */
export function getDSTTransitions(year) {
  const sf = getSpringForwardUTC(year);
  const fb = getFallBackUTC(year);
  return {
    year,
    springForward: sf.toISOString(),
    springForwardLocal: `Second Sunday of March (${sf.toISOString().split('T')[0]}) at 2:00 AM EST → 3:00 AM EDT`,
    fallBack: fb.toISOString(),
    fallBackLocal: `First Sunday of November (${fb.toISOString().split('T')[0]}) at 2:00 AM EDT → 1:00 AM EST`,
    edtMonths: 'Approximately March–November',
    estMonths: 'Approximately November–March',
    currentlyEDT: isEDT(new Date()),
    currentLabel: getTimezoneLabel(new Date()),
  };
}
