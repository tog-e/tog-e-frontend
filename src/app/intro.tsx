import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const QUESTIONS = [
  { q: "Өөрийгөө танилцуулаач 🙂", emoji: "👋", color: "#A78BFA" },
  { q: "Та хоёр анх яаж танилцаж байсан бэ?", emoji: "💫", color: "#F472B6" },
  { q: "Анх хэн түрүүлж яриа өдөж байсан бэ?", emoji: "😄", color: "#60A5FA" },
  { q: "Хамгийн дурсамжтай мөчөөсөө хуваалцаач", emoji: "🌟", color: "#FBBF24" },
  { q: "Бие биенээ амьтантай зүйрлэвэл юутай адил шинж чанартай вэ?", emoji: "🐾", color: "#34D399" },
  { q: "Сүүлд хэзээ яаж хамтрагчдаа талархсан бэ?", emoji: "🙏", color: "#FB923C" },
  { q: "Бие биенийхээ сул талыг надад хэлээч", emoji: "💪", color: "#F87171" },
  { q: "Хамтрагч чинь ирээдүйд юу хийж амьдрахыг мөрөөддөг гэж бодож байна?", emoji: "🚀", color: "#C084FC" },
  { q: "Та өөрөө ирээдүйд юу хийж амьдрахыг хүсдэг вэ?", emoji: "✨", color: "#A78BFA" },
  { q: "Хамтрагчийн таны дуртай дуу юу вэ?", emoji: "🎵", color: "#F472B6" },
  { q: "Та хамтрагчаа бодох үед ямар дуу санаанд тань ордог вэ? Яагаад?", emoji: "🎶", color: "#60A5FA" },
  { q: "Хамтрагчаа 3 үгээр илэрхийл", emoji: "💬", color: "#34D399" },
  { q: "Хамтрагчдаа юу хандаж хэлмээр байна?", emoji: "💌", color: "#F472B6" },
  { q: "Та хоёрын харилцаанд TOG-E-гоос өөр зүйл орж ирэхгүй гэдгийг зөвшөөрч байна уу?", emoji: "🤝", color: "#FBBF24" },
];

const MEMBER_COLORS = ['#A78BFA', '#F472B6'];

