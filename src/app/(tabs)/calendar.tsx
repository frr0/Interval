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
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types/intervals';
import {
  formatDateRelative,
  formatDuration,
  getSportDetails,
} from '../../utils/formatters';

type TabView = 'UPCOMING' | 'ALL';

export default function CalendarScreen() {
  const { events, isRefreshing, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<TabView>('UPCOMING');

  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime()
    );
  }, [events]);

  const displayedEvents = useMemo(() => {
    if (activeTab === 'UPCOMING') {
      return sortedEvents.filter((ev) => {
        const evDate = (ev.start_date_local || '').split('T')[0];
        return evDate >= todayDateStr;
      });
    }
    return sortedEvents;
  }, [sortedEvents, activeTab, todayDateStr]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>TRAINING PLAN</Text>
        <Text style={styles.subtitle}>Scheduled workouts, targets & calendar events</Text>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'UPCOMING' && styles.tabButtonActive]}
          onPress={() => setActiveTab('UPCOMING')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'UPCOMING' && styles.tabButtonTextActive,
            ]}
          >
            UPCOMING SESSIONS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ALL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'ALL' && styles.tabButtonTextActive,
            ]}
          >
            FULL CALENDAR ({events.length})
          </Text>
        </TouchableOpacity>
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
        {displayedEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No workouts found</Text>
            <Text style={styles.emptySubtitle}>
              Sync with your Intervals.icu calendar or training plan.
            </Text>
          </View>
        ) : (
          displayedEvents.map((event: CalendarEvent) => {
            const sport = getSportDetails(event.type || 'Workout');
            const isToday = (event.start_date_local || '').startsWith(todayDateStr);

            return (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  isToday && styles.eventCardToday,
                ]}
              >
                {/* Header row */}
                <View style={styles.eventCardHeader}>
                  <View style={styles.eventLeftBadge}>
                    <View
                      style={[
                        styles.sportIconWrap,
                        { backgroundColor: `${sport.color}22` },
                      ]}
                    >
                      <Ionicons
                        name={sport.icon as any}
                        size={14}
                        color={sport.color}
                      />
                    </View>
                    <View>
                      <Text style={[styles.sportLabel, { color: sport.color }]}>
                        {sport.label}
                      </Text>
                      <Text style={styles.eventDate}>
                        {formatDateRelative(event.start_date_local)}
                      </Text>
                    </View>
                  </View>

                  {/* Planned Load pill */}
                  {event.load ? (
                    <View style={styles.loadBadge}>
                      <Text style={styles.loadValue}>~{event.load}</Text>
                      <Text style={styles.loadLabel}>LOAD</Text>
                    </View>
                  ) : null}
                </View>

                {/* Workout Title */}
                <Text style={styles.eventTitle}>{event.name}</Text>

                {/* Duration */}
                {event.moving_time ? (
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>
                      Planned: {formatDuration(event.moving_time)}
                    </Text>
                  </View>
                ) : null}

                {/* Description / Structured Workout Steps */}
                {event.description ? (
                  <View style={styles.descWrap}>
                    <Text style={styles.descText}>{event.description}</Text>
                  </View>
                ) : null}

                {/* Status indicator */}
                <View style={styles.statusFooter}>
                  {event.completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={Colors.whoopMint}
                      />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  ) : isToday ? (
                    <View style={styles.todayBadge}>
                      <Ionicons
                        name="flash-outline"
                        size={13}
                        color={Colors.warningAmber}
                      />
                      <Text style={styles.todayBadgeText}>Scheduled Today</Text>
                    </View>
                  ) : (
                    <View style={styles.upcomingBadge}>
                      <Ionicons
                        name="hourglass-outline"
                        size={13}
                        color={Colors.textMuted}
                      />
                      <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
    color: Colors.text,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  eventCardToday: {
    borderColor: 'rgba(0, 229, 163, 0.4)',
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  loadBadge: {
    backgroundColor: `${Colors.stravaOrange}1E`,
    borderWidth: 1,
    borderColor: `${Colors.stravaOrange}44`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadValue: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.stravaOrange,
  },
  loadLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: Colors.stravaOrange,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  descWrap: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  descText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.whoopMint,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warningAmber,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
