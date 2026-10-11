import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { Activity } from '../types/intervals';
import {
  formatDateRelative,
  formatDistance,
  formatDuration,
  formatHeartRate,
  formatPace,
  formatSpeed,
  formatWatts,
  getSportDetails,
} from '../utils/formatters';

interface ActivityCardProps {
  activity: Activity;
  useImperial?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, useImperial = false }) => {
  const sport = getSportDetails(activity.type);
  const isRun = (activity.type || '').toLowerCase().includes('run');

  const handlePress = () => {
    router.push({
      pathname: '/activity/[id]',
      params: { id: activity.id },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={handlePress}
    >
      {/* Top row: Sport badge & Title & Time */}
      <View style={styles.topRow}>
        <View style={styles.titleInfo}>
          <View style={styles.sportPillRow}>
            <View style={[styles.sportIconWrap, { backgroundColor: `${sport.color}22` }]}>
              <Ionicons name={sport.icon as any} size={14} color={sport.color} />
            </View>
            <Text style={[styles.sportLabel, { color: sport.color }]}>{sport.label}</Text>
            <Text style={styles.dateText}>{formatDateRelative(activity.start_date_local)}</Text>
          </View>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {activity.name}
          </Text>
        </View>

        {/* Training Load Pill */}
        {activity.icu_training_load !== undefined && (
          <View style={styles.loadBadge}>
            <Text style={styles.loadValue}>{Math.round(activity.icu_training_load)}</Text>
            <Text style={styles.loadLabel}>LOAD</Text>
          </View>
        )}
      </View>

      {/* Grid of Key Metrics */}
      <View style={styles.metricsGrid}>
        {/* Distance */}
        {activity.distance ? (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>DISTANCE</Text>
            <Text style={styles.metricValue}>
              {formatDistance(activity.distance, useImperial)}
            </Text>
          </View>
        ) : null}

        {/* Time */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TIME</Text>
          <Text style={styles.metricValue}>
            {formatDuration(activity.moving_time || activity.elapsed_time)}
          </Text>
        </View>

        {/* Power or Pace or Speed */}
        {activity.average_watts ? (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>AVG POWER</Text>
            <Text style={styles.metricValue}>{formatWatts(activity.average_watts)}</Text>
          </View>
        ) : isRun && activity.average_speed ? (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PACE</Text>
            <Text style={styles.metricValue}>
              {formatPace(activity.average_speed, useImperial)}
            </Text>
          </View>
        ) : activity.average_speed ? (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>SPEED</Text>
            <Text style={styles.metricValue}>
              {formatSpeed(activity.average_speed, useImperial)}
            </Text>
          </View>
        ) : null}

        {/* Heart Rate */}
        {activity.average_heartrate ? (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>AVG HR</Text>
            <Text style={styles.metricValue}>
              {formatHeartRate(activity.average_heartrate)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom Info Row: Elevation, Intensity Factor, Feeling, RPE */}
      <View style={styles.bottomRow}>
        <View style={styles.subTagsRow}>
          {activity.total_elevation_gain ? (
            <View style={styles.subTag}>
              <Ionicons name="trending-up" size={11} color={Colors.textMuted} />
              <Text style={styles.subTagText}>
                {Math.round(activity.total_elevation_gain)}m
              </Text>
            </View>
          ) : null}

          {activity.icu_intensity ? (
            <View style={styles.subTag}>
              <Ionicons name="flash-outline" size={11} color={Colors.warningAmber} />
              <Text style={styles.subTagText}>
                IF {(activity.icu_intensity > 2 ? activity.icu_intensity / 100 : activity.icu_intensity).toFixed(2)}
              </Text>
            </View>
          ) : null}

          {activity.weighted_average_watts ? (
            <View style={styles.subTag}>
              <Text style={styles.subTagText}>NP {Math.round(activity.weighted_average_watts)}W</Text>
            </View>
          ) : null}

          {activity.rpe ? (
            <View style={styles.subTag}>
              <Text style={styles.subTagText}>RPE {activity.rpe}/10</Text>
            </View>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleInfo: {
    flex: 1,
    paddingRight: 10,
  },
  sportPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sportIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sportLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginRight: 8,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  loadBadge: {
    backgroundColor: `${Colors.stravaOrange}1E`,
    borderWidth: 1,
    borderColor: `${Colors.stravaOrange}44`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.stravaOrange,
  },
  loadLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.stravaOrange,
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorderSubtle,
  },
  metricItem: {
    minWidth: 70,
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  subTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  subTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  subTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
