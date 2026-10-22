import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createLocalTaskProposal, type GoalHearingInput, type TaskProposal } from '@/services/task-proposal';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const emptyInput: GoalHearingInput = { goal: '', deadline: '', dailyTime: '30分', currentLevel: '', obstacles: '' };

export default function GoalSetupScreen() {
  const router = useRouter();
  const { state, createGoal } = useAppState();
  const [input, setInput] = useState(emptyInput);
  const [proposal, setProposal] = useState<TaskProposal | null>(null);
  const canGenerate = Boolean(input.goal.trim() && input.dailyTime.trim() && input.currentLevel.trim());
  const canSave = Boolean(proposal?.tasks.some((task) => task.trim()));
  const setField = (field: keyof GoalHearingInput, value: string) => setInput((current) => ({ ...current, [field]: value }));

  const generate = () => {
    if (!canGenerate) return;
    setProposal(createLocalTaskProposal(input, state.userType, state.userSettings));
  };
  const updateTask = (index: number, value: string) => setProposal((current) => current ? { ...current, tasks: current.tasks.map((task, itemIndex) => itemIndex === index ? value : task) } : current);
  const removeTask = (index: number) => setProposal((current) => current ? { ...current, tasks: current.tasks.filter((_, itemIndex) => itemIndex !== index) } : current);
  const moveTask = (index: number, direction: -1 | 1) => setProposal((current) => {
    if (!current) return current;
    const target = index + direction;
    if (target < 0 || target >= current.tasks.length) return current;
    const tasks = [...current.tasks];
    [tasks[index], tasks[target]] = [tasks[target], tasks[index]];
    return { ...current, tasks };
  });
  const save = () => {
    if (!proposal || !canSave) return;
    createGoal(input, proposal);
    router.replace('/');
  };

  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.topRow}><Pressable accessibilityRole="button" onPress={() => proposal ? setProposal(null) : router.back()} style={styles.backButton}><Text style={styles.backText}>‹ 戻る</Text></Pressable><Text style={styles.step}>{proposal ? '2 / 2' : '1 / 2'}</Text></View>
    {!proposal ? <>
      <Text style={styles.eyebrow}>GOAL HEARING</Text><Text style={styles.title}>目標までの道を、一緒に整える。</Text><Text style={styles.description}>今の状態を少しだけ教えてください。最初の一週間にちょうどいいタスク案を作ります。</Text>
      <Field label="達成したい目標 *" placeholder="例：3か月後の試験に合格する" value={input.goal} onChangeText={(value) => setField('goal', value)} />
      <Field label="期限" placeholder="例：2027-01-31" value={input.deadline} onChangeText={(value) => setField('deadline', value)} />
      <Field label="1日に使える時間 *" placeholder="例：30分" value={input.dailyTime} onChangeText={(value) => setField('dailyTime', value)} />
      <Field label="現在地 *" placeholder="例：教材を買ったが、まだ始めていない" value={input.currentLevel} onChangeText={(value) => setField('currentLevel', value)} multiline />
      <Field label="続けるうえでの障害" placeholder="例：仕事の後は疲れて先延ばしにする" value={input.obstacles} onChangeText={(value) => setField('obstacles', value)} multiline />
      <Pressable accessibilityRole="button" disabled={!canGenerate} onPress={generate} style={({ pressed }) => [styles.primaryButton, !canGenerate && styles.disabledButton, pressed && canGenerate && styles.pressed]}><Text style={styles.primaryText}>最初のタスク案を作る</Text></Pressable>
      <Text style={styles.localNote}>現在はローカル提案版です。入力内容は外部へ送信されません。</Text>
    </> : <>
      <Text style={styles.eyebrow}>FIRST WEEK PLAN</Text><Text style={styles.title}>まずは、このペースから。</Text><Text style={styles.description}>{proposal.rationale}</Text>
      <View style={styles.adviceCard}><Text style={styles.adviceLabel}>あなたへのヒント</Text><Text style={styles.adviceText}>{proposal.advice}</Text></View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>毎日のタスク案</Text><Text style={styles.count}>{proposal.tasks.length}件</Text></View>
      {proposal.tasks.map((task, index) => <View key={index} style={styles.taskCard}><TextInput accessibilityLabel={`提案タスク${index + 1}`} maxLength={100} multiline onChangeText={(value) => updateTask(index, value)} style={styles.taskInput} value={task} /><View style={styles.actions}><Pressable accessibilityLabel={`提案タスク${index + 1}を上へ`} disabled={index === 0} onPress={() => moveTask(index, -1)} style={styles.iconButton}><Text style={[styles.iconText, index === 0 && styles.disabledText]}>↑</Text></Pressable><Pressable accessibilityLabel={`提案タスク${index + 1}を下へ`} disabled={index === proposal.tasks.length - 1} onPress={() => moveTask(index, 1)} style={styles.iconButton}><Text style={[styles.iconText, index === proposal.tasks.length - 1 && styles.disabledText]}>↓</Text></Pressable><Pressable accessibilityLabel={`提案タスク${index + 1}を削除`} disabled={proposal.tasks.length === 1} onPress={() => removeTask(index)} style={styles.iconButton}><Text style={[styles.deleteText, proposal.tasks.length === 1 && styles.disabledText]}>×</Text></Pressable></View></View>)}
      <Pressable accessibilityRole="button" onPress={() => setProposal((current) => current ? { ...current, tasks: [...current.tasks, ''] } : current)} style={styles.addButton}><Text style={styles.addText}>＋ タスクを追加</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={!canSave} onPress={save} style={({ pressed }) => [styles.primaryButton, !canSave && styles.disabledButton, pressed && canSave && styles.pressed]}><Text style={styles.primaryText}>このプランで始める</Text></Pressable>
    </>}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

function Field({ label, multiline, ...props }: { label: string; multiline?: boolean; placeholder: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} maxLength={multiline ? 300 : 100} multiline={multiline} placeholderTextColor={palette.inkFaint} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} {...props} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, flex: { flex: 1 }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }, backButton: { paddingVertical: spacing.sm, paddingRight: spacing.lg }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, step: { ...typography.caption, color: palette.inkMuted },
  eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl }, field: { marginBottom: spacing.xl }, label: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.sm }, input: { ...typography.body, minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, color: palette.ink, paddingHorizontal: spacing.lg }, multiline: { minHeight: 96, paddingVertical: spacing.md },
  primaryButton: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy, marginTop: spacing.md }, primaryText: { ...typography.bodyStrong, color: palette.white }, disabledButton: { opacity: 0.32 }, pressed: { opacity: 0.72 }, localNote: { ...typography.caption, color: palette.inkFaint, textAlign: 'center', marginTop: spacing.md },
  adviceCard: { borderRadius: radius.lg, backgroundColor: palette.sage, padding: spacing.lg, marginBottom: spacing.xxl }, adviceLabel: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.xs }, adviceText: { ...typography.body, color: palette.ink }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, sectionTitle: { ...typography.heading, color: palette.ink }, count: { ...typography.caption, color: palette.inkMuted },
  taskCard: { ...shadow.card, borderRadius: radius.md, backgroundColor: palette.surface, padding: spacing.md, marginBottom: spacing.md }, taskInput: { ...typography.body, minHeight: 48, color: palette.ink, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line }, actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }, iconButton: { width: 42, height: 36, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 18, color: palette.inkMuted }, deleteText: { fontSize: 24, color: '#A86464' }, disabledText: { opacity: 0.22 }, addButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, borderWidth: 1, borderColor: palette.sageStrong, marginBottom: spacing.xl }, addText: { ...typography.bodyStrong, color: palette.sageStrong },
});
