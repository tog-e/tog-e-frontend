import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActivitiesScreen from './activities';
import CompletionScreen from './completion';
import IntroScreen from './intro';
import JobsScreen from './jobs';
import LeaderboardScreen from './leaderboard';
import MapsScreen from './maps';
import ProfileScreen from './profile';
import ScheduleScreen from './schedule';
import TasksScreen from './tasks';

const API = "https://backend-production-6077.up.railway.app";

const CATEGORY_CONFIG: { [key: string]: { emoji: string; color: string; glow: string; label: string } } = {
  date_ideas:      { emoji: '💑', color: '#FF6B9D', glow: 'rgba(255,107,157,0.4)', label: 'Date idea' },
  positive_habits: { emoji: '💪', color: '#A78BFA', glow: 'rgba(167,139,250,0.4)', label: 'Эерэг дадал' },
  growing:         { emoji: '🌱', color: '#34D399', glow: 'rgba(52,211,153,0.4)', label: 'Хамтдаа өсөх' },
  challenges:      { emoji: '🏆', color: '#FBBF24', glow: 'rgba(251,191,36,0.4)', label: 'Сорилт' },
  ai_recommended:  { emoji: '✨', color: '#60A5FA', glow: 'rgba(96,165,250,0.4)', label: 'AI санал' },
};

