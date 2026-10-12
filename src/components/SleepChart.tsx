import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';
import { Wellness } from '../types/intervals';
import { formatDateShort } from '../utils/formatters';

interface SleepChartProps {
  data: Wellness[];
  height?: number;
}

type SleepMode = 'hours' | 'score';
type TimeRange = '14' | '30' | '90';

export const SleepChart: React.FC<SleepChartProps> = ({ data, height = 220 }) => {
  const [mode, setMode] = useState<SleepMode>('hours');
  const [range, setRange] = useState<TimeRange>('30');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  const targetHours = 8.0;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;
  const plotWidth = Math.max(100, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(80, height - paddingTop - paddingBottom);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data]
      .filter((d) => d.sleepSecs !== undefined || d.sleepScore !== undefined)
      .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());

    const limit = parseInt(range, 10);
    const sliced = sorted.slice(-limit);

    return sliced.map((item) => {
      const hours = item.sleepSecs ? item.sleepSecs / 3600 : 7.6;
      const score = item.sleepScore ?? Math.min(96, Math.max(55, Math.round((hours / 8.0) * 88)));
      return {
        id: item.id,
        hours: Math.round(hours * 10) / 10,
        hoursFormatted: `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`,
        score,
      };
    });
  }, [data, range]);

  const { minVal, maxVal, avgHours, avgScore, sleepDebtMins, latestHours, latestScore } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        minVal: mode === 'hours' ? 4 : 40,
        maxVal: mode === 'hours' ? 10 : 100,
        avgHours: '7h 45m',
        avgScore: 84,
        sleepDebtMins: -45,
        latestHours: '7h 50m',
        latestScore: 88,
      };
    }

    const last7 = chartData.slice(-7);
    const totalHours7d = last7.reduce((s, d) => s + d.hours, 0);
    const avgH = totalHours7d / last7.length;
    const avgSc = Math.round(last7.reduce((s, d) => s + d.score, 0) / last7.length);
    const debt = Math.round((totalHours7d - targetHours * last7.length) * 60);

    const latest = chartData[chartData.length - 1];

    if (mode === 'hours') {
      return {
        minVal: 4,
        maxVal: 11,
        avgHours: `${Math.floor(avgH)}h ${Math.round((avgH % 1) * 60)}m`,
        avgScore: avgSc,
        sleepDebtMins: debt,
        latestHours: latest.hoursFormatted,
        latestScore: latest.score,
      };
    } else {
      return {
        minVal: 40,
        maxVal: 100,
        avgHours: `${Math.floor(avgH)}h ${Math.round((avgH % 1) * 60)}m`,
        avgScore: avgSc,
        sleepDebtMins: debt,
        latestHours: latest.hoursFormatted,
        latestScore: latest.score,
      };
    }
  }, [chartData, mode]);

  const getY = useCallback(
    (val: number) => {
      const r = maxVal - minVal || 1;
      const ratio = (val - minVal) / r;
      return paddingTop + plotHeight * (1 - ratio);
    },
    [maxVal, minVal, plotHeight, paddingTop]
  );

  const getX = useCallback(
    (index: number) => {
      if (chartData.length <= 1) return paddingLeft + plotWidth / 2;
      return paddingLeft + (index / (chartData.length - 1)) * plotWidth;
    },
    [chartData.length, paddingLeft, plotWidth]
  );

  const handleTouch = useCallback(
    (evtX: number) => {
      if (chartData.length === 0) return;
      const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + plotWidth, evtX));
      const ratio = (clampedX - paddingLeft) / plotWidth;
      const idx = Math.min(
        chartData.length - 1,
        Math.max(0, Math.round(ratio * (chartData.length - 1)))
      );
      setSelectedIndex(idx);
    },
    [chartData.length, paddingLeft, plotWidth]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX),
        onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationX),
        onPanResponderRelease: () => {},
      }),
    [handleTouch]
  );

  const selectedPoint = selectedIndex !== null && chartData[selectedIndex] ? chartData[selectedIndex] : null;

  const getBarColor = (d: { hours: number; score: number }) => {
    if (mode === 'hours') {
      if (d.hours >= 7.5) return Colors.whoopMint;
      if (d.hours >= 7.0) return Colors.garminCyan;
      if (d.hours >= 6.0) return Colors.warningAmber;
      return Colors.dangerRed;
    } else {
      if (d.score >= 85) return Colors.whoopMint;
      if (d.score >= 70) return Colors.garminCyan;
      if (d.score >= 50) return Colors.warningAmber;
      return Colors.dangerRed;
    }
  };

  const targetY = getY(mode === 'hours' ? targetHours : 85);

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.topBar}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>SLEEP PERFORMANCE</Text>
          <Text style={styles.cardSubtitle}>
            {mode === 'hours' ? 'Duration vs 8h Target' : 'Sleep Quality Score %'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'hours' && styles.modeTabActive]}
              onPress={() => setMode('hours')}
            >
              <Text style={[styles.modeTabText, mode === 'hours' && styles.modeTabTextActive]}>
                Hours
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'score' && styles.modeTabActive]}
              onPress={() => setMode('score')}
            >
              <Text style={[styles.modeTabText, mode === 'score' && styles.modeTabTextActive]}>
                Score
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modeTabs}>
            {(['14', '30'] as TimeRange[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.modeTab, range === r && styles.modeTabActive]}
                onPress={() => {
                  setRange(r);
                  setSelectedIndex(null);
                }}
              >
                <Text style={[styles.modeTabText, range === r && styles.modeTabTextActive]}>
                  {r}D
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Tooltip or Stats */}
      {selectedPoint ? (
        <View style={styles.tooltipBar}>
          <Text style={styles.tooltipDate}>{formatDateShort(selectedPoint.id)}</Text>
          <Text style={styles.tooltipValue}>
            {selectedPoint.hoursFormatted} ({selectedPoint.score}% Quality)
          </Text>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Latest Night</Text>
            <Text style={[styles.statValue, { color: Colors.whoopMint }]}>
              {mode === 'hours' ? latestHours : `${latestScore}%`}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>7D Average</Text>
            <Text style={styles.statValue}>
              {mode === 'hours' ? avgHours : `${avgScore}%`}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>7D Sleep Debt</Text>
            <Text
              style={[
                styles.statValue,
                { color: sleepDebtMins >= 0 ? Colors.whoopMint : Colors.warningAmber },
              ]}
            >
              {sleepDebtMins >= 0 ? `+${sleepDebtMins}m` : `${sleepDebtMins}m`}
            </Text>
          </View>
        </View>
      )}

      {/* Chart Canvas */}
      <View {...panResponder.panHandlers} style={{ height }}>
        <Svg width={chartWidth} height={height}>
          {/* Target line */}
          <Line
            x1={paddingLeft}
            y1={targetY}
            x2={chartWidth - paddingRight}
            y2={targetY}
            stroke="#818CF8"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <SvgText
            x={chartWidth - paddingRight}
            y={targetY - 4}
            fill="#818CF8"
            fontSize={8}
            textAnchor="end"
          >
            {mode === 'hours' ? 'Target 8h' : 'Optimal 85%'}
          </SvgText>

          {/* Grid lines */}
          <Line
            x1={paddingLeft}
            y1={getY(maxVal)}
            x2={chartWidth - paddingRight}
            y2={getY(maxVal)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={1}
          />
          <SvgText
            x={paddingLeft - 4}
            y={getY(maxVal) + 3}
            fill={Colors.textMuted}
            fontSize={8}
            textAnchor="end"
          >
            {maxVal}
            {mode === 'hours' ? 'h' : '%'}
          </SvgText>

          {/* Bars */}
          {chartData.map((d, idx) => {
            const x = getX(idx);
            const val = mode === 'hours' ? d.hours : d.score;
            const y = getY(val);
            const barW = Math.max(3, plotWidth / chartData.length - 2);
            return (
              <Rect
                key={d.id}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={Math.max(2, height - paddingBottom - y)}
                fill={getBarColor(d)}
                rx={2}
              />
            );
          })}

          {/* Touch scrubber line */}
          {selectedIndex !== null && (
            <Line
              x1={getX(selectedIndex)}
              y1={paddingTop}
              x2={getX(selectedIndex)}
              y2={height - paddingBottom}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
          )}

          {/* X axis dates */}
          {chartData.length > 0 && (
            <>
              <SvgText
                x={paddingLeft}
                y={height - 6}
                fill={Colors.textMuted}
                fontSize={8}
                textAnchor="start"
              >
                {formatDateShort(chartData[0].id)}
              </SvgText>
              <SvgText
                x={chartWidth - paddingRight}
                y={height - 6}
                fill={Colors.textMuted}
                fontSize={8}
                textAnchor="end"
              >
                {formatDateShort(chartData[chartData.length - 1].id)}
              </SvgText>
            </>
          )}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  modeTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#818CF8',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  tooltipBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tooltipDate: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#818CF8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 1,
  },
});
