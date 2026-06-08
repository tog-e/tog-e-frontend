import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

const RANK_COLORS = ['#F5A623', '#C0C0C0', '#CD7F32'];
const RANK_LABELS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API}/api/leaderboard/`);
      const data = await res.json();
      setBoard(data.leaderboard || []);
    } catch (e) {}
    setLoading(false);
  };

  const topThree = board.slice(0, 3);
  const rest = board.slice(3);
  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 110;
    if (rank === 2) return 85;
    return 70;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Тэргүүлэгчид 🏆</Text>
        <Text style={styles.sub}>Монголын хамгийн эрхэм хосууд</Text>

        {loading ? (
          <ActivityIndicator color="#F5A623" style={{ marginTop: 40, marginBottom: 20 }} />
        ) : topThree.length > 0 ? (
          <View style={styles.podiumContainer}>
            {podiumOrder.map((item, i) => {
              if (!item) return null;
              const isFirst = item.rank === 1;
              const rankIdx = item.rank - 1;
              return (
                <View key={i} style={styles.podiumCol}>
                  {isFirst && <Text style={styles.crownEmoji}>👑</Text>}
                  <View style={styles.podiumAvatar}>
                    <Text style={styles.podiumAvatarText}>{item.members?.charAt(0)}</Text>
                  </View>
                  <Text style={styles.podiumNameText} numberOfLines={1}>{item.members}</Text>
                  <Text style={styles.podiumPtsText}>{item.tog_total} ⚡</Text>
                  <View style={[styles.podiumBlock, {
                    height: getPodiumHeight(item.rank),
                    backgroundColor: RANK_COLORS[rankIdx] + '30',
                    borderColor: RANK_COLORS[rankIdx] + '60',
                  }]}>
                    <Text style={[styles.podiumRankEmoji]}>{RANK_LABELS[rankIdx]}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      {/* LIST */}
      <View style={styles.list}>
        {rest.length > 0 && (
          <Text style={styles.listLabel}>БУСАД ХОСУУД</Text>
        )}
        {rest.map((item, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.rowRank}>
              <Text style={styles.rowNum}>{item.rank}</Text>
            </View>
            <View style={styles.rowAvatar}>
              <Text style={styles.rowAvatarText}>{item.members?.charAt(0)}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.members}</Text>
              <Text style={styles.rowTasks}>{item.tasks_completed} task биелүүлсэн</Text>
            </View>
            <View style={styles.rowScoreBox}>
              <Text style={styles.rowScore}>{item.tog_total}</Text>
              <Text style={styles.rowScoreLabel}>⚡ тог</Text>
            </View>
          </View>
        ))}

        {!loading && board.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏅</Text>
            <Text style={styles.emptyText}>Одоохондоо жагсаалт хоосон байна</Text>
            <Text style={styles.emptySub}>Даалгавар биелүүлж тэргүүлээрэй!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A2E' },
  header: {
    backgroundColor: '#1A1040',
    padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.2)',
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, marginBottom: 24 },

  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingBottom: 8 },
  podiumCol: { flex: 1, alignItems: 'center' },
  crownEmoji: { fontSize: 20, marginBottom: 4 },
  podiumAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(108,61,232,0.4)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(108,61,232,0.6)',
    marginBottom: 6,
  },
  podiumAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  podiumNameText: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 2, paddingHorizontal: 4 },
  podiumPtsText: { color: '#F5A623', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  podiumBlock: {
    width: '100%', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  podiumRankEmoji: { fontSize: 24 },

  list: { padding: 16 },
  listLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 12 },
  row: {
    backgroundColor: '#1A1040', borderRadius: 16, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  rowRank: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  rowNum: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  rowAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(108,61,232,0.4)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.5)',
  },
  rowAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  rowTasks: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  rowScoreBox: { alignItems: 'flex-end' },
  rowScore: { fontSize: 16, fontWeight: '800', color: '#F5A623' },
  rowScoreLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});