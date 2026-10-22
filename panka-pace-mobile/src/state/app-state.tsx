import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';

import { clearAppState, loadAppState, saveAppState } from '@/data/app-repository';
import { defaultAppState } from '@/data/default-state';
import { calculateStreak, reconcileAppStateForDate } from '@/domain/app-state-transitions';
import type { AppState, DailyRecord, NotificationSettings, TaskApplyTiming, UserSettings, WeeklyReview } from '@/domain/models';
import { getLocalDateKey } from '@/lib/date';
import type { GoalHearingInput, TaskProposal } from '@/services/task-proposal';
import { persistAppState, PERSISTENCE_ERROR_MESSAGE } from '@/state/persistence-status';

interface AppStateContextValue {
  state: AppState;
  isReady: boolean;
  persistenceError: string | null;
  retryPersistence: () => Promise<void>;
  todayRecord: DailyRecord;
  toggleTodayTask: (index: number) => void;
  saveTodayRecord: (memo: string) => void;
  saveGoal: (goal: string, dailyTime: string, tasks: string[], timing: TaskApplyTiming) => void;
  completeOnboarding: (userType: string) => void;
  createGoal: (input: GoalHearingInput, proposal: TaskProposal) => void;
  saveWeeklyReview: (review: WeeklyReview) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateNotifications: (notifications: NotificationSettings) => void;
  resetAppData: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function emptyTodayRecord(date = getLocalDateKey()): DailyRecord {
  return {
    date,
    done: [],
    rate: 0,
    memo: '',
    extraData: {},
    aiComment: '',
  };
}

function getTomorrowKey() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateKey(tomorrow);
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(defaultAppState);
  const [isReady, setIsReady] = useState(false);
  const [currentDate, setCurrentDate] = useState(getLocalDateKey());
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const persist = useCallback((next: AppState) => persistAppState(saveAppState, next, setPersistenceError), []);

  useEffect(() => {
    let active = true;
    void loadAppState()
      .then((saved) => {
        if (!active || !saved) return;
        const normalized = { ...saved, records: saved.records ?? [], weeklyReviews: saved.weeklyReviews ?? [] };
        const hydrated = reconcileAppStateForDate(normalized, getLocalDateKey());
        setState(hydrated);
        if (hydrated !== saved) void persist(hydrated);
      })
      .catch(() => { if (active) setPersistenceError(PERSISTENCE_ERROR_MESSAGE); })
      .finally(() => { if (active) setIsReady(true); });
    return () => {
      active = false;
    };
  }, [persist]);

  useEffect(() => {
    const refresh = () => {
      const date = getLocalDateKey();
      setCurrentDate(date);
      setState((current) => {
        const next = reconcileAppStateForDate(current, date);
        if (next === current) return current;
        void persist(next);
        return next;
      });
    };
    const subscription = NativeAppState.addEventListener('change', (status) => {
      if (status === 'active') refresh();
    });
    const timer = setInterval(refresh, 60_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [persist]);

  const todayRecord = useMemo(
    () => state.records.find((record) => record.date === currentDate) ?? emptyTodayRecord(currentDate),
    [currentDate, state.records],
  );

  const updateTodayRecord = useCallback((change: (record: DailyRecord, taskCount: number) => DailyRecord) => {
    setState((current) => {
      const date = currentDate;
      const taskCount = current.goal?.tasks.length ?? 0;
      const existing = current.records.find((record) => record.date === date) ?? emptyTodayRecord();
      const updated = change(existing, taskCount);
      const records = [...current.records.filter((record) => record.date !== date), updated];
      const next = {
        ...current,
        records,
        streak: calculateStreak(records, date),
      };
      void persist(next);
      return next;
    });
  }, [currentDate, persist]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      isReady,
      persistenceError,
      async retryPersistence() {
        await persist(state);
      },
      todayRecord,
      toggleTodayTask(index) {
        updateTodayRecord((record, taskCount) => {
          const done = record.done.includes(index)
            ? record.done.filter((item) => item !== index)
            : [...record.done, index].sort((a, b) => a - b);
          return { ...record, done, rate: taskCount ? Math.round((done.length / taskCount) * 100) : 0 };
        });
      },
      saveTodayRecord(memo) {
        updateTodayRecord((record) => ({ ...record, memo: memo.trim() }));
      },
      saveGoal(goal, dailyTime, tasks, timing) {
        setState((current) => {
          const date = getLocalDateKey();
          const cleanTasks = tasks.map((task) => task.trim()).filter(Boolean);
          const existing = current.goal;
          const nextGoal = {
            goal: goal.trim(),
            deadline: existing?.deadline ?? '',
            dailyTime: dailyTime.trim(),
            currentLevel: existing?.currentLevel ?? '',
            obstacles: existing?.obstacles ?? '',
            tasks: timing === 'today' ? cleanTasks : (existing?.tasks ?? cleanTasks),
            pendingTasks: timing === 'tomorrow' ? { tasks: cleanTasks, effectiveDate: getTomorrowKey() } : null,
            rationale: existing?.rationale ?? '',
            advice: existing?.advice ?? '',
            status: 'active' as const,
            startDate: existing?.startDate ?? date,
            lastUpdated: date,
          };
          const next = {
            ...current,
            goal: nextGoal,
            records: timing === 'today'
              ? current.records.map((record) => record.date === date ? { ...record, done: [], rate: 0 } : record)
              : current.records,
          };
          void persist(next);
          return next;
        });
      },
      completeOnboarding(userType) {
        setState((current) => {
          const next = { ...current, onboardingComplete: true, userType };
          void persist(next);
          return next;
        });
      },
      createGoal(input, proposal) {
        setState((current) => {
          const date = getLocalDateKey();
          const next = {
            ...current,
            records: [],
            streak: 0,
            goal: {
              ...input,
              tasks: proposal.tasks.map((task) => task.trim()).filter(Boolean),
              pendingTasks: null,
              rationale: proposal.rationale,
              advice: proposal.advice,
              status: 'active' as const,
              startDate: date,
              lastUpdated: date,
            },
          };
          void persist(next);
          return next;
        });
      },
      saveWeeklyReview(review) {
        setState((current) => {
          const next = {
            ...current,
            weeklyReviews: [...(current.weeklyReviews ?? []).filter((item) => item.date !== review.date), review],
            goal: current.goal ? {
              ...current.goal,
              pendingTasks: { tasks: review.nextTasks, effectiveDate: review.effectiveDate },
              lastUpdated: getLocalDateKey(),
            } : null,
          };
          void persist(next);
          return next;
        });
      },
      updateSettings(settings) {
        setState((current) => {
          const next = { ...current, userSettings: { ...current.userSettings, ...settings } };
          void persist(next);
          return next;
        });
      },
      updateNotifications(notifications) {
        setState((current) => {
          const next = { ...current, notifications };
          void persist(next);
          return next;
        });
      },
      async resetAppData() {
        try {
          await clearAppState();
          setPersistenceError(null);
          setCurrentDate(getLocalDateKey());
          setState({ ...defaultAppState, records: [], weeklyReviews: [] });
        } catch {
          setPersistenceError(PERSISTENCE_ERROR_MESSAGE);
        }
      },
    }),
    [isReady, persist, persistenceError, state, todayRecord, updateTodayRecord],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
