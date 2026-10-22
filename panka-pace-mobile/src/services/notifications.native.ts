import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationSettings } from '@/domain/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

export async function configureNotificationSchedule(settings: NotificationSettings) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.dailyEnabled && !settings.weeklyEnabled) return 'granted' as const;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'PANKA PACE リマインダー',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return 'denied' as const;

  if (settings.dailyEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: { title: '今日のペースを確認しましょう', body: '小さな一歩だけでも大丈夫です。', data: { url: '/' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: settings.dailyHour, minute: settings.dailyMinute, channelId: 'reminders' },
    });
  }
  if (settings.weeklyEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: { title: '今週を振り返る時間です', body: 'できたことを確認して、来週のペースを整えましょう。', data: { url: '/weekly' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: settings.weeklyDay + 1, hour: settings.weeklyHour, minute: settings.weeklyMinute, channelId: 'reminders' },
    });
  }
  return 'granted' as const;
}
