import { globalStorage } from '~/store/storage';

export const getCurrentUserFromStorage = () => {
  try {
    const authStateString = globalStorage.get('auth-storage');
    if (!authStateString) {
      return null;
    }

    const authState = JSON.parse(authStateString);
    const currentUser = authState?.state?.currentUser;
    if (!currentUser?.id || !currentUser?.email) {
      return null;
    }

    return currentUser;
  } catch (error) {
    console.error('[AuthHelpers] Failed to get current user:', error);
    return null;
  }
};

export const isUserAuthenticated = () => {
  const user = getCurrentUserFromStorage();
  return user !== null && user.id !== '';
};

export const getSessionToken = async () => {
  try {
    const authStateString = globalStorage.get('auth-storage');
    if (!authStateString) {
      return null;
    }

    const authState = JSON.parse(authStateString);
    return authState?.state?.session || null;
  } catch (error) {
    console.error('[AuthHelpers] Failed to get session token:', error);
    return null;
  }
};

export const updateUserLastSynced = (timestamp: string) => {
  try {
    const authStateString = globalStorage.get('auth-storage');
    if (!authStateString) {
      return false;
    }

    const authState = JSON.parse(authStateString);
    if (authState?.state?.currentUser) {
      authState.state.currentUser.last_synced = timestamp;
      globalStorage.set('auth-storage', JSON.stringify(authState));
      return true;
    }

    return false;
  } catch (error) {
    console.error('[AuthHelpers] Failed to update last synced:', error);
    return false;
  }
};
