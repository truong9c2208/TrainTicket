import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormTextInput } from '../components/FormTextInput';
import { useAuthActions } from '../hooks/useAuth';
import { useThemeStore } from '../store/theme.store';
import { useAppTheme } from '../theme';
import {
  AUTH_VALIDATION,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@repo/shared/src/validation/auth';
import { HttpError } from '@repo/shared/src/api/http-client';

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
      const httpError = error as HttpError;
      const responseMessage =
        httpError && typeof httpError === 'object' && 'data' in httpError
          ? ((httpError.data as { message?: string | string[] } | null)?.message ?? null)
          : null;

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
            validate: validateFullName,
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
          validate: validateEmail,
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
          minLength: {
            value: AUTH_VALIDATION.passwordMinLength,
            message: `Password must be at least ${AUTH_VALIDATION.passwordMinLength} characters`,
          },
          validate: validatePassword,
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
