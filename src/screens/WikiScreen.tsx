import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { GameSearchBar } from '../components/GameSearchBar';
import { useTheme } from '../theme/ThemeContext';
import { searchWiki, getCategory } from '../services/fandom';
import type { GameWikiConfig } from '../data/gameRegistry';

type WikiSection = 'characters' | 'items' | 'weapons' | 'locations' | 'bosses' | 'quests';

const SECTION_ICONS: Record<WikiSection, keyof typeof Ionicons.glyphMap> = {
  characters: 'people',
  items: 'cube',
  weapons: 'flash',
  locations: 'map',
  bosses: 'skull',
  quests: 'book',
};

export default function WikiScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ Wiki: { config: GameWikiConfig } }, 'Wiki'>>();
  const config = route.params.config;

  const [activeSection, setActiveSection] = useState<WikiSection | 'search'>('characters');
  const [pages, setPages] = useState<{ title: string; pageId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const availableSections = Object.entries(config.categories)
    .filter(([, v]) => !!v)
    .map(([k]) => k as WikiSection);

  useEffect(() => {
    if (activeSection === 'search') return;
    loadCategory(activeSection);
  }, [activeSection]);

  async function loadCategory(section: WikiSection) {
    const categoryName = config.categories[section];
    if (!categoryName) return;

    setLoading(true);
    try {
      const results = await getCategory(config.wiki, categoryName, 200);
      setPages(results);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setActiveSection('characters');
      return;
    }
    setActiveSection('search');
    setSearching(true);
    try {
      const results = await searchWiki(config.wiki, query, 30);
      setPages(results.map((r) => ({ title: r.title, pageId: r.pageId })));
    } catch {
      setPages([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12, flex: 1 }} numberOfLines={1}>
          {config.gameTitle} Wiki
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <GameSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          loading={searching}
          placeholder={`Search ${config.gameTitle} wiki...`}
        />
      </View>

      {/* Section tabs */}
      <View style={styles.tabs}>
        {availableSections.map((section) => (
          <TouchableOpacity
            key={section}
            onPress={() => { setActiveSection(section); setSearchQuery(''); }}
            style={[
              styles.tab,
              {
                backgroundColor: activeSection === section ? theme.colors.primary : theme.colors.surface,
                borderColor: activeSection === section ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name={SECTION_ICONS[section] ?? 'list'}
              size={14}
              color={activeSection === section ? '#FFF' : theme.colors.textSecondary}
            />
            <Text
              variant="caption"
              style={{
                marginLeft: 4,
                color: activeSection === section ? '#FFF' : theme.colors.textSecondary,
                fontWeight: activeSection === section ? '600' : '400',
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Page list */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(item) => String(item.pageId)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pageItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => navigation.navigate('WikiPage', { wiki: config.wiki, title: item.title, config })}
            >
              <Text variant="body">{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text variant="secondary" style={styles.empty}>No pages found</Text>
          }
        />
      )}

      {/* CC BY-SA Attribution */}
      <View style={[styles.attribution, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10, textAlign: 'center' }}>
          Wiki content from {config.wiki}.fandom.com — Licensed under CC BY-SA 3.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  searchWrapper: { paddingHorizontal: 24, marginBottom: 12 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  list: { paddingHorizontal: 24, paddingBottom: 60 },
  pageItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  empty: { textAlign: 'center', marginTop: 40 },
  attribution: { padding: 10, borderTopWidth: 0.5 },
});
