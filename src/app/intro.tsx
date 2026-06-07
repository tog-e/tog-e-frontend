import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const QUESTIONS = [
  "1. Өөрийгөө танилцуулаач 🙂",
  "2. Та хоёр анх яаж танилцаж байсан бэ?",
  "3. Анх хэн түрүүлж яриа удирж байсан бэ?",
  "4. Хамгийн дурсамжтай мөчөөсөө хуваалцаач 💫",
  "5. Бие биенээ амьтантай зүйрлэвэл юутай адил шинж чанартай вэ? 🐾",
  "6. Сүүлд хэзээ яаж хамтрагчдаа талархсан бэ?",
  "7. Бие биенийхээ сул талыг надад хэлээч",
  "8. Хамтрагч чинь ирээдүйд юу хийж амьдрахыг мөрөөддөг гэж бодож байна?",
  "9. Та өөрөө ирээдүйд юу хийж амьдрахыг хүсдэг вэ?",
  "10. Хамтрагчийн таны дуртай дуу юу вэ? 🎵",
  "11. Та хамтрагчаа бодох үед ямар дуу санаанд тань ордог вэ? Яагаад?",
  "12. Хамтрагчаа 3 үгээр илэрхийл ✨",
  "13. Хамтрагчдаа юу хандаж хэлмээр байна? 💌",
  "14. Та хоёрын харилцаанд дунд TOG-E-гоос өөр зүйл орж ирэхгүй гэдгийг зөвшөөрч байна уу? 🤝",
];

export default function IntroScreen({ 
  onFinish,
  memberNames,
}: { 
  onFinish: () => void,
  memberNames: string[],
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
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      setFinished(true);
    }
  };

  const prev = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  };

  if (finished) {
    return (
      <View style={styles.finishedContainer}>
        <Text style={styles.finishedEmoji}>🎉</Text>
        <Text style={styles.finishedTitle}>Танилцахад таатай байлаа!</Text>
        <Text style={styles.finishedSub}>
          Та хоёр хамтдаа гайхалтай аян эхлүүлж байна ⚡
        </Text>
        <TouchableOpacity style={styles.finishedBtn} onPress={onFinish}>
          <Text style={styles.finishedBtnText}>Нүүр хуудас руу →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Танилцацгаая 👋</Text>
        <Text style={styles.headerSub}>{currentQ + 1} / {QUESTIONS.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
      </View>

      {/* Question */}
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{QUESTIONS[currentQ]}</Text>
      </View>

      {/* Answers */}
      {memberNames.map((name, i) => (
        <View key={i} style={styles.answerBox}>
          <Text style={styles.answerLabel}>
            {i === 0 ? '💜' : '💛'} {name}
          </Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Хариултаа бичнэ үү..."
            placeholderTextColor="#C4BEDC"
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
          <TouchableOpacity style={styles.prevBtn} onPress={prev}>
            <Text style={styles.prevBtnText}>← Өмнөх</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextBtn, currentQ === 0 && { flex: 1 }]} 
          onPress={next}
        >
          <Text style={styles.nextBtnText}>
            {currentQ === QUESTIONS.length - 1 ? 'Дуусгах ✓' : 'Дараах →'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1035' },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 32 },
  progressFill: { height: 4, backgroundColor: '#6C3DE8', borderRadius: 2 },
  questionBox: {
    backgroundColor: '#2D1A6E', borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 0.5, borderColor: 'rgba(108,61,232,0.4)',
  },
  questionText: { color: '#fff', fontSize: 17, fontWeight: '700', lineHeight: 26 },
  answerBox: { marginBottom: 16 },
  answerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  answerInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 14,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
    minHeight: 80, textAlignVertical: 'top',
  },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  prevBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, alignItems: 'center' },
  prevBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  nextBtn: { flex: 2, backgroundColor: '#6C3DE8', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  finishedContainer: { flex: 1, backgroundColor: '#1A1035', alignItems: 'center', justifyContent: 'center', padding: 32 },
  finishedEmoji: { fontSize: 60, marginBottom: 16 },
  finishedTitle: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  finishedSub: { color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  finishedBtn: { backgroundColor: '#6C3DE8', borderRadius: 14, padding: 16, paddingHorizontal: 32 },
  finishedBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});