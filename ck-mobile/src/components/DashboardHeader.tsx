/**
 * Dashboard Header — Top bar with CK logo, search, and account dropdown.
 * Matches the dark navy header from the screenshot.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT, RADIUS } from '../styles/theme';

interface Props {
  onSearch: (query: string) => void;
  accountName?: string;
}

export function DashboardHeader({ onSearch, accountName = 'All Accounts' }: Props) {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>CK</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={styles.searchIcon}>&#x1F50D;</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={COLORS.textMuted}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onSearch(text);
          }}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>GLOBAL REAL ESTATE ANALYTICS</Text>

      {/* Account Selector */}
      <TouchableOpacity style={styles.accountSelector}>
        <Text style={styles.accountText}>{accountName}</Text>
        <Text style={styles.dropdownArrow}>&#9660;</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  logoSection: {
    marginRight: SPACING.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.bg,
    fontWeight: '800',
    fontSize: FONT.sizes.sm,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    flex: 1,
    maxWidth: 200,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  searchInput: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  accountText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
  },
  dropdownArrow: {
    color: COLORS.textMuted,
    fontSize: 8,
  },
});
