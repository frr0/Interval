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
import { formatDateShort, getFormStatus } from '../utils/formatters';

interface FitnessChartProps {
  data: Wellness[];
  height?: number;
}

type TimeRange = '14' | '30' | '90' | '180';

export const FitnessChart: React.FC<FitnessChartProps> = ({ data, height = 220 }) => {
  const [range, setRange] = useState<TimeRange>('30');
  const [showCtl, setShowCtl] = useState(true);
  const [showAtl, setShowAtl] = useState(true);
  const [showTsb, setShowTsb] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  // Filter and sort by date ascending
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.id).getTime() - new Date(b.id).getTime()
    );

    const limit = parseInt(range, 10);
    return sorted.slice(-limit);
  }, [data, range]);

  // Compute min & max bounds
  const { minVal, maxVal } = useMemo(() => {
    if (chartData.length === 0) return { minVal: -20, maxVal: 100 };

    let min = 0;
    let max = 0;

    chartData.forEach((d) => {
      if (d.ctl !== undefined) max = Math.max(max, d.ctl);
      if (d.atl !== undefined) max = Math.max(max, d.atl);
      if (d.tsb !== undefined) {
        max = Math.max(max, d.tsb);
        min = Math.min(min, d.tsb);
      }
    });

    const padding = 10;
    return {
      minVal: Math.min(-30, Math.floor((min - padding) / 10) * 10),
      maxVal: Math.max(100, Math.ceil((max + padding) / 10) * 10),
    };
  }, [chartData]);

  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;
  const plotWidth = Math.max(100, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(80, height - paddingTop - paddingBottom);

  const getY = useCallback(
    (val: number) => {
      const rangeVal = maxVal - minVal || 1;
      const ratio = (val - minVal) / rangeVal;
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

  // Build SVG path
  const createPath = useCallback(
    (getValue: (d: Wellness) => number | undefined) => {
      let path = '';
      chartData.forEach((d, idx) => {
        const val = getValue(d);
        if (val === undefined) return;
        const x = getX(idx);
        const y = getY(val);
        if (path === '') {
          path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      return path;
    },
    [chartData, getX, getY]
  );

  const ctlPath = useMemo(() => createPath((d) => d.ctl), [createPath]);
  const atlPath = useMemo(() => createPath((d) => d.atl), [createPath]);
  const tsbPath = useMemo(() => createPath((d) => d.tsb), [createPath]);

  // Touch responder to inspect points
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
  const zeroY = getY(0);

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
    >
      {/* Header controls: Range selector */}
      <View style={styles.topBar}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>FITNESS & FORM</Text>
          <Text style={styles.cardSubtitle}>Chronic (CTL) vs Acute (ATL) Load</Text>
        </View>

        <View style={styles.rangeTabs}>
          {(['14', '30', '90', '180'] as TimeRange[]).map((r) => (
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

      {/* Selected data point tooltip bar */}
      {selectedPoint ? (
        <View style={styles.tooltipBar}>
          <Text style={styles.tooltipDate}>{formatDateShort(selectedPoint.id)}</Text>
          <View style={styles.tooltipMetrics}>
            <Text style={[styles.tooltipMetric, { color: Colors.fitnessCtl }]}>
              CTL: <Text style={styles.bold}>{selectedPoint.ctl ?? '--'}</Text>
            </Text>
            <Text style={[styles.tooltipMetric, { color: Colors.fatigueAtl }]}>
              ATL: <Text style={styles.bold}>{selectedPoint.atl ?? '--'}</Text>
            </Text>
            <Text style={[styles.tooltipMetric, { color: Colors.whoopMint }]}>
              Form: <Text style={styles.bold}>{selectedPoint.tsb ?? '--'}</Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.legendRow}>
          <TouchableOpacity
            style={styles.legendItem}
            onPress={() => setShowCtl(!showCtl)}
          >
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Colors.fitnessCtl, opacity: showCtl ? 1 : 0.3 },
              ]}
            />
            <Text
              style={[
                styles.legendLabel,
                { color: showCtl ? Colors.text : Colors.textMuted },
              ]}
            >
              Fitness (CTL)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legendItem}
            onPress={() => setShowAtl(!showAtl)}
          >
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Colors.fatigueAtl, opacity: showAtl ? 1 : 0.3 },
              ]}
            />
            <Text
              style={[
                styles.legendLabel,
                { color: showAtl ? Colors.text : Colors.textMuted },
              ]}
            >
              Fatigue (ATL)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legendItem}
            onPress={() => setShowTsb(!showTsb)}
          >
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Colors.whoopMint, opacity: showTsb ? 1 : 0.3 },
              ]}
            />
            <Text
              style={[
                styles.legendLabel,
                { color: showTsb ? Colors.text : Colors.textMuted },
              ]}
            >
              Form (TSB)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Interactive Chart Canvas */}
      <View {...panResponder.panHandlers} style={{ height }}>
        <Svg width={chartWidth} height={height}>
          {/* Zero baseline for Form */}
          <Line
            x1={paddingLeft}
            y1={zeroY}
            x2={chartWidth - paddingRight}
            y2={zeroY}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <SvgText
            x={paddingLeft - 6}
            y={zeroY + 3}
            fill={Colors.textMuted}
            fontSize={9}
            textAnchor="end"
          >
            0
          </SvgText>

          {/* Max and Min horizontal guides */}
          <Line
            x1={paddingLeft}
            y1={getY(maxVal)}
            x2={chartWidth - paddingRight}
            y2={getY(maxVal)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={1}
          />
          <SvgText
            x={paddingLeft - 6}
            y={getY(maxVal) + 3}
            fill={Colors.textMuted}
            fontSize={9}
            textAnchor="end"
          >
            {maxVal}
          </SvgText>

          {minVal < 0 && (
            <>
              <Line
                x1={paddingLeft}
                y1={getY(minVal)}
                x2={chartWidth - paddingRight}
                y2={getY(minVal)}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1}
              />
              <SvgText
                x={paddingLeft - 6}
                y={getY(minVal) + 3}
                fill={Colors.textMuted}
                fontSize={9}
                textAnchor="end"
              >
                {minVal}
              </SvgText>
            </>
          )}

          {/* Form Optimal Zone Shading (-30 to -10) */}
          <Rect
            x={paddingLeft}
            y={getY(-10)}
            width={plotWidth}
            height={Math.max(0, getY(-30) - getY(-10))}
            fill="rgba(56, 189, 248, 0.07)"
          />

          {/* Curves */}
          {showCtl && ctlPath ? (
            <Path
              d={ctlPath}
              stroke={Colors.fitnessCtl}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {showAtl && atlPath ? (
            <Path
              d={atlPath}
              stroke={Colors.fatigueAtl}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {showTsb && tsbPath ? (
            <Path
              d={tsbPath}
              stroke={Colors.whoopMint}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {/* Active scrubber line */}
          {selectedIndex !== null && chartData[selectedIndex] && (
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

          {/* Date labels on X axis */}
          {chartData.length > 0 && (
            <>
              <SvgText
                x={paddingLeft}
                y={height - 6}
                fill={Colors.textMuted}
                fontSize={9}
                textAnchor="start"
              >
                {formatDateShort(chartData[0].id)}
              </SvgText>
              <SvgText
                x={chartWidth - paddingRight}
                y={height - 6}
                fill={Colors.textMuted}
                fontSize={9}
                textAnchor="end"
              >
                {formatDateShort(chartData[chartData.length - 1].id)}
              </SvgText>
            </>
          )}
        </Svg>
      </View>

      {/* Current Form Status Badge */}
      {chartData.length > 0 && (
        <View style={styles.formStatusFooter}>
          {(() => {
            const latest = chartData[chartData.length - 1];
            const status = getFormStatus(latest.tsb ?? 0);
            return (
              <View style={styles.statusPillRow}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusLabel, { color: status.color }]}>
                  {status.label}
                </Text>
                <Text style={styles.statusDesc}>({status.description})</Text>
              </View>
            );
          })()}
        </View>
      )}
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
    marginBottom: 12,
  },
  titleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
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
    color: Colors.text,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
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
    fontWeight: '800',
    color: Colors.text,
  },
  tooltipMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  tooltipMetric: {
    fontSize: 11,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '800',
  },
  formStatusFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorderSubtle,
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },
  statusDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
});
