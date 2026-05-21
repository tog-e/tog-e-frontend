import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CompletionScreen from './completion';
import LeaderboardScreen from './leaderboard';
import MapsScreen from './maps';
import ScheduleScreen from './schedule';
import TasksScreen from './tasks';
const API = 'http://localhost:8000';

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Өнөөдрийн даалгавар</Text>
        <Text style={styles.name}>{memberNames}</Text>
        <View style={styles.togBox}>
          <Text style={styles.togNum}>{account?.tog_total || 0}</Text>
          <Text style={styles.togLabel}> ⚡ Нийт Тог</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>ӨНӨӨДРИЙН ҮҮРЭГ</Text>
        {loading ? (
          <ActivityIndicator color="#6C3DE8" style={{ marginTop: 20 }} />
        ) : tasks.length === 0 ? (
          <Text style={styles.emptyText}>Өнөөдрийн даалгавар байхгүй байна</Text>
        ) : (
          tasks.map((task, i) => (
            <TouchableOpacity key={i} style={styles.taskCard} onPress={() => { setSelectedTask(task); setScreen('completion'); }}>
              <View style={styles.taskIcon}>
                <Text style={styles.taskEmoji}>
                  {task.category === 'date_ideas' ? '💑' :
                   task.category === 'positive_habits' ? '💪' :
                   task.category === 'growing' ? '🌱' : '🏆'}
                </Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.title}</Text>
                <Text style={styles.taskLoc}>
                  {task.location_name ? `📍 ${task.location_name}` : task.category}
                </Text>
              </View>
              <Text style={styles.taskPts}>+{task.points}<Text style={styles.togSuffix}> тог</Text></Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.scheduleBtn} onPress={() => setScreen('schedule')}>
          <Text style={styles.scheduleBtnText}>🗓️ 7 хоногийн цаг тохируулах</Text>
          <Text style={styles.scheduleBtnSub}>AI activity санал авах</Text>
        </TouchableOpacity>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('maps')}>
            <Text style={styles.navBtnText}>🗺️ Газрын зур</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('tasks')}>
            <Text style={styles.navBtnText}>📋 Даалгавар</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.navBtn, styles.navBtnDark, { marginTop: 0 }]} onPress={() => setScreen('leaderboard')}>
          <Text style={styles.navBtnText}>🏆 Тэргүүн жагсаалт</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1035' },
  header: {
    backgroundColor: '#6C3DE8', padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  togBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginTop: 16, alignSelf: 'flex-start',
  },
  togNum: { color: '#F5A623', fontSize: 22, fontWeight: '800' },
  togLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  body: { padding: 16, backgroundColor: '#1A1035' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: 0.5 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginTop: 20 },
  taskCard: {
    backgroundColor: '#2D1A6E', borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: 'rgba(108,61,232,0.3)',
  },
  taskIcon: {
    width: 40, height: 40, backgroundColor: '#3D2A7E',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  taskEmoji: { fontSize: 20 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  taskLoc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  taskPts: { fontSize: 14, fontWeight: '800', color: '#F5A623' },
  togSuffix: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  scheduleBtn: {
    backgroundColor: '#2D1A6E', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 10,
    borderWidth: 0.5, borderColor: 'rgba(108,61,232,0.3)',
  },
  scheduleBtnText: { color: '#F5A623', fontSize: 15, fontWeight: '700' },
  scheduleBtnSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  navBtn: {
    flex: 1, backgroundColor: '#6C3DE8',
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  navBtnDark: { backgroundColor: '#2D1A6E' },
  navBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});