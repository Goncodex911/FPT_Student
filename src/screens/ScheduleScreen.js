import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + offset);

    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${slotDate.getFullYear()}-${pad(slotDate.getMonth() + 1)}-${pad(slotDate.getDate())}`;
    const dayLabelStr = `${slotDate.getDate()}/${slotDate.getMonth() + 1}`;

    // Compute dynamic session numbers, keeping them between 1 and 30
    let sessionNo = baseItem.sessionNo + diffWeeks;
    if (sessionNo < 1) sessionNo = 1;
    if (sessionNo > 30) sessionNo = 30;

    // Attendance status: past classes (before 2026-06-16) change 'NOT YET' to 'PRESENT'
    let attendance = baseItem.attendance;
    const todayStr = '2026-06-16';
    if (dateStr < todayStr) {
      if (attendance === 'NOT YET') {
        attendance = 'PRESENT';
      }
    } else if (dateStr > todayStr) {
      attendance = 'NOT YET';
    }

    items.push({
      ...baseItem,
      id: `${baseItem.id}_${dateStr}`,
      date: dateStr,
      dayLabel: dayLabelStr,
      sessionNo: sessionNo,
      attendance: attendance,
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
    'PRESENT': { bg: COLORS.successBg, color: COLORS.success, label: 'PRESENT' },
    'NOT YET': { bg: '#E5E7EB', color: '#6B7280', label: 'NOT YET' },
    'ABSENT': { bg: COLORS.dangerBg, color: COLORS.danger, label: 'ABSENT' },
  };
  const cfg = map[status] || map['NOT YET'];
  return (
    <View style={[badge.box, { backgroundColor: cfg.bg }]}>
      <Text style={[badge.txt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};
const badge = StyleSheet.create({
  box: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 6 },
  txt: { fontSize: 11, fontWeight: '700' },
});

const MaterialBadge = () => (
  <View style={[badge.box, { backgroundColor: '#FEF3C7' }]}>
    <Text style={[badge.txt, { color: '#D97706' }]}>Materials</Text>
  </View>
);

const MeetBadge = () => (
  <View style={[badge.box, { backgroundColor: '#D1FAE5' }]}>
    <Text style={[badge.txt, { color: '#059669' }]}>Meet URL</Text>
  </View>
);

/* Group schedule items by day */
const groupByDay = (items) => {
  const map = {};
  items.forEach(item => {
    if (!map[item.dayLabel]) map[item.dayLabel] = { dayLabel: item.dayLabel, dayName: item.dayName, slots: [] };
    map[item.dayLabel].slots.push(item);
  });
  return Object.values(map);
};

const ScheduleScreen = ({ navigation }) => {
  const { currentStudent } = useAuth();
  const [activeSemIdx, setActiveSemIdx] = useState(0);

  // Set initial week start to SUMMER2026 start date (June 15th, 2026)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => new Date(2026, 5, 15));
  const [selectedDate, setSelectedDate] = useState(null); // default to null (show whole week)

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const studentSchedule = useMemo(() =>
    getScheduleForWeek(currentWeekStart, currentStudent?.id, activeSemIdx),
    [currentWeekStart, currentStudent, activeSemIdx]
  );

  const filteredSchedule = useMemo(() => {
    if (selectedDate === null) return studentSchedule;
    return studentSchedule.filter(d => d.date === selectedDate);
  }, [studentSchedule, selectedDate]);

  const grouped = useMemo(() => groupByDay(filteredSchedule), [filteredSchedule]);

  const handleSemesterPress = (idx) => {
    setActiveSemIdx(idx);
    setSelectedDate(null);
    setCurrentWeekStart(getSemesterStart(idx));
  };

  const handlePrevWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(next);
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.navy} />
          <Text style={s.backTxt}>Home</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Weekly timetable</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Semester Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.semScroll} contentContainerStyle={s.semRow}>
        {semesters.map((sem, idx) => (
          <TouchableOpacity
            key={sem.id}
            style={[s.semChip, idx === activeSemIdx && s.semChipActive]}
            onPress={() => handleSemesterPress(idx)}
          >
            <View style={[s.semIconCircle, idx === activeSemIdx && s.semIconCircleActive]}>
              <Ionicons
                name={sem.icon}
                size={15}
                color={idx === activeSemIdx ? '#fff' : '#9CA3AF'}
              />
            </View>
            <Text style={[s.semTxt, idx === activeSemIdx && s.semTxtActive]}>{sem.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Week range ── */}
      <View style={s.weekRange}>
        <TouchableOpacity onPress={handlePrevWeek}>
          <Ionicons name="chevron-back" size={20} color={COLORS.navy} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.weekLabel}>{formatWeekRange(currentWeekStart)}</Text>
          <Text style={s.monthLabel}>{formatMonthYear(currentWeekStart)}</Text>
        </View>
        <TouchableOpacity onPress={handleNextWeek}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      {/* ── Day picker ── */}
      <View style={s.dayRow}>
        {weekDays.map((d) => {
          const isToday = d.formatted === '2026-06-16';
          const isSelected = d.formatted === selectedDate;
          const hasClass = studentSchedule.some(sc => sc.date === d.formatted);
          return (
            <TouchableOpacity
              key={d.formatted}
              style={[
                s.dayCell,
                isSelected && s.dayCellActive,
                (!selectedDate && isToday) && s.dayCellToday
              ]}
              onPress={() => setSelectedDate(d.formatted === selectedDate ? null : d.formatted)}
            >
              <Text style={[
                s.dayShort,
                isSelected && s.dayTxtActive,
                (!selectedDate && isToday) && s.dayTxtToday
              ]}>{d.short}</Text>
              <Text style={[
                s.dayNum,
                isSelected && s.dayTxtActive,
                (!selectedDate && isToday) && s.dayTxtToday
              ]}>{d.date}</Text>
              {hasClass && <View style={[s.dot, isSelected && s.dotActive]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Schedule list ── */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {grouped.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
            <Text style={s.emptyTxt}>Không có lịch học</Text>
          </View>
        )}

        {grouped.map((day) => (
          <View key={day.dayLabel} style={s.dayGroup}>
            {/* Day label */}
            <View style={s.dayLabelBox}>
              <Text style={s.dayLabelNum}>{day.dayLabel}</Text>
              <Text style={s.dayLabelName}>{day.dayName}</Text>
            </View>

            {/* Slot cards */}
            <View style={s.slots}>
              {day.slots.map((slot) => (
                <View key={slot.id} style={s.slotCard}>
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
                    <Text style={s.roomLabel}>Room</Text>
                    <Text style={s.roomName}>{slot.room}</Text>
                    <Text style={s.slotCode}>{slot.subjectCode}</Text>
                    <Text style={s.slotDetail}>SessionNo: {slot.sessionNo}</Text>
                    <Text style={s.slotDetail}>Class: {slot.className}</Text>
                    <Text style={s.slotDetail}>Lecturer: {slot.lecturer}</Text>

                    <View style={s.badgeRow}>
                      <AttendanceBadge status={slot.attendance} />
                      <MaterialBadge />
                      {slot.attendance === 'NOT YET' && <MeetBadge />}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backTxt: { fontSize: 16, color: COLORS.navy, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy },

  /* Semesters */
  semScroll: { backgroundColor: COLORS.background, flexGrow: 0 },
  semRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, gap: 10 },
  semChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 28,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  semChipActive: {
    backgroundColor: '#EB8F00', borderColor: '#F5A623',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  semIconCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  semIconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  semTxt: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  semTxtActive: { color: '#fff' },

  /* Week range */
  weekRange: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  weekLabel: { fontSize: 12, color: COLORS.textSub },
  monthLabel: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginTop: 2 },

  /* Day picker */
  dayRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dayCell: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 20 },
  dayCellActive: { backgroundColor: COLORS.navy },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy + '15',
  },
  dayShort: { fontSize: 12, color: COLORS.textSub, fontWeight: '500' },
  dayNum: { fontSize: 16, color: COLORS.navy, fontWeight: '700', marginTop: 2 },
  dayTxtActive: { color: COLORS.white },
  dayTxtToday: { color: COLORS.navy, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
  dotActive: { backgroundColor: COLORS.white },

  /* Schedule list */
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt: { color: COLORS.textSub, fontSize: 15 },

  /* Day group */
  dayGroup: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 16 },
  dayLabelBox: { width: 44, alignItems: 'center', paddingTop: 4 },
  dayLabelNum: { fontSize: 18, fontWeight: '800', color: COLORS.navy },
  dayLabelName: { fontSize: 12, color: COLORS.textSub },
  slots: { flex: 1, gap: 10, paddingLeft: 6 },

  /* Slot card */
  slotCard: {
    flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 4,
  },
  slotBar: { width: 4 },

  /* Slot time col */
  slotTimeCol: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, minWidth: 72 },
  slotBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  slotBadgeTxt: { fontSize: 11, fontWeight: '700' },
  slotTime: { fontSize: 12, color: COLORS.textSub, fontWeight: '600' },
  slotTimeLine: { width: 1, height: 16, backgroundColor: COLORS.border, marginVertical: 3 },

  /* Slot info col */
  slotInfo: { flex: 1, paddingVertical: 12, paddingRight: 14 },
  roomLabel: { fontSize: 11, color: COLORS.textLight },
  roomName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 6 },
  slotCode: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  slotDetail: { fontSize: 13, color: COLORS.textSub, marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4 },
});

export default ScheduleScreen;
