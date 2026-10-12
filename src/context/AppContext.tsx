import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  derivePowerCurve,
  getActivities,
  getAthleteProfile,
  getCalendarEvents,
  getWellnessHistory,
  IntervalsApiError,
} from '../services/api';
import {
  MOCK_ACTIVITIES,
  MOCK_ATHLETE,
  MOCK_CALENDAR_EVENTS,
  MOCK_POWER_CURVE,
  MOCK_WELLNESS,
} from '../services/mockData';
import { StorageService, UserSettings } from '../services/storage';
import { Activity, Athlete, AuthCredentials, CalendarEvent, PowerCurvePoint, Wellness } from '../types/intervals';
import { computeRecoveryScore } from '../utils/formatters';

interface AppContextType {
  credentials: AuthCredentials | null;
  athlete: Athlete | null;
  wellness: Wellness[];
  activities: Activity[];
  events: CalendarEvent[];
  powerCurve: PowerCurvePoint[];
  latestWellness: Wellness | null;
  recoveryScore: number;
  weeklyLoad: number;
  weeklyDurationSecs: number;
  weeklyDistanceMeters: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  settings: UserSettings;
  login: (apiKey: string, athleteId?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  toggleUnits: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [wellness, setWellness] = useState<Wellness[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({ useImperial: false });

  // Load stored session & cache on startup
  useEffect(() => {
    async function initSession() {
      try {
        const [savedAuth, savedSettings, cachedAthlete, cachedWellness, cachedActivities, cachedEvents] =
          await Promise.all([
            StorageService.getAuth(),
            StorageService.getSettings(),
            StorageService.getCachedAthlete(),
            StorageService.getCachedWellness(),
            StorageService.getCachedActivities(),
            StorageService.getCachedEvents(),
          ]);

        if (savedSettings) {
          setSettings(savedSettings);
        }

        if (savedAuth) {
          setCredentials(savedAuth);
          if (cachedAthlete) setAthlete(cachedAthlete);
          if (cachedWellness) setWellness(cachedWellness);
          if (cachedActivities) setActivities(cachedActivities);
          if (cachedEvents) setEvents(cachedEvents);

          // Silent background sync
          fetchFullData(savedAuth, false);
        }
      } catch (err) {
        console.warn('Error reading stored session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initSession();
  }, []);

  async function fetchFullData(auth: AuthCredentials, showLoadingSpinner = false) {
    if (showLoadingSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      if (auth.isDemo) {
        // Use rich simulated dataset
        setAthlete(MOCK_ATHLETE);
        setWellness(MOCK_WELLNESS);
        setActivities(MOCK_ACTIVITIES);
        setEvents(MOCK_CALENDAR_EVENTS);
        return;
      }

      // Live Intervals.icu fetch
      const [fetchedAthlete, fetchedWellness, fetchedActivities, fetchedEvents] =
        await Promise.all([
          getAthleteProfile(auth.apiKey, auth.athleteId),
          getWellnessHistory(auth.apiKey, auth.athleteId),
          getActivities(auth.apiKey, auth.athleteId),
          getCalendarEvents(auth.apiKey, auth.athleteId),
        ]);

      setAthlete(fetchedAthlete);
      setWellness(fetchedWellness);
      setActivities(fetchedActivities);
      setEvents(fetchedEvents);

      // Cache for offline resilience
      await Promise.all([
        StorageService.saveCachedAthlete(fetchedAthlete),
        StorageService.saveCachedWellness(fetchedWellness),
        StorageService.saveCachedActivities(fetchedActivities),
        StorageService.saveCachedEvents(fetchedEvents),
      ]);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (err instanceof IntervalsApiError) {
        setError(err.message);
      } else {
        setError(err.message || 'Unable to sync with Intervals.icu');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const login = async (apiKey: string, athleteId = '0') => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanKey = apiKey.trim();
      const cleanId = athleteId.trim() || '0';

      // Verify connection with athlete profile request
      const verifiedAthlete = await getAthleteProfile(cleanKey, cleanId);

      const auth: AuthCredentials = {
        apiKey: cleanKey,
        athleteId: cleanId,
        isDemo: false,
      };

      await StorageService.saveAuth(auth);
      setCredentials(auth);
      setAthlete(verifiedAthlete);

      // Now fetch rest of data
      await fetchFullData(auth, false);
    } catch (err: any) {
      setIsLoading(false);
      if (err instanceof IntervalsApiError) {
        setError(err.message);
        throw err;
      }
      const genericMsg = 'Connection failed. Please verify your API Key.';
      setError(genericMsg);
      throw new Error(genericMsg);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    setError(null);
    const auth: AuthCredentials = {
      apiKey: 'DEMO_KEY',
      athleteId: 'demo',
      isDemo: true,
    };
    await StorageService.saveAuth(auth);
    setCredentials(auth);
    setAthlete(MOCK_ATHLETE);
    setWellness(MOCK_WELLNESS);
    setActivities(MOCK_ACTIVITIES);
    setEvents(MOCK_CALENDAR_EVENTS);
    setIsLoading(false);
  };

  const logout = async () => {
    await StorageService.clearAuth();
    setCredentials(null);
    setAthlete(null);
    setWellness([]);
    setActivities([]);
    setEvents([]);
    setError(null);
  };

  const refreshData = async () => {
    if (!credentials) return;
    await fetchFullData(credentials, false);
  };

  const toggleUnits = async () => {
    const updated: UserSettings = { useImperial: !settings.useImperial };
    setSettings(updated);
    await StorageService.saveSettings(updated);
  };

  const clearError = () => setError(null);

  // Computed latest wellness
  const latestWellness = useMemo(() => {
    if (!wellness || wellness.length === 0) return null;
    // Newest is usually at end of array or sorted by date
    const sorted = [...wellness].sort(
      (a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()
    );
    return sorted[0];
  }, [wellness]);

  // Computed Whoop-style recovery score
  const recoveryScore = useMemo(() => {
    return computeRecoveryScore(latestWellness || undefined);
  }, [latestWellness]);

  // Computed weekly volume stats (last 7 days)
  const { weeklyLoad, weeklyDurationSecs, weeklyDistanceMeters } = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;

    let load = 0;
    let duration = 0;
    let dist = 0;

    activities.forEach((act) => {
      const actTime = new Date(act.start_date_local).getTime();
      if (actTime >= sevenDaysAgo) {
        load += act.icu_training_load || 0;
        duration += act.moving_time || 0;
        dist += act.distance || 0;
      }
    });

    return {
      weeklyLoad: Math.round(load),
      weeklyDurationSecs: duration,
      weeklyDistanceMeters: dist,
    };
  }, [activities]);

  const powerCurve = useMemo(() => {
    if (credentials?.isDemo || !athlete) {
      return MOCK_POWER_CURVE;
    }
    return derivePowerCurve(athlete.ftp || 295, athlete.weight || 68.5);
  }, [credentials, athlete]);

  return (
    <AppContext.Provider
      value={{
        credentials,
        athlete,
        wellness,
        activities,
        events,
        powerCurve,
        latestWellness,
        recoveryScore,
        weeklyLoad,
        weeklyDurationSecs,
        weeklyDistanceMeters,
        isLoading,
        isRefreshing,
        error,
        settings,
        login,
        loginDemo,
        logout,
        refreshData,
        toggleUnits,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
