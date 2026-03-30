/**
 * Leads Screen — Lead management with AI enrichment capabilities.
 * Connects to ck-api-gateway /v1/leads endpoints.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { api } from '../services/api';

const DEMO_LEADS = [
  { id: 'rec1', name: 'Sarah Mitchell', email: 'sarah@example.com', phone: '(772) 555-0101', segment: 'Luxury STR Owner', zone: 'Zone C - Jupiter', status: 'Qualified', value: '$1.2M', date: '2026-03-28' },
  { id: 'rec2', name: 'James Rodriguez', email: 'james@example.com', phone: '(772) 555-0202', segment: 'Multi-Property Investor', zone: 'Zone A - PSL', status: 'New', value: '$3.4M', date: '2026-03-27' },
  { id: 'rec3', name: 'Emily Chen', email: 'emily@example.com', phone: '(561) 555-0303', segment: 'Absentee Owner', zone: 'Zone B - Stuart', status: 'Nurturing', value: '$850K', date: '2026-03-25' },
  { id: 'rec4', name: 'Michael Thompson', email: 'mike@example.com', phone: '(772) 555-0404', segment: 'First-Time Landlord', zone: 'Zone D - Palm City', status: 'New', value: '$520K', date: '2026-03-24' },
  { id: 'rec5', name: 'Alexandra Davis', email: 'alex@example.com', phone: '(561) 555-0505', segment: 'Luxury STR Owner', zone: 'Zone C - Tequesta', status: 'Proposal Sent', value: '$2.1M', date: '2026-03-22' },
];

const STATUS_COLORS: Record<string, string> = {
  'New': COLORS.accent,
  'Qualified': COLORS.green,
  'Nurturing': COLORS.yellow,
  'Proposal Sent': COLORS.accentPurple,
  'Closed Won': COLORS.gold,
  'Closed Lost': COLORS.red,
};

export function LeadsScreen({ navigation }: { navigation: any }) {
  const [search, setSearch] = useState('');
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const filtered = DEMO_LEADS.filter(
    (l) => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.zone.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEnrich = async (leadId: string, type: 'battle_plan' | 'investor_analysis' | 'segment_analysis') => {
    setEnrichingId(leadId);
    try {
      const result = await api.enrichLead(leadId, type);
      Alert.alert('AI Enrichment Complete', `${type.replace('_', ' ')} generated successfully.`);
    } catch (err) {
      Alert.alert('Note', 'Connect your API token to enable AI enrichment.');
    } finally {
      setEnrichingId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Lead Pipeline</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation?.navigate?.('AIChat', { agentType: 'sales' })}
        >
          <Text style={styles.addButtonText}>+ AI Capture</Text>
        </TouchableOpacity>
      </View>

      {/* Pipeline stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        {[
          { label: 'New', count: 47, color: COLORS.accent },
          { label: 'Qualified', count: 23, color: COLORS.green },
          { label: 'Nurturing', count: 31, color: COLORS.yellow },
          { label: 'Proposal', count: 12, color: COLORS.accentPurple },
          { label: 'Won', count: 8, color: COLORS.gold },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        style={styles.searchInput}
        placeholder="Search leads..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Lead Cards */}
      {filtered.map((lead) => (
        <TouchableOpacity key={lead.id} style={styles.card} activeOpacity={0.7}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.leadName}>{lead.name}</Text>
              <Text style={styles.leadSegment}>{lead.segment}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: (STATUS_COLORS[lead.status] || COLORS.accent) + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[lead.status] || COLORS.accent }]}>{lead.status}</Text>
            </View>
          </View>

          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{lead.zone}</Text>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.metaText}>{lead.value}</Text>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.metaText}>{lead.date}</Text>
          </View>

          {/* AI Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEnrich(lead.id, 'battle_plan')}
              disabled={enrichingId === lead.id}
            >
              <Text style={styles.actionText}>Battle Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEnrich(lead.id, 'segment_analysis')}
              disabled={enrichingId === lead.id}
            >
              <Text style={styles.actionText}>Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEnrich(lead.id, 'investor_analysis')}
              disabled={enrichingId === lead.id}
            >
              <Text style={styles.actionText}>Investor</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700' },
  addButton: { backgroundColor: COLORS.gold + '20', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.gold },
  addButtonText: { color: COLORS.gold, fontSize: FONT.sizes.sm, fontWeight: '700' },
  statsRow: { marginBottom: SPACING.lg },
  statCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md,
    minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm,
  },
  statCount: { fontSize: FONT.sizes.xxl, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginTop: 2 },
  searchInput: {
    backgroundColor: COLORS.bgCard, color: COLORS.textPrimary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT.sizes.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  leadName: { color: COLORS.textPrimary, fontSize: FONT.sizes.lg, fontWeight: '600' },
  leadSegment: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, marginTop: 2 },
  statusPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  metaText: { color: COLORS.textMuted, fontSize: FONT.sizes.sm },
  metaDivider: { color: COLORS.border },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  actionBtn: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, paddingVertical: SPACING.sm, alignItems: 'center' },
  actionText: { color: COLORS.gold, fontSize: FONT.sizes.xs, fontWeight: '600' },
});
