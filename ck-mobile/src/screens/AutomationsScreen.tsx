/**
 * Automations Screen — View and control the self-performing automation engine.
 * Shows all registered automation tasks with status, controls, and execution history.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { automationEngine, AutomationTask } from '../automations/automation-engine';
import { useAppStore } from '../store/app-store';

const TYPE_ICONS: Record<string, { label: string; color: string }> = {
  lead: { label: 'LEAD', color: COLORS.green },
  inspection: { label: 'INSP', color: COLORS.yellow },
  content: { label: 'CONTENT', color: COLORS.accentPurple },
  agent: { label: 'AGENT', color: COLORS.accent },
  financial: { label: 'FIN', color: COLORS.gold },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  active: { color: COLORS.green, bg: COLORS.greenBg },
  paused: { color: COLORS.yellow, bg: COLORS.yellowBg },
  running: { color: COLORS.accent, bg: COLORS.blueBg },
  error: { color: COLORS.red, bg: COLORS.redBg },
};

export function AutomationsScreen() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const automationActive = useAppStore((s) => s.automationActive);
  const toggleAutomation = useAppStore((s) => s.toggleAutomation);

  useEffect(() => {
    setTasks(automationEngine.getTasks());
  }, []);

  const handleTrigger = async (taskId: string) => {
    try {
      await automationEngine.triggerTask(taskId);
      setTasks([...automationEngine.getTasks()]);
      Alert.alert('Task Executed', 'Automation task completed successfully.');
    } catch {
      Alert.alert('Error', 'Task execution failed. Check API connection.');
    }
  };

  const handleToggle = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      automationEngine.pauseTask(taskId);
    } else {
      automationEngine.resumeTask(taskId);
    }
    setTasks([...automationEngine.getTasks()]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Automation Engine</Text>
        <TouchableOpacity
          style={[styles.masterToggle, { backgroundColor: automationActive ? COLORS.greenBg : COLORS.redBg }]}
          onPress={toggleAutomation}
        >
          <View style={[styles.toggleDot, { backgroundColor: automationActive ? COLORS.green : COLORS.red }]} />
          <Text style={[styles.toggleText, { color: automationActive ? COLORS.green : COLORS.red }]}>
            {automationActive ? 'ENGINE ON' : 'ENGINE OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Self-performing task orchestration — {tasks.filter((t) => t.status === 'active').length}/{tasks.length} active automations
      </Text>

      {/* Task Summary */}
      <View style={styles.summaryRow}>
        {Object.entries(TYPE_ICONS).map(([type, config]) => {
          const count = tasks.filter((t) => t.type === type).length;
          return (
            <View key={type} style={styles.summaryCard}>
              <Text style={[styles.summaryBadge, { color: config.color }]}>{config.label}</Text>
              <Text style={styles.summaryCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Task Cards */}
      {tasks.map((task) => {
        const typeConfig = TYPE_ICONS[task.type];
        const statusConfig = STATUS_CONFIG[task.status];

        return (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
                  <Text style={[styles.typeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                </View>
                <Text style={styles.taskName}>{task.name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.taskDescription}>{task.description}</Text>

            {task.interval && (
              <Text style={styles.taskMeta}>
                Interval: {task.interval >= 3600000
                  ? `${task.interval / 3600000}h`
                  : `${task.interval / 60000}m`}
                {task.lastRun ? ` | Last: ${new Date(task.lastRun).toLocaleTimeString()}` : ''}
              </Text>
            )}

            <View style={styles.taskActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleTrigger(task.id)}
              >
                <Text style={styles.actionText}>Run Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, task.status === 'active' ? { borderColor: COLORS.yellow } : { borderColor: COLORS.green }]}
                onPress={() => handleToggle(task.id, task.status)}
              >
                <Text style={[styles.actionText, { color: task.status === 'active' ? COLORS.yellow : COLORS.green }]}>
                  {task.status === 'active' ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700' },
  masterToggle: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: SPACING.sm,
  },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleText: { fontSize: FONT.sizes.xs, fontWeight: '700', letterSpacing: 1 },
  subtitle: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, marginBottom: SPACING.xl },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryBadge: { fontSize: FONT.sizes.xs, fontWeight: '700', letterSpacing: 0.5 },
  summaryCount: { color: COLORS.textPrimary, fontSize: FONT.sizes.xxl, fontWeight: '700', marginTop: SPACING.xs },
  taskCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1, marginRight: SPACING.sm },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  typeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  taskName: { color: COLORS.textPrimary, fontSize: FONT.sizes.md, fontWeight: '600', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, gap: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '600' },
  taskDescription: { color: COLORS.textSecondary, fontSize: FONT.sizes.sm, lineHeight: 20, marginBottom: SPACING.sm },
  taskMeta: { color: COLORS.textMuted, fontSize: FONT.sizes.xs, marginBottom: SPACING.md },
  taskActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  actionButton: {
    flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.sm, paddingVertical: SPACING.sm,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.gold,
  },
  actionText: { color: COLORS.gold, fontSize: FONT.sizes.sm, fontWeight: '600' },
});
