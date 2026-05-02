import { CONTACT_WINDOWS, BLACKOUT_DATES, getOptimalTime, getPeakTimeDashboard } from '../engines/peak-time-intelligence.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handlePeakTimeDashboard() {
  return jsonResponse(getPeakTimeDashboard());
}

export async function handlePeakTimeOptimal(request) {
  const body = await request.json();
  const { channel, date } = body;

  if (!channel || !date) {
    return errorResponse('channel and date (YYYY-MM-DD) required', 400);
  }

  const validChannels = ['voice', 'email', 'sms', 'social'];
  if (!validChannels.includes(channel)) {
    return errorResponse(`channel must be one of: ${validChannels.join(', ')}`, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return errorResponse('date must be YYYY-MM-DD format', 400);
  }

  return jsonResponse(getOptimalTime(channel, date));
}

export function handlePeakTimeWindows(url) {
  const channel = url.searchParams.get('channel');
  if (channel && CONTACT_WINDOWS[channel]) {
    return jsonResponse({ channel, windows: CONTACT_WINDOWS[channel] });
  }
  return jsonResponse({ channels: CONTACT_WINDOWS });
}

export function handlePeakTimeBlackouts() {
  return jsonResponse({ blackoutDates: BLACKOUT_DATES, total: BLACKOUT_DATES.length });
}
