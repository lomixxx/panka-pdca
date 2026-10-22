export type GoalStatus = 'active' | 'completed';
export type TaskApplyTiming = 'today' | 'tomorrow';
export type TaskGranularity = 'small' | 'medium' | 'large';
export type RecordFrequency = 'daily' | '3perweek';
export type RecordStyle = 'simple' | 'normal' | 'detailed';
export type AiTone = 'warm' | 'analytical' | 'flat';

export interface PendingTasks {
  tasks: string[];
  effectiveDate: string;
}

export interface Goal {
  goal: string;
  deadline: string;
  dailyTime: string;
  currentLevel: string;
  obstacles: string;
  tasks: string[];
  pendingTasks: PendingTasks | null;
  rationale: string;
  advice: string;
  status: GoalStatus;
  startDate: string;
  lastUpdated: string;
}

export interface DailyRecord {
  date: string;
  done: number[];
  rate: number;
  memo: string;
  extraData: {
    insight?: string;
    declaration?: string;
    theme?: string;
    score?: number;
  };
  aiComment: string;
}

export interface WeeklyReview {
  date: string;
  averageRate: number;
  wentWell: string;
  adjustment: string;
  nextTasks: string[];
  effectiveDate: string;
}

export interface UserSettings {
  taskGranularity: TaskGranularity;
  maxDailyMinutes: number;
  recordFrequency: RecordFrequency;
  recordDays?: number[];
  recordStyle: RecordStyle;
  aiTone: AiTone;
  adaptationHistory: unknown[];
}

export interface NotificationSettings {
  dailyEnabled: boolean;
  dailyHour: number;
  dailyMinute: number;
  weeklyEnabled: boolean;
  weeklyDay: number;
  weeklyHour: number;
  weeklyMinute: number;
}

export interface AppState {
  onboardingComplete: boolean;
  userType: string | null;
  goal: Goal | null;
  records: DailyRecord[];
  weeklyReviews: WeeklyReview[];
  streak: number;
  badges: string[];
  userSettings: UserSettings;
  purchasedItems: string[];
  theme: string | null;
  effects: string[];
  characterMode: string;
  notifications: NotificationSettings;
}
