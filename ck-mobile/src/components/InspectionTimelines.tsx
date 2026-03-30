/**
 * Inspection Timelines — Table widget matching the dashboard screenshot.
 * Shows inspection records with property ID, repair status, last inspection date,
 * and color-coded status indicators.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

interface InspectionRow {
  id: string;
  propertyId: string;
  repair: boolean;
  lastInspection: string;
  status: 'complete' | 'pending' | 'overdue' | 'in_progress';
}

const DEMO_INSPECTIONS: InspectionRow[] = [
  { id: '1', propertyId: 'Inspection 1', repair: true, lastInspection: '2 mo ago', status: 'complete' },
  { id: '2', propertyId: 'Inspection 2', repair: false, lastInspection: '3 wks ago', status: 'pending' },
  { id: '3', propertyId: 'Inspection 3', repair: true, lastInspection: '24 days ago', status: 'in_progress' },
  { id: '4', propertyId: 'Inspection 4', repair: false, lastInspection: '4 days ago', status: 'overdue' },
  { id: '5', propertyId: 'Inspection 5', repair: true, lastInspection: '1 wk ago', status: 'complete' },
];

const STATUS_CONFIGS: Record<string, { color: string; bg: string; label: string }> = {
  complete: { color: COLORS.green, bg: COLORS.greenBg, label: 'Complete' },
  pending: { color: COLORS.yellow, bg: COLORS.yellowBg, label: 'Pending' },
  overdue: { color: COLORS.red, bg: COLORS.redBg, label: 'Overdue' },
  in_progress: { color: COLORS.accent, bg: COLORS.blueBg, label: 'In Progress' },
};

interface Props {
  inspections?: InspectionRow[];
  onInspectionPress?: (id: string) => void;
}

export function InspectionTimelines({ inspections = DEMO_INSPECTIONS, onInspectionPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspection Timelines</Text>
        <View style={styles.tabs}>
          <Text style={styles.tabActive}>Inspection</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>PROPERTY</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>REPAIR</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>LAST INSPECTION</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>STATUS</Text>
      </View>

      {/* Table Rows */}
      {inspections.map((inspection) => {
        const config = STATUS_CONFIGS[inspection.status];
        return (
          <TouchableOpacity
            key={inspection.id}
            style={styles.tableRow}
            onPress={() => onInspectionPress?.(inspection.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cell, { flex: 2 }]}>{inspection.propertyId}</Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={[
                  styles.repairDot,
                  { backgroundColor: inspection.repair ? COLORS.green : COLORS.red },
                ]}
              />
            </View>
            <Text style={[styles.cell, styles.cellMuted, { flex: 2 }]}>
              {inspection.lastInspection}
            </Text>
            <View style={{ flex: 1.5 }}>
              <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
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
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
  },
  tabActive: {
    color: COLORS.gold,
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  headerCell: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  cell: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.sm,
  },
  cellMuted: {
    color: COLORS.textSecondary,
  },
  repairDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
});
