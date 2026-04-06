import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';

interface AttributionFooterProps {
  wikiName: string;
  pageTitle?: string;
}

export function AttributionFooter({ wikiName, pageTitle }: AttributionFooterProps) {
  const { theme } = useTheme();

  const sourceUrl = pageTitle
    ? `https://${wikiName}.fandom.com/wiki/${encodeURIComponent(pageTitle)}`
    : `https://${wikiName}.fandom.com`;

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.border }]}>
      <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10 }}>
        Content from{' '}
        <Text
          variant="caption"
          style={{ color: theme.colors.primary, fontSize: 10 }}
          onPress={() => Linking.openURL(sourceUrl)}
        >
          {wikiName}.fandom.com{pageTitle ? `/${pageTitle}` : ''}
        </Text>
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://creativecommons.org/licenses/by-sa/3.0/')}>
        <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10 }}>
          Licensed under CC BY-SA 3.0
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    paddingTop: 10,
    marginTop: 12,
  },
});
