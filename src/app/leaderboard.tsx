import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'http://localhost:8000';

export default function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.crown}>🏆</Text>
        <Text style={styles.title}>Монголын эрхэм хосууд</Text>
        <Text style={styles.sub}>Тог оноогоор жагсаалт</Text>

        {loading ? (
          <ActivityIndicator color="#F5A623" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.podium}>
            {podiumOrder.map((item, i) => (
              <View key={i} style={[styles.podiumItem, item?.rank === 1 && styles.podiumFirst]}>
                {item?.rank === 1 && <Text style={styles.crownSmall}>👑</Text>}
                <Text style={styles.podiumRank}>
                  {item?.rank === 1 ? '1st' : item?.rank === 2 ? '2nd' : '3rd'}
                </Text>
                <Text style={styles.podiumName}>{item?.members}</Text>
                <Text style={styles.podiumPts}>{item?.tog_total}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.list}>
        {rest.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowNum}>{item.rank}</Text>
            <View style={styles.rowAvatar}>
              <Text style={styles.rowAvatarText}>{item.members?.charAt(0)}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.members}</Text>
              <Text style={styles.rowTasks}>{item.tasks_completed} task биелүүлсэн</Text>
            </View>
            <Text style={styles.rowScore}>{item.tog_total} ⚡</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: {
    backgroundColor: '#1A1035', padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  crown: { fontSize: 36, marginBottom: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  podium: { flexDirection: 'row', marginTop: 20, gap: 8, alignItems: 'flex-end' },
  podiumItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 10, width: 100, alignItems: 'center',
  },
  podiumFirst: {
    backgroundColor: 'rgba(245,166,35,0.2)',
    borderWidth: 0.5, borderColor: 'rgba(245,166,35,0.4)',
  },
  crownSmall: { fontSize: 16 },
  podiumRank: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  podiumName: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  podiumPts: { color: '#F5A623', fontSize: 16, fontWeight: '800', marginTop: 4 },
  list: { padding: 16 },
  row: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E8E2F8',
  },
  rowNum: { fontSize: 13, fontWeight: '800', color: '#8A85A0', width: 20 },
  rowAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6C3DE8', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  rowAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, fontWeight: '700', color: '#1A1035' },
  rowTasks: { fontSize: 11, color: '#8A85A0', marginTop: 2 },
  rowScore: { fontSize: 14, fontWeight: '800', color: '#6C3DE8' },
});