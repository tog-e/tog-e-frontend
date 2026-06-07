import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API = 'http://localhost:8000';

export default function ProfileScreen({ 
  onBack, 
  userId 
}: { 
  onBack: () => void, 
  userId: number | null 
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) {
      alert('Нэрээ оруулна уу!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatar_url: '' }),
      });

      // Нэр шинэчлэх
      const nameRes = await fetch(`${API}/api/auth/update-name/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Алдаа гарлаа');
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
        <Text style={styles.title}>Профайл тохируулах</Text>
        <Text style={styles.sub}>Өөрийнхөө мэдээллийг оруулаарай</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>

        <Text style={styles.label}>Таны нэр</Text>
        <TextInput
          style={styles.input}
          placeholder="Нэрээ оруулна уу"
          placeholderTextColor="#C4BEDC"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Танилцуулга</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Өөрийгөө танилцуулаарай..."
          placeholderTextColor="#C4BEDC"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {saved ? '✅ Хадгалагдлаа!' : 'Хадгалах'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1035' },
  header: {
    backgroundColor: '#6C3DE8', padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 24 },
  avatarBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#2D1A6E', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24,
    borderWidth: 2, borderColor: '#6C3DE8',
  },
  avatarEmoji: { fontSize: 36 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#6C3DE8', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: '#4A2AB0' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});