import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';

export default function LibraryScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.content}>
        <Text variant="hero">Library</Text>
        <Text variant="secondary" style={{ marginTop: theme.spacing.sm }}>
          Your game collection
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
});
