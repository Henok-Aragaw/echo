import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'echo_auth_token';
export const ONBOARDING_KEY = 'echo_has_seen_onboarding';

export const storage = {
  getToken: async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (e) {
      console.warn('Failed to save auth token', e);
    }
  },

  removeToken: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
  },

  hasSeenOnboarding: async () => {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  },

  setSeenOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  },
};
