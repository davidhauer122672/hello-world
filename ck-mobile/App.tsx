/**
 * Coastal Key Enterprise Mobile App
 *
 * Global Real Estate Analytics & AI-Powered Property Management
 *
 * Architecture:
 * - React Native (Expo) — Cross-platform iOS/Android
 * - 2 Embedded AI Agents (Claude-powered via ck-api-gateway)
 *   1. Sentinel: AI Sales Agent — lead qualification, outbound pursuit
 *   2. Architect: AI Client Builder — onboarding, service configuration
 * - Self-Performing Automation Engine — 10 automated business processes
 * - Real-time Dashboard matching Global Real Estate Analytics design
 * - Full integration with existing CK systems:
 *   - ck-api-gateway (Cloudflare Workers)
 *   - Airtable Master Orchestrator (22 tables)
 *   - Anthropic Claude (Sonnet 4.6 / Opus 4.6)
 *   - Retell Voice AI
 *   - 290 AI Agents across 9 divisions
 *
 * @version 1.0.0
 * @author Coastal Key AI Development Team
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { automationEngine } from './src/automations/automation-engine';

// Suppress non-critical warnings in development
LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

export default function App() {
  useEffect(() => {
    // Start the self-performing automation engine
    automationEngine.start();

    return () => {
      automationEngine.stop();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0B1426" />
      <AppNavigator />
    </>
  );
}
