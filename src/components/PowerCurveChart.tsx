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
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';
import { PowerCurvePoint } from '../types/intervals';

interface PowerCurveChartProps {
  data: PowerCurvePoint[];
  ftp?: number;
  weight?: number;
  height?: number;
}

type MetricMode = 'watts' | 'wkg';

export const PowerCurveChart: React.FC<PowerCurveChartProps> = ({
  data,
  ftp = 295,
  weight = 68.5,
  height = 220,
}) => {
  const [metric, setMetric] = useState<MetricMode>('watts');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;
  const plotWidth = Math.max(100, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(80, height - paddingTop - paddingBottom);

  const { minVal, maxVal } = useMemo(() => {
    if (!data || data.length === 0) return { minVal: 0, maxVal: 1000 };
    if (metric === 'watts') {
      const max = Math.max(...data.map((d) => d.seasonWatts ?? d.watts));
      return { minVal: 0, maxVal: Math.ceil(max / 100) * 100 + 50 };
    } else {
      const max = Math.max(...data.map((d) => d.seasonWkg ?? d.wkg ?? 10));
      return { minVal: 0, maxVal: Math.ceil(max) + 1 };
    }
  }, [data, metric]);

  const getY = useCallback(
    (val: number) => {
      const range = maxVal - minVal || 1;
      const ratio = (val - minVal) / range;
      return paddingTop + plotHeight * (1 - ratio);
    },
    [maxVal, minVal, plotHeight, paddingTop]
  );

  const getX = useCallback(
    (index: number) => {
      if (data.length <= 1) return paddingLeft + plotWidth / 2;
      return paddingLeft + (index / (data.length - 1)) * plotWidth;
    },
    [data.length, paddingLeft, plotWidth]
  );

  // Path creation
  const currentPath = useMemo(() => {
    if (!data || data.length === 0) return '';
    let path = '';
    data.forEach((d, idx) => {
      const val = metric === 'watts' ? d.watts : (d.wkg ?? 0);
      const x = getX(idx);
      const y = getY(val);
      if (path === '') {
        path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return path;
  }, [data, metric, getX, getY]);

  const seasonPath = useMemo(() => {
    if (!data || data.length === 0) return '';
    let path = '';
    data.forEach((d, idx) => {
      const val =
        metric === 'watts'
          ? (d.seasonWatts ?? d.watts)
          : (d.seasonWkg ?? d.wkg ?? 0);
      const x = getX(idx);
      const y = getY(val);
      if (path === '') {
        path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return path;
  }, [data, metric, getX, getY]);

  const handleTouch = useCallback(
    (evtX: number) => {
      if (data.length === 0) return;
      const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + plotWidth, evtX));
      const ratio = (clampedX - paddingLeft) / plotWidth;
      const idx = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))));
      setSelectedIndex(idx);
    },
    [data.length, paddingLeft, plotWidth]
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

  const selectedPoint = selectedIndex !== null && data[selectedIndex] ? data[selectedIndex] : null;

  const p5s = data.find((d) => d.secs === 5);
  const p1m = data.find((d) => d.secs === 60);
  const p5m = data.find((d) => d.secs === 300);
  const p20m = data.find((d) => d.secs === 1200);

  const ftpWkg = (ftp / weight).toFixed(1);
  const ftpY = getY(metric === 'watts' ? ftp : parseFloat(ftpWkg));

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>POWER DURATION CURVE</Text>
          <Text style={styles.cardSubtitle}>MMP & Critical Power Profile</Text>
        </View>

        <View style={styles.metricTabs}>
          <TouchableOpacity
            style={[styles.metricTab, metric === 'watts' && styles.metricTabActive]}
            onPress={() => setMetric('watts')}
          >
            <Text style={[styles.metricTabText, metric === 'watts' && styles.metricTabTextActive]}>
              Watts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricTab, metric === 'wkg' && styles.metricTabActive]}
            onPress={() => setMetric('wkg')}
          >
            <Text style={[styles.metricTabText, metric === 'wkg' && styles.metricTabTextActive]}>
              W/kg
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Point Tooltip Bar */}
      {selectedPoint ? (
        <View style={styles.tooltipBar}>
          <Text style={styles.tooltipLabel}>{selectedPoint.label} Effort ({selectedPoint.category})</Text>
          <Text style={styles.tooltipValue}>
            {selectedPoint.watts}W ({selectedPoint.wkg} W/kg)
          </Text>
        </View>
      ) : (
        <View style={styles.pillsRow}>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>5s Sprint</Text>
            <Text style={styles.pillValue}>{p5s?.watts ?? 980}W</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>1m Attack</Text>
            <Text style={styles.pillValue}>{p1m?.watts ?? 530}W</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>5m VO2</Text>
            <Text style={styles.pillValue}>{p5m?.watts ?? 385}W</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>20m FTP</Text>
            <Text style={styles.pillValue}>{p20m?.watts ?? 310}W</Text>
          </View>
        </View>
      )}

      {/* Chart Canvas */}
      <View {...panResponder.panHandlers} style={{ height }}>
        <Svg width={chartWidth} height={height}>
          {/* FTP Reference Line */}
          <Line
            x1={paddingLeft}
            y1={ftpY}
            x2={chartWidth - paddingRight}
            y2={ftpY}
            stroke={Colors.whoopMint}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <SvgText
            x={chartWidth - paddingRight}
            y={ftpY - 4}
            fill={Colors.whoopMint}
            fontSize={9}
            textAnchor="end"
          >
            FTP {ftp}W ({ftpWkg} W/kg)
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
          </SvgText>

          {/* Season Line (dashed) */}
          {seasonPath ? (
            <Path
              d={seasonPath}
              stroke={Colors.garminCyan}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="none"
            />
          ) : null}

          {/* Current Power Curve */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={Colors.stravaOrange}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {/* Active touch scrubber */}
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

          {/* X axis duration labels */}
          {data.map((d, idx) => (
            <SvgText
              key={d.secs}
              x={getX(idx)}
              y={height - 6}
              fill={Colors.textMuted}
              fontSize={8}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          ))}
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
  metricTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  metricTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricTabActive: {
    backgroundColor: Colors.stravaOrange,
  },
  metricTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  metricTabTextActive: {
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
  tooltipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.stravaOrange,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  pillItem: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 1,
  },
});
