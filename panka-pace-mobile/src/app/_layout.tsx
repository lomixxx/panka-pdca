import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppStateProvider, useAppState } from '@/state/app-state';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <PersistenceNotice />
    </AppStateProvider>
  );
}

function PersistenceNotice() {
  const { persistenceError, retryPersistence } = useAppState();
  if (!persistenceError) return null;
  return (
    <View accessibilityLiveRegion="assertive" style={styles.notice}>
      <Text style={styles.noticeText}>{persistenceError}</Text>
      <Pressable accessibilityRole="button" onPress={() => void retryPersistence()} style={styles.retryButton}>
        <Text style={styles.retryText}>再試行</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    ...shadow.card,
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#7D4242',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noticeText: { ...typography.caption, flex: 1, color: palette.white },
  retryButton: { borderRadius: radius.round, backgroundColor: palette.white, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  retryText: { ...typography.caption, color: '#7D4242', fontWeight: '700' },
});
