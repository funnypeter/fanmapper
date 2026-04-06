import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface AchievementDisplay {
  id: string;
  name: string;
  description: string | null;
  isEarned: boolean;
  earnedAt: string | null;
  globalUnlockPercent: number | null;
}

export default function AchievementsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ Achievements: { gameId: string } }, 'Achievements'>>();
  const { user } = useAuthContext();
  const [achievements, setAchievements] = useState<AchievementDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'unearned'>('all');

  useEffect(() => {
    async function fetch() {
      if (!user) return;

      const { data: achs } = await supabase
        .from('achievements')
        .select('*')
        .eq('game_id', route.params.gameId);

      if (!achs || achs.length === 0) {
        setLoading(false);
        return;
      }

      const achIds = achs.map((a: any) => a.id);
      const { data: userAchs } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .in('achievement_id', achIds);

      const userAchMap = new Map((userAchs ?? []).map((ua: any) => [ua.achievement_id, ua]));

      const mapped: AchievementDisplay[] = achs.map((a: any) => {
        const ua = userAchMap.get(a.id);
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          isEarned: ua?.is_earned ?? false,
          earnedAt: ua?.earned_at ?? null,
          globalUnlockPercent: a.global_unlock_percent,
        };
      });

      // Sort: earned first, then by name
      mapped.sort((a, b) => {
        if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setAchievements(mapped);
      setLoading(false);
    }
    fetch();
  }, [user, route.params.gameId]);

  const earned = achievements.filter((a) => a.isEarned).length;
  const total = achievements.length;
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

  const filtered = achievements.filter((a) => {
    if (filter === 'earned') return a.isEarned;
    if (filter === 'unearned') return !a.isEarned;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="title" style={{ marginLeft: 12 }}>Achievements</Text>
      </View>

      {/* Progress bar */}
      <Card style={{ marginHorizontal: 24 }}>
        <View style={styles.progressHeader}>
          <Text variant="body" style={{ fontWeight: '600' }}>{earned}/{total}</Text>
          <Text variant="caption">{percent}% complete</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceElevated }]}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: theme.colors.success }]} />
        </View>
      </Card>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'earned', 'unearned'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, { backgroundColor: filter === f ? theme.colors.primary : theme.colors.surface, borderColor: filter === f ? theme.colors.primary : theme.colors.border }]}
          >
            <Text variant="caption" style={{ color: filter === f ? '#FFF' : theme.colors.textSecondary }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.achCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: item.isEarned ? 1 : 0.5 }]}>
            <Ionicons
              name={item.isEarned ? 'trophy' : 'trophy-outline'}
              size={24}
              color={item.isEarned ? theme.colors.xp : theme.colors.textMuted}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '500' }}>{item.name}</Text>
              {item.description && <Text variant="caption">{item.description}</Text>}
              {item.isEarned && item.earnedAt && (
                <Text variant="caption" style={{ color: theme.colors.success, marginTop: 2 }}>
                  Earned {new Date(item.earnedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text variant="secondary" style={styles.empty}>No achievements found</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  filters: { flexDirection: 'row', paddingHorizontal: 24, marginVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  achCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
});
