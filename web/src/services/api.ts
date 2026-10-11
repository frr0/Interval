import { Activity, Athlete, CalendarEvent, Wellness } from '../types/intervals';

// Use Vite reverse proxy /api in development, or direct URL
const BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://intervals.icu/api/v1';

export class IntervalsApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'IntervalsApiError';
    this.status = status;
  }
}

function getAuthHeader(apiKey: string): string {
  const cleanKey = apiKey.trim();
  return `Basic ${btoa(`API_KEY:${cleanKey}`)}`;
}

async function request<T>(endpoint: string, apiKey: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(apiKey),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new IntervalsApiError(
        'Invalid API Key or unauthorized access. Please verify your Intervals.icu API Key.',
        response.status
      );
    }
    if (response.status === 404) {
      throw new IntervalsApiError('Athlete or resource not found on Intervals.icu.', response.status);
    }
    throw new IntervalsApiError(`Intervals.icu API error (HTTP ${response.status})`, response.status);
  }

  return response.json();
}

export async function getAthleteProfile(apiKey: string, athleteId = '0'): Promise<Athlete> {
  const id = athleteId.trim() || '0';
  return request<Athlete>(`/athlete/${id}`, apiKey);
}

export async function getWellnessHistory(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<Wellness[]> {
  const id = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  params.append('oldest', oldestDate || ninetyDaysAgo.toISOString().split('T')[0]);
  params.append('newest', newestDate || today.toISOString().split('T')[0]);

  const list = await request<Wellness[]>(`/athlete/${id}/wellness?${params.toString()}`, apiKey);

  return list.map((item) => ({
    ...item,
    tsb:
      item.tsb !== undefined
        ? item.tsb
        : item.ctl !== undefined && item.atl !== undefined
        ? Math.round((item.ctl - item.atl) * 10) / 10
        : undefined,
  }));
}

export async function getActivities(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<Activity[]> {
  const id = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);

  params.append('oldest', oldestDate || sixtyDaysAgo.toISOString().split('T')[0]);
  params.append('newest', newestDate || today.toISOString().split('T')[0]);

  const list = await request<Activity[]>(`/athlete/${id}/activities?${params.toString()}`, apiKey);

  return list.sort(
    (a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()
  );
}

export async function getActivityDetails(apiKey: string, activityId: string): Promise<Activity> {
  return request<Activity>(`/activity/${activityId}`, apiKey);
}

export async function getCalendarEvents(
  apiKey: string,
  athleteId = '0',
  oldestDate?: string,
  newestDate?: string
): Promise<CalendarEvent[]> {
  const id = athleteId.trim() || '0';
  const params = new URLSearchParams();

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const twoWeeksAhead = new Date();
  twoWeeksAhead.setDate(today.getDate() + 14);

  params.append('oldest', oldestDate || weekAgo.toISOString().split('T')[0]);
  params.append('newest', newestDate || twoWeeksAhead.toISOString().split('T')[0]);

  return request<CalendarEvent[]>(`/athlete/${id}/events?${params.toString()}`, apiKey);
}
