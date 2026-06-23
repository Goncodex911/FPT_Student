import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { scheduleData, semesters } from '../data/fptData';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

// Dynamic date helpers
const getWeekDays = (start) => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const pad = (n) => String(n).padStart(2, '0');
    days.push({
      short: dayNames[d.getDay()],
      date: d.getDate(),
      formatted: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return days;
};

const getSemesterStart = (semIdx) => {
  if (semIdx === 0) return new Date(2026, 5, 15); // SUMMER2026 starts June 15th, 2026
  if (semIdx === 1) return new Date(2026, 1, 16); // SPRING2026 starts Feb 16th, 2026
  return new Date(2025, 8, 15); // FALL2025 starts Sept 15th, 2025
};

const getScheduleForWeek = (weekStart, studentId, semIdx) => {
  const items = [];
  const semStart = getSemesterStart(semIdx);
  const dayOffsets = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6 };

  // Calculate difference in weeks relative to the active semester start week
  const diffTime = weekStart.getTime() - semStart.getTime();
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

  // Filter base classes from scheduleData in fptData.js
  const baseSchedule = scheduleData.filter(item => item.studentId === studentId);

  baseSchedule.forEach(baseItem => {
    const offset = dayOffsets[baseItem.dayName];
    if (offset === undefined) return;

    // PMG201c only runs in the week starting 2026-05-11
    if (baseItem.subjectCode === 'PMG201c') {
      const pmgStart = new Date(2026, 4, 11); // May 11, 2026
      if (
        weekStart.getFullYear() !== pmgStart.getFullYear() ||
        weekStart.getMonth() !== pmgStart.getMonth() ||
        weekStart.getDate() !== pmgStart.getDate()
      ) {
        return;
      }
    }

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + offset);

    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${slotDate.getFullYear()}-${pad(slotDate.getMonth() + 1)}-${pad(slotDate.getDate())}`;
    const dayLabelStr = `${slotDate.getDate()}/${slotDate.getMonth() + 1}`;

    // Compute dynamic session numbers, keeping them between 1 and 30
    let sessionNo = baseItem.sessionNo + diffWeeks;
    if (sessionNo < 1) sessionNo = 1;
    if (sessionNo > 30) sessionNo = 30;

    // Attendance status: past classes (before 2026-06-24) change 'NOT YET' to 'PRESENT'
    let attendance = baseItem.attendance;
    const todayStr = '2026-06-24';
    if (dateStr < todayStr) {
      if (attendance === 'NOT YET') {
        attendance = 'PRESENT';
      }
    } else {
      attendance = 'NOT YET';
    }

    const slotColors = {
      'Slot 1': '#913A07',
      'Slot 2': '#53DB36',
      'Slot 3': '#DD6424',
      'Slot 4': '#180CDA',
      'Slot 5': '#140E91',
      'Slot 7': '#000000',
    };
    const dynamicSlotColor = slotColors[baseItem.slot] || baseItem.slotColor;

    items.push({
      ...baseItem,
      id: `${baseItem.id}_${dateStr}`,
      date: dateStr,
      dayLabel: dayLabelStr,
      sessionNo: sessionNo,
      attendance: attendance,
      slotColor: dynamicSlotColor,
    });
  });

  // Sort chronologically
  const slotOrder = { 'Slot 1': 1, 'Slot 2': 2, 'Slot 3': 3, 'Slot 4': 4, 'Slot 5': 5, 'Slot 6': 6 };
  items.sort((a, b) => {
    const dayA = dayOffsets[a.dayName];
    const dayB = dayOffsets[b.dayName];
    if (dayA !== dayB) return dayA - dayB;
    return slotOrder[a.slot] - slotOrder[b.slot];
  });

  return items;
};

const formatWeekRange = (start) => {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const pad = (n) => String(n).padStart(2, '0');
  const startStr = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;
  const endStr = `${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
  return `Current week: ${startStr} – ${endStr}`;
};

const formatMonthYear = (start) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mid = new Date(start);
  mid.setDate(start.getDate() + 3);
  return `${months[mid.getMonth()]} ${mid.getFullYear()}`;
};

const AttendanceBadge = ({ status }) => {
  const map = {
    'PRESENT': { bg: '#53DA36', color: '#FFFFFF', label: 'PRESENT' },
    'NOT YET': { bg: '#9CA3AF', color: '#FFFFFF', label: 'NOT YET' },
    'ABSENT': { bg: '#913A07', color: '#FFFFFF', label: 'ABSENT' },
  };
  const cfg = map[status] || map['NOT YET'];
  return (
    <View style={[badge.box, { backgroundColor: cfg.bg }]}>
      <Text style={[badge.txt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};
const badge = StyleSheet.create({
  box: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, marginRight: 6, },
  txt: { fontSize: 10, fontWeight: '700' },
});

const MaterialBadge = () => (
  <View style={[badge.box, { backgroundColor: '#EC8E01', paddingHorizontal: 15 }]}>
    <Text style={[badge.txt, { color: '#FFFFFF' }]}>Materials</Text>
  </View>
);

const MeetBadge = () => (
  <View style={[badge.box, { backgroundColor: '#D1FAE5' }]}>
    <Text style={[badge.txt, { color: '#059669' }]}>Meet URL</Text>
  </View>
);

/* Blinking "Online" text: gray -> green -> gray */
const OnlineText = ({ size = 13 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: false }),
        Animated.delay(900),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  const color = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', '#10B981'], // gray -> green
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Animated.View style={[
        { width: 7, height: 7, borderRadius: 4 },
        { backgroundColor: color },
      ]} />
      <Animated.Text style={{ fontSize: size, fontWeight: '600', color }}>
        Online
      </Animated.Text>
    </View>
  );
};

/* Group schedule items by day — always include all 7 days of the week */
const groupByDay = (items, allWeekDays) => {
  const map = {};
  // Pre-populate all 7 days so empty days still appear
  allWeekDays.forEach(d => {
    map[d.dayLabel] = { dayLabel: d.dayLabel, dayName: d.short, slots: [] };
  });
  // Fill in actual slots
  items.forEach(item => {
    if (map[item.dayLabel]) map[item.dayLabel].slots.push(item);
  });
  return Object.values(map);
};

const ScheduleScreen = ({ navigation }) => {
  const { currentStudent } = useAuth();
  const [activeSemIdx, setActiveSemIdx] = useState(0);

  // Set initial week start to SUMMER2026 start date (June 15th, 2026)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => new Date(2026, 5, 15));
  const [selectedDayIdx, setSelectedDayIdx] = useState(6); // Default to Sunday (index 6 of weekDays)

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const studentSchedule = useMemo(() =>
    getScheduleForWeek(currentWeekStart, currentStudent?.id, activeSemIdx),
    [currentWeekStart, currentStudent, activeSemIdx]
  );

  const filteredSchedule = useMemo(() => {
    return studentSchedule;
  }, [studentSchedule]);

  const grouped = useMemo(() => groupByDay(filteredSchedule, weekDays), [filteredSchedule, weekDays]);

  const handleSemesterPress = (idx) => {
    setActiveSemIdx(idx);
    setCurrentWeekStart(getSemesterStart(idx));
  };

  const handlePrevWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  return (
    <View style={s.root}>
      {/* ── Navy safe area for status bar + header ── */}
      <SafeAreaView style={s.safeHeader}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={30} color={COLORS.white} />
            <Text style={s.backTxt}>Home</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Weekly timetable</Text>
          <View style={{ width: 60 }} />
        </View>
      </SafeAreaView>

      {/* ── Content with light background ── */}
      <View style={s.content}>
        {/* ── Semester Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.semScroll} contentContainerStyle={s.semRow}>
          {semesters.map((sem, idx) => (
            <TouchableOpacity
              key={sem.id}
              style={[s.semChip, idx === activeSemIdx && s.semChipActive]}
              onPress={() => handleSemesterPress(idx)}
            >
              <View style={[s.semIconCircle, idx === activeSemIdx && s.semIconCircleActive]}>
                {sem.icon === 'seedling' || sem.icon === 'tree' || sem.icon === 'sun' ? (
                  <FontAwesome5
                    name={sem.icon}
                    size={13}
                    solid
                    color={idx === activeSemIdx ? '#EB8F00' : '#9CA3AF'}
                  />
                ) : (
                  <Ionicons
                    name={sem.icon}
                    size={15}
                    color={idx === activeSemIdx ? '#EB8F00' : '#9CA3AF'}
                  />
                )}
              </View>
              <Text style={[s.semTxt, idx === activeSemIdx && s.semTxtActive]}>{sem.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Week range text ── */}
        <View style={s.weekRangeContainer}>
          <Text style={s.weekLabel}>{formatWeekRange(currentWeekStart)}</Text>
        </View>

        {/* ── Month navigation row ── */}
        <View style={s.monthNavRow}>
          <TouchableOpacity onPress={handlePrevWeek} style={s.navArrow}>
            <Ionicons name="caret-back" size={22} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{formatMonthYear(currentWeekStart)}</Text>
          <TouchableOpacity onPress={handleNextWeek} style={s.navArrow}>
            <Ionicons name="caret-forward" size={22} color={COLORS.navy} />
          </TouchableOpacity>
        </View>

        {/* ── Day picker ── */}
        <View style={s.dayRow}>
          {weekDays.map((d, index) => {
            const isSelected = index === selectedDayIdx;
            const hasClass = studentSchedule.some(sc => sc.date === d.formatted);
            return (
              <TouchableOpacity
                key={d.formatted}
                style={s.dayCell}
                onPress={() => setSelectedDayIdx(index)}
              >
                <Text style={s.dayShort}>{d.short}</Text>
                <View style={[
                  s.dayNumContainer,
                  isSelected && s.dayNumContainerActive
                ]}>
                  <Text style={[
                    s.dayNum,
                    isSelected && s.dayNumActive
                  ]}>{d.date}</Text>
                </View>
                {hasClass && <View style={s.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Schedule list ── */}
        <View style={s.scheduleContainer}>
          <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {grouped.length === 0 && (
              <View style={s.empty}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
                <Text style={s.emptyTxt}>Không có lịch học</Text>
              </View>
            )}

            {grouped.map((day, index) => (
              <View key={day.dayLabel} style={[s.dayGroup, index === 0 && s.dayGroupFirst]}>
                {/* Day label */}
                <View style={s.dayLabelBox}>
                  <Text style={s.dayLabelNum}>{day.dayLabel}</Text>
                  <Text style={s.dayLabelName}>{day.dayName}</Text>
                </View>

                {/* Slot cards */}
                <View style={s.slots}>
                  {day.slots.length === 0 ? (
                    <View style={s.noClass} />
                  ) : (
                    day.slots.map((slot, sIdx) => {
                      const isLastSlot = sIdx === day.slots.length - 1;
                      return (
                        <View key={slot.id} style={[s.slotCard, !isLastSlot && s.slotDivider]}>
                          {/* Colored left bar */}
                          <View style={[s.slotBar, { backgroundColor: slot.slotColor }]} />

                          {/* Slot time column */}
                          <View style={s.slotTimeCol}>
                            <View style={[s.slotBadge, { backgroundColor: slot.slotColor + '20' }]}>
                              <Text style={[s.slotBadgeTxt, { color: slot.slotColor }]}>{slot.slot}</Text>
                            </View>
                            <Text style={s.slotTime}>{slot.startTime}</Text>
                            <View style={s.slotTimeLine} />
                            <Text style={s.slotTime}>{slot.endTime}</Text>
                          </View>

                          {/* Info column */}
                          <View style={s.slotInfo}>
                            <View style={s.roomContainer}>
                              <Text style={s.roomLabel}>Room</Text>
                              <Text style={s.roomName}>{slot.room}</Text>
                            </View>
                            <Text style={s.slotCode}>{slot.subjectCode}</Text>
                            <Text style={s.slotDetail}>SessionNo: {slot.sessionNo}</Text>
                            <Text style={s.slotDetail}>Class: {slot.className}</Text>
                            <Text style={s.slotDetail}>Lecturer: {slot.lecturer}</Text>

                            {slot.isOnline ? (
                              /* Online layout: row1 = PRESENT + ● Online, row2 = Materials */
                              <>
                                <View style={s.badgeRow}>
                                  <AttendanceBadge status={slot.attendance} />
                                  <OnlineText size={11} />
                                </View>
                                <View style={[s.badgeRow, { marginTop: 6 }]}>
                                  <MaterialBadge />
                                </View>
                              </>
                            ) : (
                              /* Normal layout */
                              <View style={s.badgeRow}>
                                <AttendanceBadge status={slot.attendance} />
                                <MaterialBadge />
                                {slot.attendance === 'NOT YET' && <MeetBadge />}
                              </View>
                            )}
                          </View>

                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safeHeader: { backgroundColor: COLORS.navy },
  content: { flex: 1, backgroundColor: COLORS.background },
  scheduleContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: 24,
    borderBottomWidth: 0.3,
    borderBottomColor: '#7E7E80',
  },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 0, paddingVertical: 8,
    backgroundColor: COLORS.navy, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backTxt: { fontSize: 13, color: COLORS.white, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },

  /* Semesters */
  semScroll: { backgroundColor: COLORS.background, flexGrow: 0 },
  semRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, gap: 10 },
  semChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 28,
    backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E5E7EB',
  },
  semChipActive: {
    backgroundColor: '#EB8F00', borderColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  semIconCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.02)', alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  semIconCircleActive: {
    backgroundColor: '#F0A93E',
  },
  semTxt: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  semTxtActive: { color: '#fff' },

  /* Week range */
  weekRangeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11.5,
    backgroundColor: COLORS.background,
  },
  weekLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSub },

  /* Month navigation */
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
    paddingVertical: 1,
    backgroundColor: COLORS.white,
    borderTopWidth: 0.3,
    borderTopColor: "#7E7E80",
  },
  monthLabel: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  navArrow: { padding: 4 },

  /* Day picker */
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 1,
    paddingVertical: 1,
    paddingBottom: 5.5,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.3,
    borderBottomColor: '#7E7E80',
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  dayShort: {
    fontSize: 13,
    color: COLORS.textSub,
    fontWeight: '450',
    marginBottom: 6,
  },
  dayNumContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumContainerActive: {
    backgroundColor: COLORS.navy,
  },
  dayNum: {
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: '0',
  },
  dayNumActive: {
    color: COLORS.white,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.navy,
    marginTop: -8,
  },

  /* Schedule list */
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt: { color: COLORS.textSub, fontSize: 15 },

  /* Day group */
  dayGroup: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.border,
  },
  dayGroupFirst: {
    borderTopWidth: 0.8,
    borderTopColor: COLORS.border,
    marginTop: -1,
  },
  dayLabelBox: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  dayLabelNum: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  dayLabelName: { fontSize: 12, color: COLORS.textSub },
  slots: {
    flex: 1,
  },
  noClass: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  noClassTxt: {
    color: COLORS.textLight,
    fontSize: 13,
    fontStyle: 'italic',
  },

  /* Slot card */
  slotCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    overflow: 'hidden',
  },
  slotDivider: {
    borderBottomWidth: 0.2,
    borderBottomColor: COLORS.border,
  },
  slotBar: {
    width: 4,
    borderRadius: 2,
    marginVertical: 12,
    marginLeft: 0,
  },

  /* Slot time col */
  slotTimeCol: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, minWidth: 72 },
  slotBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  slotBadgeTxt: { fontSize: 11, fontWeight: '800' },
  slotTime: { fontSize: 10, color: '#A0AEC0', fontWeight: '500' },
  slotTimeLine: { width: 1, height: 16, backgroundColor: COLORS.border, marginVertical: 3 },

  /* Slot info col */
  slotInfo: { flex: 1, paddingVertical: 12, paddingRight: 14 },
  roomContainer: {
    backgroundColor: '#f2f3f5ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 220,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  roomLabel: { fontSize: 10, color: COLORS.textLight },
  roomName: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  slotCode: { fontSize: 13, fontWeight: '500', color: COLORS.textSub },
  slotDetail: { fontSize: 13, color: COLORS.textSub, marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4, alignItems: 'center' },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981', marginLeft: 2 },
  onlineTxt: { fontSize: 13, fontWeight: '600', color: '#10B981' },
});

export default ScheduleScreen;
