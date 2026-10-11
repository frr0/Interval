import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityCard } from '../../components/ActivityCard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatDistance, formatDuration } from '../../utils/formatters';

type SportFilter = 'ALL' | 'RIDE' | 'RUN' | 'SWIM' | 'WORKOUT';

export default function ActivitiesScreen() {
  const { activities, isRefreshing, refreshData, settings } = useApp();
  const [filter, setFilter] = useState<SportFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Type match
      const typeLower = (act.type || '').toLowerCase();
      if (filter === 'RIDE' && !typeLower.includes('ride') && !typeLower.includes('cycl')) {
        return false;
      }
      if (filter === 'RUN' && !typeLower.includes('run')) {
        return false;
      }
      if (filter === 'SWIM' && !typeLower.includes('swim')) {
        return false;
      }
      if (
        filter === 'WORKOUT' &&
        !typeLower.includes('weight') &&
        !typeLower.includes('strength') &&
        !typeLower.includes('gym') &&
        !typeLower.includes('workout')
      ) {
        return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (act.name || '').toLowerCase().includes(q);
        const descMatch = (act.description || '').toLowerCase().includes(q);
        return nameMatch || descMatch;
      }

      return true;
    });
  }, [activities, filter, searchQuery]);

  // Summary stats for filtered activities
  const { totalCount, totalDistance, totalDuration, totalLoad } = useMemo(() => {
    let dist = 0;
    let dur = 0;
    let load = 0;

    filteredActivities.forEach((act) => {
      dist += act.distance || 0;
      dur += act.moving_time || act.elapsed_time || 0;
      load += act.icu_training_load || 0;
    });

    return {
      totalCount: filteredActivities.length,
      totalDistance: dist,
      totalDuration: dur,
      totalLoad: Math.round(load),
    };
  }, [filteredActivities]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>ACTIVITIES</Text>
        <Text style={styles.subtitle}>Completed workouts & training sessions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by activity name..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sport Category Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(
            [
              { id: 'ALL', label: 'All Sports', icon: undefined },
              { id: 'RIDE', label: 'Cycling', icon: 'bicycle' },
              { id: 'RUN', label: 'Running', icon: 'walk' },
              { id: 'SWIM', label: 'Swimming', icon: 'water' },
              { id: 'WORKOUT', label: 'Strength', icon: 'barbell' },
            ] as const
          ).map((item) => {
            const active = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {item.icon ? (
                  <Ionicons
                    name={item.icon as any}
                    size={14}
                    color={active ? '#080A0F' : Colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Totals Strip */}
      <View style={styles.totalsStrip}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>ACTIVITIES</Text>
          <Text style={styles.totalValue}>{totalCount}</Text>
        </View>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>DISTANCE</Text>
          <Text style={styles.totalValue}>
            {formatDistance(totalDistance, settings.useImperial)}
          </Text>
        </View>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>TIME</Text>
          <Text style={styles.totalValue}>{formatDuration(totalDuration)}</Text>
        </View>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>LOAD</Text>
          <Text style={[styles.totalValue, { color: Colors.stravaOrange }]}>
            {totalLoad}
          </Text>
        </View>
      </View>

      {/* Activities List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} useImperial={settings.useImperial} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={Colors.whoopMint}
            colors={[Colors.whoopMint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching activities</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or sport filter.
            </Text>
          </View>
        }
      />
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
    paddingBottom: 4,
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.text,
    fontSize: 13,
  },
  clearSearch: {
    padding: 4,
  },
  filterBar: {
    marginTop: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.whoopMint,
    borderColor: Colors.whoopMint,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#080A0F',
    fontWeight: '900',
  },
  totalsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorderSubtle,
  },
  totalCol: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  listContent: {
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
});
