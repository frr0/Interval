import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricCard } from '../../components/MetricCard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { getActivityDetails } from '../../services/api';
import { Activity } from '../../types/intervals';
import {
  formatDateRelative,
  formatDistance,
  formatDuration,
  formatElevation,
  formatHeartRate,
  formatPace,
  formatSpeed,
  formatWatts,
  getSportDetails,
} from '../../utils/formatters';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, credentials, settings } = useApp();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadActivity() {
      // Check in cached activities first
      const found = activities.find((a) => a.id === id);
      if (found) {
        setActivity(found);
      }

      // If live and has credentials, fetch detailed intervals & streams
      if (credentials && !credentials.isDemo && id) {
        try {
          const detail = await getActivityDetails(credentials.apiKey, id);
          if (detail) {
            setActivity(detail);
          }
        } catch (err) {
          console.warn('Could not fetch activity detail:', err);
        }
      }
      setLoading(false);
    }
    loadActivity();
  }, [id, activities, credentials]);

  if (loading && !activity) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.whoopMint} />
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Activity not found</Text>
        <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sport = getSportDetails(activity.type);
  const isRun = (activity.type || '').toLowerCase().includes('run');

  // Compute HR zone percentages if present
  const hrZones = activity.icu_hr_zones || [];
  const totalHrSecs = hrZones.reduce((a, b) => a + b, 0);

  const zoneColors = [
    Colors.hrZ1,
    Colors.hrZ2,
    Colors.hrZ3,
    Colors.hrZ4,
    Colors.hrZ5,
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.navTitleWrap}>
          <View style={[styles.sportPill, { backgroundColor: `${sport.color}22` }]}>
            <Ionicons name={sport.icon as any} size={13} color={sport.color} />
            <Text style={[styles.sportPillText, { color: sport.color }]}>{sport.label}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Activity Title & Timestamp */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>{activity.name}</Text>
          <Text style={styles.date}>{formatDateRelative(activity.start_date_local)}</Text>
        </View>

        {/* Hero Big 3 Stats Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroStatCol}>
            <Text style={styles.heroLabel}>DISTANCE</Text>
            <Text style={styles.heroValue}>
              {formatDistance(activity.distance, settings.useImperial)}
            </Text>
          </View>

          <View style={styles.heroStatDivider} />

          <View style={styles.heroStatCol}>
            <Text style={styles.heroLabel}>TIME</Text>
            <Text style={styles.heroValue}>
              {formatDuration(activity.moving_time || activity.elapsed_time)}
            </Text>
          </View>

          <View style={styles.heroStatDivider} />

          <View style={styles.heroStatCol}>
            <Text style={styles.heroLabel}>TRAINING LOAD</Text>
            <Text style={[styles.heroValue, { color: Colors.stravaOrange }]}>
              {activity.icu_training_load ? Math.round(activity.icu_training_load) : '--'}
            </Text>
          </View>
        </View>

        {/* Performance & Power Grid */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionLabel}>PERFORMANCE & OUTPUT</Text>
        </View>

        <View style={styles.grid}>
          {activity.average_watts ? (
            <MetricCard
              label="Avg Power"
              value={formatWatts(activity.average_watts)}
              subValue={
                activity.weighted_average_watts
                  ? `NP: ${formatWatts(activity.weighted_average_watts)}`
                  : undefined
              }
              icon="flash-outline"
              accentColor={Colors.stravaOrange}
            />
          ) : null}

          {isRun && activity.average_speed ? (
            <MetricCard
              label="Pace"
              value={formatPace(activity.average_speed, settings.useImperial)}
              subValue={`Speed: ${formatSpeed(activity.average_speed, settings.useImperial)}`}
              icon="speedometer-outline"
              accentColor={Colors.whoopMint}
            />
          ) : activity.average_speed ? (
            <MetricCard
              label="Avg Speed"
              value={formatSpeed(activity.average_speed, settings.useImperial)}
              subValue={
                activity.max_speed
                  ? `Max: ${formatSpeed(activity.max_speed, settings.useImperial)}`
                  : undefined
              }
              icon="speedometer-outline"
              accentColor={Colors.whoopMint}
            />
          ) : null}

          {activity.average_heartrate ? (
            <MetricCard
              label="Avg Heart Rate"
              value={formatHeartRate(activity.average_heartrate)}
              subValue={
                activity.max_heartrate
                  ? `Max: ${formatHeartRate(activity.max_heartrate)}`
                  : undefined
              }
              icon="heart-outline"
              accentColor={Colors.dangerRed}
            />
          ) : null}

          {activity.total_elevation_gain ? (
            <MetricCard
              label="Elevation Gain"
              value={formatElevation(activity.total_elevation_gain, settings.useImperial)}
              icon="trending-up"
              accentColor={Colors.garminCyan}
            />
          ) : null}

          {activity.icu_joules ? (
            <MetricCard
              label="Total Work"
              value={`${Math.round(activity.icu_joules / 1000)} kJ`}
              icon="flame-outline"
              accentColor={Colors.warningAmber}
            />
          ) : null}

          {activity.icu_intensity ? (
            <MetricCard
              label="Intensity Factor"
              value={(
                activity.icu_intensity > 2
                  ? activity.icu_intensity / 100
                  : activity.icu_intensity
              ).toFixed(2)}
              subValue={activity.icu_intensity > 0.9 ? 'High Intensity' : 'Moderate'}
              icon="flame-outline"
              accentColor={Colors.fatiguePurple}
            />
          ) : null}
        </View>

        {/* Heart Rate Zones Distribution */}
        {totalHrSecs > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={16} color={Colors.dangerRed} />
              <Text style={styles.cardTitle}>HEART RATE ZONES</Text>
            </View>

            {/* Zone bar */}
            <View style={styles.zoneBar}>
              {hrZones.map((secs, idx) => {
                const pct = (secs / totalHrSecs) * 100;
                if (pct <= 0) return null;
                return (
                  <View
                    key={idx}
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: zoneColors[idx] || Colors.hrZ1,
                    }}
                  />
                );
              })}
            </View>

            {/* Zone stats breakdown */}
            <View style={styles.zoneBreakdown}>
              {hrZones.map((secs, idx) => {
                const pct = totalHrSecs > 0 ? (secs / totalHrSecs) * 100 : 0;
                return (
                  <View key={idx} style={styles.zoneRow}>
                    <View style={styles.zoneRowLeft}>
                      <View
                        style={[
                          styles.zoneDot,
                          { backgroundColor: zoneColors[idx] || Colors.hrZ1 },
                        ]}
                      />
                      <Text style={styles.zoneRowLabel}>Zone {idx + 1}</Text>
                    </View>
                    <Text style={styles.zoneRowSecs}>{formatDuration(secs)}</Text>
                    <Text style={styles.zoneRowPct}>{Math.round(pct)}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Intervals Breakdown (if activity contains structured intervals) */}
        {activity.intervals && activity.intervals.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="repeat" size={16} color={Colors.whoopMint} />
              <Text style={styles.cardTitle}>INTERVAL STATS ({activity.intervals.length})</Text>
            </View>

            {activity.intervals.map((int, idx) => (
              <View key={int.id || idx} style={styles.intervalRow}>
                <View style={styles.intervalLeft}>
                  <View
                    style={[
                      styles.intervalIndexBadge,
                      {
                        backgroundColor:
                          int.type === 'RECOVERY'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : `${Colors.whoopMint}22`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.intervalIndexText,
                        {
                          color:
                            int.type === 'RECOVERY'
                              ? Colors.textMuted
                              : Colors.whoopMint,
                        },
                      ]}
                    >
                      #{idx + 1}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.intervalName}>
                      {int.type === 'RECOVERY' ? 'Recovery' : 'Work Interval'}
                    </Text>
                    <Text style={styles.intervalDuration}>
                      {formatDuration(int.moving_time || int.elapsed_time)}
                    </Text>
                  </View>
                </View>

                <View style={styles.intervalRight}>
                  {int.average_watts ? (
                    <Text style={styles.intervalStat}>
                      {Math.round(int.average_watts)} W
                    </Text>
                  ) : null}
                  {int.average_heartrate ? (
                    <Text style={styles.intervalStatHR}>
                      {Math.round(int.average_heartrate)} bpm
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Athlete Notes & RPE */}
        {(activity.description || activity.rpe || activity.feel) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.garminCyan} />
              <Text style={styles.cardTitle}>NOTES & PERCEPTION</Text>
            </View>

            {activity.description ? (
              <Text style={styles.notesText}>{activity.description}</Text>
            ) : null}

            <View style={styles.perceptionRow}>
              {activity.rpe ? (
                <View style={styles.perceptionPill}>
                  <Text style={styles.perceptionLabel}>RPE (EXERTION)</Text>
                  <Text style={styles.perceptionValue}>{activity.rpe} / 10</Text>
                </View>
              ) : null}

              {activity.feel ? (
                <View style={styles.perceptionPill}>
                  <Text style={styles.perceptionLabel}>FEELING</Text>
                  <Text style={styles.perceptionValue}>
                    {activity.feel === 5
                      ? 'Great ⚡'
                      : activity.feel === 4
                      ? 'Good 👍'
                      : activity.feel === 3
                      ? 'Normal'
                      : 'Tired 😴'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  backButtonSimple: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.whoopMint,
    fontWeight: '800',
    fontSize: 12,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorderSubtle,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleWrap: {
    alignItems: 'center',
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  sportPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroSection: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatCol: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.surfaceBorderSubtle,
  },
  sectionTitleRow: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  zoneBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  zoneBreakdown: {
    gap: 8,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  zoneRowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  zoneRowSecs: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '600',
  },
  zoneRowPct: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    width: 40,
    textAlign: 'right',
  },
  intervalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorderSubtle,
  },
  intervalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intervalIndexBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  intervalIndexText: {
    fontSize: 11,
    fontWeight: '900',
  },
  intervalName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  intervalDuration: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  intervalRight: {
    alignItems: 'flex-end',
  },
  intervalStat: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  intervalStatHR: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  perceptionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  perceptionPill: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  perceptionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  perceptionValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
});
