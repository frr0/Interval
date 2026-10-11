export interface Athlete {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  profile_medium?: string;
  city?: string;
  country?: string;
  weight?: number;
  restingHR?: number;
  maxHR?: number;
  ftp?: number;
  sportSettings?: AthleteSportSettings[];
}

export interface AthleteSportSettings {
  id: string;
  types: string[];
  ftp?: number;
  indoor_ftp?: number;
  w_prime?: number;
  warmup_time?: number;
  cooldown_time?: number;
  hr_load_type?: string;
}

export interface Wellness {
  id: string; // "YYYY-MM-DD"
  ctl?: number; // Chronic Training Load (Fitness)
  atl?: number; // Acute Training Load (Fatigue)
  rampRate?: number;
  ctlLoad?: number;
  atlLoad?: number;
  restingHR?: number;
  hrv?: number; // rMSSD in ms
  hrvSDNN?: number;
  sleepSecs?: number;
  sleepScore?: number;
  sleepQuality?: number; // 1-5
  avgSleepingHR?: number;
  soreness?: number; // 1-5
  fatigue?: number; // 1-5
  stress?: number; // 1-5
  mood?: number; // 1-5
  motivation?: number;
  hydration?: number;
  weight?: number;
  readiness?: number;
  comments?: string;
  // Computed helpers
  tsb?: number; // Form = CTL - ATL
}

export interface ActivityInterval {
  id: number;
  type?: string;
  start_index?: number;
  end_index?: number;
  start_time?: number;
  end_time?: number;
  elapsed_time?: number;
  moving_time?: number;
  distance?: number;
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_speed?: number;
  average_cadence?: number;
  intensity?: number;
  zone?: number;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  start_date_local: string;
  distance?: number; // meters
  moving_time?: number; // seconds
  elapsed_time?: number;
  total_elevation_gain?: number; // meters
  average_speed?: number; // m/s
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number; // NP
  icu_training_load?: number; // TSS
  icu_intensity?: number; // Intensity Factor * 100 or ratio
  icu_ftp?: number;
  icu_joules?: number; // Work in Joules
  icu_average_cadence?: number;
  icu_hr_zones?: number[]; // seconds in each zone
  icu_power_zones?: number[]; // seconds in each zone
  feel?: number; // 1 (terrible) to 5 (great)
  rpe?: number; // 1 to 10
  description?: string;
  trainer?: boolean;
  intervals?: ActivityInterval[];
  icu_resting_hr?: number;
  icu_weight?: number;
}

export interface CalendarEvent {
  id: number | string;
  start_date_local: string;
  end_date_local?: string;
  name: string;
  type?: string;
  category?: 'WORKOUT' | 'TARGET' | 'NOTE' | 'RACE';
  moving_time?: number;
  load?: number;
  description?: string;
  completed?: boolean;
  activity_id?: string;
}

export interface PowerCurvePoint {
  secs: number;
  watts: number;
  label: string;
}

export interface AuthCredentials {
  apiKey: string;
  athleteId: string; // default "0"
  isDemo?: boolean;
}
