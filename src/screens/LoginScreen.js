import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fptStudents } from '../data/fptData';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const student = fptStudents.find(
        s => s.username.toLowerCase() === username.trim().toLowerCase()
          && s.password === password.trim()
      );
      if (student) {
        login(student);
      } else {
        setError('Mã sinh viên hoặc mật khẩu không đúng!');
      }
      setLoading(false);
    }, 600);
  };

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Banner ── */}
          <View style={s.banner}>
            <View style={s.bCircle1} />
            <View style={s.bCircle2} />
            <View style={s.bCircle3} />
            <View style={s.logoBox}>
              <Text style={s.logoEmoji}>🎓</Text>
            </View>
            <Text style={s.appName}>myFAP</Text>
            <Text style={s.appTag}>FPT University Student Portal</Text>
          </View>

          {/* ── Form Card ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Đăng nhập</Text>
            <Text style={s.cardSub}>Nhập thông tin tài khoản FAP của bạn</Text>

            {/* Student ID */}
            <Text style={s.label}>MÃ SINH VIÊN</Text>
            <View style={[s.inputRow, error && !username && s.inputErr]}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSub} style={s.iIcon} />
              <TextInput
                style={s.input}
                placeholder="Nhập mã sinh viên"
                placeholderTextColor={COLORS.textLight}
                value={username}
                onChangeText={t => { setUsername(t); setError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={[s.label, { marginTop: 14 }]}>MẬT KHẨU</Text>
            <View style={[s.inputRow, error && !password && s.inputErr]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSub} style={s.iIcon} />
              <TextInput
                style={s.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off-outline'} size={20} color={COLORS.textSub} />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={15} color={COLORS.danger} />
                <Text style={s.errorTxt}>{error}</Text>
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity style={[s.btn, loading && s.btnDim]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <Text style={s.btnTxt}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
            </TouchableOpacity>

            {/* Demo chips */}
            <View style={s.demo}>
              <Text style={s.demoTitle}>Tài khoản demo:</Text>
              <View style={s.demoRow}>
                <TouchableOpacity style={s.demoChip} onPress={() => fillDemo('thuan', '123456')}>
                  <Text style={s.demoTxt}>thuan / 123456</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.demoChip} onPress={() => fillDemo('hoai', '123456')}>
                  <Text style={s.demoTxt}>hoai / 123456</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={s.footer}>myFAP v2.0.3 (2)</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.navy },
  scroll: { flexGrow: 1 },

  /* Banner */
  banner: {
    backgroundColor: COLORS.navy, alignItems: 'center',
    paddingTop: 64, paddingBottom: 52, overflow: 'hidden', position: 'relative',
  },
  bCircle1: { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)', top:-70, right:-60 },
  bCircle2: { position:'absolute', width:160, height:160, borderRadius:80,  backgroundColor:'rgba(255,255,255,0.05)', bottom:-20, left:-40 },
  bCircle3: { position:'absolute', width:120, height:120, borderRadius:60,  backgroundColor:'rgba(255,255,255,0.08)', top:20, left:30 },
  logoBox:  { width:80, height:80, borderRadius:20, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center', marginBottom:14 },
  logoEmoji:{ fontSize:40 },
  appName:  { fontSize:34, fontWeight:'800', color:'#fff', letterSpacing:2 },
  appTag:   { fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:4 },

  /* Card */
  card:     { flex:1, backgroundColor:COLORS.background, borderTopLeftRadius:30, borderTopRightRadius:30, padding:28, paddingTop:34 },
  cardTitle:{ fontSize:24, fontWeight:'700', color:COLORS.text, marginBottom:5 },
  cardSub:  { fontSize:14, color:COLORS.textSub, marginBottom:26 },

  /* Fields */
  label:    { fontSize:11, fontWeight:'600', color:COLORS.textSub, letterSpacing:1.2, marginBottom:8 },
  inputRow: {
    flexDirection:'row', alignItems:'center', backgroundColor:COLORS.cardBg,
    borderRadius:12, borderWidth:1.5, borderColor:COLORS.border,
    paddingHorizontal:14,
    shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.04, shadowRadius:8, elevation:2,
  },
  inputErr: { borderColor:COLORS.danger },
  iIcon:    { marginRight:10 },
  input:    { flex:1, paddingVertical:15, fontSize:15, color:COLORS.text },
  eyeBtn:   { padding:6 },

  /* Error */
  errorBox: { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.dangerBg, padding:12, borderRadius:12, marginTop:12 },
  errorTxt: { color:COLORS.danger, fontSize:13, fontWeight:'500', marginLeft:6, flex:1 },

  /* Button */
  btn:      {
    backgroundColor:COLORS.navy, borderRadius:14, paddingVertical:16,
    alignItems:'center', marginTop:20, marginBottom:24,
    shadowColor:COLORS.navy, shadowOffset:{width:0,height:6}, shadowOpacity:0.3, shadowRadius:12, elevation:6,
  },
  btnDim:   { opacity:0.7 },
  btnTxt:   { color:'#fff', fontSize:16, fontWeight:'700', letterSpacing:0.5 },

  /* Demo */
  demo:      { borderTopWidth:1, borderTopColor:COLORS.border, paddingTop:16, alignItems:'center' },
  demoTitle: { fontSize:12, color:COLORS.textSub, marginBottom:10, fontWeight:'500' },
  demoRow:   { flexDirection:'row', gap:10 },
  demoChip:  { backgroundColor:'#EEF2FF', paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:'#C7D2FE' },
  demoTxt:   { fontSize:12, color:'#4338CA', fontWeight:'600' },

  footer: { textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.45)', paddingVertical:14, backgroundColor:COLORS.navy },
});

export default LoginScreen;