export default function IntroScreen({
  onFinish,
  memberNames,
}: {
  onFinish: () => void;
  memberNames: string[];
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: { [name: string]: string } }>({});
  const [finished, setFinished] = useState(false);

  const updateAnswer = (name: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ]: { ...(prev[currentQ] || {}), [name]: text }
    }));
  };

  const next = () => {
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(q => q + 1);
    else setFinished(true);
  };
  const prev = () => { if (currentQ > 0) setCurrentQ(q => q - 1); };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const current = QUESTIONS[currentQ];

  if (finished) {
    return (
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.finishedContainer}>
        <View style={styles.finishedIconWrap}>
          <Text style={styles.finishedEmoji}>🎉</Text>
        </View>
        <Text style={styles.finishedTitle}>Танилцахад таатай байлаа!</Text>
        <Text style={styles.finishedSub}>
          Та хоёр хамтдаа гайхалтай аян эхлүүлж байна ⚡
        </Text>
        <View style={styles.finishedStats}>
          <View style={styles.finishedStat}>
            <Text style={styles.finishedStatNum}>{QUESTIONS.length}</Text>
            <Text style={styles.finishedStatLabel}>Асуулт</Text>
          </View>
          <View style={styles.finishedStatDivider} />
          <View style={styles.finishedStat}>
            <Text style={styles.finishedStatNum}>{memberNames.length}</Text>
            <Text style={styles.finishedStatLabel}>Хүн</Text>
          </View>
          <View style={styles.finishedStatDivider} />
          <View style={styles.finishedStat}>
            <Text style={styles.finishedStatNum}>💜</Text>
            <Text style={styles.finishedStatLabel}>Холбоо</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.finishedBtn} onPress={onFinish} activeOpacity={0.8}>
          <LinearGradient colors={['#7C3AED', '#EC4899']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.finishedBtnGradient}>
            <Text style={styles.finishedBtnText}>Нүүр хуудас руу →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.emojiWrap, { backgroundColor: current.color + '25', borderColor: current.color + '50' }]}>
            <Text style={styles.headerEmoji}>{current.emoji}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Танилцацгаая</Text>
            <Text style={styles.headerSub}>{currentQ + 1} / {QUESTIONS.length}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < currentQ && { backgroundColor: current.color },
                i === currentQ && { backgroundColor: current.color, transform: [{ scaleX: 2 }] },
                i > currentQ && { backgroundColor: 'rgba(255,255,255,0.1)' },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Question card */}
      <View style={[styles.questionCard, { borderColor: current.color + '40' }]}>
        <LinearGradient colors={[current.color + '15', 'transparent']} style={styles.questionGradient} />
        <View style={[styles.questionNumBadge, { backgroundColor: current.color + '25' }]}>
          <Text style={[styles.questionNum, { color: current.color }]}>#{currentQ + 1}</Text>
        </View>
        <Text style={styles.questionText}>{current.q}</Text>
      </View>

      {/* Answer inputs */}
      {memberNames.map((name, i) => (
        <View key={i} style={styles.answerBox}>
          <View style={styles.answerLabelRow}>
            <View style={[styles.answerAvatar, { backgroundColor: MEMBER_COLORS[i] + '30', borderColor: MEMBER_COLORS[i] + '60' }]}>
              <Text style={styles.answerAvatarText}>{name.charAt(0)}</Text>
            </View>
            <Text style={[styles.answerLabel, { color: MEMBER_COLORS[i] }]}>{name}</Text>
          </View>
          <TextInput
            style={[styles.answerInput, { borderColor: answers[currentQ]?.[name] ? MEMBER_COLORS[i] + '40' : 'rgba(255,255,255,0.08)' }]}
            placeholder="Хариултаа бичнэ үү..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={answers[currentQ]?.[name] || ''}
            onChangeText={text => updateAnswer(name, text)}
            multiline
            numberOfLines={3}
          />
        </View>
      ))}

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentQ > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={prev} activeOpacity={0.7}>
            <Text style={styles.prevBtnText}>← Өмнөх</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, currentQ === 0 && { flex: 1 }]}
          onPress={next}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            start={{x:0,y:0}} end={{x:1,y:0}}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>
              {currentQ === QUESTIONS.length - 1 ? 'Дуусгах ✓' : 'Дараах →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Answered indicator */}
      <View style={styles.answeredRow}>
        {memberNames.map((name, i) => {
          const hasAnswer = !!(answers[currentQ]?.[name]);
          return (
            <View key={i} style={[styles.answeredChip, { borderColor: MEMBER_COLORS[i] + '40', backgroundColor: hasAnswer ? MEMBER_COLORS[i] + '15' : 'transparent' }]}>
              <Text style={[styles.answeredText, { color: hasAnswer ? MEMBER_COLORS[i] : 'rgba(255,255,255,0.2)' }]}>
                {hasAnswer ? '✓' : '○'} {name}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  content: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  emojiWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerEmoji: { fontSize: 26 },
  headerRight: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
  progressRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  progressDot: { height: 4, flex: 1, borderRadius: 2 },

  questionCard: {
    marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, overflow: 'hidden', position: 'relative',
  },
  questionGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  questionNumBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 },
  questionNum: { fontSize: 11, fontWeight: '800' },
  questionText: { color: '#fff', fontSize: 17, fontWeight: '700', lineHeight: 26 },

  answerBox: { marginHorizontal: 16, marginBottom: 14 },
  answerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  answerAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  answerAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  answerLabel: { fontSize: 13, fontWeight: '700' },
  answerInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 1,
    minHeight: 88, textAlignVertical: 'top',
  },

  navRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  prevBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prevBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
  nextBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  nextBtnGradient: { padding: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  answeredRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  answeredChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  answeredText: { fontSize: 11, fontWeight: '600' },

  finishedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  finishedIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(167,139,250,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  finishedEmoji: { fontSize: 48 },
  finishedTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  finishedSub: { color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  finishedStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  finishedStat: { flex: 1, alignItems: 'center' },
  finishedStatNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  finishedStatLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 },
  finishedStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 4 },
  finishedBtn: { borderRadius: 16, overflow: 'hidden', width: '100%' },
  finishedBtnGradient: { padding: 16, alignItems: 'center' },
  finishedBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});