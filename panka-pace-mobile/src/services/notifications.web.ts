import type { NotificationSettings } from '@/domain/models';

export async function configureNotificationSchedule(_settings: NotificationSettings) {
  return 'unsupported' as const;
}
