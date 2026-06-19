import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { menuSections } from '../data/fptData';
import { COLORS } from '../utils/theme';

/* ── single menu card ── */
const MenuItem = ({ item, onPress }) => (
  <TouchableOpacity style={s.menuItem} onPress={() => onPress(item)} activeOpacity={0.75}>
    <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
      <Ionicons name={item.icon} size={30} color={item.iconColor} />
    </View>
    <Text style={s.menuLabel}>{item.label}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { currentStudent, logout } = useAuth();

  const handlePress = (item) => {
    if (item.screen) navigation.navigate(item.screen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Top Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {/* Avatar placeholder */}
          <View style={s.avatarBox}>
            <Text style={s.avatarEmoji}>🐣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerName} numberOfLines={1}>{currentStudent?.fullName}</Text>
            <Text style={s.headerSub}>FPT University</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {menuSections.map((sec) => {
          // Split items into rows of 2
          const rows = [];
          const items = sec.items;
          for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
          }

          return (
            <View key={sec.section} style={s.section}>
              <Text style={s.sectionTitle}>{sec.section}</Text>

              {rows.map((row, ri) => (
                <View key={ri} style={s.row}>
                  {row.map((item) => (
                    <MenuItem key={item.id} item={item} onPress={handlePress} />
                  ))}
                  {/* If row has only 1 item, add empty spacer */}
                  {row.length === 1 && <View style={s.menuItemSpacer} />}
                </View>
              ))}
            </View>
          );
        })}

        {/* ── Logout ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={s.logoutTxt}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={s.versionTxt}>myFAP v2.0.3 (2)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const ITEM_W = '48%';

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    backgroundColor: COLORS.background, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  avatarBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarEmoji: { fontSize: 24 },
  headerName:  { fontSize: 16, fontWeight: '700', color: COLORS.navy },
  headerSub:   { fontSize: 12, color: COLORS.textSub, marginTop: 1 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },

  /* Scroll */
  scroll: { paddingBottom: 40 },

  /* Section */
  section:      { paddingHorizontal: 16, marginTop: 22 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textSub, letterSpacing: 1.1, marginBottom: 12 },

  /* Grid */
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  menuItem: {
    width: ITEM_W, backgroundColor: COLORS.cardBg, borderRadius: 16,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  menuItemSpacer: { width: ITEM_W },
  iconBox: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  menuLabel: { fontSize: 13, fontWeight: '500', color: COLORS.text, textAlign: 'center' },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 10, paddingVertical: 14,
    backgroundColor: COLORS.dangerBg, borderRadius: 14, gap: 8,
  },
  logoutTxt: { fontSize: 15, fontWeight: '600', color: COLORS.danger },

  versionTxt: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 16 },
});

export default HomeScreen;
