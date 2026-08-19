/**
 * HomeInTown.ai Design System
 * Matching the website's color palette and typography.
 */

export const Colors = {
  // Primary (Green - matching website's green-700)
  primary: '#15803D',
  primaryDark: '#166534',
  primaryLight: '#DCFCE7',
  primaryText: '#14532D',

  // Secondary (Blue - matching website's blue-600)
  secondary: '#2563EB',
  secondaryLight: '#DBEAFE',

  // Accent / CTA
  ctaRed: '#EF4444',
  ctaRedDark: '#DC2626',
  whatsapp: '#22C55E',
  whatsappDark: '#16A34A',

  // Background
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#D1D5DB',

  // Status
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#2563EB',

  // Map
  markerBg: '#111827',
  markerText: '#FFFFFF',

  // Shadows
  shadowColor: '#000000',
};

export const Typography = {
  // Sizes
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 15,
  bodySmall: 13,
  caption: 11,
  tiny: 10,

  // Weights
  black: '900' as const,
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Category tabs matching website
export const CATEGORY_TABS = [
  { name: 'All', icon: '🏠' },
  { name: 'Flat', icon: '🏢' },
  { name: 'Plot', icon: '📐' },
  { name: 'Villa', icon: '🏡' },
  { name: 'Rent', icon: '💰' },
];

// Nearby places categories (Geographic mode)
export const PLACE_CATEGORIES = [
  { type: 'school', label: '🏫 Schools' },
  { type: 'hospital', label: '🏥 Hospitals' },
  { type: 'park', label: '🌳 Parks' },
  { type: 'subway_station', label: '🚇 Metro' },
  { type: 'bus_station', label: '🚌 Bus Stops' },
  { type: 'restaurant', label: '🍽️ Restaurants' },
  { type: 'bank', label: '🏦 Banks' },
  { type: 'gas_station', label: '⛽ Petrol Pumps' },
  { type: 'gym', label: '💪 Gyms' },
  { type: 'supermarket', label: '🛒 Market' },
  { type: 'shopping_mall', label: '🏬 Malls' },
];
