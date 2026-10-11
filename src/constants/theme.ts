export const Colors = {
  // Base
  background: '#080A0F',
  surface: '#111622',
  surfaceElevated: '#1A2234',
  surfaceCard: '#151C2C',
  surfaceBorder: '#232D42',
  surfaceBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#080A0F',

  // Core Athletic Accents (Whoop / Strava / Garmin)
  stravaOrange: '#FC5200',
  whoopMint: '#00E5A3',
  garminCyan: '#00B4D8',
  fatiguePurple: '#8B5CF6',
  warningAmber: '#F59E0B',
  dangerRed: '#EF4444',
  successGreen: '#10B981',

  // Fitness / Fatigue / Form
  fitnessCtl: '#38BDF8', // Cyan / Light Blue
  fatigueAtl: '#A855F7', // Violet
  formTsb: '#00E5A3',    // Mint Green
  loadTss: '#FC5200',    // Bright Orange

  // Heart Rate Zones
  hrZ1: '#94A3B8', // Active Recovery (Grey)
  hrZ2: '#38BDF8', // Aerobic / Endurance (Blue)
  hrZ3: '#10B981', // Tempo (Green)
  hrZ4: '#F59E0B', // Threshold (Yellow/Orange)
  hrZ5: '#EF4444', // VO2 Max / Anaerobic (Red)

  // Recovery States
  recoveryHigh: '#00E5A3',   // 67 - 100%
  recoveryMed: '#F59E0B',    // 34 - 66%
  recoveryLow: '#EF4444',    // 0 - 33%

  // Gradients
  gradientDark: ['#111622', '#0A0C12'],
  gradientMint: ['#00E5A3', '#00B4D8'],
  gradientOrange: ['#FC5200', '#FF7A00'],
  gradientPurple: ['#8B5CF6', '#6366F1'],
  gradientCard: ['rgba(26, 34, 52, 0.7)', 'rgba(17, 22, 34, 0.95)'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
};

export const Typography = {
  header: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
};
