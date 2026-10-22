import type { AppState } from '../domain/models.ts';

const APP_STATE_KEY = 'panka_app_state_v1';
const STORAGE_VERSION = 2;

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface StoredAppState {
  version: number;
  state: AppState;
}

function isEnvelope(value: unknown): value is StoredAppState {
  return Boolean(value && typeof value === 'object' && 'version' in value && 'state' in value);
}

export function createAppRepository(storage: StorageAdapter) {
  let writeQueue = Promise.resolve();

  return {
    async loadAppState(): Promise<AppState | null> {
      const saved = await storage.getItem(APP_STATE_KEY);
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved) as unknown;
        if (isEnvelope(parsed)) return parsed.state;
        return parsed as AppState;
      } catch {
        return null;
      }
    },
    async saveAppState(state: AppState): Promise<void> {
      const payload: StoredAppState = { version: STORAGE_VERSION, state };
      writeQueue = writeQueue.catch(() => undefined).then(() => storage.setItem(APP_STATE_KEY, JSON.stringify(payload)));
      await writeQueue;
    },
    async clearAppState(): Promise<void> {
      await writeQueue.catch(() => undefined);
      await storage.removeItem(APP_STATE_KEY);
    },
  };
}
