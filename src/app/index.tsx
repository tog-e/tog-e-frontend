import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HomeScreen from "./home";

const API = "http://127.0.0.1:8000";

export default function LoginScreen() {
  const [screen, setScreen] = useState<"login" | "signup" | "forgot" | "reset" | "verify">("login");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("tog_e_token");
    const savedAccountId = localStorage.getItem("tog_e_account_id");
    const savedUserId = localStorage.getItem("tog_e_user_id");
    if (token && savedAccountId && savedUserId) {
      setAccountId(Number(savedAccountId));
      setUserId(Number(savedUserId));
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [myCode, setMyCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (loggedIn === null) return null;
  if (loggedIn) return <HomeScreen userId={userId} accountId={accountId} />;

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { alert("Email болон нууц үгээ оруулна уу"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoggedIn(true);
        setUserId(data.user_id);
        setAccountId(data.account_id);
        localStorage.setItem("tog_e_token", data.access_token);
        localStorage.setItem("tog_e_account_id", String(data.account_id));
        localStorage.setItem("tog_e_user_id", String(data.user_id));
      } else {
        alert(data.detail || "Нэвтрэх амжилтгүй");
      }
    } catch (e) { alert("Сервертэй холбогдож чадсангүй"); }
    setLoading(false);
  };

  const handleSendVerification = async () => {
    if (!name || !email || !partnerEmail || !password) { alert("Бүх талбарыг бөглөнө үү"); return; }
    setLoading(true);
    try {
      await fetch(`${API}/api/auth/send-verification?email=${email}`, { method: "POST" });
      await fetch(`${API}/api/auth/send-verification?email=${partnerEmail}`, { method: "POST" });
      setScreen("verify");
    } catch (e) { alert("Сервертэй холбогдож чадсангүй"); }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!myCode || !partnerCode) { alert("Хоёр кодыг оруулна уу"); return; }
    setLoading(true);
    try {
      const res1 = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: myCode }),
      });
      const res2 = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: partnerEmail, code: partnerCode }),
      });
      if (!res1.ok) { alert("Таны код буруу байна"); setLoading(false); return; }
      if (!res2.ok) { alert("Хамтрагчийн код буруу байна"); setLoading(false); return; }
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, partner_emails: [partnerEmail], password }),
      });
      const data = await res.json();
      if (res.ok) { alert("🎉 Бүртгэл амжилттай үүслээ!"); setScreen("login"); }
      else { alert(data.detail || "Бүртгэл амжилтгүй"); }
    } catch (e) { alert("Сервертэй холбогдож чадсангүй"); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { alert("Email хаягаа оруулна уу"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password?email=${forgotEmail}`, { method: "POST" });
      if (res.ok) { setScreen("reset"); }
      else { alert("Email олдсонгүй"); }
    } catch (e) { alert("Сервертэй холбогдож чадсангүй"); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !resetCode || !newPassword) { alert("Бүх талбарыг бөглөнө үү"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: resetCode.trim(), new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) { alert("✅ Нууц үг амжилттай өөрчлөгдлөө!"); setScreen("login"); }
      else { alert(data.detail || "Код буруу байна"); }
    } catch (e) { alert("Сервертэй холбогдож чадсангүй"); }
    setLoading(false);
  };

  const getTitle = () => {
    if (screen === "login") return { title: "Тавтай морил 👋", sub: "Хамтын аяндаа нэвтрэх" };
    if (screen === "signup") return { title: "Хамтын account ✨", sub: "Хоёулаа нэг аян эхлүүлэх" };
    if (screen === "verify") return { title: "Баталгаажуулах 📩", sub: "Хоёр имэйлд код илгээлээ" };
    if (screen === "forgot") return { title: "Нууц үг сэргээх 🔑", sub: "Имэйлд код илгээнэ" };
    return { title: "Шинэ нууц үг 🔐", sub: "Кодоо оруулаад шинэчлэх" };
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.logo}>Tog<Text style={styles.logoAccent}>-e</Text></Text>
          <Text style={styles.tagline}>Хамтдаа өсөцгөөе</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{getTitle().title}</Text>
          <Text style={styles.cardSub}>{getTitle().sub}</Text>

          {/* LOGIN */}
          {screen === "login" && (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Имэйл хаяг</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#9B96B0"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Нууц үг</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9B96B0"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity onPress={() => setScreen("forgot")} style={styles.forgotBox}>
                <Text style={styles.forgotText}>Нууц үг мартсан уу?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Нэвтрэх →</Text>}
              </TouchableOpacity>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>эсвэл</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreen("signup")}>
                <Text style={styles.secondaryBtnText}>Шинэ account үүсгэх</Text>
              </TouchableOpacity>
            </>
          )}

          {/* SIGNUP */}
          {screen === "signup" && (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Таны нэр</Text>
                <TextInput style={styles.input} placeholder="Нэрээ оруулна уу" placeholderTextColor="#9B96B0" value={name} onChangeText={setName} />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Таны имэйл</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#9B96B0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Хамтрагчийн имэйл</Text>
                <TextInput style={styles.input} placeholder="partner@example.com" placeholderTextColor="#9B96B0" value={partnerEmail} onChangeText={setPartnerEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Нууц үг</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#9B96B0" value={password} onChangeText={setPassword} secureTextEntry />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSendVerification} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Код илгээх →</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("login")}>
                <Text style={styles.backBtnText}>← Нэвтрэх рүү буцах</Text>
              </TouchableOpacity>
            </>
          )}

          {/* VERIFY */}
          {screen === "verify" && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>📧 {email}</Text>
                <Text style={styles.infoText}>📧 {partnerEmail}</Text>
                <Text style={styles.infoSub}>дээрх хаягуудад код илгээлээ</Text>
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Таны код</Text>
                <TextInput style={[styles.input, styles.codeInput]} placeholder="000000" placeholderTextColor="#9B96B0" value={myCode} onChangeText={setMyCode} keyboardType="numeric" maxLength={6} />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Хамтрагчийн код</Text>
                <TextInput style={[styles.input, styles.codeInput]} placeholder="000000" placeholderTextColor="#9B96B0" value={partnerCode} onChangeText={setPartnerCode} keyboardType="numeric" maxLength={6} />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Бүртгүүлэх ✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("signup")}>
                <Text style={styles.backBtnText}>← Буцах</Text>
              </TouchableOpacity>
            </>
          )}

          {/* FORGOT */}
          {screen === "forgot" && (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Имэйл хаяг</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#9B96B0" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleForgotPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Код илгээх</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("login")}>
                <Text style={styles.backBtnText}>← Буцах</Text>
              </TouchableOpacity>
            </>
          )}

          {/* RESET */}
          {screen === "reset" && (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Имэйл хаяг</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#9B96B0" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Баталгаажуулах код</Text>
                <TextInput style={[styles.input, styles.codeInput]} placeholder="000000" placeholderTextColor="#9B96B0" value={resetCode} onChangeText={setResetCode} keyboardType="numeric" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Шинэ нууц үг</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#9B96B0" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Нууц үг өөрчлөх</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("login")}>
                <Text style={styles.backBtnText}>← Буцах</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>Tog-e © 2026 · Монгол 🇲🇳</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0F0A2E",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingVertical: 48,
  },
  logoBox: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#6C3DE8",
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#6C3DE8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  logoEmoji: { fontSize: 28 },
  logo: { fontSize: 36, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  logoAccent: { color: "#F5A623" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  card: {
    width: "100%", maxWidth: 400,
    backgroundColor: "#1A1040",
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: "rgba(108,61,232,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 },
  inputBox: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 14,
    color: "#fff", fontSize: 15,
  },
  codeInput: { fontSize: 20, fontWeight: "700", textAlign: "center", letterSpacing: 8 },
  forgotBox: { alignItems: "flex-end", marginBottom: 16, marginTop: -8 },
  forgotText: { color: "#6C3DE8", fontSize: 13, fontWeight: "600" },
  btn: {
    backgroundColor: "#6C3DE8", borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 8,
    shadowColor: "#6C3DE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  btnDisabled: { backgroundColor: "#3D2A7E", shadowOpacity: 0 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  dividerText: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  secondaryBtn: {
    borderWidth: 1, borderColor: "rgba(108,61,232,0.4)",
    borderRadius: 14, padding: 16, alignItems: "center",
  },
  secondaryBtnText: { color: "#9B8FCC", fontSize: 15, fontWeight: "600" },
  backBtn: { alignItems: "center", marginTop: 16 },
  backBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  infoBox: {
    backgroundColor: "rgba(108,61,232,0.15)", borderRadius: 12,
    padding: 14, marginBottom: 20, borderWidth: 1,
    borderColor: "rgba(108,61,232,0.3)",
  },
  infoText: { color: "#B89EFF", fontSize: 13, fontWeight: "600", marginBottom: 2 },
  infoSub: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 },
  footer: { color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 32 },
});