import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import { Activity } from '../types/intervals';

interface WeeklyLoadBarProps {
  activities: Activity[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyLoadBar: React.FC<WeeklyLoadBarProps> = ({ activities }) => {
  // Aggregate load for the last 7 calendar days
  const { weekData, totalLoad, maxDayLoad } = useMemo(() => {
    const today = new Date();
    const result = [];
    let sum = 0;
    let max = 50;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = DAYS[d.getDay()];

      let dayLoad = 0;
      activities.forEach((act) => {
        if (act.start_date_local && act.start_date_local.startsWith(dateStr)) {
          dayLoad += act.icu_training_load || 0;
        }
      });

      max = Math.max(max, dayLoad);
      sum += dayLoad;

      result.push({
        dateStr,
        dayLabel,
        isToday: i === 0,
        load: Math.round(dayLoad),
      });
    }

    return { weekData: result, totalLoad: Math.round(sum), maxDayLoad: max };
  }, [activities]);

  const targetWeeklyLoad = 550; // Reference weekly target
  const progressRatio = Math.min(1.2, totalLoad / targetWeeklyLoad);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>7-DAY TRAINING LOAD</Text>
          <View style={styles.loadSummaryRow}>
            <Text style={styles.totalLoadText}>{totalLoad}</Text>
            <Text style={styles.targetText}>/ ~{targetWeeklyLoad} Target</Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {progressRatio >= 0.85 && progressRatio <= 1.15
              ? 'OPTIMAL LOAD'
              : progressRatio > 1.15
              ? 'HIGH STRAIN'
              : 'RECOVERY / BUILDING'}
          </Text>
        </View>
      </View>

      {/* 7 Day Bars */}
      <View style={styles.barsRow}>
        {weekData.map((d, idx) => {
          const heightPercent = maxDayLoad > 0 ? (d.load / maxDayLoad) * 100 : 0;
          const barColor = d.isToday
            ? Colors.whoopMint
            : d.load > 120
            ? Colors.stravaOrange
            : Colors.fitnessCtl;

          return (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(d.load > 0 ? 12 : 4, heightPercent)}%`,
                      backgroundColor: d.load > 0 ? barColor : 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayText, d.isToday && styles.todayText]}>
                {d.dayLabel}
              </Text>
              <Text style={styles.dayLoadText}>{d.load > 0 ? d.load : '-'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  loadSummaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  totalLoadText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  badge: {
    backgroundColor: 'rgba(0, 229, 163, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.whoopMint,
    letterSpacing: 0.5,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 6,
  },
  todayText: {
    color: Colors.whoopMint,
    fontWeight: '900',
  },
  dayLoadText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
