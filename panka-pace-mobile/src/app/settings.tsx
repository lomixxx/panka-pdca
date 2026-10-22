import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { continuityTypes, type ContinuityTypeKey } from '@/domain/continuity-types';
import type { AiTone, RecordFrequency, RecordStyle, TaskGranularity } from '@/domain/models';
import { configureNotificationSchedule, type NotificationScheduleStatus } from '@/services/notifications';
import { useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function SettingsScreen() {
  const { isReady } = useAppState();
  if (!isReady) return <SafeAreaView style={[styles.safeArea, styles.loading]}><ActivityIndicator color={palette.sageStrong} /></SafeAreaView>;
  return <SettingsContent />;
}

function SettingsContent() {
  const router = useRouter();
  const { state, resetAppData, updateSettings, updateNotifications } = useAppState();
  const settings = state.userSettings;
  const [notificationStatus, setNotificationStatus] = useState<NotificationScheduleStatus | null>(null);
  const typeKey = state.userType && state.userType in continuityTypes ? state.userType as ContinuityTypeKey : null;
  const type = typeKey ? continuityTypes[typeKey] : null;
  const applyNotifications = async (change: Partial<typeof state.notifications>) => {
    const next = { ...state.notifications, ...change };
    const status = await configureNotificationSchedule(next);
    setNotificationStatus(status);
    updateNotifications(status === 'denied' ? { ...next, dailyEnabled: false, weeklyEnabled: false } : next);
  };
  const confirmReset = () => Alert.alert(
    'すべてのデータを削除しますか？',
    '目標、タスク、記録、診断結果、設定がこの端末から削除されます。この操作は取り消せません。',
    [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除する', style: 'destructive', onPress: () => { void configureNotificationSchedule({ ...state.notifications, dailyEnabled: false, weeklyEnabled: false }).then(() => resetAppData()).then(() => router.replace('/')); } },
    ],
  );

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>SETTINGS</Text><Text style={styles.title}>自分に合う形へ。</Text><Text style={styles.description}>使いながら変えて大丈夫です。変更内容はこの端末に自動保存されます。</Text>

    <View style={styles.typeCard}><View style={styles.typeEmoji}><Text style={styles.typeEmojiText}>{type?.emoji ?? '○'}</Text></View><View style={styles.typeCopy}><Text style={styles.cardLabel}>継続タイプ</Text><Text style={styles.typeName}>{type?.name ?? '未診断'}</Text><Text style={styles.typeStrength}>{type?.strength ?? '診断すると、あなたに合う続け方を提案します。'}</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.navigate('./diagnosis')} style={styles.secondaryButton}><Text style={styles.secondaryText}>タイプ診断をやり直す</Text></Pressable>

    <SettingsSection title="タスクの設定">
      <Text style={styles.settingLabel}>タスクの細かさ</Text><OptionRow value={settings.taskGranularity} options={[['small', '細かく'], ['medium', '標準'], ['large', '大きめ']]} onChange={(value) => updateSettings({ taskGranularity: value as TaskGranularity })} />
      <Text style={styles.settingLabel}>1日の上限時間</Text><OptionRow value={String(settings.maxDailyMinutes)} options={[['15', '15分'], ['30', '30分'], ['60', '60分']]} onChange={(value) => updateSettings({ maxDailyMinutes: Number(value) })} />
      <Pressable accessibilityRole="button" disabled={!state.goal} onPress={() => router.navigate('./goal')} style={[styles.actionRow, !state.goal && styles.actionDisabled]}><View><Text style={styles.actionTitle}>タスクを編集</Text><Text style={styles.actionDescription}>今日または明日から適用できます</Text></View><Text style={styles.chevron}>›</Text></Pressable>
    </SettingsSection>

    <SettingsSection title="記録の設定">
      <Text style={styles.settingLabel}>記録頻度</Text><OptionRow value={settings.recordFrequency} options={[['daily', '毎日'], ['3perweek', '週3回']]} onChange={(value) => updateSettings({ recordFrequency: value as RecordFrequency })} />
      <Text style={styles.settingLabel}>記録スタイル</Text><OptionRow value={settings.recordStyle} options={[['simple', 'シンプル'], ['normal', '標準'], ['detailed', '詳しく']]} onChange={(value) => updateSettings({ recordStyle: value as RecordStyle })} />
    </SettingsSection>

    <SettingsSection title="PANKAの話し方">
      <OptionRow value={settings.aiTone} options={[['warm', 'あたたかく'], ['analytical', '分析的'], ['flat', 'フラット']]} onChange={(value) => updateSettings({ aiTone: value as AiTone })} />
    </SettingsSection>

    <SettingsSection title="リマインダー">
      <ToggleRow label="毎日のリマインダー" description={`${String(state.notifications.dailyHour).padStart(2, '0')}:${String(state.notifications.dailyMinute).padStart(2, '0')}`} enabled={state.notifications.dailyEnabled} onPress={() => void applyNotifications({ dailyEnabled: !state.notifications.dailyEnabled })} />
      {state.notifications.dailyEnabled && <OptionRow value={String(state.notifications.dailyHour)} options={[['8', '8:00'], ['12', '12:00'], ['20', '20:00'], ['21', '21:00']]} onChange={(value) => void applyNotifications({ dailyHour: Number(value), dailyMinute: 0 })} />}
      <ToggleRow label="週間レビュー" description={`毎週${['日', '月', '火', '水', '木', '金', '土'][state.notifications.weeklyDay]}曜 ${String(state.notifications.weeklyHour).padStart(2, '0')}:00`} enabled={state.notifications.weeklyEnabled} onPress={() => void applyNotifications({ weeklyEnabled: !state.notifications.weeklyEnabled })} />
      {state.notifications.weeklyEnabled && <><OptionRow value={String(state.notifications.weeklyDay)} options={[['0', '日曜'], ['5', '金曜'], ['6', '土曜']]} onChange={(value) => void applyNotifications({ weeklyDay: Number(value) })} /><OptionRow value={String(state.notifications.weeklyHour)} options={[['18', '18:00'], ['20', '20:00'], ['21', '21:00']]} onChange={(value) => void applyNotifications({ weeklyHour: Number(value), weeklyMinute: 0 })} /></>}
      {notificationStatus === 'unsupported' && <Text style={styles.notificationNote}>Webでは設定のみ保存します。通知はiPhone・Androidで有効になります。</Text>}
      {notificationStatus === 'denied' && <Text style={styles.notificationError}>通知が許可されなかったため、リマインダーをオフにしました。</Text>}
    </SettingsSection>

    <View style={styles.infoCard}><Text style={styles.infoTitle}>現在の保存場所</Text><Text style={styles.infoText}>データはこの端末内に保存されています。アカウント同期は今後の工程で追加します。</Text></View>
    <Pressable accessibilityRole="button" onPress={confirmReset} style={styles.resetButton}><Text style={styles.resetText}>この端末のデータをリセット</Text></Pressable>
  </ScrollView><BottomNav active="settings" /></SafeAreaView>;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function OptionRow({ value, options, onChange }: { value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <View style={styles.options}>{options.map(([optionValue, label]) => { const selected = value === optionValue; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={optionValue} onPress={() => onChange(optionValue)} style={[styles.option, selected && styles.optionSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text></Pressable>; })}</View>;
}

function ToggleRow({ label, description, enabled, onPress }: { label: string; description: string; enabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: enabled }} onPress={onPress} style={styles.toggleRow}><View><Text style={styles.actionTitle}>{label}</Text><Text style={styles.actionDescription}>{description}</Text></View><View style={[styles.toggle, enabled && styles.toggleEnabled]}><View style={[styles.toggleKnob, enabled && styles.toggleKnobEnabled]} /></View></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, loading: { alignItems: 'center', justifyContent: 'center' }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl }, eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.sm }, title: { ...typography.hero, color: palette.ink, marginBottom: spacing.sm }, description: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl },
  typeCard: { ...shadow.card, flexDirection: 'row', gap: spacing.lg, alignItems: 'center', borderRadius: radius.xl, backgroundColor: palette.navy, padding: spacing.xl }, typeEmoji: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: '#465467' }, typeEmojiText: { fontSize: 30 }, typeCopy: { flex: 1 }, cardLabel: { ...typography.eyebrow, color: palette.blueSoft, marginBottom: spacing.xs }, typeName: { ...typography.heading, color: palette.white }, typeStrength: { ...typography.caption, color: palette.whiteMuted, marginTop: 2 }, secondaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, borderWidth: 1, borderColor: palette.sageStrong, marginTop: spacing.md, marginBottom: spacing.xxl }, secondaryText: { ...typography.bodyStrong, color: palette.sageStrong },
  section: { ...shadow.card, borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.lg, marginBottom: spacing.lg }, sectionTitle: { ...typography.heading, color: palette.ink, marginBottom: spacing.lg }, settingLabel: { ...typography.caption, color: palette.inkMuted, marginBottom: spacing.sm }, options: { flexDirection: 'row', gap: spacing.xs, borderRadius: radius.round, backgroundColor: palette.canvas, padding: 4, marginBottom: spacing.lg }, option: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round }, optionSelected: { backgroundColor: palette.navy }, optionText: { ...typography.caption, color: palette.inkMuted, textAlign: 'center' }, optionTextSelected: { color: palette.white, fontWeight: '700' },
  actionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line, paddingTop: spacing.md }, actionDisabled: { opacity: 0.35 }, actionTitle: { ...typography.bodyStrong, color: palette.ink }, actionDescription: { ...typography.caption, color: palette.inkMuted }, chevron: { fontSize: 28, color: palette.inkFaint }, infoCard: { borderRadius: radius.lg, backgroundColor: palette.sage, padding: spacing.lg }, infoTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.xs }, infoText: { ...typography.caption, color: palette.inkMuted },
  toggleRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line, marginBottom: spacing.md }, toggle: { width: 48, height: 28, justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.line, padding: 3 }, toggleEnabled: { backgroundColor: palette.sageStrong }, toggleKnob: { width: 22, height: 22, borderRadius: radius.round, backgroundColor: palette.white }, toggleKnobEnabled: { alignSelf: 'flex-end' }, notificationNote: { ...typography.caption, color: palette.inkMuted }, notificationError: { ...typography.caption, color: '#A86464' },
  resetButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg }, resetText: { ...typography.bodyStrong, color: '#A86464' },
});
