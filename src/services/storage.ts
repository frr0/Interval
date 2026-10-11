import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, Athlete, AuthCredentials, CalendarEvent, Wellness } from '../types/intervals';

const KEYS = {
  AUTH: '@intervals_auth_credentials',
  ATHLETE: '@intervals_cached_athlete',
  WELLNESS: '@intervals_cached_wellness',
  ACTIVITIES: '@intervals_cached_activities',
  EVENTS: '@intervals_cached_events',
  SETTINGS: '@intervals_user_settings',
};

export interface UserSettings {
  useImperial: boolean; // mi/lbs vs km/kg
}

export const StorageService = {
  async saveAuth(credentials: AuthCredentials): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH, JSON.stringify(credentials));
  },

  async getAuth(): Promise<AuthCredentials | null> {
    const raw = await AsyncStorage.getItem(KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.AUTH,
      KEYS.ATHLETE,
      KEYS.WELLNESS,
      KEYS.ACTIVITIES,
      KEYS.EVENTS,
    ]);
  },

  async saveCachedAthlete(athlete: Athlete): Promise<void> {
    await AsyncStorage.setItem(KEYS.ATHLETE, JSON.stringify(athlete));
  },

  async getCachedAthlete(): Promise<Athlete | null> {
    const raw = await AsyncStorage.getItem(KEYS.ATHLETE);
    return raw ? JSON.parse(raw) : null;
  },

  async saveCachedWellness(data: Wellness[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WELLNESS, JSON.stringify(data));
  },

  async getCachedWellness(): Promise<Wellness[] | null> {
    const raw = await AsyncStorage.getItem(KEYS.WELLNESS);
    return raw ? JSON.parse(raw) : null;
  },

  async saveCachedActivities(data: Activity[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(data));
  },

  async getCachedActivities(): Promise<Activity[] | null> {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : null;
  },

  async saveCachedEvents(data: CalendarEvent[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(data));
  },

  async getCachedEvents(): Promise<CalendarEvent[] | null> {
    const raw = await AsyncStorage.getItem(KEYS.EVENTS);
    return raw ? JSON.parse(raw) : null;
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getSettings(): Promise<UserSettings> {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : { useImperial: false };
  },
};
