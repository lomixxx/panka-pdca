const memory = new Map<string, string>();

export const storage = {
  async getItem(key: string) {
    if (typeof window === 'undefined') return memory.get(key) ?? null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === 'undefined') {
      memory.set(key, value);
      return;
    }
    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window === 'undefined') {
      memory.delete(key);
      return;
    }
    window.localStorage.removeItem(key);
  },
};
