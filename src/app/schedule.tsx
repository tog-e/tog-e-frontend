import { useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const DAYS = [
  { key: 'mon', label: 'Даваа' },
  { key: 'tue', label: 'Мягмар' },
  { key: 'wed', label: 'Лхагва' },
  { key: 'thu', label: 'Пүрэв' },
  { key: 'fri', label: 'Баасан' },
  { key: 'sat', label: 'Бямба' },
  { key: 'sun', label: 'Ням' },
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
  date_ideas: '#E84B8A',
  positive_habits: '#6C3DE8',
  growing: '#1D9E75',
  challenges: '#F5A623',
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
  const setSchedule = (s: FullSchedule) =>
    activeUser === 'me' ? setMySchedule(s) : setPartnerSchedule(s);
  const getDayData = (day: string): DaySchedule =>
    getSchedule()[day] || { activities: [], other: '' };

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
Хэрэглэгч 1-ийн 7 хоногийн хуваарь:\n${formatText(mySchedule) || 'тодорхойгүй'}
Хэрэглэгч 2-ийн 7 хоногийн хуваарь:\n${formatText(partnerSchedule) || 'тодорхойгүй'}
Эдгээр хуваарьд үндэслэн хоёр хүн хамтдаа хийж болох 5 activity санал болго.
Зөвхөн JSON форматаар буц:
{"activities": [{"title": "...", "day": "...", "duration": "...", "points": 50, "description": "...", "category": "date_ideas"}]}`;
    try {
      const res = await fetch('https://backend-production-6077.up.railway.app/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const text = data[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      setRecommendations(JSON.parse(clean).activities || []);
    } catch { setRecommendations([]); }
    setLoading(false);
  };

  const addAsTask = async (act: any) => {
    if (addedTask) { alert('Өнөөдөр AI-с нэг л даалгавар нэмж болно!'); return; }
    try {
      const res = await fetch('https://backend-production-6077.up.railway.app/api/tasks/add-recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, title: act.title, description: act.description, points: act.points, category: act.category, location_name: '' }),
      });
      const data = await res.json();
      if (res.ok) { setAddedTask(act.title); alert('✅ Даалгавар нэмэгдлээ!'); }
      else { alert(data.detail || 'Алдаа гарлаа'); }
    } catch { alert('Сервертэй холбогдож чадсангүй'); }
  };

  // RESULT
  if (step === 'result') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setStep('overview'); setRecommendations([]); }} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI санал ✨</Text>
          <Text style={styles.sub}>Таны хуваарьт тохирсон үйл ажиллагаа</Text>
        </View>
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#6C3DE8" />
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
                const color = CAT_COLOR[act.category] || '#6C3DE8';
                const isAdded = addedTask === act.title;
                const isLocked = !!addedTask && !isAdded;
                return (
                  <View key={i} style={styles.actCard}>
                    <View style={[styles.actCatBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.actCatText, { color }]}>{CAT_LABEL[act.category] || act.category}</Text>
                    </View>
                    <View style={styles.actTop}>
                      <Text style={styles.actTitle}>{act.title}</Text>
                      <Text style={[styles.actPts, { color }]}>+{act.points} ⚡</Text>
                    </View>
                    <View style={styles.actMeta}>
                      <Text style={styles.actMetaText}>📅 {act.day}</Text>
                      <Text style={styles.actMetaText}>⏱ {act.duration}</Text>
                    </View>
                    <Text style={styles.actDesc}>{act.description}</Text>
                    <TouchableOpacity
                      style={[styles.actBtn, isAdded && styles.actBtnAdded, isLocked && styles.actBtnLocked]}
                      onPress={() => addAsTask(act)}
                      disabled={!!addedTask}
                    >
                      <Text style={[styles.actBtnText, isAdded && { color: '#1D9E75' }, isLocked && { color: 'rgba(255,255,255,0.3)' }]}>
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

  // DAY DETAIL
  if (step === 'day') {
    const day = DAYS[currentDayIndex];
    const data = getDayData(day.key);
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('overview')} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{day.label} гаригт</Text>
          <Text style={styles.sub}>{activeUser === 'me' ? '👤 Таны үйл ажиллагаа' : '👤 Хамтрагчийн үйл ажиллагаа'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayNavScroll}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.dayNavItem, i === currentDayIndex && styles.dayNavActive]}
                onPress={() => setCurrentDayIndex(i)}
              >
                <Text style={[styles.dayNavText, i === currentDayIndex && styles.dayNavActiveText]}>
                  {d.label.slice(0, 2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>{opt.label}</Text>
                  {selected && <Text style={styles.optionCheck}>✓</Text>}
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

  // OVERVIEW
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Schedule 🗓️</Text>
        <Text style={styles.sub}>7 хоногийн хуваарь оруулаад AI санал аваарай</Text>
        <View style={styles.userSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'me' && styles.switchActive]}
            onPress={() => setActiveUser('me')}
          >
            <Text style={[styles.switchText, activeUser === 'me' && styles.switchActiveText]}>👤 Миний</Text>
            <Text style={[styles.switchCount, activeUser === 'me' && styles.switchActiveText]}>{getFilledDays(mySchedule)}/7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'partner' && styles.switchActive]}
            onPress={() => setActiveUser('partner')}
          >
            <Text style={[styles.switchText, activeUser === 'partner' && styles.switchActiveText]}>👤 Хамтрагч</Text>
            <Text style={[styles.switchCount, activeUser === 'partner' && styles.switchActiveText]}>{getFilledDays(partnerSchedule)}/7</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>ДОЛОО ХОНОГ</Text>
        {DAYS.map((day, i) => {
          const schedule = activeUser === 'me' ? mySchedule : partnerSchedule;
          const data = schedule[day.key];
          const hasData = data && (data.activities.length > 0 || data.other);
          return (
            <TouchableOpacity
              key={day.key}
              style={[styles.dayCard, hasData && styles.dayCardFilled]}
              onPress={() => { setCurrentDayIndex(i); setStep('day'); }}
            >
              <View style={[styles.dayCardIcon, hasData && styles.dayCardIconFilled]}>
                <Text style={styles.dayCardIconText}>{hasData ? '✓' : day.label.slice(0, 1)}</Text>
              </View>
              <View style={styles.dayCardLeft}>
                <Text style={[styles.dayCardLabel, hasData && styles.dayCardLabelFilled]}>{day.label}</Text>
                {hasData ? (
                  <Text style={styles.dayCardActivities} numberOfLines={1}>
                    {[...(data.activities || []), data.other].filter(Boolean).join(' · ')}
                  </Text>
                ) : (
                  <Text style={styles.dayCardEmpty}>Дарж үйл ажиллагаа нэмэх</Text>
                )}
              </View>
              <Text style={styles.dayCardArrow}>›</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.submitBtn, (!formatText(mySchedule) && !formatText(partnerSchedule)) && styles.submitDisabled]}
          onPress={getRecommendations}
          disabled={!formatText(mySchedule) && !formatText(partnerSchedule)}
        >
          <Text style={styles.submitText}>✨ AI-аас санал авах</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A2E' },
  header: {
    backgroundColor: '#1A1040', padding: 24, paddingTop: 52,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(108,61,232,0.2)',
  },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  userSwitch: { flexDirection: 'row', marginTop: 16, gap: 8 },
  switchBtn: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  switchActive: { backgroundColor: '#6C3DE8', borderColor: '#6C3DE8' },
  switchText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 12 },
  switchActiveText: { color: '#fff' },
  switchCount: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 12 },
  dayCard: {
    backgroundColor: '#1A1040', borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  dayCardFilled: { borderColor: 'rgba(108,61,232,0.5)' },
  dayCardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  dayCardIconFilled: { backgroundColor: 'rgba(108,61,232,0.3)' },
  dayCardIconText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  dayCardLeft: { flex: 1 },
  dayCardLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  dayCardLabelFilled: { color: '#fff' },
  dayCardActivities: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 },
  dayCardEmpty: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 3 },
  dayCardArrow: { color: 'rgba(255,255,255,0.2)', fontSize: 20 },
  dayNavScroll: { marginTop: 14 },
  dayNavItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
  dayNavActive: { backgroundColor: '#6C3DE8' },
  dayNavText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  dayNavActiveText: { color: '#fff' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 10, marginTop: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionCard: {
    width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative',
  },
  optionCardActive: { backgroundColor: 'rgba(108,61,232,0.2)', borderColor: '#6C3DE8' },
  optionEmoji: { fontSize: 22, marginBottom: 4 },
  optionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textAlign: 'center' },
  optionLabelActive: { color: '#B89EFF' },
  optionCheck: { position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#6C3DE8', fontWeight: '800' },
  otherInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 14, color: '#fff', marginBottom: 20,
  },
  navButtons: { flexDirection: 'row', gap: 10 },
  navPrev: { flex: 1, backgroundColor: 'rgba(108,61,232,0.2)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(108,61,232,0.3)' },
  navPrevText: { color: '#B89EFF', fontWeight: '700' },
  navNext: { flex: 2, backgroundColor: '#6C3DE8', borderRadius: 12, padding: 14, alignItems: 'center' },
  navNextText: { color: '#fff', fontWeight: '700' },
  submitBtn: { backgroundColor: '#6C3DE8', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitDisabled: { backgroundColor: 'rgba(108,61,232,0.3)' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 16 },
  loadingText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 12 },
  retryBtn: { backgroundColor: '#6C3DE8', borderRadius: 10, padding: 12, marginTop: 16 },
  retryText: { color: '#fff', fontWeight: '700' },
  actCard: { backgroundColor: '#1A1040', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  actCatBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  actCatText: { fontSize: 11, fontWeight: '700' },
  actTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1, marginRight: 8 },
  actPts: { fontSize: 15, fontWeight: '800' },
  actMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  actMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  actDesc: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 20 },
  actBtn: { backgroundColor: 'rgba(108,61,232,0.2)', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(108,61,232,0.4)' },
  actBtnAdded: { backgroundColor: 'rgba(29,158,117,0.2)', borderColor: 'rgba(29,158,117,0.4)' },
  actBtnLocked: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
  actBtnText: { color: '#B89EFF', fontSize: 13, fontWeight: '700' },
});