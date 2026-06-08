import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');

const DAYS = [
  { key: 'mon', label: 'Даваа', short: 'Да', color: '#A78BFA' },
  { key: 'tue', label: 'Мягмар', short: 'Мя', color: '#F472B6' },
  { key: 'wed', label: 'Лхагва', short: 'Лх', color: '#34D399' },
  { key: 'thu', label: 'Пүрэв', short: 'Пү', color: '#60A5FA' },
  { key: 'fri', label: 'Баасан', short: 'Ба', color: '#FBBF24' },
  { key: 'sat', label: 'Бямба', short: 'Бя', color: '#F87171' },
  { key: 'sun', label: 'Ням', short: 'Ня', color: '#C084FC' },
];

const ACTIVITY_OPTIONS = [
  { emoji: '💼', label: 'Ажил', color: '#60A5FA' },
  { emoji: '📚', label: 'Сургууль', color: '#A78BFA' },
  { emoji: '🏋️', label: 'Биеийн тамир', color: '#34D399' },
  { emoji: '📖', label: 'Ном унших', color: '#FBBF24' },
  { emoji: '👥', label: 'Найзтай уулзах', color: '#F472B6' },
  { emoji: '🏠', label: 'Гэрийн ажил', color: '#FB923C' },
  { emoji: '🍳', label: 'Хоол хийх', color: '#F87171' },
  { emoji: '🎮', label: 'Тоглоом', color: '#C084FC' },
  { emoji: '😴', label: 'Амрах', color: '#94A3B8' },
  { emoji: '🚗', label: 'Явах', color: '#2DD4BF' },
];

