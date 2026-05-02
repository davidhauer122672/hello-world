/**
 * Inspections Screen — Property inspection management.
 * Lists all inspections with filtering, status tracking, and AI risk assessment.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

const INSPECTION_DATA = [
  { id: '1', property: '123 Ocean Blvd, Stuart', type: 'Annual', status: 'complete', risk: 'low', date: '2026-03-15', nextDue: '2027-03-15', inspector: 'AI-OPS-12' },
  { id: '2', property: '456 Palm Dr, Jupiter', type: 'Quarterly', status: 'pending', risk: 'medium', date: '2026-02-28', nextDue: '2026-05-28', inspector: 'AI-OPS-08' },
  { id: '3', property: '789 Sunrise Ave, PSL', type: 'Move-Out', status: 'overdue', risk: 'high', date: '2026-01-10', nextDue: '2026-03-10', inspector: 'AI-OPS-15' },
  { id: '4', property: '321 Island Way, Jensen', type: 'Preventive', status: 'in_progress', risk: 'low', date: '2026-03-25', nextDue: '2026-06-25', inspector: 'AI-OPS-03' },
  { id: '5', property: '654 Hibiscus Ln, Hobe Sound', type: 'Annual', status: 'complete', risk: 'critical', date: '2026-03-01', nextDue: '2027-03-01', inspector: 'AI-OPS-21' },
  { id: '6', property: '987 Tequesta Dr, Tequesta', type: 'Quarterly', status: 'pending', risk: 'medium', date: '2026-03-20', nextDue: '2026-06-20', inspector: 'AI-OPS-11' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  complete: { color: COLORS.green, bg: COLORS.greenBg, label: 'Complete' },
  pending: { color: COLORS.yellow, bg: COLORS.yellowBg, label: 'Pending' },
  overdue: { color: COLORS.red, bg: COLORS.redBg, label: 'Overdue' },
  in_progress: { color: COLORS.accent, bg: COLORS.blueBg, label: 'In Progress' },
};

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: COLORS.green, label: 'Low' },
  medium: { color: COLORS.yellow, label: 'Medium' },
  high: { color: COLORS.orange, label: 'High' },
  critical: { color: COLORS.red, label: 'Critical' },
};

export function InspectionsScreen() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = INSPECTION_DATA.filter((i) => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (search && !i.property.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inspections</Text>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search properties..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {['all', 'pending', 'in_progress', 'complete', 'overdue'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inspection Cards */}
      {filtered.map((inspection) => {
        const statusCfg = STATUS_CONFIG[inspection.status];
        const riskCfg = RISK_CONFIG[inspection.risk];
        return (
          <TouchableOpacity key={inspection.id} style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardProperty} numberOfLines={1}>{inspection.property}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>
            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{inspection.type}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Risk</Text>
                <Text style={[styles.detailValue, { color: riskCfg.color }]}>{riskCfg.label}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Next Due</Text>
                <Text style={styles.detailValue}>{inspection.nextDue}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Agent</Text>
                <Text style={[styles.detailValue, { color: COLORS.accent }]}>{inspection.inspector}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700', marginBottom: SPACING.lg },
  searchInput: {
    backgroundColor: COLORS.bgCard, color: COLORS.textPrimary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT.sizes.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  filterRow: { marginBottom: SPACING.lg },
  filterTab: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm,
  },
  filterTabActive: { backgroundColor: COLORS.gold + '20', borderColor: COLORS.gold },
  filterText: { color: COLORS.textMuted, fontSize: FONT.sizes.sm, fontWeight: '600' },
  filterTextActive: { color: COLORS.gold },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardProperty: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600', flex: 1, marginRight: SPACING.sm },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: '600' },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.lg },
  detailItem: {},
  detailLabel: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginBottom: 2 },
  detailValue: { color: COLORS.textPrimary, fontSize: FONT.sizes.sm, fontWeight: '600' },
});
