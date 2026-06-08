import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const DAYS = [
  { key: 'mon', label: 'Даваа', short: 'Да' },
  { key: 'tue', label: 'Мягмар', short: 'Мя' },
  { key: 'wed', label: 'Лхагва', short: 'Лх' },
  { key: 'thu', label: 'Пүрэв', short: 'Пү' },
  { key: 'fri', label: 'Баасан', short: 'Ба' },
  { key: 'sat', label: 'Бямба', short: 'Бя' },
  { key: 'sun', label: 'Ням', short: 'Ня' },
];

const ACTIVITY_OPTIONS = [
  { emoji: '💼', label: 'Ажил' },
  { emoji: '📚', label: 'Сургууль' },
  { emoji: '🏋️', label: 'Биеийн тамир' },
  { emoji: '📖', label: 'Ном унших' },
  { emoji: '👥', label: 'Найзтай уулзах' },
  { emoji: '🏠', label: 'Гэрийн ажил' },
  { emoji: '🍳', label: 'Хоол хийх' },
  { emoji: '🎮', label: 'Тоглоом' },
  { emoji: '😴', label: 'Амрах' },
  { emoji: '🚗', label: 'Явах' },
];

const CAT_COLOR: { [k: string]: string } = {
  date_ideas: '#FF6B9D',
  positive_habits: '#A78BFA',
  growing: '#34D399',
  challenges: '#FBBF24',
};
const CAT_LABEL: { [k: string]: string } = {
  date_ideas: '💑 Date idea',
  positive_habits: '💪 Эерэг дадал',
  growing: '🌱 Хамтдаа өсөх',
  challenges: '🏆 Сорилт',
};

type DaySchedule = { activities: string[]; other: string };
type FullSchedule = { [day: string]: DaySchedule };

