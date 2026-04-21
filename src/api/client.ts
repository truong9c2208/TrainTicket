import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: 'https://ch01-be.shibaa.uk/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const inMemoryToken = useAuthStore.getState().token;
  const persistedToken = await AsyncStorage.getItem('accessToken');
  const token = inMemoryToken ?? persistedToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
