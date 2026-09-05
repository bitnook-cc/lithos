/** Injectable storage allows testing quota, corruption, and recovery without a browser. */
export interface SaveStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export function browserStorage(): SaveStorage {
  return { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
}

export function createSaveRepository<T>(storage: SaveStorage, key: string, decode: (raw: string) => T, encode: (value: T) => string, legacyKey?: string) {
  const backupKey = `${key}_backup`;
  const recoveryKey = `${key}_recovery`;
  const valid = (raw: string) => { try { decode(raw); return true; } catch { return false; } };
  return {
    load(): { value: T | null; issue: string | null } {
      try {
        const current = storage.getItem(key);
        const raw = current ?? (legacyKey ? storage.getItem(legacyKey) : null);
        if (raw !== null) {
          try { return { value: decode(raw), issue: null }; } catch { /* retain for recovery */ }
          const backup = storage.getItem(backupKey);
          if (backup && valid(backup)) return { value: decode(backup), issue: 'Your latest save could not be loaded. A previous save was recovered; the original is retained for export.' };
          return { value: null, issue: 'Your save could not be loaded. It has been retained. Export it before troubleshooting, or begin a new lineage while keeping a recovery copy.' };
        }
        return { value: null, issue: null };
      } catch { return { value: null, issue: 'Browser storage is unavailable. Progress cannot be saved; keep this tab open and export your progress.' }; }
    },
    save(value: T): string | null {
      try {
        const encoded = encode(value);
        decode(encoded);
        const current = storage.getItem(key);
        if (current && current !== encoded) {
          if (valid(current)) storage.setItem(backupKey, current);
          else {
            const retained = storage.getItem(recoveryKey);
            // Preserve earlier recovery data as well as the latest malformed save.
            if (retained !== current) storage.setItem(recoveryKey, retained === null ? current : JSON.stringify({ previous: retained, latest: current }));
          }
        }
        storage.setItem(key, encoded);
        return null;
      } catch { return 'Saving failed. Your previous save is retained. Keep this tab open, export your progress, and retry saving.'; }
    },
    previous(): T | null {
      try { const raw = storage.getItem(backupKey); return raw ? decode(raw) : null; } catch { return null; }
    },
    export(value: T): string {
      const retained: Record<string, string | null> = {};
      for (const slot of [key, backupKey, recoveryKey, legacyKey].filter((s): s is string => Boolean(s))) {
        try { retained[slot] = storage.getItem(slot); } catch { retained[slot] = null; }
      }
      return JSON.stringify({ current: JSON.parse(encode(value)), retained }, null, 2);
    },
  };
}
