import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

const CATEGORIES = [
  { type: 'all', label: '🌟 Бүгд' },
  { type: 'cafe', label: '☕ Кофе' },
  { type: 'restaurant', label: '🍜 Ресторан' },
  { type: 'movie_theater', label: '🎭 Кино' },
  { type: 'park', label: '🌿 Парк' },
  { type: 'gym', label: '🏋️ Спорт' },
  { type: 'museum', label: '🏛️ Музей' },
];

export default function ActivitiesScreen({ onBack }: { onBack: () => void }) {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => { fetchPlaces('all'); }, []);

  const fetchPlaces = async (category: string) => {
    setLoading(true);
    setSelectedCat(category);
    try {
      const res = await fetch(`${API}/api/places/?category=${category}`);
      const data = await res.json();
      setPlaces(data.places || []);
    } catch {}
    setLoading(false);
  };

  const openMaps = (place: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Activities 🎯</Text>
        <Text style={styles.sub}>Улаанбаатарт хийж болох зүйлс</Text>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.catBtn, selectedCat === cat.type && styles.catBtnActive]}
              onPress={() => fetchPlaces(cat.type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catText, selectedCat === cat.type && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>
          {places.length} ГАЗАР ОЛДЛОО
        </Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Google Maps-аас хайж байна...</Text>
          </View>
        ) : places.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Газар олдсонгүй</Text>
          </View>
        ) : (
          places.map((place, i) => (
            <TouchableOpacity
              key={i}
              style={styles.placeCard}
              onPress={() => openMaps(place)}
              activeOpacity={0.75}
            >
              <View style={[styles.accentBar, { backgroundColor: place.color || '#A78BFA' }]} />

              {/* Photo */}
              {place.photo ? (
                <Image source={{ uri: place.photo }} style={styles.placePhoto} />
              ) : (
                <View style={[styles.placePhotoPlaceholder, { backgroundColor: (place.color || '#A78BFA') + '20' }]}>
                  <Text style={styles.placeholderEmoji}>{place.category?.split(' ')[0] || '📍'}</Text>
                </View>
              )}

              <View style={styles.placeInfo}>
                <View style={styles.placeTop}>
                  <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                  {place.open_now !== undefined && (
                    <View style={[styles.openBadge, { backgroundColor: place.open_now ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }]}>
                      <Text style={[styles.openText, { color: place.open_now ? '#34D399' : '#F87171' }]}>
                        {place.open_now ? 'Нээлттэй' : 'Хаалттай'}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.placeCategory}>{place.category}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>📍 {place.address}</Text>

                <View style={styles.placeMeta}>
                  {place.rating > 0 && (
                    <View style={styles.ratingChip}>
                      <Text style={styles.ratingText}>⭐ {place.rating}</Text>
                      {place.user_ratings > 0 && (
                        <Text style={styles.ratingCount}>({place.user_ratings})</Text>
                      )}
                    </View>
                  )}
                  <Text style={styles.mapsLink}>🗺️ Газрын зураг →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  catScroll: { marginBottom: 4 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  catBtnActive: { backgroundColor: 'rgba(167,139,250,0.25)', borderColor: '#A78BFA' },
  catText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#C4B5FD' },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  placeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18,
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', position: 'relative',
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, zIndex: 1 },
  placePhoto: { width: '100%', height: 140 },
  placePhotoPlaceholder: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 40 },
  placeInfo: { padding: 14 },
  placeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  placeName: { color: '#fff', fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  openBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  openText: { fontSize: 10, fontWeight: '700' },
  placeCategory: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4 },
  placeAddress: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 8 },
  placeMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },
  ratingCount: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
  mapsLink: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },
});