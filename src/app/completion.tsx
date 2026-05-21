import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'http://localhost:8000';

export default function CompletionScreen({ 
  task, 
  userId, 
  accountId,
  onBack,
  onComplete
}: { 
  task: any, 
  userId: number | null,
  accountId: number | null,
  onBack: () => void,
  onComplete: () => void
}) {
  const [step, setStep] = useState<'submit' | 'pending' | 'review'>('submit');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'ok' | 'far'>('idle');
  const [pendingCompletions, setPendingCompletions] = useState<any[]>([]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const getLocation = () => {
    setLocationStatus('checking');
    if (!navigator.geolocation) {
      alert('Байршил тодорхойлох боломжгүй');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (task.latitude && task.longitude) {
          const dist = getDistance(pos.coords.latitude, pos.coords.longitude, task.latitude, task.longitude);
          setLocationStatus(dist < 500 ? 'ok' : 'far');
        } else {
          setLocationStatus('ok');
        }
      },
      () => {
        alert('Байршил тодорхойлж чадсангүй');
        setLocationStatus('idle');
      }
    );
  };

  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = (ev.target?.result as string).split(',')[1];
          setPhoto(base64);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const submitCompletion = async () => {
    if (!photo) {
      alert('Зураг авна уу!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_task_id: task.id,
          submitted_by: userId,
          photo_base64: photo,
          latitude: location?.lat || null,
          longitude: location?.lng || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('pending');
      } else {
        alert(data.detail || 'Алдаа гарлаа');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  const loadPendingCompletions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/pending/${accountId}`);
      const data = await res.json();
      setPendingCompletions(data.pending || []);
      setStep('review');
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  const reviewCompletion = async (completionId: number, decision: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completion_id: completionId,
          reviewed_by: userId,
          decision,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (decision === 'approved') {
          onComplete();
        } else {
          loadPendingCompletions();
        }
      } else {
        alert(data.detail || 'Алдаа гарлаа');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.ptsBadge}>
          <Text style={styles.ptsText}>+{task.points} ⚡</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* SUBMIT STEP */}
        {step === 'submit' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Даалгавар биелүүлэх</Text>
            <Text style={styles.cardDesc}>
              Зураг авч, байршлаа шалгаад хамтрагч тань баталгаажуулна.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoItem}>📍 {task.location_name || 'Байршил тодорхойгүй'}</Text>
              <Text style={styles.infoItem}>⚡ +{task.points} Тог оноо</Text>
              <Text style={styles.infoItem}>👥 Хамтрагч баталгаажуулна</Text>
            </View>

            {/* Байршил */}
            <TouchableOpacity 
              style={[
                styles.locationBtn, 
                locationStatus === 'ok' && styles.locationBtnOk, 
                locationStatus === 'far' && styles.locationBtnFar
              ]}
              onPress={getLocation}
            >
              <Text style={styles.locationBtnText}>
                {locationStatus === 'idle' && '📍 Байршил шалгах'}
                {locationStatus === 'checking' && '📍 Шалгаж байна...'}
                {locationStatus === 'ok' && '✅ Байршил зөв байна!'}
                {locationStatus === 'far' && '⚠️ Та хол байна'}
              </Text>
            </TouchableOpacity>

            {/* Зураг */}
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnText}>
                📷 {photo ? 'Зураг дахин авах' : 'Зураг авах'}
              </Text>
            </TouchableOpacity>

            {photo && (
              <View style={styles.photoPreview}>
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${photo}` }} 
                  style={styles.photoImage} 
                />
                <Text style={styles.photoOk}>✅ Зураг бэлэн!</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitBtn, (!photo || loading) && styles.btnDisabled]} 
              onPress={submitCompletion}
              disabled={!photo || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>✅ Биелүүллээ!</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.reviewBtn} onPress={loadPendingCompletions}>
              <Text style={styles.reviewBtnText}>🔍 Хамтрагчийн биелүүлэлт шалгах</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PENDING STEP */}
        {step === 'pending' && (
          <View style={styles.card}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <Text style={styles.cardTitle}>Хамтрагчийг хүлээж байна</Text>
            <Text style={styles.cardDesc}>
              Таны биелүүлэлт илгээгдлээ! Хамтрагч тань баталгаажуулахыг хүлээж байна.
            </Text>
            <View style={styles.waitingBox}>
              <Text style={styles.waitingText}>
                Хамтрагч тань баталгаажуулсны дараа Тог оноо нэмэгдэнэ ⚡
              </Text>
            </View>
            <TouchableOpacity style={styles.reviewBtn} onPress={loadPendingCompletions}>
              <Text style={styles.reviewBtnText}>🔍 Хамтрагчийн биелүүлэлт шалгах</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
              <Text style={styles.backHomeBtnText}>← Нүүр хуудас руу буцах</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REVIEW STEP */}
        {step === 'review' && (
          <>
            <Text style={styles.sectionLabel}>БАТАЛГААЖУУЛАХ БИЕЛҮҮЛЭЛТҮҮД</Text>
            {loading ? (
              <ActivityIndicator color="#6C3DE8" style={{ marginTop: 20 }} />
            ) : pendingCompletions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyText}>Баталгаажуулах биелүүлэлт байхгүй байна</Text>
                <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
                  <Text style={styles.backHomeBtnText}>← Буцах</Text>
                </TouchableOpacity>
              </View>
            ) : (
              pendingCompletions.map((completion, i) => (
                <View key={i} style={styles.reviewCard}>
                  <Text style={styles.reviewName}>👤 {completion.submitter_name}</Text>
                  <Text style={styles.reviewTask}>📋 {completion.task_title}</Text>
                  <Text style={styles.reviewTime}>
                    🕐 {new Date(completion.submitted_at).toLocaleString()}
                  </Text>
                  <Text style={styles.reviewPoints}>+{completion.task_points} ⚡</Text>

                  {completion.photo_url && (
                    <TouchableOpacity 
                      style={styles.viewPhotoBtn}
                      onPress={async () => {
                        const res = await fetch(`${API}/api/completions/${completion.id}/photo`);
                        const data = await res.json();
                        alert('Зураг: ' + (data.photo_base64 ? 'Байна' : 'Байхгүй'));
                      }}
                    >
                      <Text style={styles.viewPhotoBtnText}>🖼️ Зураг харах</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.reviewBtns}>
                    <TouchableOpacity 
                      style={styles.approveBtn}
                      onPress={() => reviewCompletion(completion.id, 'approved')}
                      disabled={loading}
                    >
                      <Text style={styles.approveBtnText}>✅ Зөвшөөрөх</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectBtn}
                      onPress={() => reviewCompletion(completion.id, 'rejected')}
                      disabled={loading}
                    >
                      <Text style={styles.rejectBtnText}>❌ Татгалзах</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: {
    backgroundColor: '#1A1035', padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  ptsBadge: {
    backgroundColor: 'rgba(245,166,35,0.2)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 8,
  },
  ptsText: { color: '#F5A623', fontSize: 14, fontWeight: '800' },
  body: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 0.5, borderColor: '#E8E2F8', alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1035', marginBottom: 8, textAlign: 'center' },
  cardDesc: { fontSize: 14, color: '#8A85A0', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  infoBox: { width: '100%', backgroundColor: '#F8F4FF', borderRadius: 12, padding: 14, marginBottom: 16, gap: 8 },
  infoItem: { fontSize: 13, color: '#1A1035' },
  locationBtn: {
    backgroundColor: '#F0EBFF', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%', marginBottom: 10,
  },
  locationBtnOk: { backgroundColor: '#E8F8F0' },
  locationBtnFar: { backgroundColor: '#FFF0E8' },
  locationBtnText: { color: '#6C3DE8', fontSize: 14, fontWeight: '600' },
  photoBtn: {
    backgroundColor: '#1A1035', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%', marginBottom: 10,
  },
  photoBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  photoPreview: { width: '100%', alignItems: 'center', marginBottom: 10 },
  photoImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  photoOk: { color: '#1D9E75', fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#6C3DE8', borderRadius: 12, padding: 16,
    alignItems: 'center', width: '100%', marginBottom: 10,
  },
  btnDisabled: { backgroundColor: '#C4BEDC' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reviewBtn: {
    backgroundColor: '#F0EBFF', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%',
  },
  reviewBtnText: { color: '#6C3DE8', fontSize: 14, fontWeight: '600' },
  pendingEmoji: { fontSize: 48, marginBottom: 12 },
  waitingBox: { backgroundColor: '#F0EBFF', borderRadius: 12, padding: 14, marginBottom: 20, width: '100%' },
  waitingText: { color: '#6C3DE8', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  backHomeBtn: { marginTop: 12, padding: 12 },
  backHomeBtnText: { color: '#8A85A0', fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#8A85A0', marginBottom: 12, letterSpacing: 0.5 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#8A85A0', marginTop: 12, textAlign: 'center' },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 0.5, borderColor: '#E8E2F8',
  },
  reviewName: { fontSize: 15, fontWeight: '700', color: '#1A1035' },
  reviewTask: { fontSize: 13, color: '#8A85A0', marginTop: 4 },
  reviewTime: { fontSize: 12, color: '#8A85A0', marginTop: 4 },
  reviewPoints: { fontSize: 16, fontWeight: '800', color: '#F5A623', marginTop: 8 },
  viewPhotoBtn: {
    backgroundColor: '#F0EBFF', borderRadius: 8, padding: 10,
    alignItems: 'center', marginTop: 10,
  },
  viewPhotoBtnText: { color: '#6C3DE8', fontWeight: '600' },
  reviewBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  approveBtn: { flex: 1, backgroundColor: '#1D9E75', borderRadius: 10, padding: 12, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#FFE8E8', borderRadius: 10, padding: 12, alignItems: 'center' },
  rejectBtnText: { color: '#E84B4B', fontWeight: '700' },
});