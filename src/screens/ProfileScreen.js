import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

/* ── QR code drawn with pure View boxes ── */
const QRCode = ({ size = 160 }) => {
  const cell = size / 21;
  // Simplified QR-like pattern (decorative, not scannable)
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0],
  ];
  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 4, borderRadius: 8 }}>
      {pattern.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell_val, ci) => (
            <View
              key={ci}
              style={{ width: cell, height: cell, backgroundColor: cell_val ? '#000' : '#fff' }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const InfoRow = ({ icon, iconBg, iconColor, label, value, masked, onToggleMask, isFontAwesome = false }) => {
  const [show, setShow] = useState(!masked);
  const displayVal = masked && !show ? value : value;

  return (
    <View style={row.wrap}>
      <View style={[row.iconBox, { backgroundColor: iconBg }]}>
        {isFontAwesome ? (
          <FontAwesome5 name={icon} size={16} color={iconColor} solid />
        ) : (
          <Ionicons name={icon} size={18} color={iconColor} />
        )}
      </View>
      <View style={row.info}>
        <Text style={row.label}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={[row.value, { marginTop: 0 }]}>{displayVal}</Text>
          {masked && (
            <TouchableOpacity onPress={() => setShow(!show)} style={[row.eye, { marginLeft: 8 }]}>
              <FontAwesome5 name={show ? 'eye' : 'eye-slash'} size={10} color={COLORS.textSub} solid />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  info: { flex: 1 },
  label: { fontSize: 11, color: COLORS.textLight },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  eye: { padding: 1 },
});

const SectionCard = ({ title, children, barColor = COLORS.primary }) => (
  <View style={sc.wrap}>
    <View style={sc.titleRow}>
      <View style={[sc.titleBar, { backgroundColor: barColor }]} />
      <Text style={sc.title}>{title}</Text>
    </View>
    {children}
  </View>
);

const sc = StyleSheet.create({
  wrap: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  titleBar: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
});

const ProfileScreen = ({ navigation }) => {
  const { currentStudent, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const s = currentStudent;

  return (
    <View style={ps.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ps.scroll}>

        {/* ── Avatar Banner ── */}
        <View style={ps.banner}>
          <View style={ps.bannerCircle1} />
          <View style={ps.bannerCircle2} />

          <View style={ps.avatarBig}>
            <Ionicons name="person" size={44} color="#CBD5E0" />
          </View>
          <Text style={ps.bannerName}>{s?.fullName}</Text>
          {s?.role === 'HD' ? (
            <View style={ps.roleBadgeHD}>
              <Text style={ps.roleTxtHD}>HD</Text>
            </View>
          ) : (
            <View style={ps.roleBadge}>
              <Text style={ps.roleTxt}>{s?.role}</Text>
            </View>
          )}
        </View>

        {/* ── Student Information ── */}
        <SectionCard title="Student Information" barColor="#000">
          <InfoRow
            icon="id-card" iconBg={COLORS.background} iconColor={COLORS.navy}
            label="Roll Number" value={s?.studentCode}
            masked
            isFontAwesome
          />
          <InfoRow
            icon="envelope" iconBg={COLORS.background} iconColor="#EC8F00"
            label="Email" value={s?.email}
            masked
            isFontAwesome
          />
          <InfoRow
            icon="map-marker-alt" iconBg="#E3F2EE" iconColor="#20B27B"
            label="Campus" value={s?.campus}
            isFontAwesome
          />
        </SectionCard>

        {/* ── Student ID / QR ── */}
        <SectionCard title="Student ID" barColor="#F29100">
          <View style={ps.qrContainer}>
            <QRCode size={170} />
          </View>
          <Text style={ps.qrCode}>{s?.studentCode}</Text>
          <Text style={ps.qrHint}>Show this QR code to verify your student identity</Text>

          <TouchableOpacity style={ps.fapLink}>
            <View style={ps.fapQrSmall}>
              <QRCode size={44} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ps.fapLinkLabel}>Check information online</Text>
              <Text style={ps.fapLinkUrl}>https://fap.fpt.edu.vn</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSub} />
          </TouchableOpacity>
        </SectionCard>

        {/* ── Appearance ── */}
        <SectionCard title="Appearance" barColor="#7C3AED">
          <View style={ps.toggleRow}>
            <View style={ps.toggleLeft}>
              <View style={[ps.toggleIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="sunny-outline" size={18} color="#D97706" />
              </View>
              <View>
                <Text style={ps.toggleLabel}>Dark Mode</Text>
                <Text style={ps.toggleSub}>{darkMode ? 'Dark theme is active' : 'Light theme is active'}</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.navy }}
              thumbColor={COLORS.white}
            />
          </View>
        </SectionCard>

        {/* ── Notification Settings ── */}
        <SectionCard title="Notification Settings" barColor="#3B82F6">
          <View style={ps.toggleRow}>
            <View style={ps.toggleLeft}>
              <View style={[ps.toggleIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.green} />
              </View>
              <View>
                <Text style={ps.toggleLabel}>Push Notifications</Text>
                <Text style={ps.toggleSub}>{pushNotif ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
            <View style={[ps.onBadge, { backgroundColor: pushNotif ? COLORS.green : COLORS.border }]}>
              <Text style={[ps.onTxt, { color: pushNotif ? '#fff' : COLORS.textSub }]}>
                {pushNotif ? '● ON' : '○ OFF'}
              </Text>
            </View>
          </View>
        </SectionCard>

        <Text style={ps.version}>myFAP v2.0.3 (2)</Text>
      </ScrollView>
    </View>
  );
};

const ps = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },

  /* Banner */
  banner: {
    backgroundColor: COLORS.navy, alignItems: 'center',
    paddingTop: 32, paddingBottom: 28, overflow: 'hidden', position: 'relative',
    borderRadius: 24,
    marginBottom: 14,
  },
  bannerCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -60 },
  bannerCircle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 },
  avatarBig: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#2D3E5E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 12,
  },
  bannerName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  roleBadge: { backgroundColor: '#2D6A4F', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  roleTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  roleBadgeHD: {
    backgroundColor: '#184953',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTxtHD: {
    fontSize: 10.5, // Chỉnh kích cỡ chữ HD tại đây (Adjust HD font size here)
    fontWeight: '700',
    color: '#0DB47E',
    letterSpacing: 0.5,
  },

  /* QR */
  qrContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#F8F9FA', borderRadius: 12, marginTop: 12, marginBottom: 10 },
  qrCode: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.navy, letterSpacing: 2 },
  qrHint: { textAlign: 'center', fontSize: 12, color: COLORS.textSub, marginTop: 6, marginBottom: 16 },

  fapLink: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F4F8',
    borderRadius: 12, padding: 12, gap: 10,
  },
  fapQrSmall: { borderRadius: 6, overflow: 'hidden' },
  fapLinkLabel: { fontSize: 12, color: COLORS.textSub },
  fapLinkUrl: { fontSize: 14, fontWeight: '600', color: COLORS.navy },

  /* Toggle row */
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  toggleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toggleSub: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
  onBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onTxt: { fontSize: 13, fontWeight: '700' },

  version: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 4 },
});

export default ProfileScreen;
