import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityCard } from '../../components/ActivityCard';
import { Header } from '../../components/Header';
import { MetricCard } from '../../components/MetricCard';
import { RecoveryRing } from '../../components/RecoveryRing';
import { WeeklyLoadBar } from '../../components/WeeklyLoadBar';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatDuration, getFormStatus } from '../../utils/formatters';

export default function DashboardScreen() {
  const {
    athlete,
    latestWellness,
    activities,
    events,
    recoveryScore,
    isRefreshing,
    refreshData,
    settings,
  } = useApp();

  const ctl = latestWellness?.ctl ?? 75;
  const atl = latestWellness?.atl ?? 80;
  const tsb = latestWellness?.tsb ?? (ctl - atl);
  const formStatus = getFormStatus(tsb);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = activities.find((a) =>
    a.start_date_local && a.start_date_local.startsWith(todayStr)
  );
  const mostRecentActivity = activities[0];

  const todayEvent = events.find((e) =>
    e.start_date_local && e.start_date_local.startsWith(todayStr)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={Colors.whoopMint}
            colors={[Colors.whoopMint]}
          />
        }
      >
        {/* Recovery Hero Card */}
        <View style={styles.recoveryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>DAILY RECOVERY & READINESS</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/fitness')}
              style={styles.moreLink}
            >
              <Text style={styles.moreLinkText}>DETAILS</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.whoopMint} />
            </TouchableOpacity>
          </View>

          <RecoveryRing
            score={recoveryScore}
            size={180}
            strokeWidth={14}
            restingHR={latestWellness?.restingHR}
            hrv={latestWellness?.hrv}
          />

          <Text style={styles.recoveryAdvice}>
            {recoveryScore >= 67
              ? 'Your body is primed for high-strain training and intensity.'
              : recoveryScore >= 34
              ? 'Moderate readiness. Stick to aerobic baseline or sweet spot.'
              : 'High fatigue detected. Prioritize active recovery and sleep.'}
          </Text>
        </View>

        {/* Fitness / Fatigue / Form Triplet Cards */}
        <View style={styles.tripletRow}>
          {/* Fitness (CTL) */}
          <View style={[styles.tripletCard, { borderColor: `${Colors.fitnessCtl}33` }]}>
            <Text style={styles.tripletLabel}>FITNESS</Text>
            <Text style={[styles.tripletValue, { color: Colors.fitnessCtl }]}>
              {Math.round(ctl)}
            </Text>
            <Text style={styles.tripletSub}>CTL (42d)</Text>
          </View>

          {/* Fatigue (ATL) */}
          <View style={[styles.tripletCard, { borderColor: `${Colors.fatigueAtl}33` }]}>
            <Text style={styles.tripletLabel}>FATIGUE</Text>
            <Text style={[styles.tripletValue, { color: Colors.fatigueAtl }]}>
              {Math.round(atl)}
            </Text>
            <Text style={styles.tripletSub}>ATL (7d)</Text>
          </View>

          {/* Form (TSB) */}
          <View style={[styles.tripletCard, { borderColor: `${formStatus.color}33` }]}>
            <Text style={styles.tripletLabel}>FORM</Text>
            <Text style={[styles.tripletValue, { color: formStatus.color }]}>
              {tsb > 0 ? `+${Math.round(tsb)}` : Math.round(tsb)}
            </Text>
            <Text style={[styles.tripletSub, { color: formStatus.color }]}>
              {formStatus.label}
            </Text>
          </View>
        </View>

        {/* 7-Day Training Load Progress Bar */}
        <WeeklyLoadBar activities={activities} />

        {/* Today's Planned Workout or Completed Activity */}
        {todayEvent && !todayActivity && (
          <View style={styles.plannedWorkoutCard}>
            <View style={styles.plannedHeader}>
              <View style={styles.plannedBadge}>
                <Ionicons name="calendar-outline" size={13} color={Colors.garminCyan} />
                <Text style={styles.plannedBadgeText}>TODAY&apos;S PLANNED WORKOUT</Text>
              </View>
              {todayEvent.load ? (
                <Text style={styles.plannedLoad}>LOAD ~{todayEvent.load}</Text>
              ) : null}
            </View>
            <Text style={styles.plannedTitle}>{todayEvent.name}</Text>
            {todayEvent.description ? (
              <Text style={styles.plannedDesc} numberOfLines={2}>
                {todayEvent.description}
              </Text>
            ) : null}
            {todayEvent.moving_time ? (
              <View style={styles.plannedMetaRow}>
                <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.plannedMetaText}>
                  Planned duration: {formatDuration(todayEvent.moving_time)}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Recent / Today Activity */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionLabel}>
            {todayActivity ? "TODAY'S ACTIVITY" : 'LATEST ACTIVITY'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/activities')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {todayActivity ? (
          <ActivityCard activity={todayActivity} useImperial={settings.useImperial} />
        ) : mostRecentActivity ? (
          <ActivityCard activity={mostRecentActivity} useImperial={settings.useImperial} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No activities logged yet.</Text>
          </View>
        )}

        {/* Daily Wellness Vitals Grid */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionLabel}>BIOMETRICS & WELLNESS</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Sleep"
            value={
              latestWellness?.sleepSecs
                ? formatDuration(latestWellness.sleepSecs)
                : '7h 45m'
            }
            subValue={
              latestWellness?.sleepScore
                ? `${latestWellness.sleepScore}% Sleep Score`
                : 'Good Quality'
            }
            icon="moon-outline"
            accentColor="#818CF8"
          />

          <MetricCard
            label="HRV (rMSSD)"
            value={latestWellness?.hrv ? `${latestWellness.hrv}` : '64'}
            unit="ms"
            subValue="Within baseline"
            icon="heart-outline"
            accentColor={Colors.whoopMint}
          />

          <MetricCard
            label="Resting HR"
            value={latestWellness?.restingHR || athlete?.restingHR || 46}
            unit="bpm"
            subValue="Low & recovered"
            icon="pulse-outline"
            accentColor={Colors.garminCyan}
          />

          <MetricCard
            label="Ramp Rate"
            value={
              latestWellness?.rampRate !== undefined
                ? `${latestWellness.rampRate > 0 ? '+' : ''}${latestWellness.rampRate}`
                : '+3.2'
            }
            unit="/wk"
            subValue="Safe building"
            icon="trending-up"
            accentColor={Colors.warningAmber}
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  recoveryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.whoopMint,
  },
  recoveryAdvice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  tripletRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  tripletCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tripletLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tripletValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tripletSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  plannedWorkoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.3)',
    marginVertical: 8,
  },
  plannedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  plannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plannedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.garminCyan,
    letterSpacing: 0.6,
  },
  plannedLoad: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.stravaOrange,
  },
  plannedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  plannedDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  plannedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  plannedMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.whoopMint,
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
