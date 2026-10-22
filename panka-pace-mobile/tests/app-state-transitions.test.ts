import assert from 'node:assert/strict';
import test from 'node:test';

import { defaultAppState } from '../src/data/default-state.ts';
import { reconcileAppStateForDate } from '../src/domain/app-state-transitions.ts';
import type { AppState, DailyRecord } from '../src/domain/models.ts';

function record(date: string, meaningful = true): DailyRecord {
  return {
    date,
    done: meaningful ? [0] : [],
    rate: meaningful ? 100 : 0,
    memo: '',
    extraData: {},
    aiComment: '',
  };
}

test('連続した記録から、指定日を基準にストリークを計算する', () => {
  const state: AppState = {
    ...defaultAppState,
    records: [record('2026-10-20'), record('2026-10-21'), record('2026-10-22')],
  };

  assert.equal(reconcileAppStateForDate(state, '2026-10-22').streak, 3);
});

test('当日の記録がまだなければ、前日までのストリークを維持する', () => {
  const state: AppState = {
    ...defaultAppState,
    records: [record('2026-10-20'), record('2026-10-21')],
  };

  assert.equal(reconcileAppStateForDate(state, '2026-10-22').streak, 2);
});

test('適用日を迎えた予約タスクだけを反映する', () => {
  const state: AppState = {
    ...defaultAppState,
    goal: {
      goal: '毎日歩く', deadline: '', dailyTime: '10分', currentLevel: '', obstacles: '',
      tasks: ['旧タスク'], pendingTasks: { tasks: ['新タスク'], effectiveDate: '2026-10-22' },
      rationale: '', advice: '', status: 'active', startDate: '2026-10-01', lastUpdated: '2026-10-01',
    },
  };

  assert.deepEqual(reconcileAppStateForDate(state, '2026-10-21').goal?.tasks, ['旧タスク']);
  const due = reconcileAppStateForDate(state, '2026-10-22');
  assert.deepEqual(due.goal?.tasks, ['新タスク']);
  assert.equal(due.goal?.pendingTasks, null);
  assert.equal(due.goal?.lastUpdated, '2026-10-22');
});
