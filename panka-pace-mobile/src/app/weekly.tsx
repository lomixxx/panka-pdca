import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { getLocalDateKey } from '@/lib/date';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

function getPastWeek() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { key: getLocalDateKey(date), label: new Intl.DateTimeFormat('ja-JP', { weekday: 'narrow' }).format(date) };
  });
}

function getNextMondayKey() {
  const date = new Date();
  const days = ((8 - date.getDay()) % 7) || 7;
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

export default function WeeklyScreen() {
  const { isReady } = useAppState();
  if (!isReady) return <SafeAreaView style={[styles.safeArea, styles.loading]}><ActivityIndicator color={palette.sageStrong} /></SafeAreaView>;
  return <WeeklyContent />;
}

function WeeklyContent() {
  const router = useRouter();
  const { state, saveWeeklyReview } = useAppState();
  const week = useMemo(() => getPastWeek(), []);
  const weekRecords = week.map((day) => state.records.find((record) => record.date === day.key));
  const rates = weekRecords.map((record) => record?.rate ?? 0);
  const recordedDays = weekRecords.filter(Boolean).length;
  const averageRate = recordedDays ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / recordedDays) : 0;
  const scheduledTasks = state.goal?.pendingTasks?.tasks;
  const [wentWell, setWentWell] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [tasks, setTasks] = useState(scheduledTasks ?? state.goal?.tasks ?? ['']);
  const [saved, setSaved] = useState(false);
  const canSave = Boolean(state.goal && tasks.some((task) => task.trim()));

  const updateTask = (index: number, value: string) => setTasks((current) => current.map((task, itemIndex) => itemIndex === index ? value : task));
  const removeTask = (index: number) => setTasks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const moveTask = (index: number, direction: -1 | 1) => setTasks((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const save = () => {
    if (!canSave) return;
    saveWeeklyReview({ date: getLocalDateKey(), averageRate, wentWell: wentWell.trim(), adjustment: adjustment.trim(), nextTasks: tasks.map((task) => task.trim()).filter(Boolean), effectiveDate: getNextMondayKey() });
    setSaved(true);
  };

  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>WEEKLY REVIEW</Text><Text style={styles.title}>今週のペースを見つめる。</Text><Text style={styles.description}>評価ではなく、来週を少し進みやすくするための振り返りです。</Text>

    <View style={styles.summaryCard}><View><Text style={styles.summaryLabel}>記録した日の平均</Text><Text style={styles.average}>{averageRate}<Text style={styles.percent}>%</Text></Text></View><Text style={styles.days}>{recordedDays} / 7日</Text><View style={styles.chart}>{week.map((day, index) => <View key={day.key} style={styles.barColumn}><View style={styles.barTrack}><View style={[styles.barFill, { height: `${rates[index]}%` }]} /></View><Text style={styles.dayLabel}>{day.label}</Text></View>)}</View></View>

    <Text style={styles.label}>うまくいったこと</Text><TextInput accessibilityLabel="うまくいったこと" maxLength={300} multiline onChangeText={setWentWell} placeholder="例：朝に5分だけ始めると取り組みやすかった" placeholderTextColor={palette.inkFaint} style={styles.textarea} textAlignVertical="top" value={wentWell} />
    <Text style={styles.label}>来週、調整したいこと</Text><TextInput accessibilityLabel="来週調整したいこと" maxLength={300} multiline onChangeText={setAdjustment} placeholder="例：疲れた日は復習だけにする" placeholderTextColor={palette.inkFaint} style={styles.textarea} textAlignVertical="top" value={adjustment} />

    <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>来週のタスク改善</Text><Text style={styles.sectionDescription}>次の月曜日から自動で切り替わります。</Text></View><Text style={styles.count}>{tasks.length}件</Text></View>
    {tasks.map((task, index) => <View key={index} style={styles.taskCard}><TextInput accessibilityLabel={`来週のタスク${index + 1}`} maxLength={100} multiline onChangeText={(value) => updateTask(index, value)} placeholder={`タスク ${index + 1}`} placeholderTextColor={palette.inkFaint} style={styles.taskInput} value={task} /><View style={styles.actions}><Pressable accessibilityLabel={`来週のタスク${index + 1}を上へ`} disabled={index === 0} onPress={() => moveTask(index, -1)} style={styles.iconButton}><Text style={[styles.iconText, index === 0 && styles.disabledText]}>↑</Text></Pressable><Pressable accessibilityLabel={`来週のタスク${index + 1}を下へ`} disabled={index === tasks.length - 1} onPress={() => moveTask(index, 1)} style={styles.iconButton}><Text style={[styles.iconText, index === tasks.length - 1 && styles.disabledText]}>↓</Text></Pressable><Pressable accessibilityLabel={`来週のタスク${index + 1}を削除`} disabled={tasks.length === 1} onPress={() => removeTask(index)} style={styles.iconButton}><Text style={[styles.deleteText, tasks.length === 1 && styles.disabledText]}>×</Text></Pressable></View></View>)}
    <Pressable accessibilityRole="button" onPress={() => setTasks((current) => [...current, ''])} style={styles.addButton}><Text style={styles.addText}>＋ タスクを追加</Text></Pressable>
    {saved ? <View style={styles.savedBox}><Text style={styles.savedTitle}>来週のプランを保存しました</Text><Text style={styles.savedText}>{getNextMondayKey()}から自動で適用されます。</Text><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.doneButton}><Text style={styles.doneText}>ホームへ戻る</Text></Pressable></View> : <Pressable accessibilityRole="button" disabled={!canSave} onPress={save} style={({ pressed }) => [styles.saveButton, !canSave && styles.saveDisabled, pressed && canSave && styles.pressed]}><Text style={styles.saveText}>振り返りと来週のプランを保存</Text></Pressable>}
  </ScrollView><BottomNav active="weekly" /></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, loading: { alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl }, backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.xl }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl },
  summaryCard: { ...shadow.card, borderRadius: radius.xl, backgroundColor: palette.navy, padding: spacing.xl, marginBottom: spacing.xxl }, summaryLabel: { ...typography.caption, color: palette.blueSoft }, average: { fontSize: 42, lineHeight: 50, fontWeight: '700', color: palette.white }, percent: { fontSize: 20 }, days: { ...typography.caption, color: palette.whiteMuted, position: 'absolute', top: spacing.xl, right: spacing.xl }, chart: { height: 92, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.lg }, barColumn: { flex: 1, alignItems: 'center', gap: spacing.xs }, barTrack: { width: 8, height: 62, justifyContent: 'flex-end', borderRadius: radius.round, backgroundColor: '#465467', overflow: 'hidden' }, barFill: { width: '100%', minHeight: 2, borderRadius: radius.round, backgroundColor: palette.sage }, dayLabel: { ...typography.caption, color: palette.whiteMuted },
  label: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.sm }, textarea: { ...typography.body, minHeight: 96, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, color: palette.ink, padding: spacing.lg, marginBottom: spacing.xl }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: spacing.md }, sectionTitle: { ...typography.heading, color: palette.ink }, sectionDescription: { ...typography.caption, color: palette.inkMuted, marginTop: 2 }, count: { ...typography.caption, color: palette.inkMuted },
  taskCard: { ...shadow.card, borderRadius: radius.md, backgroundColor: palette.surface, padding: spacing.md, marginBottom: spacing.md }, taskInput: { ...typography.body, minHeight: 46, color: palette.ink, paddingHorizontal: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line }, actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }, iconButton: { width: 42, height: 36, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 18, color: palette.inkMuted }, deleteText: { fontSize: 24, color: '#A86464' }, disabledText: { opacity: 0.22 }, addButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, borderWidth: 1, borderColor: palette.sageStrong, marginBottom: spacing.xl }, addText: { ...typography.bodyStrong, color: palette.sageStrong },
  saveButton: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy }, saveDisabled: { opacity: 0.35 }, saveText: { ...typography.bodyStrong, color: palette.white }, pressed: { opacity: 0.72 }, savedBox: { borderRadius: radius.lg, backgroundColor: palette.sage, padding: spacing.xl }, savedTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.xs }, savedText: { ...typography.caption, color: palette.inkMuted, marginBottom: spacing.lg }, doneButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy }, doneText: { ...typography.bodyStrong, color: palette.white },
});
