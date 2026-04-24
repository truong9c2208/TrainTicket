import { create } from 'zustand';

type AuthState = {
  token: string | null;
  userId: number | null;
  setAuth: (token: string, userId: number) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  setAuth: (token, userId) => set({ token, userId }),
  logout: () => set({ token: null, userId: null }),
}));
