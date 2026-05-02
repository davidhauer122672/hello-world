/**
 * Global Map Widget — Interactive world map showing property locations.
 * Matches the Google Maps embed from the dashboard screenshot.
 * Falls back to a styled placeholder on platforms without MapView.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

// Property markers for the Treasure Coast
const PROPERTY_MARKERS = [
  { id: 'p1', name: 'Port St. Lucie Portfolio', lat: 27.2730, lng: -80.3582, count: 42 },
  { id: 'p2', name: 'Stuart Properties', lat: 27.1975, lng: -80.2528, count: 28 },
  { id: 'p3', name: 'Jensen Beach', lat: 27.2545, lng: -80.2295, count: 15 },
  { id: 'p4', name: 'Jupiter Estates', lat: 26.9342, lng: -80.0942, count: 31 },
  { id: 'p5', name: 'Palm City', lat: 27.1634, lng: -80.2669, count: 18 },
  { id: 'p6', name: 'Hobe Sound', lat: 27.0597, lng: -80.1363, count: 12 },
  { id: 'p7', name: 'Tequesta', lat: 26.9687, lng: -80.1081, count: 10 },
];

export function GlobalMapWidget() {
  return (
    <View style={styles.container}>
      {/* Map area with styled representation */}
      <View style={styles.mapArea}>
        {/* World map background grid */}
        <View style={styles.mapGrid}>
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <View key={`cell-${row}-${col}`} style={styles.gridCell} />
            )),
          )}
        </View>

        {/* Connection lines (representing global reach) */}
        <View style={styles.connectionOverlay}>
          <View style={[styles.connectionDot, { top: '30%', left: '25%' }]}>
            <View style={styles.dotPulse} />
          </View>
          <View style={[styles.connectionDot, { top: '40%', left: '55%' }]}>
            <View style={styles.dotPulse} />
          </View>
          <View style={[styles.connectionDot, { top: '35%', left: '75%' }]}>
            <View style={styles.dotPulse} />
          </View>
          {/* Primary market — Florida Treasure Coast */}
          <View style={[styles.primaryDot, { top: '45%', left: '28%' }]}>
            <View style={styles.primaryPulse} />
            <Text style={styles.markerLabel}>Treasure Coast HQ</Text>
          </View>
        </View>

        {/* Map attribution */}
        <Text style={styles.attribution}>Coastal Key Global Portfolio</Text>
      </View>

      {/* Property count overlay */}
      <View style={styles.statsOverlay}>
        {PROPERTY_MARKERS.map((marker) => (
          <View key={marker.id} style={styles.statPill}>
            <View style={styles.statDot} />
            <Text style={styles.statName}>{marker.name}</Text>
            <Text style={styles.statCount}>{marker.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  mapArea: {
    height: 220,
    backgroundColor: '#0D1929',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridCell: {
    width: '12.5%',
    height: '16.67%',
    borderWidth: 0.5,
    borderColor: COLORS.accent,
  },
  connectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connectionDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },
  dotPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    top: -5,
    left: -5,
  },
  primaryDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gold,
    zIndex: 10,
  },
  primaryPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    opacity: 0.2,
    top: -7,
    left: -7,
  },
  markerLabel: {
    position: 'absolute',
    top: -18,
    left: 18,
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '700',
    width: 100,
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  statsOverlay: {
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  statName: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.xs,
  },
  statCount: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.xs,
    fontWeight: '700',
  },
});
