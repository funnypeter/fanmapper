import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuthContext();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Sign out failed');
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.content}>
        <Text variant="hero">Profile</Text>

        <Card style={{ marginTop: 24 }}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="person" size={28} color="#FFF" />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>
                {user?.email ?? 'Unknown'}
              </Text>
              <Text variant="caption">
                Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Gaming Stats</Text>
          <View style={styles.statRow}>
            <StatItem label="Games" value="0" color={theme.colors.primary} />
            <StatItem label="Playtime" value="0h" color={theme.colors.accent} />
            <StatItem label="Completed" value="0%" color={theme.colors.success} />
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Linked Platforms</Text>
          <Text variant="secondary">No platforms linked yet</Text>
        </Card>

        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleSignOut}
          style={{ marginTop: 24 }}
        />
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text variant="title" style={{ color }}>{value}</Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
});
