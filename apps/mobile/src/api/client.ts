import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/auth.store';
import { ACCESS_TOKEN_KEY } from '@repo/shared/src/auth/session';
import { createHttpClient } from '@repo/shared/src/api/http-client';

export const api = createHttpClient({
  baseUrl: 'https://ch01-be.shibaa.uk/api',
  timeoutMs: 10000,
  getAccessToken: async () => {
    const inMemoryToken = useAuthStore.getState().token;
    const persistedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return inMemoryToken ?? persistedToken;
  },
});
