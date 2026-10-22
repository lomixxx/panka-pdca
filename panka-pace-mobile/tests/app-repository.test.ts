import assert from 'node:assert/strict';
import test from 'node:test';

import { defaultAppState } from '../src/data/default-state.ts';
import { createAppRepository } from '../src/data/create-app-repository.ts';

function createStorage(initial: string | null = null) {
  let value = initial;
  const writes: string[] = [];
  return {
    writes,
    storage: {
      async getItem() { return value; },
      async setItem(_key: string, next: string) { writes.push(next); value = next; },
      async removeItem() { value = null; },
    },
  };
}

test('旧形式の状態をそのまま読み込める', async () => {
  const fake = createStorage(JSON.stringify(defaultAppState));
  const repository = createAppRepository(fake.storage);

  assert.deepEqual(await repository.loadAppState(), defaultAppState);
});

test('version 2の包絡形式で保存し、読み戻せる', async () => {
  const fake = createStorage();
  const repository = createAppRepository(fake.storage);

  await repository.saveAppState({ ...defaultAppState, streak: 4 });
  assert.equal(JSON.parse(fake.writes[0]).version, 2);
  assert.equal((await repository.loadAppState())?.streak, 4);
});

test('連続した保存を呼出順に実行する', async () => {
  const calls: number[] = [];
  let releaseFirst: (() => void) | undefined;
  const storage = {
    async getItem() { return null; },
    async setItem(_key: string, value: string) {
      const streak = JSON.parse(value).state.streak as number;
      calls.push(streak);
      if (streak === 1) await new Promise<void>((resolve) => { releaseFirst = resolve; });
    },
    async removeItem() {},
  };
  const repository = createAppRepository(storage);
  const first = repository.saveAppState({ ...defaultAppState, streak: 1 });
  const second = repository.saveAppState({ ...defaultAppState, streak: 2 });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, [1]);
  releaseFirst?.();
  await Promise.all([first, second]);
  assert.deepEqual(calls, [1, 2]);
});
