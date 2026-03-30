/**
 * Overview Screen — High-level enterprise performance view.
 * Shows KPIs, division performance, and system health at a glance.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { useAppStore } from '../store/app-store';
import { api } from '../services/api';

const DIVISIONS = [
  { id: 'EXC', name: 'Executive', color: '#6366F1', agents: 25 },
  { id: 'SEN', name: 'Sentinel Sales', color: '#EF4444', agents: 40 },
  { id: 'OPS', name: 'Operations', color: '#F59E0B', agents: 45 },
  { id: 'INT', name: 'Intelligence', color: '#10B981', agents: 30 },
  { id: 'MKT', name: 'Marketing', color: '#8B5CF6', agents: 35 },
  { id: 'FIN', name: 'Finance', color: '#06B6D4', agents: 25 },
  { id: 'VEN', name: 'Vendor Mgmt', color: '#F97316', agents: 30 },
  { id: 'TEC', name: 'Technology', color: '#64748B', agents: 20 },
  { id: 'WEB', name: 'Web Development', color: '#0EA5E9', agents: 40 },
];

export function OverviewScreen() {
  const dashboardData = useAppStore((s) => s.dashboardData);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await api.getDashboard(); } catch {}
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
    >
      <Text style={styles.pageTitle}>Enterprise Overview</Text>
      <Text style={styles.pageSubtitle}>Coastal Key Property Management — Global Operations</Text>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Monthly Managed Revenue</Text>
        <Text style={styles.revenueValue}>$2.47M</Text>
        <View style={styles.revenueRow}>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatValue}>$29.6M</Text>
            <Text style={styles.revenueStatLabel}>Annual Run Rate</Text>
          </View>
          <View style={styles.revenueStat}>
            <Text style={[styles.revenueStatValue, { color: COLORS.green }]}>+18%</Text>
            <Text style={styles.revenueStatLabel}>MoM Growth</Text>
          </View>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatValue}>156</Text>
            <Text style={styles.revenueStatLabel}>Properties</Text>
          </View>
        </View>
      </View>

      {/* Division Performance */}
      <Text style={styles.sectionTitle}>Division Performance</Text>
      <View style={styles.divisionGrid}>
        {DIVISIONS.map((div) => (
          <View key={div.id} style={styles.divisionCard}>
            <View style={[styles.divColor, { backgroundColor: div.color }]} />
            <View style={styles.divInfo}>
              <Text style={styles.divName}>{div.name}</Text>
              <Text style={styles.divAgents}>{div.agents} agents</Text>
            </View>
            <View style={[styles.divStatus, { backgroundColor: COLORS.greenBg }]}>
              <Text style={[styles.divStatusText, { color: COLORS.green }]}>Active</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 5-Year Goals Progress */}
      <Text style={styles.sectionTitle}>5-Year Goals (Accelerated to 6 Months)</Text>
      {[
        { goal: 'Scale to 500+ managed properties', progress: 31, target: '156/500' },
        { goal: 'Achieve $10M ARR', progress: 30, target: '$2.97M/$10M' },
        { goal: 'Expand to 6 Florida markets', progress: 67, target: '4/6 markets' },
        { goal: 'Deploy 500 AI agents', progress: 58, target: '290/500 agents' },
        { goal: 'Launch investor platform', progress: 45, target: 'Phase 2/4' },
        { goal: 'International expansion research', progress: 15, target: 'Phase 1/5' },
      ].map((item, i) => (
        <View key={i} style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalText}>{item.goal}</Text>
            <Text style={styles.goalTarget}>{item.target}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{item.progress}%</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  pageTitle: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700', marginBottom: SPACING.xs },
  pageSubtitle: { color: COLORS.textSecondary, fontSize: FONT.sizes.md, marginBottom: SPACING.xl },
  revenueCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.gold + '30', marginBottom: SPACING.xl, ...SHADOWS.card,
  },
  revenueLabel: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, textTransform: 'uppercase', letterSpacing: 1 },
  revenueValue: { color: COLORS.gold, fontSize: 42, fontWeight: '700', letterSpacing: -2, marginVertical: SPACING.sm },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  revenueStat: { alignItems: 'center' },
  revenueStatValue: { color: COLORS.textPrimary, fontSize: FONT.sizes.xl, fontWeight: '700' },
  revenueStatLabel: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginTop: 2 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT.sizes.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  divisionGrid: { gap: SPACING.sm, marginBottom: SPACING.xl },
  divisionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md,
  },
  divColor: { width: 4, height: 36, borderRadius: 2 },
  divInfo: { flex: 1 },
  divName: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600' },
  divAgents: { color: COLORS.textMuted, fontSize: FONT.sizes.sm },
  divStatus: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  divStatusText: { fontSize: FONT.sizes.xs, fontWeight: '600' },
  goalCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  goalText: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600', flex: 1 },
  goalTarget: { color: COLORS.gold, fontSize: FONT.sizes.sm, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: COLORS.bgInput, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  progressPercent: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginTop: SPACING.xs, textAlign: 'right' },
});