export default function HomeScreen({ userId, accountId }: { userId: number | null; accountId: number | null }) {
  const [screen, setScreen] = useState('home');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountId) { fetchAccount(); fetchTasks(); }
  }, [accountId]);

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${API}/api/accounts/${accountId}`);
      setAccount(await res.json());
    } catch {}
  };

  const fetchTasks = async () => {
    if (!accountId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/tasks/daily/${accountId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {}
    setLoading(false);
  };

  if (screen === 'leaderboard') return <LeaderboardScreen onBack={() => setScreen('home')} />;
  if (screen === 'tasks') return <TasksScreen onBack={() => setScreen('home')} />;
  if (screen === 'maps') return <MapsScreen onBack={() => setScreen('home')} />;
  if (screen === 'jobs') return <JobsScreen onBack={() => setScreen('home')} />;
  if (screen === 'activities') return <ActivitiesScreen onBack={() => setScreen('home')} />;
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
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <LinearGradient
        colors={['#1A0A3E', '#0F0627']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
            <Text style={styles.statLabel}>⚡ Тог</Text>
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

        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>ӨНӨӨДРИЙН ҮҮРЭГ</Text>
          <TouchableOpacity onPress={() => setScreen('tasks')}>
            <Text style={styles.sectionLink}>Бүгд →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#A78BFA" style={{ marginVertical: 24 }} />
        ) : tasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Өнөөдрийн даалгавар байхгүй</Text>
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
                activeOpacity={0.75}
              >
                <View style={[styles.accentBar, { backgroundColor: cat.color }]} />
                <View style={[styles.taskIconGlass, { borderColor: cat.color + '50', backgroundColor: cat.color + '18' }]}>
                  <Text style={styles.taskEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskName, isDone && styles.taskNameDone]}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <Text style={[styles.catTag, { color: cat.color }]}>{cat.label}</Text>
                    {task.location_name ? <Text style={styles.taskLoc}>· 📍 {task.location_name}</Text> : null}
                  </View>
                </View>
                <View style={[styles.ptsBadge, { borderColor: cat.color + '60', shadowColor: cat.glow }]}>
                  <Text style={[styles.ptsNum, { color: cat.color }]}>+{task.points}</Text>
                  <Text style={[styles.ptsSuffix, { color: cat.color + 'AA' }]}>тог</Text>
                </View>
                {isDone && <View style={styles.doneOverlay}><Text style={styles.doneCheck}>✓</Text></View>}
              </TouchableOpacity>
            );
          })
        )}

        <Text style={styles.sectionLabel2}>ХУРДАН ҮЙЛДЭЛ</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, styles.qcPurple]} onPress={() => setScreen('schedule')} activeOpacity={0.75}>
            <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: 'rgba(167,139,250,0.3)' }]}>
              <Text style={styles.quickEmoji}>🗓️</Text>
            </View>
            <Text style={styles.quickTitle}>AI Schedule</Text>
            <Text style={styles.quickSub}>7 хоногийн санал</Text>
          </TouchableOpacity>
        
          <View style={styles.quickGrid}>
            <TouchableOpacity style={[styles.quickCard, styles.qcPink]} onPress={() => setScreen('activities')} activeOpacity={0.75}>
              <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(255,107,157,0.2)', borderColor: 'rgba(255,107,157,0.3)' }]}>
                <Text style={styles.quickEmoji}>🎯</Text>
              </View>
              <Text style={styles.quickTitle}>Activities</Text>
              <Text style={styles.quickSub}>УБ хийх зүйлс</Text>
            </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, styles.qcPurple]} onPress={() => setScreen('jobs')} activeOpacity={0.75}>
            <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: 'rgba(167,139,250,0.3)' }]}>
              <Text style={styles.quickEmoji}>💼</Text>
            </View>
            <Text style={styles.quickTitle}>Ажлын зар</Text>
            <Text style={styles.quickSub}>Zangia.mn</Text>
          </TouchableOpacity>
        </View>
          








          <TouchableOpacity style={[styles.quickCard, styles.qcPink]} onPress={() => setScreen('intro')} activeOpacity={0.75}>
            <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(255,107,157,0.2)', borderColor: 'rgba(255,107,157,0.3)' }]}>
              <Text style={styles.quickEmoji}>👋</Text>
            </View>
            <Text style={styles.quickTitle}>Танилцацгаая</Text>
            <Text style={styles.quickSub}>14 асуулт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, styles.qcGreen]} onPress={() => setScreen('maps')} activeOpacity={0.75}>
            <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(52,211,153,0.2)', borderColor: 'rgba(52,211,153,0.3)' }]}>
              <Text style={styles.quickEmoji}>🗺️</Text>
            </View>
            <Text style={styles.quickTitle}>Газрын зур</Text>
            <Text style={styles.quickSub}>Ойрхон газрууд</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, styles.qcGold]} onPress={() => setScreen('leaderboard')} activeOpacity={0.75}>
            <View style={[styles.quickIconWrap, { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.3)' }]}>
              <Text style={styles.quickEmoji}>🏆</Text>
            </View>
            <Text style={styles.quickTitle}>Тэргүүлэгчид</Text>
            <Text style={styles.quickSub}>Жагсаалт харах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: {
    padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(167,139,250,0.6)', fontSize: 13, fontWeight: '500' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  profileBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
  },
  profileEmoji: { fontSize: 20 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBg: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: '#A78BFA', borderRadius: 3 },
  progressPct: { color: 'rgba(255,255,255,0.3)', fontSize: 11, width: 32, textAlign: 'right' },
  body: { padding: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2 },
  sectionLabel2: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12, marginTop: 24 },
  sectionLink: { fontSize: 12, color: '#A78BFA', fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: 'rgba(255,255,255,0.25)', fontSize: 14 },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden', position: 'relative',
  },
  taskCardDone: { opacity: 0.4 },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  taskIconGlass: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, marginLeft: 8, borderWidth: 1,
  },
  taskEmoji: { fontSize: 22 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  taskNameDone: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.3)' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  catTag: { fontSize: 10, fontWeight: '600' },
  taskLoc: { fontSize: 10, color: 'rgba(255,255,255,0.25)' },
  ptsBadge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8,
  },
  ptsNum: { fontSize: 14, fontWeight: '800' },
  ptsSuffix: { fontSize: 9, fontWeight: '600' },
  doneOverlay: {
    position: 'absolute', right: 14, top: '50%',
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  doneCheck: { color: '#34D399', fontSize: 12, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  quickCard: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  qcPurple: { borderColor: 'rgba(167,139,250,0.2)' },
  qcPink:   { borderColor: 'rgba(255,107,157,0.2)' },
  qcGreen:  { borderColor: 'rgba(52,211,153,0.2)' },
  qcGold:   { borderColor: 'rgba(251,191,36,0.2)' },
  quickIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, borderWidth: 1,
  },
  quickEmoji: { fontSize: 20 },
  quickTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quickSub: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 3 },
});