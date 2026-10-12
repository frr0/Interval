import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FitnessChart } from '../../components/FitnessChart';
import { HrvChart } from '../../components/HrvChart';
import { MetricCard } from '../../components/MetricCard';
import { PowerCurveChart } from '../../components/PowerCurveChart';
import { RestingHrChart } from '../../components/RestingHrChart';
import { SleepChart } from '../../components/SleepChart';
import { Vo2MaxChart } from '../../components/Vo2MaxChart';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatDuration, getFormStatus } from '../../utils/formatters';

type TabType = 'fitness' | 'power' | 'hrv' | 'resting_hr' | 'sleep' | 'vo2max' | 'all';

export default function FitnessScreen() {
  const { wellness, athlete, powerCurve, isRefreshing, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('fitness');

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
  const ftp = athlete?.ftp ?? 295;
  const weight = athlete?.weight ?? 68.5;
  const vo2max = latest?.vo2max ?? athlete?.vo2max ?? 56.4;

  const tabOptions: { id: TabType; label: string; icon: any; color: string }[] = [
    { id: 'fitness', label: 'Fitness', icon: 'bar-chart-outline', color: Colors.fitnessCtl },
    { id: 'power', label: 'Power', icon: 'flash-outline', color: Colors.stravaOrange },
    { id: 'hrv', label: 'HRV', icon: 'heart-outline', color: Colors.whoopMint },
    { id: 'resting_hr', label: 'Rest HR', icon: 'pulse-outline', color: Colors.garminCyan },
    { id: 'sleep', label: 'Sleep', icon: 'moon-outline', color: '#818CF8' },
    { id: 'vo2max', label: 'VO2 Max', icon: 'trophy-outline', color: Colors.fatigueAtl },
    { id: 'all', label: 'All', icon: 'layers-outline', color: Colors.text },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>ANALYTICS & BIOMETRICS</Text>
        <Text style={styles.screenSubtitle}>
          Performance modeling, power curves & recovery biomarkers
        </Text>
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {tabOptions.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? tab.color : Colors.textMuted}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={[styles.tabDot, { backgroundColor: tab.color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
        {/* TAB: FITNESS OR ALL */}
        {(activeTab === 'fitness' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <FitnessChart data={wellness} height={230} />

            <View style={styles.metricsGrid}>
              <MetricCard
                label="Fitness (CTL)"
                value={ctl.toFixed(1)}
                unit="load"
                subValue="42-day base"
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
                label="eFTP"
                value={`${ftp} W`}
                unit=""
                subValue="Threshold"
                icon="fitness-outline"
                accentColor={Colors.stravaOrange}
              />
            </View>
          </View>
        )}

        {/* TAB: POWER OR ALL */}
        {(activeTab === 'power' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <PowerCurveChart data={powerCurve} ftp={ftp} weight={weight} height={230} />

            {activeTab === 'power' && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flash-outline" size={16} color={Colors.stravaOrange} />
                  <Text style={styles.cardHeaderTitle}>POWER PROFILING BENCHMARKS</Text>
                </View>
                <Text style={styles.cardBodyText}>
                  Your Mean Maximal Power (MMP) curve reveals anaerobic capacity and aerobic ceiling:
                </Text>
                <View style={styles.zoneList}>
                  <View style={styles.zoneItem}>
                    <View style={[styles.zonePill, { backgroundColor: Colors.stravaOrange }]}>
                      <Text style={styles.zonePillText}>Sprint</Text>
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={styles.zoneName}>5s - 15s Neuromuscular</Text>
                      <Text style={styles.zoneDesc}>Max watts for jumps and finish sprints.</Text>
                    </View>
                  </View>
                  <View style={styles.zoneItem}>
                    <View style={[styles.zonePill, { backgroundColor: Colors.garminCyan }]}>
                      <Text style={styles.zonePillText}>VO2 Max</Text>
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={styles.zoneName}>3m - 5m Aerobic Ceiling</Text>
                      <Text style={styles.zoneDesc}>Maximal stroke volume and oxygen throughput.</Text>
                    </View>
                  </View>
                  <View style={styles.zoneItem}>
                    <View style={[styles.zonePill, { backgroundColor: Colors.whoopMint }]}>
                      <Text style={styles.zonePillText}>FTP</Text>
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={styles.zoneName}>20m - 60m Functional Threshold</Text>
                      <Text style={styles.zoneDesc}>Lactate balance limit for sustained climbing.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB: HRV OR ALL */}
        {(activeTab === 'hrv' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <HrvChart data={wellness} height={230} />

            {activeTab === 'hrv' && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="heart-outline" size={16} color={Colors.whoopMint} />
                  <Text style={styles.cardHeaderTitle}>UNDERSTANDING HRV (rMSSD)</Text>
                </View>
                <Text style={styles.cardBodyText}>
                  HRV measures autonomic nervous system balance. Values inside your green baseline indicate readiness for high training strain.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB: RESTING HR OR ALL */}
        {(activeTab === 'resting_hr' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <RestingHrChart data={wellness} defaultRHR={athlete?.restingHR ?? 46} height={230} />
          </View>
        )}

        {/* TAB: SLEEP OR ALL */}
        {(activeTab === 'sleep' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <SleepChart data={wellness} height={230} />
          </View>
        )}

        {/* TAB: VO2 MAX OR ALL */}
        {(activeTab === 'vo2max' || activeTab === 'all') && (
          <View style={styles.sectionBlock}>
            <Vo2MaxChart data={wellness} currentVo2Max={vo2max} height={230} />
          </View>
        )}

        {/* Daily History Table */}
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

                {item.restingHR ? (
                  <View style={styles.logCol}>
                    <Text style={styles.logColLabel}>RHR</Text>
                    <Text style={styles.logColValue}>{item.restingHR}bpm</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}

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
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
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
  tabContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorderSubtle,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabButtonActive: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionBlock: {
    marginVertical: 4,
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
    color: Colors.textMuted,
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
    width: 64,
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
