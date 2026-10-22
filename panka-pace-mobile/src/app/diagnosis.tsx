import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { diagnoseType, diagnosisQuestions, type ContinuityTypeKey } from '@/domain/continuity-types';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function DiagnosisScreen() {
  const router = useRouter();
  const { state, completeOnboarding } = useAppState();
  const [answers, setAnswers] = useState<ContinuityTypeKey[]>([]);
  const question = diagnosisQuestions[answers.length];
  const result = useMemo(() => answers.length === diagnosisQuestions.length ? diagnoseType(answers) : null, [answers]);

  const finish = () => {
    if (!result) return;
    completeOnboarding(result.key);
    router.replace(state.goal ? '/' : './goal-setup');
  };

  if (result) {
    return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.resultContent}>
      <Text style={styles.eyebrow}>YOUR PACE TYPE</Text>
      <View style={styles.resultCard}><Text style={styles.resultEmoji}>{result.emoji}</Text><Text style={styles.resultLead}>あなたは</Text><Text style={styles.resultName}>{result.name}</Text><Text style={styles.resultDescription}>{result.description}</Text><View style={styles.strengthBox}><Text style={styles.strengthLabel}>あなたの強み</Text><Text style={styles.strength}>{result.strength}</Text></View></View>
      <Text style={styles.resultNote}>この結果をもとに、タスクの大きさや記録方法を少しずつ調整します。</Text>
      <Pressable accessibilityRole="button" onPress={finish} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>PANKA PACEを始める</Text></Pressable>
    </ScrollView></SafeAreaView>;
  }

  const progress = ((answers.length + 1) / diagnosisQuestions.length) * 100;
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.topRow}><Pressable accessibilityRole="button" onPress={() => answers.length ? setAnswers((current) => current.slice(0, -1)) : router.back()} style={styles.backButton}><Text style={styles.backText}>‹ 戻る</Text></Pressable><Text style={styles.counter}>{answers.length + 1} / {diagnosisQuestions.length}</Text></View>
    <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
    <Text style={styles.eyebrow}>PACE DIAGNOSIS</Text><Text style={styles.question}>{question.question}</Text><Text style={styles.hint}>いちばん近いものを選んでください。</Text>
    <View style={styles.options}>{question.options.map((option, index) => <Pressable accessibilityRole="button" key={option.key} onPress={() => setAnswers((current) => [...current, option.key])} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}><View style={styles.optionNumber}><Text style={styles.optionNumberText}>{index + 1}</Text></View><Text style={styles.optionText}>{option.text}</Text><Text style={styles.chevron}>›</Text></Pressable>)}</View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl }, resultContent: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }, backButton: { paddingVertical: spacing.sm, paddingRight: spacing.lg }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, counter: { ...typography.caption, color: palette.inkMuted }, track: { height: 5, borderRadius: radius.round, backgroundColor: palette.line, overflow: 'hidden', marginBottom: spacing.xxxl }, fill: { height: '100%', borderRadius: radius.round, backgroundColor: palette.sageStrong },
  eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.md }, question: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, hint: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl }, options: { gap: spacing.md }, option: { ...shadow.card, minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.lg }, optionPressed: { backgroundColor: palette.sage }, optionNumber: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.canvas }, optionNumberText: { ...typography.caption, color: palette.inkMuted }, optionText: { ...typography.body, flex: 1, color: palette.ink }, chevron: { fontSize: 26, color: palette.inkFaint },
  resultCard: { ...shadow.card, alignItems: 'center', borderRadius: radius.xl, backgroundColor: palette.surface, padding: spacing.xxl, marginBottom: spacing.xl }, resultEmoji: { fontSize: 52, marginBottom: spacing.md }, resultLead: { ...typography.caption, color: palette.inkMuted, marginBottom: spacing.xs }, resultName: { fontSize: 28, lineHeight: 38, fontWeight: '700', color: palette.ink, marginBottom: spacing.lg }, resultDescription: { ...typography.body, color: palette.inkMuted, textAlign: 'center', marginBottom: spacing.xl }, strengthBox: { alignSelf: 'stretch', borderRadius: radius.md, backgroundColor: palette.sage, padding: spacing.lg }, strengthLabel: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.xs }, strength: { ...typography.bodyStrong, color: palette.ink }, resultNote: { ...typography.caption, color: palette.inkMuted, textAlign: 'center', marginBottom: spacing.xxl }, primaryButton: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy }, primaryText: { ...typography.bodyStrong, color: palette.white }, pressed: { opacity: 0.72 },
});
