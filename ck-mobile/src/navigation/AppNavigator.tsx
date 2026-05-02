/**
 * Coastal Key App Navigator — Drawer + Bottom Tab navigation structure.
 *
 * Matches the sidebar from the dashboard screenshot:
 * - Dashboard
 * - Overview
 * - Inspections
 * - Lead Pipeline (Lead erosion from screenshot)
 * - Profile
 * - People
 * - Settings
 *
 * Additional screens:
 * - AI Chat (Sentinel Sales + Architect Client Builder)
 * - Automations
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT, RADIUS } from '../styles/theme';

import { DashboardScreen } from '../screens/DashboardScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { InspectionsScreen } from '../screens/InspectionsScreen';
import { LeadsScreen } from '../screens/LeadsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { AutomationsScreen } from '../screens/AutomationsScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Custom dark theme matching dashboard
const CKTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.gold,
    background: COLORS.bg,
    card: COLORS.bgCard,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.red,
  },
};

// ── Sidebar menu items (matches screenshot) ──
const MENU_ITEMS = [
  { name: 'Dashboard', icon: '&#9632;', screen: 'Dashboard' },
  { name: 'Overview', icon: '&#9670;', screen: 'Overview' },
  { name: 'Inspections', icon: '&#9635;', screen: 'Inspections' },
  { name: 'Lead Pipeline', icon: '&#9733;', screen: 'Leads' },
  { name: 'AI Agents', icon: '&#9881;', screen: 'AIChat' },
  { name: 'Automations', icon: '&#9889;', screen: 'Automations' },
  { name: 'Profile', icon: '&#9679;', screen: 'Profile' },
  { name: 'People', icon: '&#9787;', screen: 'People' },
  { name: 'Settings', icon: '&#9881;', screen: 'Settings' },
];

function CustomDrawerContent(props: any) {
  const { navigation, state } = props;
  const activeRoute = state.routes[state.index]?.name;

  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      {/* Logo */}
      <View style={styles.drawerLogo}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>CK</Text>
        </View>
        <View>
          <Text style={styles.logoTitle}>Coastal Key</Text>
          <Text style={styles.logoSubtitle}>Property Management</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeRoute === item.screen;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIndicator, isActive && styles.menuIndicatorActive]} />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.name}</Text>
              {item.name === 'AI Agents' && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>290</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* System Status */}
      <View style={styles.systemStatus}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All Systems Operational</Text>
        </View>
        <Text style={styles.versionText}>v1.0.0 | Powered by Claude AI</Text>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bgCard },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: COLORS.bgSidebar, width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Overview" component={OverviewScreen} />
      <Drawer.Screen name="Inspections" component={InspectionsScreen} />
      <Drawer.Screen name="Leads" component={LeadsScreen} options={{ title: 'Lead Pipeline' }} />
      <Drawer.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Agents' }} />
      <Drawer.Screen name="Automations" component={AutomationsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="People" component={PeopleScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={CKTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: COLORS.bgSidebar,
  },
  drawerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.bg,
    fontSize: FONT.sizes.md,
    fontWeight: '800',
  },
  logoTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
  logoSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
  },
  menuSection: {
    paddingHorizontal: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: COLORS.bgCard,
  },
  menuIndicator: {
    width: 3,
    height: 20,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    marginRight: SPACING.md,
  },
  menuIndicatorActive: {
    backgroundColor: COLORS.gold,
  },
  menuText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.md,
    fontWeight: '500',
    flex: 1,
  },
  menuTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  menuBadge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  menuBadgeText: {
    color: COLORS.accent,
    fontSize: FONT.sizes.xs,
    fontWeight: '700',
  },
  systemStatus: {
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  statusText: {
    color: COLORS.green,
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.xs,
  },
});
