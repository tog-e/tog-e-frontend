import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

const CATEGORY_CONFIG: { [key: string]: { color: string; glow: string } } = {
  date_ideas:      { color: '#FF6B9D', glow: 'rgba(255,107,157,0.3)' },
  positive_habits: { color: '#A78BFA', glow: 'rgba(167,139,250,0.3)' },
  growing:         { color: '#34D399', glow: 'rgba(52,211,153,0.3)' },
  challenges:      { color: '#FBBF24', glow: 'rgba(251,191,36,0.3)' },
  ai_recommended:  { color: '#60A5FA', glow: 'rgba(96,165,250,0.3)' },
};

export default function CompletionScreen({
  task, userId, accountId, onBack, onComplete
}: {
  task: any; userId: number | null; accountId: number | null;
  onBack: () => void; onComplete: () => void;
}) {
  const [step, setStep] = useState<'submit' | 'pending' | 'review'>('submit');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'ok' | 'far'>('idle');
  const [pendingCompletions, setPendingCompletions] = useState<any[]>([]);

  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.challenges;

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getLocation = () => {
    setLocationStatus('checking');
    if (!navigator.geolocation) { alert('Байршил тодорхойлох боломжгүй'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (task.latitude && task.longitude) {
          const dist = getDistance(pos.coords.latitude, pos.coords.longitude, task.latitude, task.longitude);
          setLocationStatus(dist < 500 ? 'ok' : 'far');
        } else { setLocationStatus('ok'); }
      },
      () => { alert('Байршил тодорхойлж чадсангүй'); setLocationStatus('idle'); }
    );
  };

  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPhoto((ev.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const submitCompletion = async () => {
    if (!photo) { alert('Зураг авна уу!'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_task_id: task.id, submitted_by: userId, photo_base64: photo, latitude: location?.lat || null, longitude: location?.lng || null }),
      });
      const data = await res.json();
      if (res.ok) setStep('pending');
      else alert(data.detail || 'Алдаа гарлаа');
    } catch { alert('Сервертэй холбогдож чадсангүй'); }
    setLoading(false);
  };

  const loadPendingCompletions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/pending/${accountId}`);
      const data = await res.json();
      setPendingCompletions(data.pending || []);
      setStep('review');
    } catch { alert('Сервертэй холбогдож чадсангүй'); }
    setLoading(false);
  };

  const reviewCompletion = async (completionId: number, decision: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/completions/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_id: completionId, reviewed_by: userId, decision }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (decision === 'approved') onComplete();
        else loadPendingCompletions();
      } else alert(data.detail || 'Алдаа гарлаа');
    } catch { alert('Сервертэй холбогдож чадсангүй'); }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <View style={[styles.taskIconWrap, { backgroundColor: cat.color + '20', borderColor: cat.color + '40' }]}>
          <Text style={styles.taskIconEmoji}>
            {task.category === 'date_ideas' ? '💑' : task.category === 'positive_habits' ? '💪' : task.category === 'growing' ? '🌱' : task.category === 'ai_recommended' ? '✨' : '🏆'}
          </Text>
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <View style={[styles.ptsBadge, { backgroundColor: cat.color + '20', borderColor: cat.color + '40' }]}>
          <Text style={[styles.ptsText, { color: cat.color }]}>+{task.points} ⚡</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* SUBMIT */}
        {step === 'submit' && (
          <>
            {/* Steps indicator */}
            <View style={styles.stepsRow}>
              {['Зураг авах', 'Байршил', 'Илгээх'].map((s, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepDot, i === 0 && { backgroundColor: cat.color }]}>
                    <Text style={styles.stepDotText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, i === 0 && { color: cat.color }]}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Info card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{task.location_name || 'Байршил тодорхойгүй'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👥</Text>
                <Text style={styles.infoText}>Хамтрагч баталгаажуулна</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⚡</Text>
                <Text style={[styles.infoText, { color: cat.color }]}>+{task.points} Тог оноо нэмэгдэнэ</Text>
              </View>
            </View>

            {/* Location button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.locationBtn,
                locationStatus === 'ok' && styles.locationBtnOk,
                locationStatus === 'far' && styles.locationBtnFar,
                locationStatus === 'checking' && styles.locationBtnChecking,
              ]}
              onPress={getLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>
                {locationStatus === 'idle' ? '📍' : locationStatus === 'checking' ? '⏳' : locationStatus === 'ok' ? '✅' : '⚠️'}
              </Text>
              <View>
                <Text style={[styles.actionBtnText, locationStatus === 'ok' && { color: '#34D399' }, locationStatus === 'far' && { color: '#FBBF24' }]}>
                  {locationStatus === 'idle' ? 'Байршил шалгах' : locationStatus === 'checking' ? 'Шалгаж байна...' : locationStatus === 'ok' ? 'Байршил зөв байна!' : 'Та хол байна'}
                </Text>
                <Text style={styles.actionBtnSub}>GPS байршлаар шалгах</Text>
              </View>
            </TouchableOpacity>

            {/* Photo button */}
            <TouchableOpacity style={[styles.actionBtn, styles.photoBtn]} onPress={takePhoto} activeOpacity={0.8}>
              <Text style={styles.actionBtnIcon}>📷</Text>
              <View>
                <Text style={styles.actionBtnText}>{photo ? 'Зураг дахин авах' : 'Зураг авах'}</Text>
                <Text style={styles.actionBtnSub}>Биелүүлсэнийг нотлох зураг</Text>
              </View>
              {photo && <View style={styles.photoDoneBadge}><Text style={styles.photoDoneText}>✓</Text></View>}
            </TouchableOpacity>

            {/* Photo preview */}
            {photo && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoOverlayText}>✅ Зураг бэлэн</Text>
                </View>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, (!photo || loading) && styles.submitBtnDisabled]}
              onPress={submitCompletion}
              disabled={!photo || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(!photo || loading) ? ['#1A1040', '#0F0A2E'] : [cat.color, cat.color + 'CC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>✅ Биелүүллээ!</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Review button */}
            <TouchableOpacity style={styles.secondaryBtn} onPress={loadPendingCompletions} activeOpacity={0.7}>
              <Text style={styles.secondaryBtnText}>🔍 Хамтрагчийн биелүүлэлт шалгах</Text>
            </TouchableOpacity>
          </>
        )}

        {/* PENDING */}
        {step === 'pending' && (
          <View style={styles.pendingCard}>
            <LinearGradient colors={[cat.color + '20', 'transparent']} style={styles.pendingGradient} />
            <View style={[styles.pendingIconWrap, { backgroundColor: cat.color + '20' }]}>
              <Text style={styles.pendingIcon}>⏳</Text>
            </View>
            <Text style={styles.pendingTitle}>Хамтрагчийг хүлээж байна</Text>
            <Text style={styles.pendingDesc}>Таны биелүүлэлт амжилттай илгээгдлээ!</Text>
            <View style={[styles.waitingBox, { borderColor: cat.color + '30' }]}>
              <Text style={[styles.waitingText, { color: cat.color }]}>
                ⚡ Хамтрагч баталгаажуулсны дараа +{task.points} Тог оноо нэмэгдэнэ
              </Text>
            </View>
            <TouchableOpacity style={styles.secondaryBtn} onPress={loadPendingCompletions}>
              <Text style={styles.secondaryBtnText}>🔍 Хамтрагчийн биелүүлэлт шалгах</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
              <Text style={styles.backHomeBtnText}>← Нүүр хуудас руу буцах</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <>
            <Text style={styles.sectionLabel}>БАТАЛГААЖУУЛАХ БИЕЛҮҮЛЭЛТҮҮД</Text>
            {loading ? (
              <ActivityIndicator color="#A78BFA" style={{ marginTop: 20 }} />
            ) : pendingCompletions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>Баталгаажуулах зүйл байхгүй!</Text>
                <Text style={styles.emptyDesc}>Бүх биелүүлэлт баталгаажсан байна</Text>
                <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
                  <Text style={styles.backHomeBtnText}>← Буцах</Text>
                </TouchableOpacity>
              </View>
            ) : (
              pendingCompletions.map((completion, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{completion.submitter_name?.charAt(0)}</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{completion.submitter_name}</Text>
                      <Text style={styles.reviewTask}>{completion.task_title}</Text>
                      <Text style={styles.reviewTime}>{new Date(completion.submitted_at).toLocaleString()}</Text>
                    </View>
                    <View style={styles.reviewPtsBadge}>
                      <Text style={styles.reviewPts}>+{completion.task_points}</Text>
                      <Text style={styles.reviewPtsSuffix}>⚡</Text>
                    </View>
                  </View>

                  {completion.photo_url && (
                    <TouchableOpacity
                      style={styles.viewPhotoBtn}
                      onPress={async () => {
                        const res = await fetch(`${API}/api/completions/${completion.id}/photo`);
                        const data = await res.json();
                        alert(data.photo_base64 ? '✅ Зураг байна' : '❌ Зураг байхгүй');
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
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={['#059669', '#34D399']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.reviewBtnGradient}>
                        <Text style={styles.approveBtnText}>✅ Зөвшөөрөх</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => reviewCompletion(completion.id, 'rejected')}
                      disabled={loading}
                      activeOpacity={0.8}
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
  container: { flex: 1, backgroundColor: '#080618' },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  taskIconWrap: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 12 },
  taskIconEmoji: { fontSize: 28 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  ptsBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1 },
  ptsText: { fontSize: 14, fontWeight: '800' },

  body: { padding: 16 },
  stepsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 20, paddingVertical: 8 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepDotText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600' },

  infoCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { fontSize: 16, width: 24 },
  infoText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1 },
  actionBtnIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  actionBtnSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  locationBtn: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
  locationBtnOk: { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)' },
  locationBtnFar: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' },
  locationBtnChecking: { backgroundColor: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' },
  photoBtn: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
  photoDoneBadge: { marginLeft: 'auto' as any, width: 24, height: 24, borderRadius: 12, backgroundColor: '#34D399', alignItems: 'center', justifyContent: 'center' },
  photoDoneText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  photoPreview: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  photoImage: { width: '100%', height: 200 },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, alignItems: 'center' },
  photoOverlayText: { color: '#34D399', fontWeight: '700', fontSize: 13 },

  submitBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnGradient: { padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  secondaryBtn: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', marginBottom: 10 },
  secondaryBtnText: { color: '#A78BFA', fontSize: 14, fontWeight: '600' },

  pendingCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' },
  pendingGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  pendingIconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pendingIcon: { fontSize: 36 },
  pendingTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  pendingDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  waitingBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 20, width: '100%', borderWidth: 1 },
  waitingText: { fontSize: 13, textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  backHomeBtn: { marginTop: 8, padding: 12 },
  backHomeBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

  reviewCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  reviewAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  reviewInfo: { flex: 1 },
  reviewName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  reviewTask: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  reviewTime: { color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 },
  reviewPtsBadge: { alignItems: 'center' },
  reviewPts: { color: '#FBBF24', fontSize: 18, fontWeight: '800' },
  reviewPtsSuffix: { color: '#FBBF24', fontSize: 12 },
  viewPhotoBtn: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  viewPhotoBtnText: { color: '#A78BFA', fontWeight: '600', fontSize: 13 },
  reviewBtns: { flexDirection: 'row', gap: 10 },
  approveBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  reviewBtnGradient: { padding: 14, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  rejectBtnText: { color: '#F87171', fontWeight: '700', fontSize: 14 },
});