/**
 * Dashboard Screen — Main view matching the Global Real Estate Analytics screenshot.
 *
 * Layout:
 * - Header with CK logo, search, title, account selector
 * - Interactive Analysis chart (top-left)
 * - Global Map widget (center)
 * - Property Status chart (top-right)
 * - Property grid (bottom-left)
 * - Inspection Timelines (bottom-center)
 * - Risk Heatmap (bottom-right)
 * - Quick KPI stat cards
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { DashboardHeader } from '../components/DashboardHeader';
import { InteractiveAnalysisChart } from '../components/InteractiveAnalysisChart';
import { GlobalMapWidget } from '../components/GlobalMapWidget';
import { PropertyStatusChart } from '../components/PropertyStatusChart';
import { PropertyGrid } from '../components/PropertyGrid';
import { InspectionTimelines } from '../components/InspectionTimelines';
import { RiskHeatmap } from '../components/RiskHeatmap';
import { useAppStore } from '../store/app-store';
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export function DashboardScreen({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dashboardData = useAppStore((s) => s.dashboardData);
  const automationActive = useAppStore((s) => s.automationActive);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await api.getDashboard();
      useAppStore.getState().setDashboardData({
        totalAgents: data.agents.total,
        activeAgents: data.agents.byStatus.active || 0,
        totalProperties: dashboardData.totalProperties,
        totalLeads: dashboardData.totalLeads,
        revenue: dashboardData.revenue,
        systemHealth: data.systemHealth.status,
      });
    } catch {
      // Fail silently on refresh
    }
    setRefreshing(false);
  };

  const KPI_CARDS = [
    { label: 'AI Agents', value: String(dashboardData.totalAgents), color: COLORS.accent, sub: `${dashboardData.activeAgents} active` },
    { label: 'Properties', value: String(dashboardData.totalProperties), color: COLORS.green, sub: '12 zones' },
    { label: 'Active Leads', value: String(dashboardData.totalLeads), color: COLORS.gold, sub: '+47 this week' },
    { label: 'Monthly Revenue', value: `$${(dashboardData.revenue / 1000).toFixed(0)}K`, color: COLORS.accentPurple, sub: '+18% MoM' },
    { label: 'System Health', value: dashboardData.systemHealth.toUpperCase(), color: dashboardData.systemHealth === 'healthy' ? COLORS.green : COLORS.yellow, sub: automationActive ? 'Automation ON' : 'Automation OFF' },
  ];

  return (
    <View style={styles.screen}>
      <DashboardHeader onSearch={setSearchQuery} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiRow}
        >
          {KPI_CARDS.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiSub}>{kpi.sub}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Row 1: Interactive Analysis + Property Status */}
        <View style={styles.row}>
          <View style={isTablet ? styles.twoThirds : styles.fullWidth}>
            <InteractiveAnalysisChart />
          </View>
          {isTablet && (
            <View style={styles.oneThird}>
              <PropertyStatusChart />
            </View>
          )}
        </View>

        {!isTablet && (
          <View style={styles.section}>
            <PropertyStatusChart />
          </View>
        )}

        {/* Row 2: Global Map */}
        <View style={styles.section}>
          <GlobalMapWidget />
        </View>

        {/* Row 3: Property Grid + Inspection Timelines + Risk Heatmap */}
        <View style={styles.row}>
          <View style={isTablet ? styles.oneThird : styles.fullWidth}>
            <PropertyGrid onPropertyPress={(id) => navigation?.navigate?.('PropertyDetail', { id })} />
          </View>
          {isTablet && (
            <>
              <View style={styles.oneThird}>
                <InspectionTimelines />
              </View>
              <View style={styles.oneThird}>
                <RiskHeatmap />
              </View>
            </>
          )}
        </View>

        {!isTablet && (
          <>
            <View style={styles.section}>
              <InspectionTimelines />
            </View>
            <View style={styles.section}>
              <RiskHeatmap />
            </View>
          </>
        )}

        {/* AI Agents Quick Actions */}
        <View style={styles.section}>
          <View style={styles.aiSection}>
            <Text style={styles.aiSectionTitle}>AI Command Center</Text>
            <Text style={styles.aiSectionSub}>290 agents across 9 divisions</Text>

            <View style={styles.aiActions}>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: COLORS.greenBg, borderColor: COLORS.green }]}
                onPress={() => navigation?.navigate?.('AIChat', { agentType: 'sales' })}
              >
                <Text style={[styles.aiButtonText, { color: COLORS.green }]}>Sentinel Sales Agent</Text>
                <Text style={styles.aiButtonSub}>AI-powered lead qualification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: COLORS.blueBg, borderColor: COLORS.accent }]}
                onPress={() => navigation?.navigate?.('AIChat', { agentType: 'client' })}
              >
                <Text style={[styles.aiButtonText, { color: COLORS.accent }]}>Architect Client Builder</Text>
                <Text style={styles.aiButtonSub}>Automated client onboarding</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: COLORS.yellowBg, borderColor: COLORS.yellow }]}
                onPress={() => navigation?.navigate?.('Automations')}
              >
                <Text style={[styles.aiButtonText, { color: COLORS.yellow }]}>Workflow Engine</Text>
                <Text style={styles.aiButtonSub}>Battle plans, nurture, escalation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  kpiRow: {
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  kpiCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  kpiLabel: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  kpiValue: {
    fontSize: FONT.sizes.hero,
    fontWeight: '700',
    letterSpacing: -1,
  },
  kpiSub: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.xs,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  fullWidth: {
    flex: 1,
  },
  twoThirds: {
    flex: 2,
  },
  oneThird: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  aiSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    ...SHADOWS.card,
  },
  aiSectionTitle: {
    color: COLORS.gold,
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  aiSectionSub: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
    marginBottom: SPACING.lg,
  },
  aiActions: {
    gap: SPACING.md,
  },
  aiButton: {
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  aiButtonText: {
    fontSize: FONT.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiButtonSub: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
  },
});
