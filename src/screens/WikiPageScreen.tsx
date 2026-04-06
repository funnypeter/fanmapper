import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { WikiContentCard } from '../components/WikiContentCard';
import { useTheme } from '../theme/ThemeContext';
import { fetchWikitext, fetchPage } from '../services/fandom';
import { parseInfobox } from '../services/wikitextParser';
import type { InfoboxData } from '../services/wikitextParser';
import type { GameWikiConfig } from '../data/gameRegistry';
import { TouchableOpacity } from 'react-native';

export default function WikiPageScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ WikiPage: { wiki: string; title: string; config: GameWikiConfig } }, 'WikiPage'>>();
  const { wiki, title, config } = route.params;

  const [infobox, setInfobox] = useState<InfoboxData | null>(null);
  const [sections, setSections] = useState<{ title: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch wikitext for infobox parsing
        const wikitext = await fetchWikitext(wiki, title);
        if (wikitext) {
          const ib = parseInfobox(wikitext);
          setInfobox(ib);

          // Parse sections from wikitext
          const wtf = await import('wtf_wikipedia');
          const doc = wtf.default(wikitext);
          const secs = doc.sections().map((s: any) => ({
            title: s.title() ?? '',
            text: s.text() ?? '',
          })).filter((s: any) => s.text.trim().length > 0);
          setSections(secs);
        }
      } catch (err) {
        console.error('Wiki page load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [wiki, title]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Infobox card */}
        {infobox && (
          <WikiContentCard infobox={infobox} wikiName={wiki} pageTitle={title} />
        )}

        {/* Text sections */}
        {sections.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.title && (
              <Text variant="title" style={{ marginBottom: 8 }}>{section.title}</Text>
            )}
            <Text variant="body" style={{ lineHeight: 22, color: theme.colors.textSecondary }}>
              {section.text}
            </Text>
          </View>
        ))}

        {!infobox && sections.length === 0 && (
          <Text variant="secondary" style={styles.empty}>No content available for this page.</Text>
        )}

        {/* Attribution footer */}
        <View style={[styles.attribution, { borderTopColor: theme.colors.border }]}>
          <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10 }}>
            Content from {wiki}.fandom.com/wiki/{encodeURIComponent(title)}
          </Text>
          <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10 }}>
            Licensed under CC BY-SA 3.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  content: { padding: 24 },
  section: { marginBottom: 20 },
  empty: { textAlign: 'center', marginTop: 40 },
  attribution: { borderTopWidth: 0.5, paddingTop: 16, marginTop: 24, marginBottom: 40 },
});
