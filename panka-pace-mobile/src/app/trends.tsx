import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { analyzeTrend } from '@/services/trend-analysis';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function TrendsScreen() {
  const { isReady } = useAppState();
  if (!isReady) return <SafeAreaView style={[styles.safeArea, styles.loading]}><ActivityIndicator color={palette.sageStrong} /></SafeAreaView>;
  return <TrendsContent />;
}

function TrendsContent() {
  const { state } = useAppState();
  const [period, setPeriod] = useState<14 | 30>(14);
  const summary = useMemo(() => analyzeTrend(state.records, period), [period, state.records]);
  const chartDays = period === 30 ? summary.days.filter((_, index) => index % 2 === 1 || index === summary.days.length - 1) : summary.days;

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>PACE TRENDS</Text><Text style={styles.title}>続け方の変化を見る。</Text><Text style={styles.description}>数字は評価ではなく、無理のないペースを見つけるための手がかりです。</Text>

    <View style={styles.segment}>{([14, 30] as const).map((value) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: period === value }} key={value} onPress={() => setPeriod(value)} style={[styles.segmentButton, period === value && styles.segmentSelected]}><Text style={[styles.segmentText, period === value && styles.segmentTextSelected]}>{value}日</Text></Pressable>)}</View>

    <View style={styles.heroCard}><View><Text style={styles.heroLabel}>{period}日間の平均達成率</Text><Text style={styles.heroValue}>{summary.averageRate}<Text style={styles.heroPercent}>%</Text></Text></View><View style={styles.changeBadge}><Text style={styles.changeText}>{summary.change === null ? '比較データ待ち' : `${summary.change >= 0 ? '+' : ''}${summary.change}pt`}</Text></View>
      <View style={styles.chart}>{chartDays.map((day, index) => <View key={day.date} style={styles.barColumn}><View style={styles.barTrack}><View style={[styles.barFill, !day.recorded && styles.barEmpty, { height: `${Math.max(day.rate, day.recorded ? 3 : 1)}%` }]} /></View>{(period === 14 ? index % 3 === 0 || index === chartDays.length - 1 : index % 4 === 0 || index === chartDays.length - 1) && <Text style={styles.chartLabel}>{day.label}</Text>}</View>)}</View>
    </View>

    <View style={styles.metrics}><Metric label="記録した日" value={`${summary.recordedDays}日`} /><Metric label="現在の連続" value={`${summary.activeStreak}日`} /><Metric label="最高達成率" value={`${summary.bestRate}%`} /></View>

    <View style={styles.insightCard}><View style={styles.insightMark}><Text style={styles.insightMarkText}>✦</Text></View><View style={styles.insightCopy}><Text style={styles.insightLabel}>PACE INSIGHT</Text><Text style={styles.insightText}>{summary.insight}</Text></View></View>

    {summary.recordedDays === 0 && <View style={styles.emptyCard}><Text style={styles.emptyTitle}>まだ傾向を決めなくて大丈夫です</Text><Text style={styles.emptyText}>今日の記録を1つずつ残すと、ここにあなたのペースが育っていきます。</Text></View>}
  </ScrollView><BottomNav active="trends" /></SafeAreaView>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, loading: { alignItems: 'center', justifyContent: 'center' }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl }, backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.xl }, backText: { ...typography.bodyStrong, color: palette.inkMuted }, eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xl },
  segment: { flexDirection: 'row', borderRadius: radius.round, padding: 4, backgroundColor: palette.line, marginBottom: spacing.xl }, segmentButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round }, segmentSelected: { backgroundColor: palette.surface }, segmentText: { ...typography.bodyStrong, color: palette.inkMuted }, segmentTextSelected: { color: palette.ink },
  heroCard: { ...shadow.card, borderRadius: radius.xl, backgroundColor: palette.navy, padding: spacing.xl, marginBottom: spacing.md }, heroLabel: { ...typography.caption, color: palette.blueSoft }, heroValue: { fontSize: 44, lineHeight: 54, fontWeight: '700', color: palette.white }, heroPercent: { fontSize: 20 }, changeBadge: { position: 'absolute', right: spacing.xl, top: spacing.xl, borderRadius: radius.round, backgroundColor: '#465467', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }, changeText: { ...typography.caption, color: palette.white },
  chart: { height: 110, flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: spacing.lg }, barColumn: { flex: 1, height: 92, alignItems: 'center', justifyContent: 'flex-end' }, barTrack: { width: '72%', maxWidth: 12, height: 72, justifyContent: 'flex-end', borderRadius: radius.round, backgroundColor: '#465467', overflow: 'hidden' }, barFill: { width: '100%', minHeight: 2, borderRadius: radius.round, backgroundColor: palette.sage }, barEmpty: { backgroundColor: '#5B6675' }, chartLabel: { ...typography.caption, position: 'absolute', top: 76, color: palette.whiteMuted, fontSize: 9 },
  metrics: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }, metric: { ...shadow.card, flex: 1, alignItems: 'center', borderRadius: radius.lg, backgroundColor: palette.surface, paddingVertical: spacing.lg, paddingHorizontal: spacing.xs }, metricValue: { ...typography.heading, color: palette.ink }, metricLabel: { ...typography.caption, color: palette.inkMuted, textAlign: 'center', marginTop: 2 },
  insightCard: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.lg, backgroundColor: palette.peach, padding: spacing.lg, marginBottom: spacing.lg }, insightMark: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.peachStrong }, insightMarkText: { fontSize: 20, color: palette.ink }, insightCopy: { flex: 1 }, insightLabel: { ...typography.eyebrow, color: palette.inkMuted, marginBottom: spacing.xs }, insightText: { ...typography.body, color: palette.ink },
  emptyCard: { borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, padding: spacing.xl }, emptyTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.xs }, emptyText: { ...typography.caption, color: palette.inkMuted },
});
