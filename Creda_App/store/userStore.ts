import { create, UseBoundStore, StoreApi } from 'zustand';
import { persist, PersistStorage, PersistOptions } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// INTERFACES AND TYPES

/**
 * Represents a single notification item.
 */
interface Notification {
  id: string;
  title: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: string;
}

/**
 * Defines the complete shape of the Zustand store's state,
 * including state values and action functions.
 */
interface StoreState {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    lastSynced: string | null;
  };
  setUser: (user: StoreState['user']) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
}

/**
 * Defines the shape of the state that will be persisted to storage.
 * We only persist a subset of the full state.
 */
interface PersistedState {
  user: StoreState['user'];
  notifications: Notification[];
}

/**
 * This is the type for the store hook that Zustand creates.
 * It's a function that components can use to access the store.
 */
type UserBoundStoreType = UseBoundStore<StoreApi<StoreState>>;

/**
 * A Map to cache the created stores, ensuring we only have one
 * store instance per userId.
 */
const userStores = new Map<string, UserBoundStoreType>();

// MMKV STORAGE CREATION

/**
 * Creates a dedicated MMKV instance for a given user.
 * This isolates each user's data.
 * @param userId The unique identifier for the user.
 * @returns A new MMKV instance.
 */
export const createUserMMKV = (userId: string): MMKV => {
  return new MMKV({
    id: `storage_${userId}`, // Unique storage file for each user
    encryptionKey: '48f48886-5705-4148-8020-00643c69e479', // IMPORTANT: Use a secure, user-specific key in a real app
  });
};

/**
 * Creates a storage adapter that allows Zustand's `persist` middleware
 * to use MMKV for storage.
 * @param userId The unique identifier for the user.
 * @returns A storage object compatible with Zustand's `PersistStorage`.
 */
export const createZustandStorageForUser = (userId: string): PersistStorage<PersistedState> => {
  const userStorage = createUserMMKV(userId);

  return {
    setItem: (name, value) => {
      // Serialize the entire value object (which includes state and version) to a string.
      userStorage.set(name, JSON.stringify(value));
    },
    getItem: (name) => {
      const value = userStorage.getString(name);
      // Deserialize the string back into an object, or return null if it doesn't exist.
      return value ? JSON.parse(value) : null;
    },
    removeItem: (name) => {
      userStorage.delete(name);
    },
  };
};

// ZUSTAND STORE CREATION

/**
 * Creates (or retrieves from cache) a Zustand store for a specific user.
 * This function is idempotent; calling it multiple times with the same userId
 * will return the same store instance.
 * @param userId The unique identifier for the user.
 * @returns The user-specific Zustand store.
 */
export const createStoreForUser = (userId: string): UserBoundStoreType => {
  // If a store for this user already exists in our cache, return it immediately.
  if (userStores.has(userId)) {
    return userStores.get(userId)!;
  }

  // If no store exists, create a new one.
  const newStore = create<StoreState>()(
    persist(
      (set) => ({
        // Initial state for a new user
        user: {
          id: userId,
          name: null,
          email: null,
          lastSynced: null,
        },
        notifications: [],
        // Action to update the user object
        setUser: (user) => set({ user }),
        // Action to replace all notifications
        setNotifications: (notifications) => set({ notifications }),
        // Action to add a new notification to the beginning of the list
        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
          })),
      }),
      {
        name: `my-app-store-${userId}`, // Unique name for the persisted data in MMKV
        storage: createZustandStorageForUser(userId), // Use the user-specific MMKV storage
        // A function to select which parts of the state to persist.
        partialize: (state): PersistedState => ({
          user: state.user,
          notifications: state.notifications,
        }),
      } as PersistOptions<StoreState, PersistedState> // Explicitly cast for type safety
    )
  );

  // Cache the newly created store for future use.
  userStores.set(userId, newStore);
  return newStore;
};

// REACT HOOK

/**
 * The main React hook that components will use to access the store.
 * It ensures the component uses the correct store for the given userId.
 * @param userId The unique identifier for the user.
 * @returns The user-specific Zustand store hook.
 */
export const useUserStore = (userId: string): UserBoundStoreType => {
  // This hook is now a simple wrapper around `createStoreForUser`.
  // It directly returns the store instance. Zustand's own subscription model
  // handles re-rendering components when the state inside the store changes.
  // We don't need `useState` or `useEffect` here, which simplifies the logic
  // and prevents unnecessary re-renders when the userId changes.
  return createStoreForUser(userId);
};


