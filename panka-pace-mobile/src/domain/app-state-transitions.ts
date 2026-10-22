import type { AppState, DailyRecord } from './models.ts';

function previousDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calculateStreak(records: DailyRecord[], referenceDate: string) {
  const recordedDates = new Set(
    records
      .filter((record) => record.done.length > 0 || Boolean(record.memo.trim()))
      .map((record) => record.date),
  );
  let cursor = recordedDates.has(referenceDate) ? referenceDate : previousDateKey(referenceDate);
  let streak = 0;
  while (recordedDates.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
}

export function reconcileAppStateForDate(state: AppState, date: string): AppState {
  const streak = calculateStreak(state.records ?? [], date);
  const pending = state.goal?.pendingTasks;
  if (!state.goal || !pending || pending.effectiveDate > date) {
    return streak === state.streak ? state : { ...state, streak };
  }
  return {
    ...state,
    streak,
    goal: { ...state.goal, tasks: pending.tasks, pendingTasks: null, lastUpdated: date },
  };
}
