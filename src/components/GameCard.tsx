import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => onPress(game)}
      activeOpacity={0.7}
    >
      {game.coverUrl ? (
        <Image source={{ uri: game.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.placeholder, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text variant="caption">No Art</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={2}>
          {game.title}
        </Text>
        {game.releaseDate && (
          <Text variant="caption" style={{ marginTop: 2 }}>
            {game.releaseDate.substring(0, 4)}
          </Text>
        )}
        {game.genres.length > 0 && (
          <Text variant="caption" style={{ marginTop: 4 }} numberOfLines={1}>
            {game.genres.slice(0, 3).join(' / ')}
          </Text>
        )}
        {game.platforms.length > 0 && (
          <Text variant="caption" style={{ marginTop: 2, color: theme.colors.primaryLight }} numberOfLines={1}>
            {game.platforms.slice(0, 3).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cover: {
    width: 80,
    height: 110,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
});
