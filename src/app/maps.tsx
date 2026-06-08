import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PINS = [
  { icon: '☕', title: 'Tom N Toms', category: 'Date idea', catColor: '#F472B6', points: 50, distance: '0.8 км', desc: 'Хамтдаа кофе ууцгаая', top: '18%', left: '22%' },
  { icon: '🌅', title: 'Zaisan', category: 'Date idea', catColor: '#F472B6', points: 80, distance: '3.2 км', desc: 'Мандах нарыг ажиглацгаая', top: '45%', left: '58%' },
  { icon: '🎭', title: 'Tengis Cinema', category: 'Date idea', catColor: '#F472B6', points: 40, distance: '1.5 км', desc: 'Кино үзцгэеэ', top: '28%', left: '70%' },
  { icon: '🏃', title: 'Riverside Park', category: 'Positive habit', catColor: '#34D399', points: 60, distance: '2.1 км', desc: '67н секунд дасгал хийцгэеэ', top: '60%', left: '30%' },
  { icon: '🏛️', title: 'Sükhbaatar Square', category: 'Date idea', catColor: '#F472B6', points: 35, distance: '1.2 км', desc: 'Цэцэрлэгт хүрээлэнд алхацгаая', top: '35%', left: '42%' },
];

export default function MapsScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');

  const selectedPin = selected !== null ? PINS[selected] : null;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Газрын зураг 🗺️</Text>
            <Text style={styles.sub}>Ойрхон байгаа даалгавруудыг олоорой</Text>
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'map' && styles.toggleBtnActive]}
              onPress={() => setView('map')}
            >
              <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>🗺</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
              onPress={() => setView('list')}
            >
              <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{PINS.length}</Text>
            <Text style={styles.statLabel}>Газар</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>UB</Text>
            <Text style={styles.statLabel}>Улаанбаатар</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>⚡</Text>
            <Text style={styles.statLabel}>Тог оноо</Text>
          </View>
        </View>
      </LinearGradient>

      {view === 'map' ? (
        <>
          {/* MAP AREA */}
          <View style={styles.mapArea}>
            {/* Grid lines */}
            <View style={styles.mapGrid}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.mapGridLine} />
              ))}
            </View>
            <View style={styles.mapGridV}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.mapGridLineV} />
              ))}
            </View>

            {/* City label */}
            <Text style={styles.mapCityLabel}>Улаанбаатар</Text>

            {/* Pins */}
            {PINS.map((pin, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pin, { top: pin.top, left: pin.left } as any]}
                onPress={() => setSelected(i === selected ? null : i)}
                activeOpacity={0.8}
              >
                <View style={[styles.pinBubble, selected === i && { backgroundColor: pin.catColor, transform: [{ scale: 1.1 }] }]}>
                  <Text style={styles.pinEmoji}>{pin.icon}</Text>
                  <Text style={styles.pinPts}>+{pin.points}</Text>
                </View>
                <View style={[styles.pinDot, { backgroundColor: selected === i ? pin.catColor : 'rgba(255,255,255,0.5)' }]} />
              </TouchableOpacity>
            ))}

            {/* Popup */}
            {selectedPin && (
              <View style={styles.popup}>
                <LinearGradient colors={['#1A0A3E', '#0A0618']} style={styles.popupGradient}>
                  <View style={styles.popupTop}>
                    <View>
                      <View style={[styles.popupCatBadge, { backgroundColor: selectedPin.catColor + '25' }]}>
                        <Text style={[styles.popupCat, { color: selectedPin.catColor }]}>{selectedPin.category}</Text>
                      </View>
                      <Text style={styles.popupName}>{selectedPin.title}</Text>
                      <Text style={styles.popupDesc}>{selectedPin.desc}</Text>
                      <Text style={styles.popupDist}>📍 {selectedPin.distance}</Text>
                    </View>
                    <View style={[styles.popupPtsBadge, { backgroundColor: selectedPin.catColor + '20', borderColor: selectedPin.catColor + '40' }]}>
                      <Text style={[styles.popupPts, { color: selectedPin.catColor }]}>+{selectedPin.points}</Text>
                      <Text style={[styles.popupPtsSuffix, { color: selectedPin.catColor }]}>⚡</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.popupBtn, { backgroundColor: selectedPin.catColor }]} activeOpacity={0.8}>
                    <Text style={styles.popupBtnText}>Даалгавар эхлэх →</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* MINI LIST */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniList}>
            {PINS.map((pin, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.miniCard, selected === i && { borderColor: pin.catColor }]}
                onPress={() => setSelected(i === selected ? null : i)}
                activeOpacity={0.7}
              >
                <Text style={styles.miniIcon}>{pin.icon}</Text>
                <Text style={styles.miniName} numberOfLines={1}>{pin.title}</Text>
                <Text style={[styles.miniPts, { color: pin.catColor }]}>+{pin.points} ⚡</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        /* LIST VIEW */
        <ScrollView style={styles.listView} showsVerticalScrollIndicator={false}>
          <Text style={styles.listSectionLabel}>БҮГД ГАЗРУУД</Text>
          {PINS.map((pin, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.listRow, selected === i && { borderColor: pin.catColor + '60' }]}
              onPress={() => setSelected(i === selected ? null : i)}
              activeOpacity={0.75}
            >
              {selected === i && <View style={[styles.listAccent, { backgroundColor: pin.catColor }]} />}
              <View style={[styles.listIconWrap, { backgroundColor: pin.catColor + '20' }]}>
                <Text style={styles.listIcon}>{pin.icon}</Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{pin.title}</Text>
                <Text style={styles.listDesc}>{pin.desc}</Text>
                <View style={styles.listMeta}>
                  <View style={[styles.listCatBadge, { backgroundColor: pin.catColor + '20' }]}>
                    <Text style={[styles.listCat, { color: pin.catColor }]}>{pin.category}</Text>
                  </View>
                  <Text style={styles.listDist}>📍 {pin.distance}</Text>
                </View>
              </View>
              <View style={[styles.listPtsBadge, { borderColor: pin.catColor + '40' }]}>
                <Text style={[styles.listPts, { color: pin.catColor }]}>+{pin.points}</Text>
                <Text style={[styles.listPtsSuffix, { color: pin.catColor + 'AA' }]}>тог</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 },
  viewToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: 'rgba(167,139,250,0.3)' },
  toggleText: { fontSize: 14, color: 'rgba(255,255,255,0.3)' },
  toggleTextActive: { color: '#A78BFA' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  statChip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statNum: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 },

  // MAP
  mapArea: { flex: 1, backgroundColor: '#0D1117', position: 'relative', overflow: 'hidden' },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column', justifyContent: 'space-around' },
  mapGridLine: { height: 1, backgroundColor: 'rgba(167,139,250,0.06)' },
  mapGridV: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-around' },
  mapGridLineV: { width: 1, backgroundColor: 'rgba(167,139,250,0.06)' },
  mapCityLabel: { position: 'absolute', top: 10, right: 12, color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: '600' },

  pin: { position: 'absolute', alignItems: 'center' },
  pinBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  pinEmoji: { fontSize: 14 },
  pinPts: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pinDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },

  popup: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },
  popupGradient: { padding: 14 },
  popupTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  popupCatBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 },
  popupCat: { fontSize: 10, fontWeight: '700' },
  popupName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  popupDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  popupDist: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
  popupPtsBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 1 },
  popupPts: { fontSize: 18, fontWeight: '800' },
  popupPtsSuffix: { fontSize: 10, fontWeight: '600' },
  popupBtn: { borderRadius: 12, padding: 11, alignItems: 'center' },
  popupBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  miniList: { maxHeight: 100, paddingHorizontal: 12, paddingVertical: 10 },
  miniCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 10, marginRight: 8, width: 100, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  miniIcon: { fontSize: 20, marginBottom: 4 },
  miniName: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 3 },
  miniPts: { fontSize: 11, fontWeight: '800' },

  // LIST VIEW
  listView: { flex: 1, padding: 16 },
  listSectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  listRow: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative',
  },
  listAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  listIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 6 },
  listIcon: { fontSize: 22 },
  listInfo: { flex: 1 },
  listName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  listDesc: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  listCatBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  listCat: { fontSize: 10, fontWeight: '700' },
  listDist: { color: 'rgba(255,255,255,0.25)', fontSize: 10 },
  listPtsBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  listPts: { fontSize: 14, fontWeight: '800' },
  listPtsSuffix: { fontSize: 9, fontWeight: '600' },
});