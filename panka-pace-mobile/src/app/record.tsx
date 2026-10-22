import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function RecordScreen() {
  const { isReady } = useAppState();
  if (!isReady) return <SafeAreaView style={[styles.safeArea, styles.loading]}><ActivityIndicator color={palette.sageStrong} /></SafeAreaView>;
  return <RecordContent />;
}

function RecordContent() {
  const router = useRouter(); const { state, todayRecord, saveTodayRecord } = useAppState(); const [memo, setMemo] = useState(todayRecord.memo);
  const recordStyle = state.userSettings.recordStyle;
  const prompt = recordStyle === 'simple' ? '今日のひとこと' : recordStyle === 'detailed' ? 'できたこと・難しかったこと・次に試すこと' : '今日の気づき';
  const placeholder = recordStyle === 'simple' ? '例：15分だけ取り組めた。' : recordStyle === 'detailed' ? '例：できたこと、止まった理由、明日試したい工夫を自由に書く。' : '例：15分だけでも始めたら、そのまま集中できた。';
  const save = () => { saveTodayRecord(memo); router.back(); };
  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>‹ 戻る</Text></Pressable>
    <Text style={styles.eyebrow}>DAILY NOTE</Text><Text style={styles.title}>今日を、短く残す。</Text><Text style={styles.description}>うまくいったことも、難しかったことも、そのままで大丈夫です。</Text>
    <View style={styles.progressCard}><Text style={styles.progressLabel}>今日のタスク達成率</Text><Text style={styles.progressValue}>{todayRecord.rate}%</Text><View style={styles.track}><View style={[styles.fill, { width: `${todayRecord.rate}%` }]} /></View></View>
    <Text style={styles.inputLabel}>{prompt}</Text><TextInput accessibilityLabel={prompt} maxLength={500} multiline onChangeText={setMemo} placeholder={placeholder} placeholderTextColor={palette.inkFaint} style={[styles.input, recordStyle === 'simple' && styles.inputSimple]} textAlignVertical="top" value={memo} /><Text style={styles.counter}>{memo.length} / 500</Text>
    <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveButtonText}>記録を保存する</Text></Pressable>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: palette.canvas }, loading: { alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl }, backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.xl }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl }, progressCard: { ...shadow.card, borderRadius: radius.lg, backgroundColor: palette.navy, padding: spacing.xl, marginBottom: spacing.xxl }, progressLabel: { ...typography.caption, color: palette.blueSoft, marginBottom: spacing.xs }, progressValue: { fontSize: 34, lineHeight: 42, fontWeight: '700', color: palette.white, marginBottom: spacing.md }, track: { height: 7, borderRadius: radius.round, backgroundColor: '#465467', overflow: 'hidden' }, fill: { height: '100%', borderRadius: radius.round, backgroundColor: palette.sage }, inputLabel: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.sm }, input: { ...typography.body, minHeight: 180, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, color: palette.ink, padding: spacing.lg }, inputSimple: { minHeight: 96 }, counter: { ...typography.caption, alignSelf: 'flex-end', color: palette.inkFaint, marginTop: spacing.sm, marginBottom: spacing.xl }, saveButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy }, saveButtonText: { ...typography.bodyStrong, color: palette.white }, pressed: { opacity: 0.72 } });
