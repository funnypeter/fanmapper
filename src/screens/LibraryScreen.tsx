import React from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { useLibrary, type LibraryGame } from '../hooks/useLibrary';
import type { GameStatus, LibraryStackParamList } from '../types';

const STATUS_LABELS: Record<GameStatus | 'all', string> = {
  all: 'All',
  playing: 'Playing',
  completed: 'Completed',
  backlog: 'Backlog',
  wishlist: 'Wishlist',
  dropped: 'Dropped',
};

const STATUS_COLORS: Record<GameStatus, string> = {
  playing: '#6C5CE7',
  completed: '#00B894',
  backlog: '#FDCB6E',
  wishlist: '#74B9FF',
  dropped: '#FF6B6B',
};

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { games, loading, filter, setFilter, refresh } = useLibrary();
  const navigation = useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();

  function renderFilterChip(status: GameStatus | 'all') {
    const active = filter === status;
    return (
      <TouchableOpacity
        key={status}
        onPress={() => setFilter(status)}
        style={[
          styles.chip,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surface,
            borderColor: active ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Text
          variant="caption"
          style={{ color: active ? '#FFF' : theme.colors.textSecondary, fontWeight: active ? '600' : '400' }}
        >
          {STATUS_LABELS[status]}
        </Text>
      </TouchableOpacity>
    );
  }

  function renderGame({ item }: { item: LibraryGame }) {
    const statusColor = STATUS_COLORS[item.status];
    return (
      <TouchableOpacity
        style={[styles.gameCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => navigation.navigate('GameDetail', { gameId: item.gameId })}
        activeOpacity={0.7}
      >
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="game-controller-outline" size={24} color={theme.colors.textMuted} />
          </View>
        )}
        <View style={styles.gameInfo}>
          <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={2}>{item.title}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text variant="caption">{STATUS_LABELS[item.status]}</Text>
          </View>
          {item.playtimeMinutes > 0 && (
            <Text variant="caption" style={{ marginTop: 2 }}>
              {Math.round(item.playtimeMinutes / 60)}h played
            </Text>
          )}
          {item.rating && (
            <Text variant="caption" style={{ color: theme.colors.xp, marginTop: 2 }}>
              {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="hero">Library</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddGame')}>
            <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text variant="caption" style={{ marginTop: 4 }}>
          {games.length} game{games.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filters}>
        {(Object.keys(STATUS_LABELS) as (GameStatus | 'all')[]).map(renderFilterChip)}
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGame}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="game-controller-outline" size={48} color={theme.colors.textMuted} />
              <Text variant="secondary" style={{ marginTop: 12, textAlign: 'center' }}>
                No games yet. Tap + to add your first game!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 12, gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  gameCard: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  cover: { width: 80, height: 110 },
  gameInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
});
