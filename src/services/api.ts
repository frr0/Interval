import { Activity, Athlete, CalendarEvent, Wellness } from '../types/intervals';

const BASE_URL = 'https://intervals.icu/api/v1';

// Cross-platform Base64 encoder for React Native and Web
export function encodeBasicAuth(apiKey: string): string {
  const credentials = `API_KEY:${apiKey.trim()}`;
  if (typeof btoa === 'function') {
    return btoa(credentials);
  }
  // Safe JS fallback
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = credentials;
  let output = '';
  for (
    let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
  ) {
    charCode = str.charCodeAt((i += 3 / 4));
    if (charCode > 0xff) {
      throw new Error('Character out of Latin1 range in auth credentials');
    }
    block = (block << 8) | charCode;
  }
  return output;
}

export class IntervalsApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'IntervalsApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, apiKey: string): Promise<T> {
  const authHeader = `Basic ${encodeBasicAuth(apiKey)}`;
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'User-Agent': 'IntervalsPulse/1.0',
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new IntervalsApiError(
        'Invalid API Key or unauthorized access. Please check your Intervals.icu API key.',
        response.status
      );
    }
    if (response.status === 404) {
      throw new IntervalsApiError(
        'Athlete or resource not found on Intervals.icu.',
        response.status
      );
    }
    throw new IntervalsApiError(
      `Intervals.icu API error (HTTP ${response.status})`,
      response.status
    );
  }

  return response.json();
}

/**
 * Validates the API key by requesting the athlete profile
 */
export async function getAthleteProfile(apiKey: string, athleteId = '0'): Promise<Athlete> {
  const cleanId = athleteId.trim() || '0';
  return request<Athlete>(`/athlete/${cleanId}`, apiKey);
}

/**
 * Fetches wellness history (CTL, ATL, HRV, resting HR, sleep, etc.)
 */
export async function getWellnessHistory(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<Wellness[]> {
  const cleanId = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const oldest = oldestDate || ninetyDaysAgo.toISOString().split('T')[0];
  const newest = newestDate || today.toISOString().split('T')[0];

  params.append('oldest', oldest);
  params.append('newest', newest);

  const data = await request<Wellness[]>(
    `/athlete/${cleanId}/wellness?${params.toString()}`,
    apiKey
  );

  // Compute TSB (Form = CTL - ATL) if not provided
  return data.map((item) => ({
    ...item,
    tsb:
      item.tsb !== undefined
        ? item.tsb
        : item.ctl !== undefined && item.atl !== undefined
        ? Math.round((item.ctl - item.atl) * 10) / 10
        : undefined,
  }));
}

/**
 * Fetches activities list
 */
export async function getActivities(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<Activity[]> {
  const cleanId = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);

  const oldest = oldestDate || sixtyDaysAgo.toISOString().split('T')[0];
  const newest = newestDate || today.toISOString().split('T')[0];

  params.append('oldest', oldest);
  params.append('newest', newest);

  const data = await request<Activity[]>(
    `/athlete/${cleanId}/activities?${params.toString()}`,
    apiKey
  );

  // Sort newest first
  return data.sort(
    (a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()
  );
}

/**
 * Fetches single activity details (intervals, stats, power/HR zones)
 */
export async function getActivityDetails(apiKey: string, activityId: string): Promise<Activity> {
  return request<Activity>(`/activity/${activityId}`, apiKey);
}

/**
 * Fetches upcoming calendar workouts & events
 */
export async function getCalendarEvents(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<CalendarEvent[]> {
  const cleanId = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const twoWeeksAhead = new Date();
  twoWeeksAhead.setDate(today.getDate() + 14);

  const oldest = oldestDate || weekAgo.toISOString().split('T')[0];
  const newest = newestDate || twoWeeksAhead.toISOString().split('T')[0];

  params.append('oldest', oldest);
  params.append('newest', newest);

  return request<CalendarEvent[]>(
    `/athlete/${cleanId}/events?${params.toString()}`,
    apiKey
  );
}
