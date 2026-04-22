import { ACCESS_TOKEN_KEY, createHttpClient } from '@repo/shared/src';

const API_BASE_URL = 'https://ch01-be.shibaa.uk/api';

export const webApi = createHttpClient({
  baseUrl: API_BASE_URL,
  timeoutMs: 10000,
  getAccessToken: async () => localStorage.getItem(ACCESS_TOKEN_KEY),
});

export function clearAuthToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
