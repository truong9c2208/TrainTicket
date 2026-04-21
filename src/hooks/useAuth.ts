import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuthActions() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSuccess = async (data: { accessToken: string; user: { id: string } }) => {
    setAuth(data.accessToken, data.user.id);
    await AsyncStorage.setItem('accessToken', data.accessToken);
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
