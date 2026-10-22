import type { NotificationSettings } from '@/domain/models';

export type NotificationScheduleStatus = 'granted' | 'denied' | 'unsupported';
export function configureNotificationSchedule(settings: NotificationSettings): Promise<NotificationScheduleStatus>;
