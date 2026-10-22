import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export type MainSection = 'today' | 'weekly' | 'trends' | 'settings';

const items = [
  { key: 'today', label: '今日', mark: '●', href: '/' },
  { key: 'weekly', label: '週間', mark: '□', href: './weekly' },
  { key: 'trends', label: '傾向', mark: '⌁', href: './trends' },
  { key: 'settings', label: '設定', mark: '◇', href: './settings' },
] as const;

export function BottomNav({ active }: { active: MainSection }) {
  const router = useRouter();
  return <View style={styles.shell}>{items.map((item) => {
    const selected = item.key === active;
    return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} key={item.key} onPress={() => router.replace(item.href)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}><Text style={[styles.mark, selected && styles.markSelected]}>{item.mark}</Text><Text style={[styles.label, selected && styles.labelSelected]}>{item.label}</Text></Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  shell: { ...shadow.card, flexDirection: 'row', borderRadius: radius.xl, backgroundColor: palette.surface, padding: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg }, pressed: { backgroundColor: palette.canvas }, mark: { fontSize: 17, lineHeight: 20, color: palette.inkFaint }, markSelected: { color: palette.sageStrong }, label: { ...typography.caption, color: palette.inkFaint, marginTop: 2 }, labelSelected: { color: palette.ink, fontWeight: '700' },
});
