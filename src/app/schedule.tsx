
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

type DaySchedule = { activities: string[]; other: string; };
type FullSchedule = { [day: string]: DaySchedule };

export default function ScheduleScreen({ onBack, accountId }: { onBack: () => void, accountId?: number | null }) {
  const [step, setStep] = useState<'overview' | 'day' | 'result'>('overview');
  const [activeUser, setActiveUser] = useState<'me' | 'partner'>('me');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [mySchedule, setMySchedule] = useState<FullSchedule>({});
  const [partnerSchedule, setPartnerSchedule] = useState<FullSchedule>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedTask, setAddedTask] = useState<string | null>(null);

  const addAsTask = async (act: any) => {
    if (addedTask) {
      alert('Өнөөдөр AI-с нэг л даалгавар нэмж болно!');
      return;
    }
    try {
      const res = await fetch('https://backend-production-6077.up.railway.app/api/tasks/add-recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          title: act.title,
          description: act.description,
          points: act.points,
          category: act.category,
          location_name: '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddedTask(act.title);
        alert('✅ Даалгавар нэмэгдлээ! Нүүр дэлгэц дээр харагдана.');
      } else {
        alert(data.detail || 'Алдаа гарлаа');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
  };

  const getSchedule = () => activeUser === 'me' ? mySchedule : partnerSchedule;
  const setSchedule = (s: FullSchedule) => activeUser === 'me' ? setMySchedule(s) : setPartnerSchedule(s);

  const getDayData = (day: string): DaySchedule => getSchedule()[day] || { activities: [], other: '' };

  const toggleActivity = (day: string, activity: string) => {
    const current = getDayData(day);
    const exists = current.activities.includes(activity);
    const updated = exists ? current.activities.filter(a => a !== activity) : [...current.activities, activity];
    setSchedule({ ...getSchedule(), [day]: { ...current, activities: updated } });
  };

  const setOther = (day: string, text: string) => {
    const current = getDayData(day);
    setSchedule({ ...getSchedule(), [day]: { ...current, other: text } });
  };

  const formatScheduleText = (schedule: FullSchedule) => {
    return DAYS.map(d => {
      const data = schedule[d.key];
      if (!data || (data.activities.length === 0 && !data.other)) return null;
      const items = [...data.activities, data.other].filter(Boolean).join(', ');
      return `${d.label}: ${items}`;
    }).filter(Boolean).join('\n');
  };

  const getRecommendations = async () => {
    setLoading(true);
    setStep('result');
    const myText = formatScheduleText(mySchedule);
    const partnerText = formatScheduleText(partnerSchedule);

    const prompt = `Та хос хүний AI туслах юм. Монгол хэлээр хариул.
Хэрэглэгч 1-ийн 7 хоногийн хуваарь:
${myText || 'тодорхойгүй'}
Хэрэглэгч 2-ийн 7 хоногийн хуваарь:
${partnerText || 'тодорхойгүй'}
Эдгээр хуваарьд үндэслэн хоёр хүн хамтдаа хийж болох 5 activity санал болго.
Зөвхөн JSON форматаар буц:
{"activities": [{"title": "...", "day": "...", "duration": "...", "points": 50, "description": "...", "category": "date_ideas"}]}`;

    console.log(`${prompt}`)
    try {
      const response = await fetch('https://backend-production-6077.up.railway.app/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log(`before clean raw data: ${JSON.stringify(data)}`)

      const text = data[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      console.log(`after clean data: ${JSON.stringify(clean)}`)

      const parsed = JSON.parse(clean);
      setRecommendations(parsed.activities || []);


      // const data = await response.json();
      // console.log(`JSON.stringify data: ${JSON.stringify(data)}`)
      // console.log(` data: ${data}`)
      

      // const text = data.content?.[0]?.text || '{}';
      // const clean = text.replace(/```json|```/g, '').trim();
      // const parsed = JSON.parse(clean);
      // setRecommendations(parsed.activities || []);
    } catch (e) {
      setRecommendations([]);
    }
    setLoading(false);
  };

  const categoryColor: { [key: string]: string } = {
    date_ideas: '#E84B8A',
    positive_habits: '#6C3DE8',
    growing: '#1D9E75',
    challenges: '#F5A623',
  };

  const categoryLabel: { [key: string]: string } = {
    date_ideas: '💑 Date idea',
    positive_habits: '💪 Эерэг дадал',
    growing: '🌱 Хамтдаа өсөх',
    challenges: '🏆 Сорилт',
  };

  const getFilledDays = (schedule: FullSchedule) =>
    DAYS.filter(d => {
      const data = schedule[d.key];
      return data && (data.activities.length > 0 || data.other);
    }).length;

  // ── RESULT ──
  if (step === 'result') {
    return (
      <ScrollView style={styles.container}>
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
              {recommendations.map((act, i) => (
                <View key={i} style={styles.actCard}>
                  <View style={[styles.actCatBadge, { backgroundColor: (categoryColor[act.category] || '#6C3DE8') + '20' }]}>
                    <Text style={[styles.actCatText, { color: categoryColor[act.category] || '#6C3DE8' }]}>
                      {categoryLabel[act.category] || act.category}
                    </Text>
                  </View>
                  <View style={styles.actTop}>
                    <Text style={styles.actTitle}>{act.title}</Text>
                    <Text style={styles.actPts}>+{act.points} ⚡</Text>
                  </View>
                  <View style={styles.actMeta}>
                    <Text style={styles.actMetaText}>📅 {act.day}</Text>
                    <Text style={styles.actMetaText}>⏱ {act.duration}</Text>
                  </View>
                  <Text style={styles.actDesc}>{act.description}</Text>
                  <TouchableOpacity 
  style={[styles.actBtn, addedTask === act.title && styles.actBtnAdded]}
  onPress={() => addAsTask(act)}
  disabled={!!addedTask}
>
  <Text style={styles.actBtnText}>
    {addedTask === act.title ? '✅ Нэмэгдсэн!' : addedTask ? '🔒 Өнөөдөр дүүрсэн' : 'Даалгавар болгох →'}
  </Text>
</TouchableOpacity>
                </View>
              ))}
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
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('overview')} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{day.label} гаригт</Text>
          <Text style={styles.sub}>{activeUser === 'me' ? '👤 Таны үйл ажиллагаа' : '👤 Хамтрагчийн үйл ажиллагаа'}</Text>
          <View style={styles.dayNav}>
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
          </View>
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
            placeholderTextColor="#C4BEDC"
            value={data.other}
            onChangeText={text => setOther(day.key, text)}
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
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>7 хоногийн хуваарь</Text>
        <Text style={styles.sub}>Та болон хамтрагчийн үйл ажиллагаа</Text>
        <View style={styles.userSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'me' && styles.switchActive]}
            onPress={() => setActiveUser('me')}
          >
            <Text style={[styles.switchText, activeUser === 'me' && styles.switchActiveText]}>👤 Миний хуваарь</Text>
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
              <View style={styles.dayCardLeft}>
                <Text style={[styles.dayCardLabel, hasData && styles.dayCardLabelFilled]}>{day.label}</Text>
                {hasData ? (
                  <Text style={styles.dayCardActivities} numberOfLines={1}>
                    {[...(data.activities || []), data.other].filter(Boolean).join(' · ')}
                  </Text>
                ) : (
                  <Text style={styles.dayCardEmpty}>Хоосон — дарж нэмэх</Text>
                )}
              </View>
              <View style={[styles.dayCardDot, hasData && styles.dayCardDotFilled]}>
                <Text style={[styles.dayCardDotText, hasData && { color: '#fff' }]}>{hasData ? '✓' : '+'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.submitBtn, (!formatScheduleText(mySchedule) && !formatScheduleText(partnerSchedule)) && styles.submitDisabled]}
          onPress={getRecommendations}
          disabled={!formatScheduleText(mySchedule) && !formatScheduleText(partnerSchedule)}
        >
          <Text style={styles.submitText}>✨ AI-аас санал авах</Text>
        </TouchableOpacity>
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
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  userSwitch: { flexDirection: 'row', marginTop: 16, gap: 8 },
  switchBtn: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  switchActive: { backgroundColor: '#6C3DE8' },
  switchText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 12 },
  switchActiveText: { color: '#fff' },
  switchCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#8A85A0', marginBottom: 10, letterSpacing: 0.5 },
  dayCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E8E2F8',
  },
  dayCardFilled: { borderColor: '#6C3DE8', borderWidth: 1 },
  dayCardLeft: { flex: 1 },
  dayCardLabel: { fontSize: 14, fontWeight: '700', color: '#1A1035' },
  dayCardLabelFilled: { color: '#6C3DE8' },
  dayCardActivities: { fontSize: 12, color: '#8A85A0', marginTop: 3 },
  dayCardEmpty: { fontSize: 12, color: '#C4BEDC', marginTop: 3 },
  dayCardDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center',
  },
  dayCardDotFilled: { backgroundColor: '#6C3DE8' },
  dayCardDotText: { fontSize: 14, color: '#6C3DE8' },
  dayNav: { flexDirection: 'row', marginTop: 14, gap: 4 },
  dayNavItem: {
    flex: 1, padding: 6, borderRadius: 8, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dayNavActive: { backgroundColor: '#6C3DE8' },
  dayNavText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },
  dayNavActiveText: { color: '#fff' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#1A1035', marginBottom: 10, marginTop: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionCard: {
    width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#E8E2F8',
    position: 'relative',
  },
  optionCardActive: { backgroundColor: '#F0EBFF', borderColor: '#6C3DE8', borderWidth: 1.5 },
  optionEmoji: { fontSize: 22, marginBottom: 4 },
  optionLabel: { fontSize: 11, color: '#8A85A0', fontWeight: '600', textAlign: 'center' },
  optionLabelActive: { color: '#6C3DE8' },
  optionCheck: { position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#6C3DE8', fontWeight: '800' },
  otherInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 0.5, borderColor: '#E8E2F8',
    fontSize: 14, color: '#1A1035', marginBottom: 20,
  },
  navButtons: { flexDirection: 'row', gap: 10 },
  navPrev: { flex: 1, backgroundColor: '#F0EBFF', borderRadius: 12, padding: 14, alignItems: 'center' },
  navPrevText: { color: '#6C3DE8', fontWeight: '700' },
  navNext: { flex: 2, backgroundColor: '#6C3DE8', borderRadius: 12, padding: 14, alignItems: 'center' },
  navNextText: { color: '#fff', fontWeight: '700' },
  submitBtn: { backgroundColor: '#6C3DE8', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitDisabled: { backgroundColor: '#C4BEDC' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingTitle: { fontSize: 16, fontWeight: '700', color: '#1A1035', marginTop: 16 },
  loadingText: { fontSize: 13, color: '#8A85A0', marginTop: 8, textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A1035', marginTop: 12 },
  retryBtn: { backgroundColor: '#6C3DE8', borderRadius: 10, padding: 12, marginTop: 16 },
  retryText: { color: '#fff', fontWeight: '700' },
  actCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#E8E2F8' },
  actCatBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  actCatText: { fontSize: 11, fontWeight: '700' },
  actTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#1A1035', flex: 1, marginRight: 8 },
  actPts: { fontSize: 15, fontWeight: '800', color: '#F5A623' },
  actMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  actMetaText: { fontSize: 12, color: '#8A85A0' },
  actDesc: { fontSize: 13, color: '#8A85A0', marginTop: 8, lineHeight: 20 },
  actBtn: { backgroundColor: '#F0EBFF', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 12 },
  actBtnAdded: { backgroundColor: '#E8F8F0' },
  actBtnText: { color: '#6C3DE8', fontSize: 13, fontWeight: '700' },
});