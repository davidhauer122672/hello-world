/**
 * Coastal Key Global State — Zustand Store
 *
 * Single source of truth for auth, dashboard data, AI agents, and notifications.
 */

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

export interface Property {
  id: string;
  name: string;
  address: string;
  status: 'LEASED' | 'VACANT' | 'MANAGED' | 'GROUNDED';
  statusLabel: string;
  image?: string;
  zone: string;
  value?: number;
  coordinates?: { lat: number; lng: number };
}

export interface Inspection {
  id: string;
  propertyId: string;
  propertyName: string;
  type: string;
  status: 'PENDING' | 'REPAIR' | 'COMPLETE' | 'OVERDUE';
  lastInspection: string;
  nextDue: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  zone: string;
  status: string;
  dateCaptured: string;
  propertyValue?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType: 'sales' | 'client';
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'lead' | 'inspection' | 'agent' | 'system' | 'workflow';
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
}

interface AppState {
  // Auth
  authToken: string | null;
  user: { name: string; email: string; role: string } | null;
  setAuth: (token: string, user: AppState['user']) => void;
  clearAuth: () => void;

  // Dashboard
  dashboardData: {
    totalAgents: number;
    activeAgents: number;
    totalProperties: number;
    totalLeads: number;
    revenue: number;
    systemHealth: string;
  };
  setDashboardData: (data: AppState['dashboardData']) => void;

  // Properties
  properties: Property[];
  setProperties: (properties: Property[]) => void;

  // Inspections
  inspections: Inspection[];
  setInspections: (inspections: Inspection[]) => void;

  // Leads
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;

  // Automation status
  automationActive: boolean;
  toggleAutomation: () => void;
}

export const store = createStore<AppState>((set) => ({
  // Auth
  authToken: null,
  user: null,
  setAuth: (token, user) => set({ authToken: token, user }),
  clearAuth: () => set({ authToken: null, user: null }),

  // Dashboard
  dashboardData: {
    totalAgents: 290,
    activeAgents: 247,
    totalProperties: 156,
    totalLeads: 1842,
    revenue: 2_470_000,
    systemHealth: 'healthy',
  },
  setDashboardData: (data) => set({ dashboardData: data }),

  // Properties
  properties: [],
  setProperties: (properties) => set({ properties }),

  // Inspections
  inspections: [],
  setInspections: (inspections) => set({ inspections }),

  // Leads
  leads: [],
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((s) => ({ leads: [lead, ...s.leads] })),

  // AI Chat
  chatMessages: [],
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),

  // Notifications
  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  // Automation
  automationActive: true,
  toggleAutomation: () => set((s) => ({ automationActive: !s.automationActive })),
}));

export function useAppStore<T>(selector: (state: AppState) => T): T {
  return useStore(store, selector);
}
