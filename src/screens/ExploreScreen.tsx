import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from '../components/Text';
import { GameSearchBar } from '../components/GameSearchBar';
import { GameCard } from '../components/GameCard';
import { useTheme } from '../theme/ThemeContext';
import { useGameSearch } from '../hooks/useGameSearch';
import type { Game } from '../types';

export default function ExploreScreen() {
  const { theme } = useTheme();
  const { query, results, loading, error, search } = useGameSearch();

  function handleGamePress(game: Game) {
    // TODO: navigate to GameDetail
    console.log('Selected game:', game.title);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text variant="hero">Explore</Text>
        <Text variant="secondary" style={{ marginTop: theme.spacing.xs }}>
          Discover games and communities
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <GameSearchBar value={query} onChangeText={search} loading={loading} />
      </View>

      {error && (
        <Text variant="caption" style={{ color: theme.colors.error, paddingHorizontal: 24 }}>
          {error}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} onPress={handleGamePress} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length > 0 && !loading ? (
            <Text variant="secondary" style={styles.empty}>No games found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  searchWrapper: { paddingHorizontal: 24, marginBottom: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  empty: { textAlign: 'center', marginTop: 40 },
});
