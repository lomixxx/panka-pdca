import type { AppState } from '../domain/models.ts';

export const PERSISTENCE_ERROR_MESSAGE = '変更を端末に保存できませんでした。';

export async function persistAppState(
  save: (state: AppState) => Promise<void>,
  state: AppState,
  setError: (error: string | null) => void,
) {
  try {
    await save(state);
    setError(null);
    return true;
  } catch {
    setError(PERSISTENCE_ERROR_MESSAGE);
    return false;
  }
}