const CAT_COLOR: { [k: string]: string } = {
  date_ideas: '#F472B6',
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

  const getSchedule = () => activeUser === 'me' ? mySchedule : partnerSchedule;
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
        <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
          <TouchableOpacity onPress={() => { setStep('overview'); setRecommendations([]); }} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <View style={styles.resultTitleRow}>
            <View>
              <Text style={styles.title}>AI санал ✨</Text>
              <Text style={styles.sub}>Хуваарьт тохирсон үйл ажиллагаа</Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiText}>AI</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingBox}>
              <LinearGradient colors={['#3B1F6E', '#1A0A3E']} style={styles.loadingCircle}>
                <ActivityIndicator size="large" color="#A78BFA" />
              </LinearGradient>
              <Text style={styles.loadingTitle}>AI боловсруулж байна...</Text>
              <Text style={styles.loadingText}>Хоёр хүний хуваарьд тохирсон{'\n'}activity хайж байна</Text>
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
                  <View key={i} style={styles.actCard}>
                    <LinearGradient colors={[color + '18', 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.actGradientTop} />
                    <View style={[styles.actAccentBar, { backgroundColor: color }]} />
                    <View style={styles.actInner}>
                      <View style={styles.actHeader}>
                        <View style={[styles.actCatBadge, { backgroundColor: color + '25' }]}>
                          <Text style={[styles.actCatText, { color }]}>{CAT_LABEL[act.category] || act.category}</Text>
                        </View>
                        <View style={[styles.actPtsBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                          <Text style={[styles.actPts, { color }]}>+{act.points} ⚡</Text>
                        </View>
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
                        style={[styles.actBtn, { borderColor: color + '50', backgroundColor: color + '12' }, isAdded && styles.actBtnAdded, isLocked && styles.actBtnLocked]}
                        onPress={() => addAsTask(act)}
                        disabled={!!addedTask}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actBtnText, { color }, isAdded && { color: '#34D399' }, isLocked && { color: 'rgba(255,255,255,0.2)' }]}>
                          {isAdded ? '✅ Нэмэгдсэн!' : isLocked ? '🔒 Өнөөдөр дүүрсэн' : '+ Даалгавар болгох'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
    const selectedCount = data.activities.length + (data.other ? 1 : 0);

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
          <TouchableOpacity onPress={() => setStep('overview')} style={styles.backBtn}>
            <Text style={styles.backText}>← Буцах</Text>
          </TouchableOpacity>
          <View style={styles.dayDetailTitle}>
            <View style={[styles.dayBigBadge, { backgroundColor: day.color + '25', borderColor: day.color + '50' }]}>
              <Text style={[styles.dayBigBadgeText, { color: day.color }]}>{day.short}</Text>
            </View>
            <View>
              <Text style={styles.title}>{day.label}</Text>
              <Text style={styles.sub}>{activeUser === 'me' ? '👤 Таны хуваарь' : '👤 Хамтрагчийн хуваарь'}</Text>
            </View>
          </View>

          {selectedCount > 0 && (
            <View style={styles.selectedCountRow}>
              <Text style={styles.selectedCountText}>{selectedCount} үйл ажиллагаа сонгосон</Text>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {DAYS.map((d, i) => {
              const s = activeUser === 'me' ? mySchedule : partnerSchedule;
              const filled = s[d.key] && (s[d.key].activities.length > 0 || s[d.key].other);
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayNavItem, i === currentDayIndex && { backgroundColor: d.color + '30', borderColor: d.color }]}
                  onPress={() => setCurrentDayIndex(i)}
                >
                  <Text style={[styles.dayNavText, i === currentDayIndex && { color: d.color }]}>{d.short}</Text>
                  {filled && <View style={[styles.dayNavDot, { backgroundColor: d.color }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.inputLabel}>Юу хийдэг вэ? (олныг сонгож болно)</Text>
          <View style={styles.optionsGrid}>
            {ACTIVITY_OPTIONS.map(opt => {
              const selected = data.activities.includes(opt.label);
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.optionCard, selected && { borderColor: opt.color, backgroundColor: opt.color + '18' }]}
                  onPress={() => toggleActivity(day.key, opt.label)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, selected && { color: opt.color }]}>{opt.label}</Text>
                  {selected && (
                    <View style={[styles.optionCheckWrap, { backgroundColor: opt.color }]}>
                      <Text style={styles.optionCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Бусад үйл ажиллагаа:</Text>
          <TextInput
            style={styles.otherInput}
            placeholder="Жишээ нь: Найзтай уулзах, аяллах..."
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
              <TouchableOpacity style={[styles.navNext, { backgroundColor: DAYS[currentDayIndex + 1]?.color || '#7C3AED' }]} onPress={() => setCurrentDayIndex(i => i + 1)}>
                <Text style={styles.navNextText}>Дараах: {DAYS[currentDayIndex + 1]?.label} →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.navNext, { backgroundColor: '#7C3AED' }]} onPress={() => setStep('overview')}>
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Schedule 🗓️</Text>
        <Text style={styles.sub}>Хуваарь оруулаад хамтын activity санал аваарай</Text>

        <View style={styles.userSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'me' && styles.switchActiveMe]}
            onPress={() => setActiveUser('me')}
          >
            <Text style={styles.switchEmoji}>👤</Text>
            <Text style={[styles.switchText, activeUser === 'me' && { color: '#fff' }]}>Миний хуваарь</Text>
            <View style={[styles.switchBadge, { backgroundColor: myFilled > 0 ? '#A78BFA' : 'rgba(255,255,255,0.08)' }]}>
              <Text style={styles.switchBadgeText}>{myFilled}/7</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, activeUser === 'partner' && styles.switchActivePartner]}
            onPress={() => setActiveUser('partner')}
          >
            <Text style={styles.switchEmoji}>👤</Text>
            <Text style={[styles.switchText, activeUser === 'partner' && { color: '#fff' }]}>Хамтрагч</Text>
            <View style={[styles.switchBadge, { backgroundColor: partnerFilled > 0 ? '#F472B6' : 'rgba(255,255,255,0.08)' }]}>
              <Text style={styles.switchBadgeText}>{partnerFilled}/7</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Week grid */}
        <View style={styles.weekGrid}>
          {DAYS.map((day, i) => {
            const schedule = activeUser === 'me' ? mySchedule : partnerSchedule;
            const data = schedule[day.key];
            const hasData = data && (data.activities.length > 0 || data.other);
            const count = data ? data.activities.length + (data.other ? 1 : 0) : 0;
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.weekDayCard, hasData && { borderColor: day.color + '60' }]}
                onPress={() => { setCurrentDayIndex(i); setStep('day'); }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={hasData ? [day.color + '25', day.color + '08'] : ['rgba(255,255,255,0.03)', 'transparent']}
                  style={styles.weekDayGradient}
                >
                  <Text style={[styles.weekDayShort, hasData && { color: day.color }]}>{day.short}</Text>
                  {hasData ? (
                    <View style={[styles.weekDayCount, { backgroundColor: day.color }]}>
                      <Text style={styles.weekDayCountText}>{count}</Text>
                    </View>
                  ) : (
                    <Text style={styles.weekDayPlus}>+</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detail list */}
        <Text style={styles.sectionLabel}>ДЭЛГЭРЭНГҮЙ</Text>
        {DAYS.map((day, i) => {
          const schedule = activeUser === 'me' ? mySchedule : partnerSchedule;
          const data = schedule[day.key];
          const hasData = data && (data.activities.length > 0 || data.other);
          return (
            <TouchableOpacity
              key={day.key}
              style={[styles.dayCard, hasData && { borderColor: day.color + '40' }]}
              onPress={() => { setCurrentDayIndex(i); setStep('day'); }}
              activeOpacity={0.75}
            >
              {hasData && <View style={[styles.dayAccentBar, { backgroundColor: day.color }]} />}
              <View style={[styles.dayCardIcon, { backgroundColor: hasData ? day.color + '20' : 'rgba(255,255,255,0.04)' }]}>
                <Text style={[styles.dayCardIconText, { color: hasData ? day.color : 'rgba(255,255,255,0.3)' }]}>
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
                  <Text style={styles.dayCardEmpty}>Дарж нэмэх</Text>
                )}
              </View>
              <Text style={[styles.dayCardArrow, hasData && { color: day.color }]}>›</Text>
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
            colors={(!formatText(mySchedule) && !formatText(partnerSchedule)) ? ['#1A1040', '#0F0A2E'] : ['#7C3AED', '#A855F7', '#EC4899']}
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
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  resultTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)' },
  aiText: { color: '#A78BFA', fontSize: 13, fontWeight: '800' },
  userSwitch: { flexDirection: 'row', marginTop: 16, gap: 8 },
  switchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 6 },
  switchActiveMe: { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.5)' },
  switchActivePartner: { backgroundColor: 'rgba(244,114,182,0.15)', borderColor: 'rgba(244,114,182,0.5)' },
  switchEmoji: { fontSize: 14 },
  switchText: { flex: 1, color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 12 },
  switchBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  switchBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },

  // WEEK GRID
  weekGrid: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  weekDayCard: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  weekDayGradient: { padding: 10, alignItems: 'center', minHeight: 64, justifyContent: 'center' },
  weekDayShort: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  weekDayCount: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weekDayCountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  weekDayPlus: { color: 'rgba(255,255,255,0.15)', fontSize: 16, fontWeight: '300' },

  dayCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' },
  dayAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  dayCardIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 6 },
  dayCardIconText: { fontSize: 13, fontWeight: '800' },
  dayCardLeft: { flex: 1 },
  dayCardLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  dayCardActivities: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  dayCardEmpty: { fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 3 },
  dayCardArrow: { color: 'rgba(255,255,255,0.2)', fontSize: 22 },

  dayDetailTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  dayBigBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dayBigBadgeText: { fontSize: 16, fontWeight: '800' },
  selectedCountRow: { marginTop: 10, backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  selectedCountText: { color: '#A78BFA', fontSize: 11, fontWeight: '600' },

  dayNavItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  dayNavText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  dayNavDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },

  inputLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 10, marginTop: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative' },
  optionEmoji: { fontSize: 24, marginBottom: 5 },
  optionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', textAlign: 'center' },
  optionCheckWrap: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  optionCheck: { fontSize: 9, color: '#fff', fontWeight: '800' },
  otherInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', fontSize: 14, color: '#fff', marginBottom: 20 },
  navButtons: { flexDirection: 'row', gap: 10 },
  navPrev: { flex: 1, backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  navPrevText: { color: '#C4B5FD', fontWeight: '700' },
  navNext: { flex: 2, borderRadius: 14, padding: 14, alignItems: 'center' },
  navNextText: { color: '#fff', fontWeight: '700' },

  submitBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 12 },
  submitDisabled: { opacity: 0.3 },
  submitGradient: { padding: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loadingTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  loadingText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 12 },
  retryBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  retryText: { color: '#fff', fontWeight: '700' },

  actCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' },
  actGradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  actAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  actInner: { padding: 16 },
  actHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actCatBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actCatText: { fontSize: 11, fontWeight: '700' },
  actPtsBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  actPts: { fontSize: 13, fontWeight: '800' },
  actTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 10 },
  actMeta: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  actMetaChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  actMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  actDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 20, marginBottom: 4 },
  actBtn: { borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  actBtnAdded: { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.4)' },
  actBtnLocked: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
  actBtnText: { fontSize: 13, fontWeight: '700' },
});