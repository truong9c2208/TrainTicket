import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';
import { FormTextInput } from '../components/FormTextInput';
import { useAuthActions } from '../hooks/useAuth';
import { useThemeStore } from '../store/theme.store';
import { useAppTheme } from '../theme';

type AuthForm = {
  fullName: string;
  email: string;
  password: string;
};

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { commonStyles, colors, mode: themeMode } = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { loginMutation, registerMutation } = useAuthActions();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (form: AuthForm) => {
    try {
      if (mode === 'login') {
        await loginMutation.mutateAsync({ email: form.email, password: form.password });
      } else {
        await registerMutation.mutateAsync(form);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const responseMessage = axiosError.response?.data?.message;

      const backendMessage = Array.isArray(responseMessage)
        ? responseMessage.join('\n')
        : responseMessage;

      Alert.alert(
        'Authentication failed',
        backendMessage ?? 'Please check your credentials and try again.',
      );
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={commonStyles.heading}>{mode === 'login' ? 'Login' : 'Register'}</Text>
        <Pressable style={[commonStyles.buttonSecondary, { paddingVertical: 8 }]} onPress={toggleTheme}>
          <Text style={commonStyles.buttonText}>{themeMode === 'light' ? 'Dark' : 'Light'}</Text>
        </Pressable>
      </View>

      {mode === 'register' ? (
        <Controller
          control={control}
          name="fullName"
          rules={{
            required: 'Full name is required',
            minLength: { value: 2, message: 'Full name is too short' },
          }}
          render={({ field }) => (
            <FormTextInput
              label="Full Name"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="John Doe"
            />
          )}
        />
      ) : null}

      {errors.fullName ? (
        <Text style={{ color: colors.danger, marginBottom: 8 }}>{errors.fullName.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
          },
        }}
        render={({ field }) => (
          <FormTextInput
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="name@company.com"
          />
        )}
      />

      {errors.email ? (
        <Text style={{ color: colors.danger, marginBottom: 8 }}>{errors.email.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        }}
        render={({ field }) => (
          <FormTextInput
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            placeholder="********"
          />
        )}
      />

      {errors.password ? (
        <Text style={{ color: colors.danger, marginBottom: 8 }}>{errors.password.message}</Text>
      ) : null}

      <Pressable style={commonStyles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={commonStyles.buttonText}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
      </Pressable>

      <Pressable style={{ marginTop: 12 }} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={{ color: colors.accent, fontWeight: '600' }}>
          {mode === 'login' ? 'No account? Register' : 'Already have account? Login'}
        </Text>
      </Pressable>
    </View>
  );
}
