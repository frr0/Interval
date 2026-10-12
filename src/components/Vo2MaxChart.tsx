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

interface Vo2MaxChartProps {
  data: Wellness[];
  currentVo2Max?: number;
  height?: number;
}

type TimeRange = '14' | '30' | '90';

export const Vo2MaxChart: React.FC<Vo2MaxChartProps> = ({
  data,
  currentVo2Max = 56.4,
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
      .filter((d) => d.vo2max !== undefined || d.ctl !== undefined)
      .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());

    const limit = parseInt(range, 10);
    const sliced = sorted.slice(-limit);

    return sliced.map((d) => {
      const baseVo2 = d.vo2max ?? (d.ctl ? Math.round((48 + (d.ctl / 100) * 10) * 10) / 10 : 54.5);
      return {
        id: d.id,
        vo2max: baseVo2,
      };
    });
  }, [data, range]);

  const { minVal, maxVal, latestVo2, change } = useMemo(() => {
    if (chartData.length === 0) {
      return { minVal: 50, maxVal: 60, latestVo2: currentVo2Max, change: 1.2 };
    }
    const vo2s = chartData.map((d) => d.vo2max);
    const min = Math.min(...vo2s);
    const max = Math.max(...vo2s);
    const latest = chartData[chartData.length - 1]?.vo2max ?? currentVo2Max;
    const earliest = chartData[0]?.vo2max ?? latest;

    return {
      minVal: Math.max(45, Math.floor(min - 1)),
      maxVal: Math.ceil(max + 1),
      latestVo2: latest,
      change: Math.round((latest - earliest) * 10) / 10,
    };
  }, [chartData, currentVo2Max]);

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

  const vo2Path = useMemo(() => {
    let path = '';
    chartData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.vo2max);
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
          <Text style={styles.cardTitle}>AEROBIC CAPACITY (VO2 MAX)</Text>
          <Text style={styles.cardSubtitle}>Cardiorespiratory Fitness Progression</Text>
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
            VO2 Max: {selectedPoint.vo2max} ml/kg/min (Superior)
          </Text>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current VO2 Max</Text>
            <Text style={[styles.statValue, { color: Colors.fatigueAtl }]}>
              {latestVo2.toFixed(1)} ml/kg
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{range}D Net Change</Text>
            <Text
              style={[
                styles.statValue,
                { color: change >= 0 ? Colors.whoopMint : Colors.dangerRed },
              ]}
            >
              {change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fitness Tier</Text>
            <Text style={[styles.statValue, { color: Colors.fatigueAtl }]}>Superior (Top 5%)</Text>
          </View>
        </View>
      )}

      {/* Chart Canvas */}
      <View {...panResponder.panHandlers} style={{ height }}>
        <Svg width={chartWidth} height={height}>
          {/* Superior Tier shading (>56) */}
          <Rect
            x={paddingLeft}
            y={getY(maxVal)}
            width={plotWidth}
            height={Math.max(0, getY(56) - getY(maxVal))}
            fill="rgba(168, 85, 247, 0.08)"
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

          {/* VO2 Max curve */}
          {vo2Path ? (
            <Path
              d={vo2Path}
              stroke={Colors.fatigueAtl}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
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
    color: Colors.fatigueAtl,
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
