import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FitnessChart } from '../../components/FitnessChart';
import { MetricCard } from '../../components/MetricCard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatDuration, getFormStatus } from '../../utils/formatters';

export default function FitnessScreen() {
  const { wellness, isRefreshing, refreshData } = useApp();

  const sortedWellness = useMemo(() => {
    return [...wellness].sort(
      (a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()
    );
  }, [wellness]);

  const latest = sortedWellness[0];
  const ctl = latest?.ctl ?? 78;
  const atl = latest?.atl ?? 82;
  const tsb = latest?.tsb ?? (ctl - atl);
  const formStatus = getFormStatus(tsb);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>FITNESS & FORM</Text>
        <Text style={styles.screenSubtitle}>
          Performance modeling, training load & physiological fatigue
        </Text>
      </View>

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
        {/* Interactive CTL / ATL / TSB Chart */}
        <FitnessChart data={wellness} height={240} />

        {/* Current State Cards */}
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Fitness (CTL)"
            value={ctl.toFixed(1)}
            unit="load"
            subValue="42-day training base"
            icon="bar-chart-outline"
            accentColor={Colors.fitnessCtl}
          />

          <MetricCard
            label="Fatigue (ATL)"
            value={atl.toFixed(1)}
            unit="load"
            subValue="7-day acute stress"
            icon="flash-outline"
            accentColor={Colors.fatigueAtl}
          />

          <MetricCard
            label="Form (TSB)"
            value={tsb > 0 ? `+${tsb.toFixed(1)}` : tsb.toFixed(1)}
            unit=""
            subValue={formStatus.label}
            icon="speedometer-outline"
            accentColor={formStatus.color}
          />

          <MetricCard
            label="Ramp Rate"
            value={
              latest?.rampRate !== undefined
                ? `${latest.rampRate > 0 ? '+' : ''}${latest.rampRate.toFixed(1)}`
                : '+3.4'
            }
            unit="/wk"
            subValue="Safe < +5.0 / wk"
            icon="trending-up"
            accentColor={Colors.warningAmber}
          />
        </View>

        {/* Form Zones Explanation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.garminCyan} />
            <Text style={styles.cardHeaderTitle}>UNDERSTANDING FORM (TSB)</Text>
          </View>
          <Text style={styles.cardBodyText}>
            Form = Fitness (CTL) − Fatigue (ATL). It indicates your current readiness for high intensity or racing:
          </Text>

          <View style={styles.zoneList}>
            <View style={styles.zoneItem}>
              <View style={[styles.zonePill, { backgroundColor: Colors.whoopMint }]}>
                <Text style={styles.zonePillText}>+5 to +25</Text>
              </View>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>Fresh & Race Ready</Text>
                <Text style={styles.zoneDesc}>Supercompensation peak. Ideal for competitions.</Text>
              </View>
            </View>

            <View style={styles.zoneItem}>
              <View style={[styles.zonePill, { backgroundColor: Colors.fitnessCtl }]}>
                <Text style={styles.zonePillText}>-10 to -30</Text>
              </View>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>Optimal Training Zone</Text>
                <Text style={styles.zoneDesc}>Productive stimulus building durable aerobic endurance.</Text>
              </View>
            </View>

            <View style={styles.zoneItem}>
              <View style={[styles.zonePill, { backgroundColor: Colors.warningAmber }]}>
                <Text style={styles.zonePillText}>-30 to -40</Text>
              </View>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>High Fatigue</Text>
                <Text style={styles.zoneDesc}>Straining capacity. Prioritize nutrition & recovery.</Text>
              </View>
            </View>

            <View style={styles.zoneItem}>
              <View style={[styles.zonePill, { backgroundColor: Colors.dangerRed }]}>
                <Text style={styles.zonePillText}>&lt; -40</Text>
              </View>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>Overreaching / Overload</Text>
                <Text style={styles.zoneDesc}>Injury and illness danger. Rest days required.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Wellness History Log */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>RECENT DAILY LOGS</Text>
          <Text style={styles.sectionSubLabel}>{sortedWellness.length} entries</Text>
        </View>

        {sortedWellness.slice(0, 10).map((item) => {
          const itemTsb = item.tsb ?? (item.ctl && item.atl ? item.ctl - item.atl : 0);
          const itemForm = getFormStatus(itemTsb);

          return (
            <View key={item.id} style={styles.logCard}>
              <View style={styles.logLeft}>
                <Text style={styles.logDate}>{formatDateShort(item.id)}</Text>
                <Text style={styles.logYear}>{item.id.split('-')[0]}</Text>
              </View>

              <View style={styles.logMetrics}>
                <View style={styles.logCol}>
                  <Text style={styles.logColLabel}>FIT / FAT</Text>
                  <Text style={styles.logColValue}>
                    {item.ctl ? Math.round(item.ctl) : '--'} / {item.atl ? Math.round(item.atl) : '--'}
                  </Text>
                </View>

                <View style={styles.logCol}>
                  <Text style={styles.logColLabel}>FORM</Text>
                  <Text style={[styles.logColValue, { color: itemForm.color }]}>
                    {itemTsb > 0 ? `+${Math.round(itemTsb)}` : Math.round(itemTsb)}
                  </Text>
                </View>

                {item.hrv ? (
                  <View style={styles.logCol}>
                    <Text style={styles.logColLabel}>HRV</Text>
                    <Text style={styles.logColValue}>{item.hrv}ms</Text>
                  </View>
                ) : null}

                {item.sleepSecs ? (
                  <View style={styles.logCol}>
                    <Text style={styles.logColLabel}>SLEEP</Text>
                    <Text style={styles.logColValue}>{formatDuration(item.sleepSecs)}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}

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
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.garminCyan,
    letterSpacing: 0.8,
  },
  cardBodyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  zoneList: {
    gap: 10,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zonePill: {
    width: 72,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 10,
  },
  zonePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#080A0F',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  zoneDesc: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  sectionSubLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  logCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logLeft: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: Colors.surfaceBorderSubtle,
    paddingRight: 8,
  },
  logDate: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  logYear: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  logMetrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  logCol: {
    alignItems: 'center',
  },
  logColLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  logColValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
});
