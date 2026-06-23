import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, Image,
  Animated, Dimensions, Modal,
} from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { menuSections } from '../data/fptData';
import { COLORS } from '../utils/theme';

/* ── email mask utility ── */
const maskEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 6) {
    return name.slice(0, 2) + '***' + name.slice(-1) + '@' + domain;
  }
  return name.slice(0, 3) + '***' + name.slice(-3) + '@' + domain;
};

/* ── single menu card ── */
const MenuItem = ({ item, onPress }) => (
  <TouchableOpacity style={s.menuItem} onPress={() => onPress(item)} activeOpacity={0.75}>
    <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
      {item.isFontAwesome ? (
        <FontAwesome5 name={item.icon} size={28} color={item.iconColor} solid />
      ) : item.isFontAwesome6 ? (
        <FontAwesome6 name={item.icon} size={26} color={item.iconColor} solid />
      ) : (
        <Ionicons name={item.icon} size={30} color={item.iconColor} />
      )}
    </View>
    <Text style={s.menuLabel}>{item.label}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { currentStudent, logout } = useAuth();
  
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = screenWidth * 0.75;
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 0);
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setSidebarOpen(false);
    });
  };

  const handlePress = (item) => {
    if (item.screen) navigation.navigate(item.screen);
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  return (
    <View style={s.root}>
      {/* ── Navy safe area for status bar + header ── */}
      <SafeAreaView style={s.safeHeader}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
        <View style={s.header}>
          <TouchableOpacity style={s.headerLeft} onPress={openSidebar} activeOpacity={0.7}>
            <View style={s.avatarBox}>
              <Image source={require('../../assets/fap-logo.jpg')} style={s.avatarImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.headerName} numberOfLines={1}>{currentStudent?.fullName}</Text>
              <Text style={s.headerSub}>FPT University</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity style={s.bellBtn}> */}
            <FontAwesome5 name="bell" size={20} color="#fff" solid />
          {/* </TouchableOpacity> */}
        </View>
      </SafeAreaView>

      {/* ── Content with light background ── */}
      <View style={s.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {menuSections.map((sec) => {
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
                    {row.length === 1 && <View style={s.menuItemSpacer} />}
                  </View>
                ))}
              </View>
            );
          })}

          <Text style={s.versionTxt}>myFAP v2.0.3 (2)</Text>
        </ScrollView>
      </View>

      {/* ── Sidebar Drawer Overlay rendered in a transparent Modal ── */}
      <Modal
        transparent={true}
        visible={sidebarOpen}
        onRequestClose={closeSidebar}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={s.backdropTouchable}
            activeOpacity={1}
            onPress={closeSidebar}
          >
            <Animated.View
              style={[
                s.backdropBg,
                {
                  opacity: slideAnim.interpolate({
                    inputRange: [-drawerWidth, 0],
                    outputRange: [0, 0.4],
                  }),
                },
              ]}
            />
          </TouchableOpacity>

          {/* ── Sidebar Content Panel ── */}
          <Animated.View
            style={[
              s.sidebarContainer,
              {
                width: drawerWidth,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={s.sidebarInner}>
              <View style={s.sidebarHeader}>
                <View style={s.largeAvatarCircle}>
                  <Ionicons name="person" size={54} color="#9CA3AF" />
                </View>
                <Text style={s.sidebarName} numberOfLines={2}>
                  {currentStudent?.fullName}
                </Text>
                
                <View style={s.emailRow}>
                  <Text style={s.sidebarEmail}>
                    {isEmailVisible ? currentStudent?.email : maskEmail(currentStudent?.email)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setIsEmailVisible(!isEmailVisible)} 
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={isEmailVisible ? "eye-outline" : "eye-off-outline"}
                      size={16}
                      color="rgba(255, 255, 255, 0.6)"
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.balancePill}>
                  <Text style={s.balanceTxt}>Balance: 0.0 VND</Text>
                </View>
              </View>

              {/* Bottom Logout Button */}
              <View style={s.sidebarFooter}>
                <TouchableOpacity style={s.sidebarLogoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                  <Ionicons name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.sidebarLogoutTxt}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const ITEM_W = '48%';

const s = StyleSheet.create({
  root:       { flex: 1 },
  safeHeader: { backgroundColor: COLORS.navy },
  content:    { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    backgroundColor: COLORS.navy, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  avatarBox: {
    width: 40, height: 40, borderRadius: 10,
    overflow: 'hidden', marginRight: 10,
    backgroundColor: '#fff',
  },
  avatarImg: { width: 40, height: 40, borderRadius: 12, resizeMode: 'contain' },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Scroll */
  scroll: { paddingBottom: 40 },

  /* Section */
  section: { paddingHorizontal: 16, marginTop: 22 },
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

  versionTxt: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 24, marginBottom: 16 },

  /* Sidebar Drawer styles */
  backdropTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backdropBg: {
    flex: 1,
    backgroundColor: '#000',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#1a2436', // Premium dark navy
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 9999,
  },
  sidebarInner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  largeAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sidebarEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  balancePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  balanceTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  sidebarFooter: {
    marginBottom: 20,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7F1D1D', // Red-900 matching screenshot
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
  },
  sidebarLogoutTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HomeScreen;
