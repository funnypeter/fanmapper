import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { syncPSNLibrary } from '../services/psn';
import { TouchableOpacity } from 'react-native';

export default function LinkPSNScreen() {
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const navigation = useNavigation();
  const [npssoToken, setNpssoToken] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ imported: number; trophies: number } | null>(null);

  async function handleSync() {
    if (!user || !npssoToken.trim()) return;
    setSyncing(true);
    try {
      const res = await syncPSNLibrary(user.id, npssoToken.trim());
      setResult(res);
    } catch (err: any) {
      Alert.alert('Sync Failed', err.message || 'Check your NPSSO token and try again.');
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
        <Text variant="title" style={{ marginLeft: 12 }}>Link PlayStation</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color={theme.colors.warning} />
            <Text variant="caption" style={{ flex: 1, marginLeft: 8, color: theme.colors.warning }}>
              PSN uses an unofficial API. Your NPSSO token is never stored on our servers.
            </Text>
          </View>

          <Text variant="body" style={{ fontWeight: '600', marginTop: 16, marginBottom: 8 }}>How to get your NPSSO token:</Text>
          <Text variant="secondary" style={{ lineHeight: 20, marginBottom: 4 }}>
            1. Open a browser and sign in to playstation.com
          </Text>
          <Text variant="secondary" style={{ lineHeight: 20, marginBottom: 4 }}>
            2. Visit the NPSSO URL (tap below to copy)
          </Text>
          <Text variant="secondary" style={{ lineHeight: 20, marginBottom: 12 }}>
            3. Copy the npsso value from the JSON response
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://ca.account.sony.com/api/v1/ssocookie')}
            style={[styles.urlBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
          >
            <Text variant="caption" style={{ color: theme.colors.primary, fontFamily: 'monospace' }} numberOfLines={1}>
              ca.account.sony.com/api/v1/ssocookie
            </Text>
            <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={npssoToken}
            onChangeText={setNpssoToken}
            placeholder="Paste your NPSSO token here"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!result && (
            <Button
              title={syncing ? 'Syncing...' : 'Import Trophies & Games'}
              onPress={handleSync}
              disabled={syncing || npssoToken.length < 20}
              style={{ marginTop: 12 }}
            />
          )}

          {syncing && (
            <View style={styles.syncStatus}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text variant="secondary" style={{ marginLeft: 12 }}>
                Importing... this takes a while due to PSN rate limits (~5 sec per game).
              </Text>
            </View>
          )}

          {result && (
            <View style={[styles.resultBox, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
              <Text variant="body" style={{ fontWeight: '600', marginTop: 8 }}>Import Complete!</Text>
              <Text variant="secondary" style={{ marginTop: 4 }}>
                {result.imported} games, {result.trophies} trophies earned
              </Text>
              <Button title="Done" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
            </View>
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  content: { padding: 24 },
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#FDCB6E15' },
  urlBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14 },
  syncStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  resultBox: { alignItems: 'center', borderRadius: 12, padding: 20, marginTop: 16 },
});
