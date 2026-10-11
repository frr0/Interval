import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { athlete, credentials, isRefreshing, refreshData } = useApp();

  const handleRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptics errors
    }
    refreshData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = athlete?.firstname || athlete?.name || 'Athlete';
  const isDemo = credentials?.isDemo;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {athlete?.profile_medium ? (
          <Image source={{ uri: athlete.profile_medium }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.titleCol}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.athleteName}>{displayName}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            isDemo ? styles.demoPill : styles.livePill,
          ]}
        >
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: isDemo ? Colors.warningAmber : Colors.whoopMint },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isDemo ? Colors.warningAmber : Colors.whoopMint },
            ]}
          >
            {isDemo ? 'DEMO' : 'LIVE'}
          </Text>
        </View>

        {/* Sync / Refresh Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={Colors.whoopMint} />
          ) : (
            <Ionicons name="sync-outline" size={18} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Colors.whoopMint,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.whoopMint,
  },
  titleCol: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  livePill: {
    backgroundColor: 'rgba(0, 229, 163, 0.1)',
  },
  demoPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
