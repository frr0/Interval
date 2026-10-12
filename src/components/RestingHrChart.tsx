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
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';
import { Wellness } from '../types/intervals';
import { formatDateShort } from '../utils/formatters';

interface RestingHrChartProps {
  data: Wellness[];
  defaultRHR?: number;
  height?: number;
}

type TimeRange = '14' | '30' | '90';

export const RestingHrChart: React.FC<RestingHrChartProps> = ({
  data,
  defaultRHR = 46,
  height = 220,
}) => {
  const [range, setRange] = useState<TimeRange>('30');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;
  const plotWidth = Math.max(100, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(80, height - paddingTop - paddingBottom);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data]
      .filter((d) => d.restingHR !== undefined)
      .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());

    const limit = parseInt(range, 10);
    const sliced = sorted.slice(-limit);

    return sliced.map((item, idx) => {
      const windowStart = Math.max(0, idx - 6);
      const windowItems = sliced.slice(windowStart, idx + 1);
      const avg7d =
        windowItems.reduce((acc, curr) => acc + (curr.restingHR ?? 46), 0) / windowItems.length;

      return {
        id: item.id,
        restingHR: item.restingHR ?? defaultRHR,
        rhr7d: Math.round(avg7d * 10) / 10,
      };
    });
  }, [data, range, defaultRHR]);

  const { minVal, maxVal, lowestRhr, latestRhr, avg7d } = useMemo(() => {
    if (chartData.length === 0) {
      return { minVal: 40, maxVal: 55, lowestRhr: 43, latestRhr: 46, avg7d: 46 };
    }
    const rhrs = chartData.map((d) => d.restingHR);
    const min = Math.min(...rhrs);
    const max = Math.max(...rhrs);
    const latest = chartData[chartData.length - 1];

    return {
      minVal: Math.max(30, min - 2),
      maxVal: max + 3,
      lowestRhr: min,
      latestRhr: latest.restingHR,
      avg7d: latest.rhr7d,
    };
  }, [chartData]);

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

  const rhrPath = useMemo(() => {
    let path = '';
    chartData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.restingHR);
      if (path === '') {
        path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return path;
  }, [chartData, getX, getY]);

  const rhr7dPath = useMemo(() => {
    let path = '';
    chartData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.rhr7d);
      if (path === '') {
        path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return path;
  }, [chartData, getX, getY]);

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

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.topBar}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>RESTING HEART RATE</Text>
          <Text style={styles.cardSubtitle}>Cardiovascular Pulse & Baseline</Text>
        </View>

        <View style={styles.rangeTabs}>
          {(['14', '30', '90'] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeTab, range === r && styles.rangeTabActive]}
              onPress={() => {
                setRange(r);
                setSelectedIndex(null);
              }}
            >
              <Text style={[styles.rangeTabText, range === r && styles.rangeTabTextActive]}>
                {r}D
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tooltip or Stats */}
      {selectedPoint ? (
        <View style={styles.tooltipBar}>
          <Text style={styles.tooltipDate}>{formatDateShort(selectedPoint.id)}</Text>
          <Text style={styles.tooltipValue}>
            Resting HR: {selectedPoint.restingHR} bpm (7d avg: {selectedPoint.rhr7d} bpm)
          </Text>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Latest Pulse</Text>
            <Text style={[styles.statValue, { color: Colors.garminCyan }]}>{latestRhr} bpm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>7D Average</Text>
            <Text style={styles.statValue}>{avg7d} bpm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lowest RHR</Text>
            <Text style={[styles.statValue, { color: Colors.whoopMint }]}>{lowestRhr} bpm</Text>
          </View>
        </View>
      )}

      {/* Chart Canvas */}
      <View {...panResponder.panHandlers} style={{ height }}>
        <Svg width={chartWidth} height={height}>
          {/* Baseline Range Band */}
          <Rect
            x={paddingLeft}
            y={getY(lowestRhr + 5)}
            width={plotWidth}
            height={Math.max(0, getY(lowestRhr) - getY(lowestRhr + 5))}
            fill="rgba(0, 180, 216, 0.08)"
          />

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
          </SvgText>

          {/* Daily RHR Line */}
          {rhrPath ? (
            <Path
              d={rhrPath}
              stroke={Colors.garminCyan}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {/* 7d average dashed line */}
          {rhr7dPath ? (
            <Path
              d={rhr7dPath}
              stroke={Colors.fitnessCtl}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="none"
            />
          ) : null}

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
  rangeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  rangeTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rangeTabActive: {
    backgroundColor: Colors.surfaceBorder,
  },
  rangeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rangeTabTextActive: {
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
    color: Colors.garminCyan,
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
