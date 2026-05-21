import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HomeScreen from './home';


const API = 'http://localhost:8000';

export default function LoginScreen() {
  const [screen, setScreen] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [userId, setUserId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('tog_e_token');
    const savedAccountId = localStorage.getItem('tog_e_account_id');
    const savedUserId = localStorage.getItem('tog_e_user_id');
    if (token && savedAccountId && savedUserId) {
      setAccountId(Number(savedAccountId));
      setUserId(Number(savedUserId));
      setLoggedIn(true);
    }
  }, []);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [password, setPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (loggedIn === null) return null;
  if (loggedIn) return <HomeScreen userId={userId} accountId={accountId} />;

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Email болон нууц үгээ оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoggedIn(true);
        setUserId(data.user_id);
        setAccountId(data.account_id);
        localStorage.setItem('tog_e_token', data.access_token);
        localStorage.setItem('tog_e_account_id', String(data.account_id));
        localStorage.setItem('tog_e_user_id', String(data.user_id));
      } else {
        alert(data.detail || 'Нэвтрэх амжилтгүй');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!name || !email || !partnerEmail || !password) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, partner_emails: [partnerEmail], password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('🎉 Амжилттай!', 'Бүртгэл үүслээ!', [
          { text: 'OK', onPress: () => setScreen('login') }
        ]);
      } else {
        Alert.alert('Алдаа', data.detail || 'Бүртгэл амжилтгүй');
      }
    } catch (e) {
      Alert.alert('Алдаа', 'Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert('Email хаягаа оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password?email=${forgotEmail}`, {
        method: 'POST',
      });
      if (res.ok) {
        setScreen('reset');
      } else {
        alert('Email олдсонгүй');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !resetCode || !newPassword) {
      alert('Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail, 
          code: resetCode.trim(), 
          new_password: newPassword 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Нууц үг амжилттай өөрчлөгдлөө!');
        setScreen('login');
      } else {
        alert(data.detail || 'Код буруу байна');
      }
    } catch (e) {
      alert('Сервертэй холбогдож чадсангүй');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Tog<Text style={styles.logoAccent}>-e</Text></Text>
        <Text style={styles.tagline}>Хамтдаа өсөцгөөе ⚡</Text>
      </View>

      <View style={styles.card}>
        {/* LOGIN */}
        {screen === 'login' && (
          <>
            <TextInput style={styles.input} placeholder="Email хаяг" placeholderTextColor="#8A85A0" value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Нууц үг" placeholderTextColor="#8A85A0" value={loginPassword} onChangeText={setLoginPassword} secureTextEntry />
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Нэвтрэх</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('forgot')}>
              <Text style={styles.forgotText}>Нууц үг мартсан уу?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('signup')}>
              <Text style={styles.switchText}>Бүртгэл үүсгэх →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* SIGNUP */}
        {screen === 'signup' && (
          <>
            <TextInput style={styles.input} placeholder="Таны нэр" placeholderTextColor="#8A85A0" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email хаяг" placeholderTextColor="#8A85A0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Хамтрагчийн email" placeholderTextColor="#8A85A0" value={partnerEmail} onChangeText={setPartnerEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Нууц үг" placeholderTextColor="#8A85A0" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Бүртгүүлэх</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('login')}>
              <Text style={styles.switchText}>← Нэвтрэх</Text>
            </TouchableOpacity>
          </>
        )}

        {/* FORGOT PASSWORD */}
        {screen === 'forgot' && (
          <>
            <Text style={styles.screenTitle}>Нууц үг сэргээх</Text>
            <Text style={styles.screenSub}>Email хаягаа оруулахад код илгээнэ</Text>
            <TextInput style={styles.input} placeholder="Email хаяг" placeholderTextColor="#8A85A0" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleForgotPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Код илгээх</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('login')}>
              <Text style={styles.switchText}>← Буцах</Text>
            </TouchableOpacity>
          </>
        )}

        {/* RESET PASSWORD */}
        {screen === 'reset' && (
          <>
            <Text style={styles.screenTitle}>Шинэ нууц үг</Text>
            <Text style={styles.screenSub}>Имэйлээр ирсэн кодоо оруулна уу</Text>
            <TextInput style={styles.input} placeholder="Email хаяг" placeholderTextColor="#8A85A0" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Баталгаажуулах код" placeholderTextColor="#8A85A0" value={resetCode} onChangeText={setResetCode} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Шинэ нууц үг" placeholderTextColor="#8A85A0" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Нууц үг өөрчлөх</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('login')}>
              <Text style={styles.switchText}>← Буцах</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1A1035', alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 48, fontWeight: '900', color: '#fff' },
  logoAccent: { color: '#F5A623' },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  card: { width: '100%', maxWidth: 400 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  btn: { backgroundColor: '#6C3DE8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#4A2AB0' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#F5A623', textAlign: 'center', marginTop: 16, fontSize: 14 },
  forgotText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 12, fontSize: 13 },
  screenTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  screenSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 },
});