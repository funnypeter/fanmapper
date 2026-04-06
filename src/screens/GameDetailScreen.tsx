import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { useLibrary } from '../hooks/useLibrary';
import { findWikiConfig } from '../data/gameRegistry';
import type { GameStatus, LibraryStackParamList } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const STATUSES: GameStatus[] = ['playing', 'backlog', 'wishlist', 'completed', 'dropped'];

export default function GameDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<LibraryStackParamList, 'GameDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const { allGames, updateGame, removeGame } = useLibrary();

  const game = allGames.find((g) => g.gameId === route.params.gameId);

  const [editingPlaytime, setEditingPlaytime] = useState(false);
  const [playtimeInput, setPlaytimeInput] = useState('');

  if (!game) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="secondary">Game not found</Text>
      </View>
    );
  }

  async function handleStatusChange(status: GameStatus) {
    try {
      await updateGame(game!.gameId, {
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      } as any);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleRating(rating: number) {
    try {
      await updateGame(game!.gameId, { rating });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handlePlaytimeSave() {
    const hours = parseFloat(playtimeInput);
    if (isNaN(hours) || hours < 0) return;
    try {
      await updateGame(game!.gameId, { playtime_minutes: Math.round(hours * 60) });
      setEditingPlaytime(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleRemove() {
    Alert.alert('Remove Game', `Remove ${game!.title} from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await removeGame(game!.gameId);
          navigation.goBack();
        }
      },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Hero */}
      {game.coverUrl && (
        <Image source={{ uri: game.coverUrl }} style={styles.hero} resizeMode="cover" />
      )}

      <View style={styles.content}>
        <Text variant="hero">{game.title}</Text>
        {game.genres.length > 0 && (
          <Text variant="caption" style={{ marginTop: 4 }}>{game.genres.join(' / ')}</Text>
        )}

        {/* Quick links */}
        {(() => {
          const wikiConfig = findWikiConfig(game.title);
          if (!wikiConfig) return null;
          return (
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={[styles.quickLink, { backgroundColor: theme.colors.primary + '15' }]}
                onPress={() => navigation.navigate('Wiki', { config: wikiConfig })}
              >
                <Ionicons name="book" size={20} color={theme.colors.primary} />
                <Text variant="caption" style={{ marginTop: 4, color: theme.colors.primary, fontWeight: '600' }}>Wiki</Text>
              </TouchableOpacity>
              {wikiConfig.maps.length > 0 && (
                <TouchableOpacity
                  style={[styles.quickLink, { backgroundColor: theme.colors.accent + '15' }]}
                  onPress={() => navigation.navigate('Map', { wiki: wikiConfig.wiki, mapName: wikiConfig.maps[0], gameTitle: wikiConfig.gameTitle })}
                >
                  <Ionicons name="map" size={20} color={theme.colors.accent} />
                  <Text variant="caption" style={{ marginTop: 4, color: theme.colors.accent, fontWeight: '600' }}>Map</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.quickLink, { backgroundColor: theme.colors.xp + '15' }]}
                onPress={() => navigation.navigate('Achievements', { gameId: game.gameId })}
              >
                <Ionicons name="trophy" size={20} color={theme.colors.xp} />
                <Text variant="caption" style={{ marginTop: 4, color: theme.colors.xp, fontWeight: '600' }}>Trophies</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Status picker */}
        <Card style={{ marginTop: 20 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleStatusChange(s)}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: game.status === s ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: game.status === s ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text variant="caption" style={{ color: game.status === s ? '#FFF' : theme.colors.textSecondary, fontWeight: '500' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Playtime */}
        <Card style={{ marginTop: 12 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>Playtime</Text>
          {editingPlaytime ? (
            <View style={styles.playtimeEdit}>
              <TextInput
                style={[styles.playtimeInput, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={playtimeInput}
                onChangeText={setPlaytimeInput}
                placeholder="Hours"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Button title="Save" onPress={handlePlaytimeSave} style={{ marginLeft: 8 }} />
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setPlaytimeInput(String(Math.round(game.playtimeMinutes / 60 * 10) / 10)); setEditingPlaytime(true); }}>
              <Text variant="title" style={{ color: theme.colors.accent }}>
                {Math.round(game.playtimeMinutes / 60 * 10) / 10}h
              </Text>
              <Text variant="caption">Tap to update</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Rating */}
        <Card style={{ marginTop: 12 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>Rating</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => handleRating(n)}>
                <Ionicons
                  name={n <= (game.rating ?? 0) ? 'star' : 'star-outline'}
                  size={32}
                  color={theme.colors.xp}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Remove */}
        <Button
          title="Remove from Library"
          variant="ghost"
          onPress={handleRemove}
          style={{ marginTop: 24, marginBottom: 40 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 56, left: 20, zIndex: 10 },
  hero: { width: '100%', height: 250 },
  content: { padding: 24 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickLinks: { flexDirection: 'row', gap: 12, marginTop: 16 },
  quickLink: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  statusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  playtimeEdit: { flexDirection: 'row', alignItems: 'center' },
  playtimeInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
});
