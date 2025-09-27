import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { globalZustandStorage } from '~/store/storage'; // adjust path accordingly
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { Toast } from 'toastify-react-native';
import { signIn, signUp } from '~/db/user';
import { SQLiteDatabase } from 'expo-sqlite';
import { createStoreForUser, useUserStore } from './userStore';
import { getNetworkStateAsync } from 'expo-network'; // Import from expo-network

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL;

async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

interface AuthState {
  session: string | null;
  currentUser: { id: string; name: string; email: string; last_synced: string };
  isLoading: boolean;
  signUp: (expoDb: SQLiteDatabase, name: string, email: string, password: string) => Promise<any>;
  signIn: (expoDb: SQLiteDatabase, email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      session: null,
      currentUser: { id: '123', name: 'Sharian', email: 'dabresharian@gmail.com', last_synced: '' },
      isLoading: true,

      initializeAuth: async () => {
        set((state) => { state.isLoading = true; });
        try {
          //const storedSession = await SecureStore.getItemAsync('session');
          let storedSession = 'dawindiandwwadibawojdbauwd bwbddbawdboajwdawudaowdjawndiandaudwa'
          console.log('Stored session:', storedSession);

          if (storedSession !== null) {
            axios.defaults.headers.common = {
              'Authorization': `Bearer ${storedSession}`,
              'Accept': 'application/json',
            };

            const networkState = await getNetworkStateAsync();
            if (false && networkState.isConnected && networkState.isInternetReachable) {
              console.log('Internet connection is available. Verifying session...');
              const result = await axios.get(API_BASE_URL + '/verify-session');
            } else {
              console.log('No internet connection. Loading session from local storage.');
            }
          }

          set((state) => {
            state.session = storedSession;
            state.isLoading = false;
          });
        } catch (error) {
          console.error('Failed to load session:', error);
          Toast.error(error.response?.data?.error || 'Failed to load session');

          await setStorageItemAsync('session', null);

          set((state) => {
            state.session = null;
            state.isLoading = false;
          });
        }
      },

      signUp: async (expoDb, name, email, password) => {
        set((state) => { state.isLoading = true; });
        try {
          const result = await axios.post(API_BASE_URL + '/signup', { name, email, password });
          await signUp(expoDb, result.data.user);
          await setStorageItemAsync('session', result.data.token);

          set((state) => {
            state.session = result.data.token;
            state.currentUser = result.data.user;
            state.isLoading = false;
          });
          return result.data.user;
        } catch (error) {
          console.error('Sign-up failed:', error);
          Toast.error(error.response?.data?.error || 'Sign-up failed');
          set((state) => {
            state.session = null;
            state.isLoading = false;
          });
        }
      },

      signIn: async (expoDb, email, password) => {
        set((state) => { state.isLoading = true; });
        try {
          const result = await axios.post(API_BASE_URL + '/login', { email, password });

          axios.defaults.headers.common = {
            'Authorization': `Bearer ${result.data.token}`,
            'Accept': 'application/json',
          };
          await signIn(expoDb, result.data.user);
          await setStorageItemAsync('session', result.data.token);

          set((state) => {
            state.session = result.data.token;
            state.currentUser = result.data.user;
            state.isLoading = false;
          });

          return result.data.user;
        } catch (error) {
          console.error('Sign-in failed:', error);
          Toast.error(error.response?.data?.error || 'Sign-in failed');
          set((state) => {
            state.session = null;
            state.isLoading = false;
          });
        }
      },

      signOut: async () => {
        set((state) => { state.isLoading = true; });
        try {
          await setStorageItemAsync('session', null);
          const userStore = useUserStore(get().currentUser.id);
          userStore.setState({
            user: {
              id: '',
              name: '',
              email: '',
              lastSynced: '',
            },
          });
          set((state) => {
            state.session = null;
            state.currentUser = { id: '', name: '', email: '', last_synced: '' };
            state.isLoading = false;
          });
        } catch (error) {
          console.error('Sign-out failed:', error);
          set((state) => { state.isLoading = false; });
        }
      },
    })),
    {
      name: 'auth-storage',
      storage: globalZustandStorage, // ✅ MMKV global storage here
      partialize: (state) => ({ currentUser: state.currentUser }), // Only persist currentUser
    }
  )
);

export default useAuthStore;

