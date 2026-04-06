import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeContext';
import type { InfoboxData } from '../services/wikitextParser';

interface WikiContentCardProps {
  infobox: InfoboxData;
  wikiName: string;
  pageTitle: string;
}

export function WikiContentCard({ infobox, wikiName, pageTitle }: WikiContentCardProps) {
  const { theme } = useTheme();

  // Filter out empty/internal fields
  const displayFields = Object.entries(infobox.fields).filter(
    ([key, val]) => val && val.trim().length > 0 && !key.startsWith('_')
  );

  return (
    <Card elevated style={{ marginBottom: 16 }}>
      {/* Image */}
      {infobox.image && (
        <Image source={{ uri: infobox.image }} style={styles.image} resizeMode="contain" />
      )}

      {/* Title */}
      {infobox.fields.name && (
        <Text variant="title" style={{ marginBottom: 8 }}>{infobox.fields.name}</Text>
      )}

      {/* Fields */}
      {displayFields.map(([key, value]) => {
        if (key === 'name' || key === 'image') return null;
        return (
          <View key={key} style={[styles.fieldRow, { borderBottomColor: theme.colors.border }]}>
            <Text variant="caption" style={styles.fieldLabel}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
            <Text variant="body" style={styles.fieldValue}>{value}</Text>
          </View>
        );
      })}

      {/* Attribution */}
      <View style={[styles.attribution, { borderTopColor: theme.colors.border }]}>
        <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 10 }}>
          Content from {wikiName}.fandom.com/{pageTitle} — Licensed under CC BY-SA 3.0
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  fieldRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5 },
  fieldLabel: { width: 100, fontWeight: '600', textTransform: 'capitalize' },
  fieldValue: { flex: 1 },
  attribution: { borderTopWidth: 0.5, paddingTop: 10, marginTop: 12 },
});
