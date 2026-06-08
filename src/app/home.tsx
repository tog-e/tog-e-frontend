import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CompletionScreen from './completion';
import IntroScreen from './intro';
import LeaderboardScreen from './leaderboard';
import MapsScreen from './maps';
import ProfileScreen from './profile';
import ScheduleScreen from './schedule';
import TasksScreen from './tasks';

const API = "https://backend-production-6077.up.railway.app";

const CATEGORY_CONFIG: { [key: string]: { emoji: string; color: string; label: string } } = {
  date_ideas:      { emoji: '💑', color: '#E84B8A', label: 'Date idea' },
  positive_habits: { emoji: '💪', color: '#6C3DE8', label: 'Эерэг дадал' },
  growing:         { emoji: '🌱', color: '#1D9E75', label: 'Хамтдаа өсөх' },
  challenges:      { emoji: '🏆', color: '#F5A623', label: 'Сорилт' },
  ai_recommended:  { emoji: '✨', color: '#00C6FF', label: 'AI санал' },
};

export default function HomeScreen({ userId, accountId }: { userId: number | null, accountId: number | null }) {
  const [screen, setScreen] = useState('home');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountId) {
      fetchAccount();
      fetchTasks();
    }
  }, [accountId]);

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${API}/api/accounts/${accountId}`);
      const data = await res.json();
      setAccount(data);
    } catch (e) {}
  };

  const fetchTasks = async () => {
    if (!accountId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/tasks/daily/${accountId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {}
    setLoading(false);
  };

  if (screen === 'leaderboard') return <LeaderboardScreen onBack={() => setScreen('home')} />;
  if (screen === 'tasks') return <TasksScreen onBack={() => setScreen('home')} />;
  if (screen === 'maps') return <MapsScreen onBack={() => setScreen('home')} />;
  if (screen === 'schedule') return <ScheduleScreen onBack={() => setScreen('home')} accountId={accountId} />;
  if (screen === 'profile') return <ProfileScreen onBack={() => setScreen('home')} userId={userId} />;
  if (screen === 'intro') return (
    <IntroScreen
      onFinish={() => setScreen('home')}
      memberNames={account?.members?.map((m: any) => m.name) || ['Хэрэглэгч 1', 'Хэрэглэгч 2']}
    />
  );
  if (screen === 'completion' && selectedTask) return (
    <CompletionScreen
      task={selectedTask}
      userId={userId}
      accountId={accountId}
      onBack={() => setScreen('home')}
      onComplete={() => { setScreen('home'); fetchTasks(); }}
    />
  );

  const memberNames = account?.members?.map((m: any) => m.name).join(' & ') || 'Tog-e';
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Сайн байна уу 👋</Text>
            <Text style={styles.name}>{memberNames}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setScreen('profile')}>
            <Text style={styles.profileEmoji}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{account?.tog_total || 0}</Text>
            <Text style={styles.statLabel}>⚡ Тог оноо</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{completedCount}/{totalCount}</Text>
            <Text style={styles.statLabel}>✅ Өнөөдөр</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View style={styles.progressBox}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%` as any }]} />
            </View>
            <Text style={styles.progressText}>{Math.round((completedCount / totalCount) * 100)}%</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* ӨНӨӨДРИЙН ҮҮРЭГ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ӨНӨӨДРИЙН ҮҮРЭГ</Text>
          <TouchableOpacity onPress={() => setScreen('tasks')}>
            <Text style={styles.sectionLink}>Бүгдийг харах →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6C3DE8" style={{ marginTop: 20 }} />
        ) : tasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Өнөөдрийн даалгавар байхгүй байна</Text>
          </View>
        ) : (
          tasks.map((task, i) => {
            const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.challenges;
            const isDone = task.status === 'completed';
            return (
              <TouchableOpacity
                key={i}
                style={[styles.taskCard, isDone && styles.taskCardDone]}
                onPress={() => { setSelectedTask(task); setScreen('completion'); }}
                disabled={isDone}
              >
                <View style={[styles.taskIconBox, { backgroundColor: cat.color + '22' }]}>
                  <Text style={styles.taskEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.taskInfo}>
                  <View style={styles.taskTop}>
                    <Text style={[styles.taskName, isDone && styles.taskNameDone]}>{task.title}</Text>
                    {isDone && <Text style={styles.doneTag}>✓</Text>}
                  </View>
                  <View style={styles.taskMeta}>
                    <Text style={[styles.catTag, { color: cat.color }]}>{cat.label}</Text>
                    {task.location_name ? <Text style={styles.taskLoc}>· 📍 {task.location_name}</Text> : null}
                  </View>
                </View>
                <View style={[styles.ptsBadge, { backgroundColor: cat.color + '22' }]}>
                  <Text style={[styles.taskPts, { color: cat.color }]}>+{task.points}</Text>
                  <Text style={[styles.togSuffix, { color: cat.color }]}>тог</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionLabel2}>ХУРДАН ҮЙЛДЭЛ</Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardPurple]} onPress={() => setScreen('schedule')}>
            <Text style={styles.quickEmoji}>🗓️</Text>
            <Text style={styles.quickTitle}>AI Schedule</Text>
            <Text style={styles.quickSub}>7 хоногийн санал</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardDark]} onPress={() => setScreen('intro')}>
            <Text style={styles.quickEmoji}>👋</Text>
            <Text style={styles.quickTitle}>Танилцацгаая</Text>
            <Text style={styles.quickSub}>14 асуулт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardDark]} onPress={() => setScreen('maps')}>
            <Text style={styles.quickEmoji}>🗺️</Text>
            <Text style={styles.quickTitle}>Газрын зур</Text>
            <Text style={styles.quickSub}>Ойрхон газрууд</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardGold]} onPress={() => setScreen('leaderboard')}>
            <Text style={styles.quickEmoji}>🏆</Text>
            <Text style={styles.quickTitle}>Тэргүүлэгчид</Text>
            <Text style={styles.quickSub}>Жагсаалт харах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A2E' },

  // HEADER
  header: {
    backgroundColor: '#1A1040',
    padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.2)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(108,61,232,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.4)',
  },
  profileEmoji: { fontSize: 18 },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },

  progressBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#6C3DE8', borderRadius: 3 },
  progressText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, width: 30, textAlign: 'right' },

  // BODY
  body: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1 },
  sectionLabel2: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  sectionLink: { fontSize: 12, color: '#6C3DE8', fontWeight: '600' },

  // TASKS
  emptyBox: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  taskCard: {
    backgroundColor: '#1A1040', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.2)',
  },
  taskCardDone: { opacity: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  taskIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  taskEmoji: { fontSize: 22 },
  taskInfo: { flex: 1 },
  taskTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskName: { fontSize: 13, fontWeight: '700', color: '#fff', flex: 1 },
  taskNameDone: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.4)' },
  doneTag: { fontSize: 12, color: '#1D9E75', fontWeight: '800' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  catTag: { fontSize: 10, fontWeight: '600' },
  taskLoc: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  ptsBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  taskPts: { fontSize: 14, fontWeight: '800' },
  togSuffix: { fontSize: 9, fontWeight: '600' },

  // QUICK ACTIONS
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  quickCard: {
    flex: 1, borderRadius: 16, padding: 16,
    borderWidth: 1,
  },
  quickCardPurple: { backgroundColor: 'rgba(108,61,232,0.2)', borderColor: 'rgba(108,61,232,0.4)' },
  quickCardDark: { backgroundColor: '#1A1040', borderColor: 'rgba(255,255,255,0.08)' },
  quickCardGold: { backgroundColor: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.3)' },
  quickEmoji: { fontSize: 24, marginBottom: 8 },
  quickTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quickSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
});