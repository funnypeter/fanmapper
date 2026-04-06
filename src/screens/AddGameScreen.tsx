import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { GameSearchBar } from '../components/GameSearchBar';
import { useTheme } from '../theme/ThemeContext';
import { useGameSearch } from '../hooks/useGameSearch';
import { useLibrary } from '../hooks/useLibrary';
import { supabase } from '../services/supabase';
import type { Game, GameStatus } from '../types';
import { TouchableOpacity } from 'react-native';

const STATUSES: { value: GameStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'playing', label: 'Playing', icon: 'play-circle' },
  { value: 'backlog', label: 'Backlog', icon: 'time' },
  { value: 'wishlist', label: 'Wishlist', icon: 'heart' },
  { value: 'completed', label: 'Completed', icon: 'checkmark-circle' },
];

export default function AddGameScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { query, results, loading, search } = useGameSearch();
  const { addGame } = useLibrary();
  const [adding, setAdding] = useState<string | null>(null);

  async function handleAdd(game: Game, status: GameStatus) {
    setAdding(game.id);
    try {
      // Ensure game exists in Supabase games table
      await supabase.from('games').upsert({
        id: game.id,
        igdb_id: game.igdbId || null,
        title: game.title,
        cover_url: game.coverUrl,
        genres: game.genres,
        platforms: game.platforms,
        release_date: game.releaseDate,
        summary: game.summary,
      });

      await addGame(game.id, status);
      Alert.alert('Added!', `${game.title} added as ${status}`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add game');
    } finally {
      setAdding(null);
    }
  }

  function renderResult({ item }: { item: Game }) {
    return (
      <View style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>{item.title}</Text>
        {item.releaseDate && <Text variant="caption">{item.releaseDate.substring(0, 4)}</Text>}
        <View style={styles.statusButtons}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.statusBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => handleAdd(item, s.value)}
              disabled={adding === item.id}
            >
              <Ionicons name={s.icon} size={16} color={theme.colors.primary} />
              <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.primary }}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12 }}>Add Game</Text>
      </View>

      <View style={styles.searchWrapper}>
        <GameSearchBar value={query} onChangeText={search} loading={loading} placeholder="Search for a game..." />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  searchWrapper: { paddingHorizontal: 24, marginBottom: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  resultCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  empty: { textAlign: 'center', marginTop: 40 },
});
