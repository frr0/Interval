import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface RecoveryRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  restingHR?: number;
  hrv?: number;
}

export const RecoveryRing: React.FC<RecoveryRingProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  restingHR,
  hrv,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorStart = Colors.whoopMint;
  let colorEnd = '#00B4D8';
  let statusText = 'PRIME / RECOVERED';

  if (clampedScore < 34) {
    colorStart = Colors.dangerRed;
    colorEnd = '#F97316';
    statusText = 'RECOVERY NEEDED';
  } else if (clampedScore < 67) {
    colorStart = Colors.warningAmber;
    colorEnd = '#FBBF24';
    statusText = 'ADEQUATE';
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorStart} />
            <Stop offset="100%" stopColor={colorEnd} />
          </LinearGradient>
        </Defs>

        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress indicator circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.subLabel}>RECOVERY</Text>
        <Text style={[styles.scoreText, { color: colorStart }]}>{clampedScore}%</Text>
        <View style={[styles.badge, { backgroundColor: `${colorStart}22` }]}>
          <Text style={[styles.badgeText, { color: colorStart }]}>{statusText}</Text>
        </View>

        {(restingHR !== undefined || hrv !== undefined) && (
          <View style={styles.microStatsRow}>
            {restingHR !== undefined && (
              <Text style={styles.microStatText}>
                HR <Text style={styles.microStatBold}>{restingHR}</Text>
              </Text>
            )}
            {restingHR !== undefined && hrv !== undefined && (
              <Text style={styles.microStatDivider}>•</Text>
            )}
            {hrv !== undefined && (
              <Text style={styles.microStatText}>
                HRV <Text style={styles.microStatBold}>{hrv}ms</Text>
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  microStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  microStatText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  microStatBold: {
    color: Colors.text,
    fontWeight: '700',
  },
  microStatDivider: {
    marginHorizontal: 5,
    color: Colors.textMuted,
    fontSize: 10,
  },
});
