import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { examData } from '../data/fptData';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

const ExamCard = ({ item }) => (
  <View style={s.card}>
    {/* Top strip */}
    <View style={s.cardTop}>
      <View style={s.subjectRow}>
        <View style={s.subjectIcon}>
          <Ionicons name="reader-outline" size={20} color={COLORS.pink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.subjectName}>{item.subjectName}</Text>
          <Text style={s.subjectCode}>{item.subjectCode}</Text>
        </View>
        <View style={[s.formatBadge, { backgroundColor: item.format === 'Paper' ? '#DBEAFE' : '#D1FAE5' }]}>
          <Text style={[s.formatTxt, { color: item.format === 'Paper' ? COLORS.blue : COLORS.green }]}>
            {item.format}
          </Text>
        </View>
      </View>
    </View>

    {/* Details */}
    <View style={s.cardBody}>
      <View style={s.detailRow}>
        <View style={s.detailItem}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.textSub} />
          <View style={{ marginLeft: 8 }}>
            <Text style={s.detailLabel}>Ngày thi</Text>
            <Text style={s.detailValue}>{item.examDate}</Text>
          </View>
        </View>
        <View style={s.detailItem}>
          <Ionicons name="time-outline" size={15} color={COLORS.textSub} />
          <View style={{ marginLeft: 8 }}>
            <Text style={s.detailLabel}>Ca thi</Text>
            <Text style={s.detailValue}>{item.shift}</Text>
          </View>
        </View>
      </View>

      <View style={s.detailRow}>
        <View style={s.detailItem}>
          <Ionicons name="location-outline" size={15} color={COLORS.textSub} />
          <View style={{ marginLeft: 8 }}>
            <Text style={s.detailLabel}>Phòng thi</Text>
            <Text style={s.detailValue}>{item.room}</Text>
          </View>
        </View>
        <View style={s.detailItem}>
          <Ionicons name="document-text-outline" size={15} color={COLORS.textSub} />
          <View style={{ marginLeft: 8 }}>
            <Text style={s.detailLabel}>Ghi chú</Text>
            <Text style={s.detailValue}>{item.note}</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);

const ExamScreen = ({ navigation }) => {
  const { currentStudent } = useAuth();
  const exams = examData.filter(e => e.studentId === currentStudent?.id);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.navy} />
          <Text style={s.backTxt}>Home</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Exam schedule</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Semester info */}
      <View style={s.semBanner}>
        <Ionicons name="sunny" size={16} color={COLORS.primary} />
        <Text style={s.semTxt}>SUMMER2026</Text>
        <Text style={s.semSub}>  |  {exams.length} môn thi</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {exams.map(e => <ExamCard key={e.id} item={e} />)}
        {exams.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="document-outline" size={48} color={COLORS.textLight} />
            <Text style={s.emptyTxt}>Không có lịch thi</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn:     { flexDirection: 'row', alignItems: 'center' },
  backTxt:     { fontSize: 16, color: COLORS.navy, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy },

  semBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FEF3C7',
  },
  semTxt:  { fontSize: 14, fontWeight: '700', color: '#D97706', marginLeft: 6 },
  semSub:  { fontSize: 13, color: COLORS.textSub },

  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  /* Card */
  card: {
    backgroundColor: COLORS.cardBg, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  cardTop: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  subjectRow: { flexDirection: 'row', alignItems: 'center' },
  subjectIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FCE7F3',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  subjectName: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  subjectCode: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
  formatBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  formatTxt:   { fontSize: 12, fontWeight: '700' },

  cardBody:   { padding: 16, gap: 12 },
  detailRow:  { flexDirection: 'row', gap: 12 },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  detailLabel:{ fontSize: 11, color: COLORS.textLight },
  detailValue:{ fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 2 },

  empty:    { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt: { color: COLORS.textSub, fontSize: 15 },
});

export default ExamScreen;
