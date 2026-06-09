import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

const AVATAR_EMOJIS = ['👤', '🦁', '🐯', '🦊', '🐺', '🦋', '🌸', '⚡', '🔥', '💫', '🌙', '🎯'];

export default function ProfileScreen({
  onBack,
  userId
}: {
  onBack: () => void;
  userId: number | null;
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👤');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  const saveProfile = async () => {
    if (!name.trim()) { alert('Нэрээ оруулна уу!'); return; }
    setLoading(true);
    try {
      await fetch(`${API}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatar_url: selectedEmoji }),
      });
      await fetch(`${API}/api/auth/update-name/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#3B1F6E', '#1A0A3E']} style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{selectedEmoji}</Text>
            </LinearGradient>
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>✏️</Text>
            </View>
          </View>
          <Text style={styles.avatarName}>{name || 'Таны нэр'}</Text>
          <Text style={styles.avatarBio}>{bio || 'Танилцуулга...'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>👤 Профайл</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>⚙️ Тохиргоо</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {activeTab === 'profile' ? (
          <>
            {/* Avatar selector */}
            <Text style={styles.sectionLabel}>AVATAR СОНГОХ</Text>
            <View style={styles.emojiGrid}>
              {AVATAR_EMOJIS.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnActive]}
                  onPress={() => setSelectedEmoji(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                  {selectedEmoji === emoji && (
                    <View style={styles.emojiCheck}>
                      <Text style={styles.emojiCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.sectionLabel}>ХУВИЙН МЭДЭЭЛЭЛ</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Нэр</Text>
              <TextInput
                style={styles.input}
                placeholder="Нэрээ оруулна уу"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Танилцуулга</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Өөрийгөө товч танилцуулаарай..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveProfile}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={saved ? ['#059669', '#34D399'] : loading ? ['#1A1040', '#0F0A2E'] : ['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {saved ? '✅ Хадгалагдлаа!' : 'Хадгалах'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Settings */}
            <Text style={styles.sectionLabel}>АПП ТОХИРГОО</Text>

            {[
              { icon: '🔔', label: 'Мэдэгдэл', sub: 'Push notification тохируулах', color: '#A78BFA' },
              { icon: '🌙', label: 'Харанхуй горим', sub: 'Одоогоор идэвхтэй', color: '#60A5FA' },
              { icon: '🌐', label: 'Хэл', sub: 'Монгол', color: '#34D399' },
              { icon: '🔒', label: 'Нууц үг солих', sub: 'Аюулгүй байдал', color: '#F472B6' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingRow} activeOpacity={0.7}>
                <View style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.settingEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSub}>{item.sub}</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ДАНС</Text>

            {[
              { icon: '📊', label: 'Статистик', sub: 'Миний үйл ажиллагаа', color: '#FBBF24' },
              { icon: '🤝', label: 'Хамтрагч', sub: 'Хамтрагчийн мэдээлэл', color: '#F472B6' },
              { icon: '🗑️', label: 'Данс устгах', sub: 'Бүрмөсөн устгах', color: '#F87171' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingRow} activeOpacity={0.7}>
                <View style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.settingEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSub}>{item.sub}</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
              <Text style={styles.logoutText}>🚪 Гарах</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(167,139,250,0.4)' },
  avatarEmoji: { fontSize: 42 },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#080618' },
  avatarEditText: { fontSize: 12 },
  avatarName: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  avatarBio: { color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center' },

  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tabActive: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: 'rgba(167,139,250,0.4)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#C4B5FD' },

  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },

  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  emojiBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'relative' },
  emojiBtnActive: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: '#A78BFA' },
  emojiText: { fontSize: 24 },
  emojiCheck: { position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center' },
  emojiCheckText: { color: '#fff', fontSize: 8, fontWeight: '800' },

  inputWrap: { marginBottom: 14 },
  inputLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  saveBtnGradient: { padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  settingIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingEmoji: { fontSize: 20 },
  settingInfo: { flex: 1 },
  settingLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  settingSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  settingArrow: { color: 'rgba(255,255,255,0.2)', fontSize: 20 },

  logoutBtn: { backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' },
  logoutText: { color: '#F87171', fontSize: 14, fontWeight: '700' },
});