import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapsScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  const pins = [
    { icon: '☕', title: 'Nomads Coffee', category: 'Date idea', points: 50, distance: '0.8 км' },
    { icon: '🌅', title: 'Zaisan', category: 'Date idea', points: 80, distance: '3.2 км' },
    { icon: '🎭', title: 'Tengis Cinema', category: 'Date idea', points: 40, distance: '1.5 км' },
    { icon: '🏃', title: 'Riverside Park', category: 'Positive habit', points: 60, distance: '2.1 км' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Даалгаврын газрууд</Text>
        <Text style={styles.sub}>Ойрхон байгаа даалгавраа олоорой</Text>
      </View>

      <View style={styles.mapArea}>
        {pins.map((pin, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.pin, { top: `${20 + i * 15}%`, left: `${15 + i * 18}%` } as any]}
            onPress={() => setSelected(i === selected ? null : i)}
          >
            <View style={[styles.pinBubble, selected === i && styles.pinSelected]}>
              <Text style={styles.pinText}>{pin.icon} +{pin.points}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {selected !== null && (
          <View style={styles.popup}>
            <Text style={styles.popupCat}>{pins[selected].category}</Text>
            <Text style={styles.popupName}>{pins[selected].title}</Text>
            <Text style={styles.popupDist}>📍 {pins[selected].distance}</Text>
            <Text style={styles.popupPts}>+{pins[selected].points} ⚡</Text>
            <TouchableOpacity style={styles.popupBtn}>
              <Text style={styles.popupBtnText}>Хамтдаа зөвшөөрч эхлэх →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.list}>
        {pins.map((pin, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.listRow, selected === i && styles.listRowSelected]}
            onPress={() => setSelected(i === selected ? null : i)}
          >
            <Text style={styles.listIcon}>{pin.icon}</Text>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{pin.title}</Text>
              <Text style={styles.listMeta}>{pin.category} · {pin.distance}</Text>
            </View>
            <Text style={styles.listPts}>+{pin.points} ⚡</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  mapArea: {
    height: 260,
    backgroundColor: '#C8E0B0',
    position: 'relative',
    overflow: 'hidden',
  },
  pin: { position: 'absolute' },
  pinBubble: {
    backgroundColor: '#6C3DE8',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  pinSelected: { backgroundColor: '#F5A623' },
  pinText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  popup: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: 'rgba(26,16,53,0.95)',
    borderRadius: 14, padding: 12,
    borderWidth: 0.5, borderColor: 'rgba(108,61,232,0.4)',
  },
  popupCat: { color: '#B89EFF', fontSize: 10, marginBottom: 2 },
  popupName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  popupDist: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  popupPts: { color: '#F5A623', fontSize: 16, fontWeight: '800', position: 'absolute', right: 12, top: 12 },
  popupBtn: {
    backgroundColor: '#6C3DE8', borderRadius: 8,
    padding: 8, alignItems: 'center', marginTop: 8,
  },
  popupBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  list: { flex: 1, padding: 12 },
  listRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E8E2F8',
  },
  listRowSelected: { borderColor: '#6C3DE8', borderWidth: 1.5 },
  listIcon: { fontSize: 24, marginRight: 10 },
  listInfo: { flex: 1 },
  listName: { fontSize: 13, fontWeight: '700', color: '#1A1035' },
  listMeta: { fontSize: 11, color: '#8A85A0', marginTop: 2 },
  listPts: { fontSize: 13, fontWeight: '800', color: '#6C3DE8' },
});