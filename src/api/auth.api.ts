import { api } from './client';
import { AuthResponse } from '../types/api';

export const register = async (payload: {
  email: string;
  password: string;
  fullName: string;
}) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
};
