/**
 * Settings Screen — App configuration, API connections, and system preferences.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { useAppStore } from '../store/app-store';

export function SettingsScreen() {
  const [apiEndpoint, setApiEndpoint] = useState('https://api.coastalkey-pm.com');
  const [authToken, setAuthToken] = useState('');

  const handleSave = () => {
    if (authToken) {
      useAppStore.getState().setAuth(authToken, { name: 'David Hauer', email: 'david@coastalkey-pm.com', role: 'admin' });
      Alert.alert('Settings Saved', 'API credentials updated successfully.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* API Configuration */}
      <Text style={styles.sectionTitle}>API Configuration</Text>
      <View style={styles.card}>
        <Text style={styles.label}>API Gateway Endpoint</Text>
        <TextInput
          style={styles.input}
          value={apiEndpoint}
          onChangeText={setApiEndpoint}
          placeholder="https://api.coastalkey-pm.com"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={styles.label}>Auth Token</Text>
        <TextInput
          style={styles.input}
          value={authToken}
          onChangeText={setAuthToken}
          placeholder="Bearer token for ck-api-gateway"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* System Info */}
      <Text style={styles.sectionTitle}>System Information</Text>
      <View style={styles.card}>
        {[
          { label: 'App Version', value: '1.0.0' },
          { label: 'API Gateway', value: 'ck-api-gateway v2.0.0' },
          { label: 'AI Model (Fast)', value: 'claude-sonnet-4-6' },
          { label: 'AI Model (Advanced)', value: 'claude-opus-4-6' },
          { label: 'Total Agents', value: '290 across 9 divisions' },
          { label: 'Database', value: 'Airtable (Master Orchestrator)' },
          { label: 'Hosting', value: 'Cloudflare Workers + Pages' },
          { label: 'Voice AI', value: 'Retell.ai Integration' },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Danger Zone */}
      <Text style={styles.sectionTitle}>Data Management</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Clear Local Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dangerButton, { marginTop: SPACING.sm }]}>
          <Text style={styles.dangerButtonText}>Reset AI Conversation History</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700', marginBottom: SPACING.xl },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT.sizes.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  label: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.bgInput, color: COLORS.textPrimary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT.sizes.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingVertical: SPACING.md,
    alignItems: 'center', marginTop: SPACING.xl,
  },
  saveButtonText: { color: COLORS.bg, fontSize: FONT.sizes.md, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  infoLabel: { color: COLORS.textSecondary, fontSize: FONT.sizes.md },
  infoValue: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: SPACING.md },
  dangerButton: {
    backgroundColor: COLORS.redBg, borderRadius: RADIUS.md, paddingVertical: SPACING.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.red + '30',
  },
  dangerButtonText: { color: COLORS.red, fontSize: FONT.sizes.md, fontWeight: '600' },
});
