import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getSteamProfile, syncSteamLibrary, type SteamProfile } from '../services/steam';
import { TouchableOpacity } from 'react-native';

export default function LinkSteamScreen() {
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const navigation = useNavigation();
  const [steamId, setSteamId] = useState('');
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ imported: number; achievements: number } | null>(null);

  async function handleLookup() {
    if (!steamId.trim()) return;
    setLookingUp(true);
    setProfile(null);
    try {
      const p = await getSteamProfile(steamId.trim());
      setProfile(p);
    } catch (err: any) {
      Alert.alert('Not Found', 'Could not find that Steam ID. Make sure it\'s a SteamID64 (17 digits).');
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSync() {
    if (!user || !profile) return;
    setSyncing(true);
    try {
      const res = await syncSteamLibrary(user.id, profile.steamId);
      setResult(res);
    } catch (err: any) {
      Alert.alert('Sync Failed', err.message || 'Something went wrong');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12 }}>Link Steam</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>Enter your SteamID64</Text>
          <Text variant="caption" style={{ marginBottom: 16 }}>
            Find it at steamid.io — it's a 17-digit number like 76561198011775992
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={steamId}
            onChangeText={setSteamId}
            placeholder="76561198011775992"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            maxLength={17}
          />

          <Button
            title={lookingUp ? 'Looking up...' : 'Look Up'}
            onPress={handleLookup}
            disabled={lookingUp || steamId.length < 17}
            style={{ marginTop: 12 }}
          />
        </Card>

        {profile && (
          <Card style={{ marginTop: 16 }}>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="logo-steam" size={24} color="#FFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{profile.personaName}</Text>
                <Text variant="caption">{profile.steamId}</Text>
              </View>
            </View>

            {!result && (
              <Button
                title={syncing ? 'Syncing...' : 'Import Games & Achievements'}
                onPress={handleSync}
                disabled={syncing}
                style={{ marginTop: 16 }}
              />
            )}

            {syncing && (
              <View style={styles.syncStatus}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text variant="secondary" style={{ marginLeft: 12 }}>
                  Importing your Steam library... this may take a few minutes.
                </Text>
              </View>
            )}

            {result && (
              <View style={[styles.resultBox, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
                <Text variant="body" style={{ fontWeight: '600', marginTop: 8 }}>
                  Import Complete!
                </Text>
                <Text variant="secondary" style={{ marginTop: 4 }}>
                  {result.imported} games, {result.achievements} achievements earned
                </Text>
                <Button title="Done" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
              </View>
            )}
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  content: { padding: 24 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, letterSpacing: 1, textAlign: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  syncStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  resultBox: { alignItems: 'center', borderRadius: 12, padding: 20, marginTop: 16 },
});
