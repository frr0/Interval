import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const {
    athlete,
    credentials,
    settings,
    toggleUnits,
    logout,
    refreshData,
    isRefreshing,
  } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Disconnect Account',
      'Are you sure you want to disconnect from Intervals.icu? You will need to enter your API key again to reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {
              // Ignore haptics
            }
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore haptics
    }
    refreshData();
    Alert.alert('Sync Triggered', 'Refreshing latest athlete data and workouts from Intervals.icu.');
  };

  const displayName = athlete?.name || athlete?.firstname || 'Athlete';
  const isDemo = credentials?.isDemo;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>ATHLETE PROFILE</Text>
        <Text style={styles.subtitle}>Settings, metrics configuration & credentials</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Athlete Hero Card */}
        <View style={styles.athleteCard}>
          <View style={styles.avatarRow}>
            {athlete?.profile_medium ? (
              <Image source={{ uri: athlete.profile_medium }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}

            <View style={styles.athleteInfoCol}>
              <Text style={styles.athleteName}>{displayName}</Text>
              {(athlete?.city || athlete?.country) && (
                <Text style={styles.athleteLocation}>
                  {[athlete.city, athlete.country].filter(Boolean).join(', ')}
                </Text>
              )}
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>
                  ATHLETE ID: {athlete?.id || credentials?.athleteId || '0'}
                </Text>
              </View>
            </View>
          </View>

          {/* Key Physiological Baselines */}
          <View style={styles.baselinesGrid}>
            <View style={styles.baselineCol}>
              <Text style={styles.baselineLabel}>FTP</Text>
              <Text style={styles.baselineValue}>{athlete?.ftp ? `${athlete.ftp} W` : '295 W'}</Text>
            </View>
            <View style={styles.baselineCol}>
              <Text style={styles.baselineLabel}>REST HR</Text>
              <Text style={styles.baselineValue}>
                {athlete?.restingHR ? `${athlete.restingHR} bpm` : '46 bpm'}
              </Text>
            </View>
            <View style={styles.baselineCol}>
              <Text style={styles.baselineLabel}>MAX HR</Text>
              <Text style={styles.baselineValue}>
                {athlete?.maxHR ? `${athlete.maxHR} bpm` : '194 bpm'}
              </Text>
            </View>
            <View style={styles.baselineCol}>
              <Text style={styles.baselineLabel}>WEIGHT</Text>
              <Text style={styles.baselineValue}>
                {athlete?.weight
                  ? settings.useImperial
                    ? `${(athlete.weight * 2.20462).toFixed(1)} lbs`
                    : `${athlete.weight.toFixed(1)} kg`
                  : '68.5 kg'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="speedometer-outline" size={20} color={Colors.garminCyan} />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Units of Measurement</Text>
                <Text style={styles.settingDesc}>
                  {settings.useImperial ? 'Imperial (Miles, Feet, Lbs)' : 'Metric (Kilometers, Meters, Kg)'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.useImperial}
              onValueChange={toggleUnits}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.whoopMint }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Connection & Data Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ACCOUNT & SYNC</Text>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDemo ? 'flash-outline' : 'shield-checkmark-outline'}
                size={20}
                color={isDemo ? Colors.warningAmber : Colors.whoopMint}
              />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Connection Status</Text>
                <Text style={styles.settingDesc}>
                  {isDemo ? 'Running in Simulated Demo Mode' : 'Connected to Intervals.icu API'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isDemo ? `${Colors.warningAmber}22` : `${Colors.whoopMint}22` },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isDemo ? Colors.warningAmber : Colors.whoopMint },
                ]}
              >
                {isDemo ? 'DEMO' : 'ACTIVE'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={handleSyncNow}
            disabled={isRefreshing}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="sync-outline" size={20} color={Colors.textSecondary} />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Force Re-sync Data</Text>
                <Text style={styles.settingDesc}>Pull latest wellness, activities, and events</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Disconnect Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.disconnectButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.dangerRed} />
          <Text style={styles.disconnectButtonText}>DISCONNECT INTERVALS.ICU</Text>
        </TouchableOpacity>

        {/* App Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoAppTitle}>INTERVALS PULSE v1.0.0</Text>
          <Text style={styles.infoAppDesc}>
            Built with Expo & React Native for Android.
            {'\n'}Data powered by your personal Intervals.icu account.
          </Text>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  athleteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.whoopMint,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.whoopMint,
  },
  athleteInfoCol: {
    flex: 1,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  athleteLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  idBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  idBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  baselinesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  baselineCol: {
    alignItems: 'center',
    flex: 1,
  },
  baselineLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  baselineValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorderSubtle,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  settingDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    height: 48,
    marginTop: 20,
  },
  disconnectButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.dangerRed,
    letterSpacing: 0.5,
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: 28,
  },
  infoAppTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  infoAppDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
