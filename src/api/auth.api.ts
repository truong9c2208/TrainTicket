import { api } from './client';
import { AuthResponse } from '../types/api';

export const register = async (payload: {
  email: string;
  password: string;
  fullName: string;
}) => {
  return api.post<AuthResponse>('/auth/register', payload);
};

export const login = async (payload: { email: string; password: string }) => {
  return api.post<AuthResponse>('/auth/login', payload);
};
