import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { GAME_REGISTRY } from '../data/gameRegistry';
import { TouchableOpacity } from 'react-native';

export default function LegalScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12 }}>Legal & Attribution</Text>
      </View>

      <View style={styles.content}>
        {/* Wiki Attribution */}
        <Card>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Wiki Content Attribution</Text>
          <Text variant="secondary" style={{ lineHeight: 20, marginBottom: 12 }}>
            FanMapper displays content from Fandom community wikis. All wiki content is licensed under Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0).
          </Text>

          <TouchableOpacity onPress={() => Linking.openURL('https://creativecommons.org/licenses/by-sa/3.0/')}>
            <Text variant="body" style={{ color: theme.colors.primary }}>View CC BY-SA 3.0 License</Text>
          </TouchableOpacity>

          <Text variant="body" style={{ fontWeight: '600', marginTop: 20, marginBottom: 8 }}>Wikis Used</Text>
          {Object.values(GAME_REGISTRY).map((config) => (
            <TouchableOpacity
              key={config.wiki}
              style={styles.wikiLink}
              onPress={() => Linking.openURL(`https://${config.wiki}.fandom.com`)}
            >
              <Text variant="secondary">{config.gameTitle}</Text>
              <Text variant="caption" style={{ color: theme.colors.primary }}>{config.wiki}.fandom.com</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Trademark Disclaimer */}
        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Trademark Disclaimer</Text>
          <Text variant="secondary" style={{ lineHeight: 20 }}>
            All game names, logos, and artwork are trademarks of their respective owners. FanMapper is not affiliated with, endorsed by, or sponsored by any game publisher or developer.
            {'\n\n'}
            Game cover art is sourced from IGDB (via Twitch) and Steam under their respective terms of service.
            {'\n\n'}
            "PlayStation" and "PSN" are registered trademarks of Sony Interactive Entertainment. "Steam" is a registered trademark of Valve Corporation. "Xbox" is a registered trademark of Microsoft Corporation.
          </Text>
        </Card>

        {/* Open Source */}
        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Open Source</Text>
          <Text variant="secondary" style={{ lineHeight: 20 }}>
            FanMapper is free and open-source software licensed under GPLv3.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => Linking.openURL('https://github.com/funnypeter/fanmapper')}
          >
            <Text variant="body" style={{ color: theme.colors.primary }}>View Source on GitHub</Text>
          </TouchableOpacity>
        </Card>

        {/* Privacy & Terms */}
        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Privacy & Data</Text>
          <Text variant="secondary" style={{ lineHeight: 20 }}>
            FanMapper stores your data in Supabase (PostgreSQL). Game library data is synced to the cloud for backup. Wiki content is cached locally on your device.
            {'\n\n'}
            Platform credentials (Steam API key, PSN NPSSO token) are used only to fetch your data and are not shared with third parties.
          </Text>
        </Card>

        <View style={{ height: 60 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  content: { padding: 24 },
  wikiLink: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#30363D' },
});
