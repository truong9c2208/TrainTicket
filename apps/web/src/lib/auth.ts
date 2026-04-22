import { ACCESS_TOKEN_KEY, toAuthSession } from '@repo/shared/src';
import type { AuthResponse } from './types';
import { webApi } from './client';

export async function login(payload: { email: string; password: string }) {
  const data = await webApi.post<AuthResponse>('/auth/login', payload);
  const session = toAuthSession(data);
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  const data = await webApi.post<AuthResponse>('/auth/register', payload);
  const session = toAuthSession(data);
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  return data;
}
