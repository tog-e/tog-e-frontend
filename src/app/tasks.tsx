import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const categories = [
  {
    label: 'Date ideas',
    icon: '💑',
    color: '#E84B8A',
    bg: 'rgba(232,75,138,0.15)',
    tasks: [
      { title: 'Хамтдаа кофе ууцгаая', location: 'Nomads Coffee', points: 50 },
      { title: 'Шинэ ресторан туршицгаая', location: '', points: 70 },
      { title: 'Кино үзцгэеэ', location: 'Tengis Cinema', points: 40 },
      { title: 'Парк дундуур алхацгаая', location: '', points: 35 },
      { title: 'Гэрт хоол хийцгээе', location: '', points: 45 },
    ],
  },
  {
    label: 'Positive habits',
    icon: '💪',
    color: '#6C3DE8',
    bg: 'rgba(108,61,232,0.15)',
    tasks: [
      { title: 'Хамтдаа дасгал хийцгэеэ', location: '', points: 60 },
      { title: 'Хамтдаа ном унших', location: '', points: 30 },
      { title: 'Эрт босоорой', location: '', points: 25 },
      { title: 'Усны норм биелүүлэх', location: '', points: 20 },
      { title: 'Утасгүй цаг өнгөрүүлэх', location: '', points: 40 },
    ],
  },
  {
    label: 'Growing together',
    icon: '🌱',
    color: '#1D9E75',
    bg: 'rgba(29,158,117,0.15)',
    tasks: [
      { title: 'Мөрөөдлийнхөө тухай ярилцаарай', location: '', points: 40 },
      { title: 'Шинэ ур чадвар суралцаарай', location: '', points: 65 },
      { title: 'Талархлын дэвтэр', location: '', points: 20 },
      { title: 'Хамтдаа podcast сонсох', location: '', points: 25 },
      { title: 'Ирээдүйн төлөвлөгөө хийх', location: '', points: 50 },
    ],
  },
  {
    label: 'Challenges',
    icon: '🏆',
    color: '#F5A623',
    bg: 'rgba(245,166,35,0.15)',
    tasks: [
      { title: '7 хоногийн challenge', location: '', points: 150 },
      { title: 'Монголын аймаг зорчицгоо', location: '', points: 200 },
      { title: 'Гэрэл зурагны challenge', location: '', points: 90 },
      { title: 'Шинэ хоол туршицгаая', location: '', points: 55 },
      { title: 'Нэг өдрийн digital detox', location: '', points: 120 },
    ],
  },
];

export default function TasksScreen({ onBack }: { onBack: () => void }) {
  const [expandedCat, setExpandedCat] = useState<number | null>(0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Даалгаврууд 📋</Text>
        <Text style={styles.sub}>Хамтдаа биелүүлэх үүргүүд</Text>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.pill, expandedCat === i && { backgroundColor: cat.color }]}
              onPress={() => setExpandedCat(i === expandedCat ? null : i)}
            >
              <Text style={styles.pillText}>{cat.icon} {cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.body}>
        {categories.map((cat, i) => (
          <View key={i} style={styles.section}>
            {/* Category header */}
            <TouchableOpacity
              style={[styles.catHeader, { borderLeftColor: cat.color }]}
              onPress={() => setExpandedCat(i === expandedCat ? null : i)}
            >
              <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
              </View>
              <View style={styles.catInfo}>
                <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
                <Text style={styles.catCount}>{cat.tasks.length} даалгавар</Text>
              </View>
              <Text style={styles.catArrow}>{expandedCat === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Tasks */}
            {expandedCat === i && cat.tasks.map((task, j) => (
              <TouchableOpacity key={j} style={styles.taskCard}>
                <View style={styles.taskLeft}>
                  <View style={[styles.taskDot, { backgroundColor: cat.color }]} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>{task.title}</Text>
                    {task.location ? (
                      <Text style={styles.taskLoc}>📍 {task.location}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.ptsBadge, { backgroundColor: cat.bg }]}>
                  <Text style={[styles.ptsText, { color: cat.color }]}>+{task.points}</Text>
                  <Text style={[styles.ptsSuffix, { color: cat.color }]}>тог</Text>
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
  container: { flex: 1, backgroundColor: '#0F0A2E' },
  header: {
    backgroundColor: '#1A1040',
    padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.2)',
  },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  pills: { flexDirection: 'row' },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    marginRight: 8,
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  body: { padding: 16 },
  section: { marginBottom: 12 },
  catHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1040', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 3,
  },
  catIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  catIcon: { fontSize: 22 },
  catInfo: { flex: 1 },
  catLabel: { fontSize: 15, fontWeight: '700' },
  catCount: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 },
  catArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 14,
    marginTop: 6, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)',
    marginLeft: 8,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  taskLoc: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  ptsBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    marginLeft: 8, alignItems: 'center',
  },
  ptsText: { fontSize: 13, fontWeight: '800' },
  ptsSuffix: { fontSize: 9, fontWeight: '600' },
});