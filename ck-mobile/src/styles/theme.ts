/**
 * Coastal Key Design System — Dark Navy Theme
 * Matches the Global Real Estate Analytics dashboard aesthetic.
 */

export const COLORS = {
  // Core backgrounds
  bg: '#0B1426',
  bgCard: '#111D33',
  bgSidebar: '#0D1829',
  bgInput: '#162240',
  bgOverlay: 'rgba(0,0,0,0.6)',

  // Text
  textPrimary: '#E8ECF4',
  textSecondary: '#8899B4',
  textMuted: '#556680',

  // Accent & Brand
  gold: '#C9A84C',
  goldLight: '#E4CB7A',
  accent: '#4F8FFF',
  accentPurple: '#7C5CFC',

  // Status
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.15)',
  yellow: '#EAB308',
  yellowBg: 'rgba(234,179,8,0.15)',
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.15)',
  orange: '#F97316',
  orangeBg: 'rgba(249,115,22,0.15)',
  blue: '#3B82F6',
  blueBg: 'rgba(59,130,246,0.15)',

  // Borders
  border: '#1E3050',
  borderLight: '#2A4060',

  // Property status colors
  leased: '#22C55E',
  vacant: '#EF4444',
  managed: '#3B82F6',
  grounded: '#F59E0B',

  // Heatmap colors
  heatLow: '#22C55E',
  heatMedium: '#EAB308',
  heatHigh: '#F97316',
  heatCritical: '#EF4444',

  // Division colors (matching ck-api-gateway)
  divExecutive: '#6366F1',
  divSentinel: '#EF4444',
  divOperations: '#F59E0B',
  divIntelligence: '#10B981',
  divMarketing: '#8B5CF6',
  divFinance: '#06B6D4',
  divVendor: '#F97316',
  divTechnology: '#64748B',
  divWebsite: '#0EA5E9',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    hero: 32,
  },
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;
