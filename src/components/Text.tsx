import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AppTextProps extends TextProps {
  variant?: 'hero' | 'title' | 'body' | 'secondary' | 'caption';
}

export function Text({ variant = 'body', style, ...props }: AppTextProps) {
  const { theme } = useTheme();

  const variantStyles = {
    hero: { fontSize: theme.fontSize.hero, fontWeight: '700' as const, color: theme.colors.text },
    title: { fontSize: theme.fontSize.xl, fontWeight: '600' as const, color: theme.colors.text },
    body: { fontSize: theme.fontSize.md, color: theme.colors.text },
    secondary: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
    caption: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted },
  };

  return <RNText style={[variantStyles[variant], style]} {...props} />;
}
