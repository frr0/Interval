import { Colors } from '../constants/theme';
import { Wellness } from '../types/intervals';

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
  }
  return `${secs}s`;
}

export function formatDistance(meters?: number, useMiles = false): string {
  if (!meters || meters <= 0) return '0.0 km';
  if (useMiles) {
    const miles = meters / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(speedMps?: number, useMiles = false): string {
  if (!speedMps || speedMps <= 0) return '0.0 km/h';
  if (useMiles) {
    const mph = speedMps * 2.23694;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = speedMps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatPace(speedMps?: number, useMiles = false): string {
  if (!speedMps || speedMps <= 0) return '--:--';
  const factor = useMiles ? 1609.344 : 1000;
  const secPerUnit = factor / speedMps;
  const mins = Math.floor(secPerUnit / 60);
  const secs = Math.floor(secPerUnit % 60);
  const suffix = useMiles ? '/mi' : '/km';
  return `${mins}:${secs < 10 ? '0' : ''}${secs} ${suffix}`;
}

export function formatElevation(meters?: number, useFeet = false): string {
  if (!meters) return '0 m';
  if (useFeet) {
    const feet = Math.round(meters * 3.28084);
    return `${feet.toLocaleString()} ft`;
  }
  return `${Math.round(meters).toLocaleString()} m`;
}

export function formatWatts(watts?: number): string {
  if (!watts || watts <= 0) return '-- W';
  return `${Math.round(watts)} W`;
}

export function formatHeartRate(hr?: number): string {
  if (!hr || hr <= 0) return '-- bpm';
  return `${Math.round(hr)} bpm`;
}

export function formatDateRelative(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today, ${timeString}`;
  if (isYesterday) return `Yesterday, ${timeString}`;

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export interface FormStatus {
  label: string;
  color: string;
  description: string;
  zone: 'fresh' | 'optimal' | 'neutral' | 'fatigued' | 'overreaching';
}

export function getFormStatus(tsb: number): FormStatus {
  if (tsb > 15) {
    return {
      label: 'Very Fresh',
      color: Colors.whoopMint,
      description: 'Well rested. Fitness declining if extended.',
      zone: 'fresh',
    };
  }
  if (tsb >= 5) {
    return {
      label: 'Fresh & Race Ready',
      color: Colors.whoopMint,
      description: 'Supercompensation reached. Peak form for racing.',
      zone: 'fresh',
    };
  }
  if (tsb >= -10) {
    return {
      label: 'Neutral',
      color: Colors.textSecondary,
      description: 'Maintenance zone. Stable fitness.',
      zone: 'neutral',
    };
  }
  if (tsb >= -30) {
    return {
      label: 'Optimal Training',
      color: Colors.fitnessCtl,
      description: 'Productive training zone building durable fitness.',
      zone: 'optimal',
    };
  }
  if (tsb >= -40) {
    return {
      label: 'High Fatigue',
      color: Colors.warningAmber,
      description: 'Heavy training load. Prioritize recovery soon.',
      zone: 'fatigued',
    };
  }
  return {
    label: 'Overreaching Risk',
    color: Colors.dangerRed,
    description: 'High injury and illness risk. Rest recommended.',
    zone: 'overreaching',
  };
}

export function computeRecoveryScore(wellness?: Wellness): number {
  if (!wellness) return 78; // Default good score
  if (wellness.readiness && wellness.readiness > 0) {
    return Math.min(100, Math.max(0, Math.round(wellness.readiness)));
  }

  // Calculate composite recovery score like Whoop / Garmin
  let score = 70;

  // HRV influence (normal baseline ~55-80ms)
  if (wellness.hrv && wellness.hrv > 0) {
    if (wellness.hrv > 75) score += 12;
    else if (wellness.hrv > 60) score += 6;
    else if (wellness.hrv < 40) score -= 15;
    else if (wellness.hrv < 50) score -= 8;
  }

  // Sleep score / duration
  if (wellness.sleepScore && wellness.sleepScore > 0) {
    score = score * 0.4 + wellness.sleepScore * 0.6;
  } else if (wellness.sleepSecs && wellness.sleepSecs > 0) {
    const hours = wellness.sleepSecs / 3600;
    if (hours >= 7.5) score += 10;
    else if (hours < 6) score -= 14;
    else if (hours < 7) score -= 6;
  }

  // Resting HR influence
  if (wellness.restingHR && wellness.restingHR > 0) {
    if (wellness.restingHR < 50) score += 6;
    else if (wellness.restingHR > 65) score -= 8;
  }

  // Subjective fatigue & soreness
  if (wellness.soreness && wellness.soreness > 3) score -= (wellness.soreness - 2) * 4;
  if (wellness.fatigue && wellness.fatigue > 3) score -= (wellness.fatigue - 2) * 4;
  if (wellness.stress && wellness.stress > 3) score -= (wellness.stress - 2) * 3;

  return Math.min(99, Math.max(15, Math.round(score)));
}

export function getSportDetails(type: string): { icon: string; color: string; label: string } {
  const t = (type || '').toLowerCase();
  if (t.includes('ride') || t.includes('cycl')) {
    return { icon: 'bicycle', color: Colors.stravaOrange, label: 'Cycling' };
  }
  if (t.includes('run')) {
    return { icon: 'walk', color: Colors.whoopMint, label: 'Running' };
  }
  if (t.includes('swim')) {
    return { icon: 'water', color: Colors.garminCyan, label: 'Swimming' };
  }
  if (t.includes('weight') || t.includes('gym') || t.includes('strength') || t.includes('crossfit')) {
    return { icon: 'barbell', color: Colors.fatiguePurple, label: 'Strength' };
  }
  if (t.includes('row')) {
    return { icon: 'boat', color: '#06B6D4', label: 'Rowing' };
  }
  if (t.includes('walk') || t.includes('hike')) {
    return { icon: 'footsteps', color: '#EAB308', label: 'Walk' };
  }
  return { icon: 'fitness', color: Colors.stravaOrange, label: type || 'Workout' };
}
