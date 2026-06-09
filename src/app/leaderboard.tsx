import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

const BADGES = [
  { emoji: '👑', label: 'Үнэнч', color: '#FBBF24' },
  { emoji: '💪', label: 'Эерэг', color: '#F472B6' },
  { emoji: '🌊', label: 'Өсөн дэвшилтэт', color: '#60A5FA' },
  { emoji: '⚡', label: 'Хүчирхэг', color: '#A78BFA' },
  { emoji: '🏆', label: 'Шилдэг', color: '#34D399' },
];

const RANK_COLORS = ['#FBBF24', '#C0C0C0', '#CD7F32'];
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
    } catch {}
    setLoading(false);
  };

  const topThree = board.slice(0, 3);
  const rest = board.slice(3);
  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  const getPodiumHeight = (rank: number) => rank === 1 ? 110 : rank === 2 ? 85 : 70;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* BIG BACKGROUND TROPHY */}
      <View style={styles.bgTrophyWrap} pointerEvents="none">
        <Text style={styles.bgTrophy}>🏆</Text>
      </View>

      {/* HEADER */}
      <LinearGradient colors={['#1A0A3E', '#0D0620', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Тэргүүлэгчид</Text>
            <Text style={styles.sub}>Монголын хамгийн эерэг хос</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Шууд</Text>
          </View>
        </View>

        {/* BADGES — туг хэлбэрээр дээрээс унжиж байгаа мэт */}
        <View style={styles.badgesRow}>
          {BADGES.map((badge, i) => (
            <View key={i} style={styles.badgeFlagWrap}>
              {/* String/rope */}
              <View style={[styles.badgeRope, { backgroundColor: badge.color + '60' }]} />
              {/* Flag */}
              <LinearGradient
                colors={[badge.color + '35', badge.color + '15']}
                style={[styles.badgeFlag, { borderColor: badge.color + '50' }]}
              >
                <Text style={styles.badgeFlagEmoji}>{badge.emoji}</Text>
                <Text style={[styles.badgeFlagLabel, { color: badge.color }]}>{badge.label}</Text>
                {/* Shadow at bottom */}
                <LinearGradient
                  colors={['transparent', badge.color + '20']}
                  style={styles.badgeFlagShadow}
                />
              </LinearGradient>
              {/* Bottom triangle point */}
              <View style={[styles.badgeFlagPoint, { borderTopColor: badge.color + '35' }]} />
            </View>
          ))}
        </View>

        {/* PODIUM */}
        {loading ? (
          <ActivityIndicator color="#FBBF24" style={{ marginVertical: 40 }} />
        ) : topThree.length > 0 ? (
          <View style={styles.podiumContainer}>
            {podiumOrder.map((item, i) => {
              if (!item) return null;
              const isFirst = item.rank === 1;
              const rankIdx = item.rank - 1;
              return (
                <View key={i} style={styles.podiumCol}>
                  {isFirst && (
                    <View style={styles.crownWrap}>
                      <Text style={styles.crownEmoji}>👑</Text>
                    </View>
                  )}
                  <View style={[
                    styles.podiumAvatar,
                    isFirst && styles.podiumAvatarFirst,
                    { borderColor: RANK_COLORS[rankIdx] + '60' }
                  ]}>
                    <Text style={styles.podiumAvatarText}>{item.members?.charAt(0)}</Text>
                    {isFirst && <View style={styles.podiumGlow} />}
                  </View>
                  <Text style={styles.podiumNameText} numberOfLines={1}>{item.members}</Text>
                  <Text style={[styles.podiumPtsText, { color: RANK_COLORS[rankIdx] }]}>{item.tog_total} ⚡</Text>
                  <View style={[styles.podiumBlock, {
                    height: getPodiumHeight(item.rank),
                    backgroundColor: RANK_COLORS[rankIdx] + '20',
                    borderColor: RANK_COLORS[rankIdx] + '40',
                  }]}>
                    <Text style={styles.podiumRankEmoji}>{RANK_LABELS[rankIdx]}</Text>
                    <Text style={[styles.podiumRankNum, { color: RANK_COLORS[rankIdx] }]}>#{item.rank}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </LinearGradient>

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
            <LinearGradient
              colors={['rgba(167,139,250,0.15)', 'rgba(167,139,250,0.05)']}
              style={styles.rowAvatar}
            >
              <Text style={styles.rowAvatarText}>{item.members?.charAt(0)}</Text>
            </LinearGradient>
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
  container: { flex: 1, backgroundColor: '#080618' },

  bgTrophyWrap: {
    position: 'absolute', top: 40, right: -30,
    zIndex: 0, opacity: 0.05,
  },
  bgTrophy: { fontSize: 300 },

  header: {
    paddingTop: 52, paddingHorizontal: 24,
    paddingBottom: 32, zIndex: 1,
  },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52,211,153,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
  liveText: { color: '#34D399', fontSize: 11, fontWeight: '700' },

  // BADGE FLAGS
  badgesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, paddingHorizontal: 4 },
  badgeFlagWrap: { alignItems: 'center', flex: 1 },
  badgeRope: { width: 1.5, height: 16, marginBottom: 0 },
  badgeFlag: {
    width: '90%', borderRadius: 10, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 4,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  badgeFlagEmoji: { fontSize: 20, marginBottom: 4 },
  badgeFlagLabel: { fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
  badgeFlagShadow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20 },
  badgeFlagPoint: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  // PODIUM
  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingBottom: 4 },
  podiumCol: { flex: 1, alignItems: 'center' },
  crownWrap: { marginBottom: 4 },
  crownEmoji: { fontSize: 22 },
  podiumAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(108,61,232,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(108,61,232,0.5)',
    marginBottom: 6, position: 'relative', overflow: 'hidden',
  },
  podiumAvatarFirst: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(251,191,36,0.2)',
    borderColor: 'rgba(251,191,36,0.6)', borderWidth: 2.5,
  },
  podiumGlow: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 40,
  },
  podiumAvatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  podiumNameText: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 2, paddingHorizontal: 2 },
  podiumPtsText: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  podiumBlock: {
    width: '100%', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, gap: 4, paddingVertical: 8,
  },
  podiumRankEmoji: { fontSize: 22 },
  podiumRankNum: { fontSize: 11, fontWeight: '800' },

  // LIST
  list: { padding: 16, zIndex: 1 },
  listLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  row: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  rowRank: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  rowNum: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  rowAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
    overflow: 'hidden',
  },
  rowAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  rowTasks: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  rowScoreBox: { alignItems: 'flex-end' },
  rowScore: { fontSize: 17, fontWeight: '800', color: '#FBBF24' },
  rowScoreLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});