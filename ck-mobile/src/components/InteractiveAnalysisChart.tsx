/**
 * Interactive Analysis Chart — Line chart widget matching the dashboard screenshot.
 * Shows property value trends over time with the gold/accent line on dark background.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

const CHART_DATA = [
  { year: '2018', value: 400 },
  { year: '2019', value: 600 },
  { year: '2020', value: 500 },
  { year: '2021', value: 900 },
  { year: '2022', value: 1100 },
  { year: '2023', value: 800 },
  { year: '2024', value: 1400 },
  { year: '2025', value: 1200 },
  { year: '2026', value: 1500 },
];

const Y_LABELS = ['0', '400', '800', '1200', '1500'];

export function InteractiveAnalysisChart() {
  const chartWidth = Dimensions.get('window').width - 80;
  const chartHeight = 180;
  const maxValue = 1500;

  const points = CHART_DATA.map((d, i) => ({
    x: (i / (CHART_DATA.length - 1)) * (chartWidth - 40) + 20,
    y: chartHeight - (d.value / maxValue) * (chartHeight - 20) - 10,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interactive Analysis</Text>

      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {Y_LABELS.slice().reverse().map((label) => (
            <Text key={label} style={styles.axisLabel}>{label}</Text>
          ))}
        </View>

        {/* Chart body with SVG-like rendering via Views */}
        <View style={[styles.chartBody, { height: chartHeight }]}>
          {/* Grid lines */}
          {Y_LABELS.map((_, i) => (
            <View
              key={`grid-${i}`}
              style={[
                styles.gridLine,
                { top: (i / (Y_LABELS.length - 1)) * (chartHeight - 20) + 10 },
              ]}
            />
          ))}

          {/* Data points */}
          {points.map((point, i) => (
            <View
              key={`point-${i}`}
              style={[
                styles.dataPoint,
                { left: point.x - 4, top: point.y - 4 },
              ]}
            />
          ))}

          {/* Line segments */}
          {points.map((point, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const dx = point.x - prev.x;
            const dy = point.y - prev.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`line-${i}`}
                style={[
                  styles.lineSegment,
                  {
                    width: length,
                    left: prev.x,
                    top: prev.y,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                  },
                ]}
              />
            );
          })}

          {/* X-axis labels */}
          <View style={styles.xAxis}>
            {CHART_DATA.map((d, i) => (
              <Text
                key={d.year}
                style={[
                  styles.axisLabel,
                  { position: 'absolute', left: points[i]?.x - 12 },
                ]}
              >
                {d.year}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.legendText}>Portfolio Value</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.legendText}>Market Index</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  chartArea: {
    flexDirection: 'row',
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginRight: SPACING.sm,
    width: 35,
  },
  chartBody: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.bgCard,
    zIndex: 10,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.gold,
    zIndex: 5,
  },
  xAxis: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  axisLabel: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
  },
  legendRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.xs,
  },
});
