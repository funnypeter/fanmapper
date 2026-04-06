import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { useWikiCache } from '../hooks/useWikiCache';
import { TouchableOpacity } from 'react-native';

export default function CacheSettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { stats, clearCache, clearExpired } = useWikiCache();

  function handleClearAll() {
    Alert.alert('Clear Cache', 'Remove all cached wiki pages and maps? You\'ll need internet to reload them.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCache },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12 }}>Offline Cache</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 16 }}>Cache Statistics</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
              <Text variant="title" style={{ marginTop: 4 }}>{stats.pageCount}</Text>
              <Text variant="caption">Wiki Pages</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="map" size={24} color={theme.colors.accent} />
              <Text variant="title" style={{ marginTop: 4 }}>{stats.mapCount}</Text>
              <Text variant="caption">Maps</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="server" size={24} color={theme.colors.xp} />
              <Text variant="title" style={{ marginTop: 4 }}>{stats.totalSizeEstimate}</Text>
              <Text variant="caption">Total Size</Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>About Offline Mode</Text>
          <Text variant="secondary" style={{ lineHeight: 20 }}>
            Previously viewed wiki pages and maps are cached for 24 hours. When offline, cached content is still available. A small indicator shows when you're viewing cached content.
          </Text>
        </Card>

        <Button
          title="Clear Expired Cache"
          variant="secondary"
          onPress={clearExpired}
          style={{ marginTop: 20 }}
        />

        <Button
          title="Clear All Cache"
          variant="ghost"
          onPress={handleClearAll}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  content: { padding: 24 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
});
