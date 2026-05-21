import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TasksScreen({ onBack }: { onBack: () => void }) {
  const categories = [
    {
      label: 'Date ideas',
      icon: '💑',
      color: '#E84B8A',
      tasks: [
        { title: 'Хамтдаа кофе ууцгаая', location: 'Nomads Coffee', points: 50 },
        { title: 'Шинэ ресторан туршицгаая', location: '', points: 70 },
        { title: 'Кино үзцгэеэ', location: 'Tengis Cinema', points: 40 },
      ],
    },
    {
      label: 'Positive habits',
      icon: '💪',
      color: '#6C3DE8',
      tasks: [
        { title: 'Хамтдаа дасгал хийцгэеэ', location: '', points: 60 },
        { title: 'Хамтдаа ном унших', location: '', points: 30 },
        { title: 'Эрт босоорой', location: '', points: 25 },
      ],
    },
    {
      label: 'Growing together',
      icon: '🌱',
      color: '#1D9E75',
      tasks: [
        { title: 'Мөрөөдлийнхөө тухай ярилцаарай', location: '', points: 40 },
        { title: 'Шинэ ур чадвар суралцаарай', location: '', points: 65 },
        { title: 'Талархлын дэвтэр', location: '', points: 20 },
      ],
    },
    {
      label: 'Challenges',
      icon: '🏆',
      color: '#F5A623',
      tasks: [
        { title: '7 хоногийн challenge', location: '', points: 150 },
        { title: 'Монголын аймаг зорчицгоо', location: '', points: 200 },
        { title: 'Гэрэл зурагны challenge', location: '', points: 90 },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Даалгаврууд</Text>
        <Text style={styles.sub}>Хамтдаа биелүүлэх үүргүүд</Text>
      </View>

      <View style={styles.body}>
        {categories.map((cat, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.catHeader}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
            </View>
            {cat.tasks.map((task, j) => (
              <TouchableOpacity key={j} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskName}>{task.title}</Text>
                  {task.location ? (
                    <Text style={styles.taskLoc}>📍 {task.location}</Text>
                  ) : null}
                </View>
                <View style={[styles.ptsBadge, { backgroundColor: cat.color + '20' }]}>
                  <Text style={[styles.ptsText, { color: cat.color }]}>+{task.points}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: {
    backgroundColor: '#1A1035',
    padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },
  section: { marginBottom: 24 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catIcon: { fontSize: 20 },
  catLabel: { fontSize: 15, fontWeight: '700' },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12, padding: 14,
    marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 0.5, borderColor: '#E8E2F8',
  },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 13, fontWeight: '600', color: '#1A1035' },
  taskLoc: { fontSize: 11, color: '#8A85A0', marginTop: 2 },
  ptsBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8,
  },
  ptsText: { fontSize: 13, fontWeight: '800' },
});