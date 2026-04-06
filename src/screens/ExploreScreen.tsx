import React from 'react';
import { View, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { GameSearchBar } from '../components/GameSearchBar';
import { useTheme } from '../theme/ThemeContext';
import { useGameSearch } from '../hooks/useGameSearch';
import { GAME_REGISTRY, type GameWikiConfig } from '../data/gameRegistry';
import type { Game } from '../types';

const FEATURED_WIKIS = Object.values(GAME_REGISTRY);

export default function ExploreScreen() {
  const { theme } = useTheme();
  const { query, results, loading, search } = useGameSearch();
  const navigation = useNavigation<any>();

  function handleGamePress(game: Game) {
    navigation.navigate('LibraryTab', { screen: 'GameDetail', params: { gameId: game.id } });
  }

  function handleWikiPress(config: GameWikiConfig) {
    navigation.navigate('LibraryTab', { screen: 'Wiki', params: { config } });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text variant="hero">Explore</Text>
        <Text variant="secondary" style={{ marginTop: 4 }}>Discover games and communities</Text>
      </View>

      <View style={styles.searchWrapper}>
        <GameSearchBar value={query} onChangeText={search} loading={loading} />
      </View>

      {/* Search results */}
      {query.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => handleGamePress(item)}
            >
              {item.coverUrl && <Image source={{ uri: item.coverUrl }} style={styles.resultCover} />}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>{item.title}</Text>
                <Text variant="caption">{item.releaseDate?.substring(0, 4)} — {item.genres.slice(0, 2).join(', ')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={!loading ? <Text variant="secondary" style={styles.empty}>No games found</Text> : null}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {/* Featured Fandom Wikis */}
          <Text variant="title" style={{ marginBottom: 12 }}>Popular Fandom Wikis</Text>
          {FEATURED_WIKIS.map((config) => (
            <TouchableOpacity
              key={config.wiki}
              style={[styles.wikiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => handleWikiPress(config)}
              activeOpacity={0.7}
            >
              <Ionicons name="book" size={24} color={theme.colors.primary} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{config.gameTitle}</Text>
                <Text variant="caption">{config.wiki}.fandom.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}

          {/* Game genres */}
          <Text variant="title" style={{ marginTop: 24, marginBottom: 12 }}>Browse by Genre</Text>
          <View style={styles.genreGrid}>
            {['RPG', 'Action', 'Adventure', 'Strategy', 'Shooter', 'Indie'].map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreChip, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => search(genre)}
              >
                <Text variant="body" style={{ fontWeight: '500' }}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  searchWrapper: { paddingHorizontal: 24, marginBottom: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  resultCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  resultCover: { width: 48, height: 64, borderRadius: 6 },
  wikiCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 10 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genreChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  empty: { textAlign: 'center', marginTop: 40 },
});
