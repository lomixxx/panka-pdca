import type { AppState } from '@/domain/models';

export const defaultAppState: AppState = {
  onboardingComplete: false,
  userType: null,
  goal: null,
  records: [],
  weeklyReviews: [],
  streak: 0,
  badges: [],
  userSettings: {
    taskGranularity: 'medium',
    maxDailyMinutes: 60,
    recordFrequency: 'daily',
    recordStyle: 'normal',
    aiTone: 'warm',
    adaptationHistory: [],
  },
  purchasedItems: [],
  theme: null,
  effects: [],
  characterMode: 'default',
  notifications: {
    dailyEnabled: false,
    dailyHour: 20,
    dailyMinute: 0,
    weeklyEnabled: false,
    weeklyDay: 0,
    weeklyHour: 20,
    weeklyMinute: 0,
  },
};
