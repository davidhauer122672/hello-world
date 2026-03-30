/**
 * Property Status Chart — Area/line chart matching the "Property Status" widget
 * from the dashboard screenshot (top-right corner).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

const STATUS_DATA = [
  { year: '2022', leased: 65, vacant: 12, managed: 45, grounded: 8 },
  { year: '2023', leased: 78, vacant: 8, managed: 52, grounded: 6 },
  { year: '2024', leased: 92, vacant: 15, managed: 60, grounded: 10 },
  { year: '2025', leased: 88, vacant: 10, managed: 68, grounded: 5 },
  { year: '2026', leased: 105, vacant: 7, managed: 72, grounded: 4 },
];

const STATUSES = [
  { key: 'leased' as const, label: 'Leased', color: COLORS.green },
  { key: 'vacant' as const, label: 'Vacant', color: COLORS.red },
  { key: 'managed' as const, label: 'Managed', color: COLORS.accent },
  { key: 'grounded' as const, label: 'Grounded', color: COLORS.yellow },
];

export function PropertyStatusChart() {
  const maxValue = 120;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property Status</Text>
        <View style={styles.legend}>
          {STATUSES.map((s) => (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: s.color }]} />
              <Text style={styles.legendText}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bar chart visualization */}
      <View style={styles.chartArea}>
        {STATUS_DATA.map((data) => (
          <View key={data.year} style={styles.barGroup}>
            {STATUSES.map((status) => {
              const value = data[status.key];
              const height = (value / maxValue) * 100;
              return (
                <View
                  key={status.key}
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: status.color,
                    },
                  ]}
                />
              );
            })}
            <Text style={styles.barLabel}>{data.year}</Text>
          </View>
        ))}
      </View>

      {/* Summary stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>105</Text>
          <Text style={styles.summaryLabel}>Leased</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>7</Text>
          <Text style={styles.summaryLabel}>Vacant</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.accent }]}>72</Text>
          <Text style={styles.summaryLabel}>Managed</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: SPACING.sm,
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
  barLabel: {
    position: 'absolute',
    bottom: -16,
    color: COLORS.textMuted,
    fontSize: 8,
    alignSelf: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
    marginTop: 2,
  },
});
