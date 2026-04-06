import React from 'react';
import { View, FlatList, Image, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useLibrary, type LibraryGame } from '../hooks/useLibrary';
import { findWikiConfig } from '../data/gameRegistry';
import type { LibraryStackParamList } from '../types';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { allGames, loading, refresh } = useLibrary();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const playing = allGames.filter((g) => g.status === 'playing');
  const recent = allGames.slice(0, 5);

  function handleGamePress(game: LibraryGame) {
    navigation.navigate('LibraryTab', { screen: 'GameDetail', params: { gameId: game.gameId } });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />}
    >
      <View style={styles.header}>
        <Text variant="hero">Fan<Text variant="hero" style={{ color: theme.colors.primary }}>Mapper</Text></Text>
        <Text variant="secondary" style={{ marginTop: 4 }}>Your gaming dashboard</Text>
      </View>

      {/* Continue Playing */}
      {playing.length > 0 && (
        <View style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>Continue Playing</Text>
          <FlatList
            horizontal
            data={playing}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item }) => {
              const wikiConfig = findWikiConfig(item.title);
              return (
                <TouchableOpacity
                  style={[styles.playingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => handleGamePress(item)}
                  activeOpacity={0.7}
                >
                  {item.coverUrl ? (
                    <Image source={{ uri: item.coverUrl }} style={styles.playingCover} />
                  ) : (
                    <View style={[styles.playingCover, { backgroundColor: theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="game-controller" size={24} color={theme.colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.playingInfo}>
                    <Text variant="body" style={{ fontWeight: '600', fontSize: 13 }} numberOfLines={2}>{item.title}</Text>
                    <Text variant="caption" style={{ marginTop: 2 }}>
                      {Math.round(item.playtimeMinutes / 60)}h played
                    </Text>
                    <View style={styles.quickActions}>
                      {wikiConfig && (
                        <>
                          {wikiConfig.maps.length > 0 && (
                            <TouchableOpacity
                              style={[styles.quickBtn, { backgroundColor: theme.colors.primary + '20' }]}
                              onPress={() => navigation.navigate('LibraryTab', {
                                screen: 'Map',
                                params: { wiki: wikiConfig.wiki, mapName: wikiConfig.maps[0], gameTitle: wikiConfig.gameTitle },
                              })}
                            >
                              <Ionicons name="map" size={12} color={theme.colors.primary} />
                              <Text variant="caption" style={{ marginLeft: 3, color: theme.colors.primary, fontSize: 10 }}>Map</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.quickBtn, { backgroundColor: theme.colors.accent + '20' }]}
                            onPress={() => navigation.navigate('LibraryTab', {
                              screen: 'Wiki',
                              params: { config: wikiConfig },
                            })}
                          >
                            <Ionicons name="book" size={12} color={theme.colors.accent} />
                            <Text variant="caption" style={{ marginLeft: 3, color: theme.colors.accent, fontSize: 10 }}>Wiki</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text variant="title" style={styles.sectionTitle}>Recent Activity</Text>
        {recent.length > 0 ? (
          recent.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.activityRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleGamePress(game)}
            >
              <View style={[styles.statusDot, { backgroundColor: game.status === 'playing' ? theme.colors.primary : game.status === 'completed' ? theme.colors.success : theme.colors.xp }]} />
              <View style={{ flex: 1 }}>
                <Text variant="body" numberOfLines={1}>{game.title}</Text>
                <Text variant="caption">{game.status} — {Math.round(game.playtimeMinutes / 60)}h</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))
        ) : (
          <Card>
            <Text variant="secondary" style={{ textAlign: 'center' }}>
              No games yet. Add some from the Library tab!
            </Text>
          </Card>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  section: { marginTop: 8 },
  sectionTitle: { paddingHorizontal: 24, marginBottom: 12 },
  playingCard: { width: 180, borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  playingCover: { width: '100%', height: 100 },
  playingInfo: { padding: 10 },
  quickActions: { flexDirection: 'row', gap: 6, marginTop: 6 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
