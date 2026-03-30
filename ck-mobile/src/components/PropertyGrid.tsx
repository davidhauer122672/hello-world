/**
 * Property Grid — Matches the "Property" card grid from the dashboard screenshot.
 * Shows properties with status badges, images, and quick actions.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';

interface Property {
  id: string;
  name: string;
  status: 'LEASED' | 'VACANT' | 'MANAGED' | 'GROUNDED';
  statusLabel: string;
  image?: string;
}

const DEMO_PROPERTIES: Property[] = [
  { id: '1', name: 'Property Basin', status: 'LEASED', statusLabel: 'STATUS: LEASED' },
  { id: '2', name: 'Summerside', status: 'VACANT', statusLabel: 'STATUS: VACANT' },
  { id: '3', name: 'Sandcity', status: 'GROUNDED', statusLabel: 'STATUS: GROUNDED' },
  { id: '4', name: 'Soo zooxis', status: 'MANAGED', statusLabel: 'STATUS: MANAGED' },
  { id: '5', name: 'Soono Chinlee', status: 'GROUNDED', statusLabel: 'STATUS: GROUNDED' },
  { id: '6', name: 'Imarsh', status: 'LEASED', statusLabel: 'STATUS: LEASED' },
];

const STATUS_COLORS: Record<string, string> = {
  LEASED: COLORS.green,
  VACANT: COLORS.red,
  MANAGED: COLORS.accent,
  GROUNDED: COLORS.yellow,
};

const STATUS_BG: Record<string, string> = {
  LEASED: COLORS.greenBg,
  VACANT: COLORS.redBg,
  MANAGED: COLORS.blueBg,
  GROUNDED: COLORS.yellowBg,
};

interface Props {
  properties?: Property[];
  onPropertyPress?: (id: string) => void;
}

export function PropertyGrid({ properties = DEMO_PROPERTIES, onPropertyPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Property</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        {properties.map((property) => (
          <TouchableOpacity
            key={property.id}
            style={styles.propertyCard}
            onPress={() => onPropertyPress?.(property.id)}
            activeOpacity={0.7}
          >
            {/* Property Image / Placeholder */}
            <View style={styles.imageContainer}>
              <View style={[styles.imagePlaceholder, { backgroundColor: STATUS_COLORS[property.status] + '20' }]}>
                <Text style={[styles.imageIcon, { color: STATUS_COLORS[property.status] }]}>
                  {property.status === 'LEASED' ? '&#9989;' : property.status === 'VACANT' ? '&#9888;' : '&#127968;'}
                </Text>
              </View>
            </View>

            {/* Property Info */}
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName} numberOfLines={1}>{property.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[property.status] }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[property.status] }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[property.status] }]}>
                  {property.statusLabel}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.gold + '20',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.sm,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  imageIcon: {
    fontSize: 18,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.md,
    fontWeight: '600',
    marginBottom: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
