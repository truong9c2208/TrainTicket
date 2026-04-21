import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { ACCESS_TOKEN_KEY, toAuthSession } from '../../../shared/src/auth/session';

export function useAuthActions() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSuccess = async (data: { accessToken: string; user: { id: string } }) => {
    const session = toAuthSession(data);
    setAuth(session.accessToken, session.userId);
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: handleSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: handleSuccess,
  });

  return {
    loginMutation,
    registerMutation,
  };
}
