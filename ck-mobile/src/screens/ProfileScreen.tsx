/**
 * Profile Screen — User account management and app settings.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { useAppStore } from '../store/app-store';

export function ProfileScreen() {
  const automationActive = useAppStore((s) => s.automationActive);
  const toggleAutomation = useAppStore((s) => s.toggleAutomation);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>DH</Text>
        </View>
        <Text style={styles.name}>David Hauer</Text>
        <Text style={styles.role}>CEO & Founder</Text>
        <Text style={styles.company}>Coastal Key Property Management</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>290</Text>
            <Text style={styles.statLabel}>AI Agents</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>Divisions</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Automation Settings</Text>

      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>AI Automation Engine</Text>
            <Text style={styles.settingDesc}>Self-performing task execution</Text>
          </View>
          <Switch
            value={automationActive}
            onValueChange={toggleAutomation}
            trackColor={{ false: COLORS.bgInput, true: COLORS.green + '60' }}
            thumbColor={automationActive ? COLORS.green : COLORS.textMuted}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Lead Auto-Capture</Text>
            <Text style={styles.settingDesc}>AI agents auto-create leads from conversations</Text>
          </View>
          <Switch value={true} trackColor={{ false: COLORS.bgInput, true: COLORS.green + '60' }} thumbColor={COLORS.green} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Battle Plan Auto-Generation</Text>
            <Text style={styles.settingDesc}>SCAA-1 plans for qualified leads</Text>
          </View>
          <Switch value={true} trackColor={{ false: COLORS.bgInput, true: COLORS.green + '60' }} thumbColor={COLORS.green} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Lead alerts, inspection reminders, agent status</Text>
          </View>
          <Switch value={true} trackColor={{ false: COLORS.bgInput, true: COLORS.green + '60' }} thumbColor={COLORS.green} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Integrations</Text>
      <View style={styles.settingCard}>
        {['Airtable CRM', 'Anthropic Claude API', 'Retell Voice AI', 'Cloudflare Workers', 'Slack Notifications'].map((integration) => (
          <View key={integration} style={styles.integrationRow}>
            <Text style={styles.settingLabel}>{integration}</Text>
            <View style={[styles.connectedBadge, { backgroundColor: COLORS.greenBg }]}>
              <Text style={[styles.connectedText, { color: COLORS.green }]}>Connected</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  profileCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xxl,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.gold + '30', marginBottom: SPACING.xl, ...SHADOWS.card,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { color: COLORS.bg, fontSize: FONT.sizes.xxl, fontWeight: '700' },
  name: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700' },
  role: { color: COLORS.gold, fontSize: FONT.sizes.md, fontWeight: '600', marginTop: SPACING.xs },
  company: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, marginTop: SPACING.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: SPACING.xl, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  stat: { alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginTop: 2 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT.sizes.lg, fontWeight: '700', marginBottom: SPACING.md },
  settingCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  settingLabel: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600' },
  settingDesc: { color: COLORS.textMuted, fontSize: FONT.sizes.sm, marginTop: 2, maxWidth: 240 },
  integrationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  connectedBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  connectedText: { fontSize: FONT.sizes.xs, fontWeight: '600' },
});
