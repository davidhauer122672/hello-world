/**
 * People Screen — Team members, AI agents, and client directory.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

const TEAM_MEMBERS = [
  { id: '1', name: 'David Hauer', role: 'CEO & Founder', division: 'Executive', status: 'active', avatar: 'DH' },
  { id: '2', name: 'AI Sentinel Lead', role: 'Sales Director (AI)', division: 'Sentinel Sales', status: 'active', avatar: 'SL' },
  { id: '3', name: 'AI Operations Lead', role: 'Operations Director (AI)', division: 'Operations', status: 'active', avatar: 'OL' },
  { id: '4', name: 'AI Intel Lead', role: 'Intelligence Director (AI)', division: 'Intelligence', status: 'active', avatar: 'IL' },
  { id: '5', name: 'AI Marketing Lead', role: 'CMO (AI)', division: 'Marketing', status: 'active', avatar: 'ML' },
  { id: '6', name: 'AI Finance Lead', role: 'CFO (AI)', division: 'Finance', status: 'active', avatar: 'FL' },
  { id: '7', name: 'AI Vendor Lead', role: 'Vendor Director (AI)', division: 'Vendor Mgmt', status: 'active', avatar: 'VL' },
  { id: '8', name: 'AI Tech Lead', role: 'CTO (AI)', division: 'Technology', status: 'active', avatar: 'TL' },
];

const DIVISION_COLORS: Record<string, string> = {
  'Executive': '#6366F1', 'Sentinel Sales': '#EF4444', 'Operations': '#F59E0B',
  'Intelligence': '#10B981', 'Marketing': '#8B5CF6', 'Finance': '#06B6D4',
  'Vendor Mgmt': '#F97316', 'Technology': '#64748B',
};

export function PeopleScreen() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'team' | 'agents'>('team');

  const filtered = TEAM_MEMBERS.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>People</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'team' && styles.tabActive]} onPress={() => setTab('team')}>
          <Text style={[styles.tabText, tab === 'team' && styles.tabTextActive]}>Leadership</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'agents' && styles.tabActive]} onPress={() => setTab('agents')}>
          <Text style={[styles.tabText, tab === 'agents' && styles.tabTextActive]}>AI Agents (290)</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search people..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {filtered.map((member) => (
        <TouchableOpacity key={member.id} style={styles.card} activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: DIVISION_COLORS[member.division] || COLORS.accent }]}>
            <Text style={styles.avatarText}>{member.avatar}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            <Text style={[styles.memberDivision, { color: DIVISION_COLORS[member.division] }]}>{member.division}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: COLORS.green }]} />
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700', marginBottom: SPACING.lg },
  tabs: { flexDirection: 'row', marginBottom: SPACING.lg, gap: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.gold + '20', borderColor: COLORS.gold },
  tabText: { color: COLORS.textMuted, fontSize: FONT.sizes.md, fontWeight: '600' },
  tabTextActive: { color: COLORS.gold },
  searchInput: {
    backgroundColor: COLORS.bgCard, color: COLORS.textPrimary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT.sizes.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, gap: SPACING.md,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FONT.sizes.md, fontWeight: '700' },
  info: { flex: 1 },
  memberName: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600' },
  memberRole: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, marginTop: 2 },
  memberDivision: { fontSize: FONT.sizes.xs, fontWeight: '600', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
