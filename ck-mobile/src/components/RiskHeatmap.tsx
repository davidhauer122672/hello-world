/**
 * Risk Heatmap — Color-coded grid matching the dashboard screenshot.
 * Displays risk levels across properties/zones as a matrix visualization.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

// Heatmap data: rows = zones, columns = risk categories
const HEATMAP_DATA = [
  { zone: 'Zone A', values: [1, 2, 3, 2, 1, 2, 3] },
  { zone: 'Zone B', values: [2, 3, 4, 3, 2, 1, 2] },
  { zone: 'Zone C', values: [1, 1, 2, 4, 3, 3, 4] },
  { zone: 'Zone D', values: [3, 2, 1, 2, 4, 3, 2] },
  { zone: 'Zone E', values: [2, 4, 3, 1, 2, 4, 3] },
];

const RISK_COLORS: Record<number, string> = {
  1: '#22C55E', // Low — green
  2: '#EAB308', // Medium — yellow
  3: '#F97316', // High — orange
  4: '#EF4444', // Critical — red
};

const RISK_LABELS = ['Struct', 'Plumb', 'Elec', 'HVAC', 'Roof', 'Land', 'Pest'];

export function RiskHeatmap() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Risk Heatmap</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.green }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.yellow }]} />
            <Text style={styles.legendText}>Med</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.orange }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.red }]} />
            <Text style={styles.legendText}>Critical</Text>
          </View>
        </View>
      </View>

      {/* Column Headers */}
      <View style={styles.columnHeaders}>
        <View style={styles.rowLabel} />
        {RISK_LABELS.map((label) => (
          <Text key={label} style={styles.colLabel}>{label}</Text>
        ))}
      </View>

      {/* Heatmap Grid */}
      {HEATMAP_DATA.map((row) => (
        <View key={row.zone} style={styles.heatRow}>
          <Text style={styles.rowLabel}>{row.zone}</Text>
          {row.values.map((value, col) => (
            <TouchableOpacity
              key={`${row.zone}-${col}`}
              style={[styles.heatCell, { backgroundColor: RISK_COLORS[value] }]}
              activeOpacity={0.7}
            >
              <Text style={styles.cellValue}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Risk Score Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>2.4</Text>
          <Text style={styles.summaryLabel}>Avg Risk</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>6</Text>
          <Text style={styles.summaryLabel}>Critical</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>12</Text>
          <Text style={styles.summaryLabel}>Low Risk</Text>
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
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 8,
  },
  columnHeaders: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
    gap: 3,
  },
  colLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 7,
    textAlign: 'center',
    fontWeight: '600',
  },
  heatRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
    alignItems: 'center',
  },
  rowLabel: {
    width: 44,
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  heatCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 28,
  },
  cellValue: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: COLORS.gold,
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
    marginTop: 2,
  },
});