export default function ScheduleScreen({ onBack, accountId }: { onBack: () => void; accountId?: number | null }) {
  const [step, setStep] = useState<'overview' | 'day' | 'result'>('overview');
  const [activeUser, setActiveUser] = useState<'me' | 'partner'>('me');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [mySchedule, setMySchedule] = useState<FullSchedule>({});
  const [partnerSchedule, setPartnerSchedule] = useState<FullSchedule>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedTask, setAddedTask] = useState<string | null>(null);

  const getSchedule = () => (activeUser === 'me' ? mySchedule : partnerSchedule);
  const setSchedule = (s: FullSchedule) => activeUser === 'me' ? setMySchedule(s) : setPartnerSchedule(s);
  const getDayData = (day: string): DaySchedule => getSchedule()[day] || { activities: [], other: '' };

  const toggleActivity = (day: string, activity: string) => {
    const cur = getDayData(day);
    const exists = cur.activities.includes(activity);
    setSchedule({ ...getSchedule(), [day]: { ...cur, activities: exists ? cur.activities.filter(a => a !== activity) : [...cur.activities, activity] } });
  };
  const setOther = (day: string, text: string) => {
    const cur = getDayData(day);
    setSchedule({ ...getSchedule(), [day]: { ...cur, other: text } });
  };
  const formatText = (s: FullSchedule) =>
    DAYS.map(d => {
      const data = s[d.key];
      if (!data || (!data.activities.length && !data.other)) return null;
      return `${d.label}: ${[...data.activities, data.other].filter(Boolean).join(', ')}`;
    }).filter(Boolean).join('\n');
  const getFilledDays = (s: FullSchedule) =>
    DAYS.filter(d => { const data = s[d.key]; return data && (data.activities.length > 0 || data.other); }).length;

  const getRecommendations = async () => {
    setLoading(true);
    setStep('result');
    const prompt = `Та хос хүний AI туслах юм. Монгол хэлээр хариул.
Хэрэглэгч 1: ${formatText(mySchedule) || 'тодорхойгүй'}
Хэрэглэгч 2: ${formatText(partnerSchedule) || 'тодорхойгүй'}
5 activity санал болго. Зөвхөн JSON:
{"activities": [{"title": "...", "day": "...", "duration": "...", "points": 50, "description": "...", "category": "date_ideas"}]}`;
    try {
      const res = await fetch('https://backend-production-6077.up.railway.app/api/ai/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const text = data[0]?.text || '{}';
      setRecommendations(JSON.parse(text.replace(/```json|```/g, '').trim()).activities || []);
    } catch { setRecommendations([]); }
    setLoading(false);
  };

  const addAsTask = async (act: any) => {
    if (addedTask) { alert('Өнөөдөр AI-с нэг л даалгавар нэмж болно!'); return; }
    try {
      const res = await fetch('https://backend-production-6077.up.railway.app/api/tasks/add-recommended', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, title: act.title, description: act.description, points: act.points, category: act.category, location_name: '' }),
      });
      const data = await res.json();
      if (res.ok) { setAddedTask(act.title); alert('✅ Даалгавар нэмэгдлээ!'); }
      else { alert(data.detail || 'Алдаа гарлаа'); }
    } catch { alert('Сервертэй холбогдож чадсангүй'); }
  };

  // ── RESULT ──
  if (step === 'result') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1A0A3E', '#0A0520']} style={styles.header}>
          <TouchableOpacity onPress={() => { setStep('overview'); setRecommendations([]); }} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI санал ✨</Text>
          <Text style={styles.sub}>Таны хуваарьт тохирсон үйл ажиллагаа</Text>
        </LinearGradient>
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingBox}>
              <View style={styles.loadingIcon}>
                <ActivityIndicator size="large" color="#A78BFA" />
              </View>
              <Text style={styles.loadingTitle}>AI боловсруулж байна...</Text>
              <Text style={styles.loadingText}>Хуваарьд тохирсон activity хайж байна</Text>
            </View>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>😢</Text>
              <Text style={styles.emptyTitle}>Санал гарсангүй</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => setStep('overview')}>
                <Text style={styles.retryText}>Дахин оролдох</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>ТАНЫ ХУВААРЬТ ТОХИРСОН</Text>
              {recommendations.map((act, i) => {
                const color = CAT_COLOR[act.category] || '#A78BFA';
                const isAdded = addedTask === act.title;
                const isLocked = !!addedTask && !isAdded;
                return (
                  <View key={i} style={[styles.actCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
                    <View style={styles.actHeader}>
                      <View style={[styles.actCatBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.actCatText, { color }]}>{CAT_LABEL[act.category] || act.category}</Text>
                      </View>
                      <Text style={[styles.actPts, { color }]}>+{act.points} ⚡</Text>
                    </View>
                    <Text style={styles.actTitle}>{act.title}</Text>
                    <View style={styles.actMeta}>
                      <View style={styles.actMetaChip}>
                        <Text style={styles.actMetaText}>📅 {act.day}</Text>
                      </View>
                      <View style={styles.actMetaChip}>
                        <Text style={styles.actMetaText}>⏱ {act.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.actDesc}>{act.description}</Text>
                    <TouchableOpacity
                      style={[styles.actBtn, { borderColor: color + '50', backgroundColor: color + '15' }, isAdded && styles.actBtnAdded, isLocked && styles.actBtnLocked]}
                      onPress={() => addAsTask(act)}
                      disabled={!!addedTask}
                    >
                      <Text style={[styles.actBtnText, { color }, isAdded && { color: '#34D399' }, isLocked && { color: 'rgba(255,255,255,0.2)' }]}>
                        {isAdded ? '✅ Нэмэгдсэн!' : isLocked ? '🔒 Өнөөдөр дүүрсэн' : 'Даалгавар болгох →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  // ── DAY DETAIL ──
  if (step === 'day') {
    const day = DAYS[currentDayIndex];
    const data = getDayData(day.key);
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1A0A3E', '#0A0520']} style={styles.header}>
          <TouchableOpacity onPress={() => setStep('overview')} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{day.label} гаригт</Text>
          <Text style={styles.sub}>{activeUser === 'me' ? '👤 Таны үйл ажиллагаа' : '👤 Хамтрагчийн үйл ажиллагаа'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.dayNavItem, i === currentDayIndex && styles.dayNavActive]}
                onPress={() => setCurrentDayIndex(i)}
              >
                <Text style={[styles.dayNavText, i === currentDayIndex && styles.dayNavActiveText]}>{d.short}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
        <View style={styles.body}>
          <Text style={styles.inputLabel}>Юу хийдэг вэ?</Text>
          <View style={styles.optionsGrid}>
            {ACTIVITY_OPTIONS.map(opt => {
              const selected = data.activities.includes(opt.label);
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.optionCard, selected && styles.optionCardActive]}
                  onPress={() => toggleActivity(day.key, opt.label)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>{opt.label}</Text>
                  {selected && (
                    <View style={styles.optionCheckWrap}>
                      <Text style={styles.optionCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.inputLabel}>Бусад:</Text>
          <TextInput
            style={styles.otherInput}
            placeholder="Өөр үйл ажиллагаа бичих..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={data.other}
            onChangeText={t => setOther(day.key, t)}
          />
          <View style={styles.navButtons}>
            {currentDayIndex > 0 && (
              <TouchableOpacity style={styles.navPrev} onPress={() => setCurrentDayIndex(i => i - 1)}>
                <Text style={styles.navPrevText}>← Өмнөх</Text>
              </TouchableOpacity>
            )}
            {currentDayIndex < DAYS.length - 1 ? (
              <TouchableOpacity style={styles.navNext} onPress={() => setCurrentDayIndex(i => i + 1)}>
                <Text style={styles.navNextText}>Дараах →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.navNext} onPress={() => setStep('overview')}>
                <Text style={styles.navNextText}>Дуусгах ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── OVERVIEW ──
  const myFilled = getFilledDays(mySchedule);
  const partnerFilled = getFilledDays(partnerSchedule);
  const totalFilled = myFilled + partnerFilled;
  const maxFilled = DAYS.length * 2;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1A0A3E', '#0A0520']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Schedule 🗓️</Text>
        <Text style={styles.sub}>7 хоногийн хуваарь оруулаад AI санал аваарай</Text>

        {/* Progress indicator */}
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(totalFilled / maxFilled) * 100}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{totalFilled}/{maxFilled}</Text>
        </View>

        <View style={styles.userSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'me' && styles.switchActive]}
            onPress={() => setActiveUser('me')}
          >
            <Text style={styles.switchEmoji}>👤</Text>
            <Text style={[styles.switchText, activeUser === 'me' && styles.switchActiveText]}>Миний</Text>
            <View style={[styles.switchBadge, { backgroundColor: myFilled > 0 ? '#A78BFA' : 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.switchBadgeText}>{myFilled}/7</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'partner' && styles.switchActive]}
            onPress={() => setActiveUser('partner')}
          >
            <Text style={styles.switchEmoji}>👤</Text>
            <Text style={[styles.switchText, activeUser === 'partner' && styles.switchActiveText]}>Хамтрагч</Text>
            <View style={[styles.switchBadge, { backgroundColor: partnerFilled > 0 ? '#FF6B9D' : 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.switchBadgeText}>{partnerFilled}/7</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>ДОЛОО ХОНОГ</Text>
        {DAYS.map((day, i) => {
          const schedule = activeUser === 'me' ? mySchedule : partnerSchedule;
          const data = schedule[day.key];
          const hasData = data && (data.activities.length > 0 || data.other);
          const accentColor = activeUser === 'me' ? '#A78BFA' : '#FF6B9D';
          return (
            <TouchableOpacity
              key={day.key}
              style={[styles.dayCard, hasData && { borderColor: accentColor + '40' }]}
              onPress={() => { setCurrentDayIndex(i); setStep('day'); }}
              activeOpacity={0.75}
            >
              {hasData && <View style={[styles.dayAccentBar, { backgroundColor: accentColor }]} />}
              <View style={[styles.dayCardIcon, hasData && { backgroundColor: accentColor + '25' }]}>
                <Text style={[styles.dayCardIconText, hasData && { color: accentColor }]}>
                  {hasData ? '✓' : day.short}
                </Text>
              </View>
              <View style={styles.dayCardLeft}>
                <Text style={[styles.dayCardLabel, hasData && { color: '#fff' }]}>{day.label}</Text>
                {hasData ? (
                  <Text style={styles.dayCardActivities} numberOfLines={1}>
                    {[...(data.activities || []), data.other].filter(Boolean).join(' · ')}
                  </Text>
                ) : (
                  <Text style={styles.dayCardEmpty}>Дарж үйл ажиллагаа нэмэх</Text>
                )}
              </View>
              <Text style={[styles.dayCardArrow, hasData && { color: accentColor }]}>›</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.submitBtn, (!formatText(mySchedule) && !formatText(partnerSchedule)) && styles.submitDisabled]}
          onPress={getRecommendations}
          disabled={!formatText(mySchedule) && !formatText(partnerSchedule)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(!formatText(mySchedule) && !formatText(partnerSchedule)) ? ['#333', '#222'] : ['#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>✨ AI-аас санал авах</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: {
    padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 4 },
  progressBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#A78BFA', borderRadius: 2 },
  progressText: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  userSwitch: { flexDirection: 'row', marginTop: 14, gap: 8 },
  switchBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 6,
  },
  switchActive: { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.4)' },
  switchEmoji: { fontSize: 14 },
  switchText: { flex: 1, color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 12 },
  switchActiveText: { color: '#fff' },
  switchBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  switchBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  dayCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', position: 'relative',
  },
  dayAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  dayCardIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 6,
  },
  dayCardIconText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '800' },
  dayCardLeft: { flex: 1 },
  dayCardLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  dayCardActivities: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  dayCardEmpty: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 3 },
  dayCardArrow: { color: 'rgba(255,255,255,0.2)', fontSize: 22 },
  dayNavItem: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginRight: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
  dayNavActive: { backgroundColor: '#6C3DE8' },
  dayNavText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  dayNavActiveText: { color: '#fff' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 10, marginTop: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionCard: {
    width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative',
  },
  optionCardActive: { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: '#A78BFA' },
  optionEmoji: { fontSize: 24, marginBottom: 5 },
  optionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', textAlign: 'center' },
  optionLabelActive: { color: '#C4B5FD' },
  optionCheckWrap: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center' },
  optionCheck: { fontSize: 9, color: '#fff', fontWeight: '800' },
  otherInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 14, color: '#fff', marginBottom: 20,
  },
  navButtons: { flexDirection: 'row', gap: 10 },
  navPrev: { flex: 1, backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  navPrevText: { color: '#C4B5FD', fontWeight: '700' },
  navNext: { flex: 2, backgroundColor: '#7C3AED', borderRadius: 14, padding: 14, alignItems: 'center' },
  navNextText: { color: '#fff', fontWeight: '700' },
  submitBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  submitDisabled: { opacity: 0.4 },
  submitGradient: { padding: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(167,139,250,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loadingText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 12 },
  retryBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  retryText: { color: '#fff', fontWeight: '700' },
  actCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  actHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  actCatBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actCatText: { fontSize: 11, fontWeight: '700' },
  actPts: { fontSize: 14, fontWeight: '800' },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 8 },
  actMeta: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  actMetaChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  actMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  actDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 20 },
  actBtn: { borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  actBtnAdded: { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.4)' },
  actBtnLocked: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
  actBtnText: { fontSize: 13, fontWeight: '700' },
});