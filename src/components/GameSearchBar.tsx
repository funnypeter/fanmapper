import React from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface GameSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function GameSearchBar({ value, onChangeText, loading, placeholder = 'Search games...' }: GameSearchBarProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {loading && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  loader: { marginLeft: 8 },
});
