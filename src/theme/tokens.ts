export const colors = {
  // Brand
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4A3DB8',

  // Accent
  accent: '#00CEC9',
  accentLight: '#81ECEC',

  // Gaming-inspired
  xp: '#FDCB6E',
  health: '#FF6B6B',
  mana: '#74B9FF',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF6B6B',

  // Dark theme
  dark: {
    bg: '#0D1117',
    surface: '#161B22',
    surfaceElevated: '#1C2333',
    border: '#30363D',
    text: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#484F58',
  },

  // Light theme
  light: {
    bg: '#FFFFFF',
    surface: '#F6F8FA',
    surfaceElevated: '#FFFFFF',
    border: '#D0D7DE',
    text: '#1F2328',
    textSecondary: '#656D76',
    textMuted: '#8C959F',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  hero: 34,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
