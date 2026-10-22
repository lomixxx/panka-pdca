import assert from 'node:assert/strict';
import test from 'node:test';

import { defaultAppState } from '../src/data/default-state.ts';
import { persistAppState } from '../src/state/persistence-status.ts';

test('保存失敗を状態へ通知し、再試行成功時に解除する', async () => {
  const statuses: Array<string | null> = [];
  let shouldFail = true;
  const save = async () => {
    if (shouldFail) throw new Error('disk full');
  };

  assert.equal(await persistAppState(save, defaultAppState, (status) => statuses.push(status)), false);
  assert.equal(statuses.at(-1), '変更を端末に保存できませんでした。');

  shouldFail = false;
  assert.equal(await persistAppState(save, defaultAppState, (status) => statuses.push(status)), true);
  assert.equal(statuses.at(-1), null);
});
