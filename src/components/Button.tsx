import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  const { theme } = useTheme();

  const bgColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.surface,
    ghost: 'transparent',
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColors[variant],
          borderRadius: theme.borderRadius.md,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        variant="body"
        style={{ color: textColors[variant], fontWeight: '600', textAlign: 'center' }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
});
