import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { getDisplayDate } from '@/lib/date';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { state, isReady, todayRecord, toggleTodayTask } = useAppState();
  const tasks = state.goal?.tasks ?? [];

  if (!isReady) {
    return <SafeAreaView style={[styles.safeArea, styles.loading]}><ActivityIndicator color={palette.sageStrong} /></SafeAreaView>;
  }

  if (!state.onboardingComplete) return <Redirect href="./onboarding" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>{getDisplayDate().toUpperCase()}</Text><Text style={styles.greeting}>今日も、小さく進めよう。</Text></View>
          <View style={styles.avatar}><Text style={styles.avatarText}>P</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate(state.goal ? './goal' : './goal-setup')} style={({ pressed }) => [styles.goalCard, pressed && styles.pressed]}>
          <Text style={styles.cardLabel}>CURRENT GOAL</Text>
          <Text style={styles.goalTitle}>{state.goal?.goal ?? '新しい目標を設定しましょう'}</Text>
          <Text style={styles.goalDescription}>{state.goal?.rationale || 'PANKA PACEが、続けられる大きさにタスクを整えます。'}</Text>
          <View style={styles.goalMeta}><Text style={styles.goalMetaText}>1日 {state.goal?.dailyTime || '未設定'}</Text><Text style={styles.goalMetaText}>達成率 {todayRecord.rate}%</Text></View>
          <Text style={styles.editGoal}>{state.goal ? '目標とタスクを編集 ›' : '目標を設定する ›'}</Text>
        </Pressable>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>今日のペース</Text><Text style={styles.sectionMeta}>{todayRecord.done.length} / {tasks.length}</Text></View>
        {state.goal?.pendingTasks && <View style={styles.pendingBanner}><Text style={styles.pendingText}>明日から新しいタスク構成に切り替わります</Text></View>}
        <View style={styles.taskCard}>
          {tasks.map((task, index) => {
            const completed = todayRecord.done.includes(index);
            return (
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: completed }} key={`${index}-${task}`} onPress={() => toggleTodayTask(index)} style={[styles.taskRow, index > 0 && styles.taskDivider]}>
                <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>{completed && <Text style={styles.checkmark}>✓</Text>}</View>
                <Text style={[styles.taskText, completed && styles.taskTextCompleted]}>{task}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('./record')} style={({ pressed }) => [styles.reflectionCard, pressed && styles.pressed]}>
          <View style={styles.reflectionIcon}><Text style={styles.reflectionIconText}>✦</Text></View>
          <View style={styles.reflectionCopy}><Text style={styles.reflectionTitle}>{todayRecord.memo ? '今日の記録を編集する' : '今日を記録する'}</Text><Text numberOfLines={2} style={styles.reflectionDescription}>{todayRecord.memo || 'できたことも、止まった理由も、次の一歩の材料です。'}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('./weekly')} style={({ pressed }) => [styles.weeklyCard, pressed && styles.pressed]}>
          <View><Text style={styles.weeklyEyebrow}>WEEKLY REVIEW</Text><Text style={styles.weeklyTitle}>今週を振り返る</Text><Text style={styles.weeklyDescription}>できたことを確認して、来週のタスクを整えます。</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('./trends')} style={({ pressed }) => [styles.trendsCard, pressed && styles.pressed]}>
          <View><Text style={styles.trendsEyebrow}>PACE TRENDS</Text><Text style={styles.weeklyTitle}>14日・30日の傾向</Text><Text style={styles.weeklyDescription}>記録から、続きやすいペースを見つけます。</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>
        <Text style={styles.prototypeNote}>PANKA PACE · 移植開発版</Text>
      </ScrollView><BottomNav active="today" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, loading: { alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, eyebrow: { ...typography.eyebrow, color: palette.inkMuted, marginBottom: spacing.xs }, greeting: { ...typography.title, color: palette.ink },
  avatar: { width: 44, height: 44, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.sage }, avatarText: { ...typography.bodyStrong, color: palette.ink },
  goalCard: { ...shadow.card, borderRadius: radius.xl, padding: spacing.xl, backgroundColor: palette.navy, marginBottom: spacing.xxl }, cardLabel: { ...typography.eyebrow, color: palette.blueSoft, marginBottom: spacing.sm }, goalTitle: { ...typography.hero, color: palette.white, marginBottom: spacing.sm }, goalDescription: { ...typography.body, color: palette.whiteMuted, marginBottom: spacing.xl },
  goalMeta: { flexDirection: 'row', gap: spacing.sm }, goalMetaText: { ...typography.caption, color: palette.navy, backgroundColor: palette.white, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }, editGoal: { ...typography.caption, color: palette.blueSoft, marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, sectionTitle: { ...typography.heading, color: palette.ink }, sectionMeta: { ...typography.caption, color: palette.inkMuted },
  pendingBanner: { borderRadius: radius.md, backgroundColor: palette.sage, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md }, pendingText: { ...typography.caption, color: palette.ink },
  taskCard: { ...shadow.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, backgroundColor: palette.surface, marginBottom: spacing.lg }, taskRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, taskDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line },
  checkbox: { width: 23, height: 23, borderRadius: radius.sm, borderWidth: 1.5, borderColor: palette.sageStrong, alignItems: 'center', justifyContent: 'center' }, checkboxCompleted: { backgroundColor: palette.sageStrong }, checkmark: { color: palette.white, fontWeight: '800', fontSize: 14 }, taskText: { ...typography.body, flex: 1, color: palette.ink }, taskTextCompleted: { color: palette.inkMuted, textDecorationLine: 'line-through' },
  reflectionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: palette.peach }, pressed: { opacity: 0.72 }, reflectionIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.peachStrong }, reflectionIconText: { fontSize: 20, color: palette.ink }, reflectionCopy: { flex: 1 }, reflectionTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: 3 }, reflectionDescription: { ...typography.caption, color: palette.inkMuted }, chevron: { fontSize: 30, lineHeight: 30, color: palette.inkMuted }, prototypeNote: { ...typography.caption, color: palette.inkFaint, textAlign: 'center', marginTop: spacing.xl },
  weeklyCard: { ...shadow.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.lg, padding: spacing.lg, backgroundColor: palette.surface, marginTop: spacing.md }, weeklyEyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.xs }, weeklyTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: 2 }, weeklyDescription: { ...typography.caption, color: palette.inkMuted },
  trendsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.lg, padding: spacing.lg, backgroundColor: palette.sage, marginTop: spacing.md }, trendsEyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.xs },
});
