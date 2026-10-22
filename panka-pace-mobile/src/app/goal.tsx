import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TaskApplyTiming } from '@/domain/models';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function GoalScreen() {
  const router = useRouter();
  const { state, saveGoal } = useAppState();
  const [goal, setGoal] = useState(state.goal?.goal ?? '');
  const [dailyTime, setDailyTime] = useState(state.goal?.dailyTime ?? '30分');
  const [tasks, setTasks] = useState(state.goal?.pendingTasks?.tasks ?? state.goal?.tasks ?? ['']);
  const [timing, setTiming] = useState<TaskApplyTiming>(state.goal?.pendingTasks ? 'tomorrow' : 'today');
  const canSave = Boolean(goal.trim() && tasks.some((task) => task.trim()));

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
    saveGoal(goal, dailyTime || '未設定', tasks, timing);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>‹ 戻る</Text></Pressable>
          <Text style={styles.eyebrow}>GOAL & PACE</Text>
          <Text style={styles.title}>続けられる形に整える。</Text>
          <Text style={styles.description}>大きな目標を、今日動ける小さなタスクに分けます。</Text>

          <Text style={styles.label}>目標</Text>
          <TextInput accessibilityLabel="目標" maxLength={100} onChangeText={setGoal} placeholder="例：資格試験に合格する" placeholderTextColor={palette.inkFaint} style={styles.input} value={goal} />
          <Text style={styles.label}>1日に取り組む時間</Text>
          <TextInput accessibilityLabel="1日に取り組む時間" maxLength={20} onChangeText={setDailyTime} placeholder="例：30分" placeholderTextColor={palette.inkFaint} style={styles.input} value={dailyTime} />

          <View style={styles.taskHeading}><Text style={styles.sectionTitle}>毎日のタスク</Text><Text style={styles.taskCount}>{tasks.length}件</Text></View>
          {tasks.map((task, index) => (
            <View key={index} style={styles.taskEditor}>
              <TextInput accessibilityLabel={`タスク${index + 1}`} maxLength={100} onChangeText={(value) => updateTask(index, value)} placeholder={`タスク ${index + 1}`} placeholderTextColor={palette.inkFaint} style={styles.taskInput} value={task} />
              <View style={styles.taskActions}>
                <Pressable accessibilityLabel={`タスク${index + 1}を上へ`} disabled={index === 0} onPress={() => moveTask(index, -1)} style={styles.iconButton}><Text style={[styles.iconText, index === 0 && styles.disabled]}>↑</Text></Pressable>
                <Pressable accessibilityLabel={`タスク${index + 1}を下へ`} disabled={index === tasks.length - 1} onPress={() => moveTask(index, 1)} style={styles.iconButton}><Text style={[styles.iconText, index === tasks.length - 1 && styles.disabled]}>↓</Text></Pressable>
                <Pressable accessibilityLabel={`タスク${index + 1}を削除`} disabled={tasks.length === 1} onPress={() => removeTask(index)} style={styles.iconButton}><Text style={[styles.deleteText, tasks.length === 1 && styles.disabled]}>×</Text></Pressable>
              </View>
            </View>
          ))}
          <Pressable accessibilityRole="button" onPress={() => setTasks((current) => [...current, ''])} style={styles.addButton}><Text style={styles.addButtonText}>＋ タスクを追加</Text></Pressable>

          <Text style={styles.label}>変更を反映する日</Text>
          <View style={styles.segment}>
            {(['today', 'tomorrow'] as const).map((value) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: timing === value }} key={value} onPress={() => setTiming(value)} style={[styles.segmentButton, timing === value && styles.segmentSelected]}><Text style={[styles.segmentText, timing === value && styles.segmentTextSelected]}>{value === 'today' ? '今日から' : '明日から'}</Text></Pressable>)}
          </View>
          {timing === 'today' && <Text style={styles.notice}>今日の完了チェックはリセットされます。</Text>}

          <Pressable accessibilityRole="button" disabled={!canSave} onPress={save} style={({ pressed }) => [styles.saveButton, !canSave && styles.saveDisabled, pressed && canSave && styles.pressed]}><Text style={styles.saveText}>保存する</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, flex: { flex: 1 }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.xl }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl },
  label: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.sm }, input: { ...typography.body, minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, color: palette.ink, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  taskHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md }, sectionTitle: { ...typography.heading, color: palette.ink }, taskCount: { ...typography.caption, color: palette.inkMuted },
  taskEditor: { ...shadow.card, borderRadius: radius.md, backgroundColor: palette.surface, padding: spacing.md, marginBottom: spacing.md }, taskInput: { ...typography.body, color: palette.ink, minHeight: 44, paddingHorizontal: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line }, taskActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }, iconButton: { width: 42, height: 36, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 18, color: palette.inkMuted }, deleteText: { fontSize: 24, color: '#A86464' }, disabled: { opacity: 0.22 },
  addButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, borderWidth: 1, borderColor: palette.sageStrong, marginBottom: spacing.xxl }, addButtonText: { ...typography.bodyStrong, color: palette.sageStrong },
  segment: { flexDirection: 'row', borderRadius: radius.round, padding: 4, backgroundColor: palette.line }, segmentButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round }, segmentSelected: { backgroundColor: palette.surface }, segmentText: { ...typography.bodyStrong, color: palette.inkMuted }, segmentTextSelected: { color: palette.ink }, notice: { ...typography.caption, color: palette.inkMuted, marginTop: spacing.sm },
  saveButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy, marginTop: spacing.xxl }, saveDisabled: { opacity: 0.35 }, saveText: { ...typography.bodyStrong, color: palette.white }, pressed: { opacity: 0.72 },
});
