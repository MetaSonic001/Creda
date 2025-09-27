import { MMKV } from 'react-native-mmkv';
import { PersistStorage } from 'zustand/middleware';
import { Platform } from 'react-native';


// Cross-platform key-value accessors used by helpers and non-Zustand code
type KeyValueStore = {
  set: (key: string, value: string) => void;
  get: (key: string) => string | null;
  delete: (key: string) => void;
};

// Use MMKV on native, localStorage on web
const isWeb = Platform.OS === 'web';

let nativeMMKV: MMKV | null = null;
if (!isWeb) {
  nativeMMKV = new MMKV({
    id: 'global_storage',
    // encryptionKey is not supported on Web; we only set it for native
    encryptionKey: 'a87e2e2e-2e73-4499-88ae-7099b47580a6',
  });
}

export const globalStorage: KeyValueStore = isWeb
  ? {
      set: (key, value) => {
        try { localStorage.setItem(key, value); } catch {}
      },
      get: (key) => {
        try { return localStorage.getItem(key); } catch { return null; }
      },
      delete: (key) => {
        try { localStorage.removeItem(key); } catch {}
      },
    }
  : {
      set: (key, value) => { nativeMMKV!.set(key, value); },
      get: (key) => nativeMMKV!.getString(key) ?? null,
      delete: (key) => { nativeMMKV!.delete(key); },
    };

// Global Zustand storage using the global MMKV instance
export const globalZustandStorage: PersistStorage<any> = {
  setItem: (name, value) => {
    globalStorage.set(name, JSON.stringify(value));
  },
  getItem: (name) => {
    const value = globalStorage.get(name);
    return value ? JSON.parse(value) : null;
  },
  removeItem: (name) => {
    globalStorage.delete(name);
  },
};

// Backward-compat export for existing imports on native platforms
export const globalMMKV = nativeMMKV as unknown as MMKV;
