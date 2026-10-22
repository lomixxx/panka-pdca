import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const benefits = [
  { mark: '01', title: '今日の一歩を小さくする', text: '大きな目標を、無理なく始められる単位に整えます。' },
  { mark: '02', title: 'できなかった日も材料にする', text: '失敗ではなく、次の計画を調整するための記録にします。' },
  { mark: '03', title: 'あなたの続け方に合わせる', text: '短い診断から、合うタスクと振り返り方を提案します。' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>P</Text></View><Text style={styles.brandName}>PANKA PACE</Text></View>
    <Text style={styles.eyebrow}>YOUR GOAL, YOUR PACE</Text><Text style={styles.title}>続け方は、ひとつじゃない。</Text>
    <Text style={styles.lead}>PANKA PACEは、あなたに合うペースを見つけ、目標までの毎日をやさしく整えます。</Text>
    <View style={styles.benefits}>{benefits.map((benefit) => <View key={benefit.mark} style={styles.benefitCard}><Text style={styles.mark}>{benefit.mark}</Text><View style={styles.benefitCopy}><Text style={styles.benefitTitle}>{benefit.title}</Text><Text style={styles.benefitText}>{benefit.text}</Text></View></View>)}</View>
    <Pressable accessibilityRole="button" onPress={() => router.navigate('./diagnosis')} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>自分に合う続け方を知る</Text></Pressable>
    <Text style={styles.note}>約2分 · あとから設定で変更できます</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxxl }, logo: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.navy }, logoText: { ...typography.bodyStrong, color: palette.white }, brandName: { ...typography.eyebrow, color: palette.ink, letterSpacing: 1.8 },
  eyebrow: { ...typography.eyebrow, color: palette.sageStrong, marginBottom: spacing.md }, title: { fontSize: 34, lineHeight: 44, fontWeight: '700', letterSpacing: -0.8, color: palette.ink, marginBottom: spacing.md }, lead: { ...typography.body, color: palette.inkMuted, marginBottom: spacing.xxl },
  benefits: { gap: spacing.md, marginBottom: spacing.xxl }, benefitCard: { ...shadow.card, flexDirection: 'row', gap: spacing.lg, borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.lg }, mark: { ...typography.eyebrow, color: palette.sageStrong, paddingTop: 3 }, benefitCopy: { flex: 1 }, benefitTitle: { ...typography.bodyStrong, color: palette.ink, marginBottom: spacing.xs }, benefitText: { ...typography.caption, color: palette.inkMuted },
  button: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.navy, marginTop: 'auto' }, buttonText: { ...typography.bodyStrong, color: palette.white }, pressed: { opacity: 0.72 }, note: { ...typography.caption, color: palette.inkFaint, textAlign: 'center', marginTop: spacing.md },
});
