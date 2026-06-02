import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormTextInput } from '../components/FormTextInput';
import { useAuthActions } from '../hooks/useAuth';
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { commonStyles, colors } = useAppTheme();
  const { loginMutation, registerMutation } = useAuthActions();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthForm>({
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (form: AuthForm) => {
    try {
      if (authMode === 'login') {
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
      const msg = Array.isArray(responseMessage) ? responseMessage.join('\n') : responseMessage;
      Alert.alert(
        authMode === 'login' ? 'Login failed' : 'Registration failed',
        msg ?? 'Please check your details and try again.',
      );
    }
  };

  const switchMode = () => {
    setAuthMode((m) => (m === 'login' ? 'register' : 'login'));
    reset();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={{ alignItems: 'center', marginBottom: 44 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              ...Platform.select({
                ios: {
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                },
                android: { elevation: 6 },
                default: {},
              }),
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>TT</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 }}>
            TrainTicket
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6 }}>
            Book train tickets, fast.
          </Text>
        </View>

        {/* Form card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            ...Platform.select({
              ios: {
                shadowColor: colors.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
              },
              android: { elevation: 3 },
              default: {},
            }),
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 22,
              letterSpacing: -0.3,
            }}
          >
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </Text>

          {authMode === 'register' && (
            <Controller
              control={control}
              name="fullName"
              rules={{ required: 'Full name is required', validate: validateFullName }}
              render={({ field }) => (
                <FormTextInput
                  label="Full name"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Your full name"
                  autoCapitalize="words"
                  error={errors.fullName?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email is required', validate: validateEmail }}
            render={({ field }) => (
              <FormTextInput
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="you@email.com"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: AUTH_VALIDATION.passwordMinLength,
                message: `At least ${AUTH_VALIDATION.passwordMinLength} characters`,
              },
              validate: validatePassword,
            }}
            render={({ field }) => (
              <FormTextInput
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                placeholder="••••••••"
                error={errors.password?.message}
              />
            )}
          />

          <Pressable
            style={({ pressed }) => [
              commonStyles.button,
              { marginTop: 8, opacity: pressed || isSubmitting ? 0.8 : 1 },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={commonStyles.buttonText}>
              {isSubmitting
                ? 'Please wait...'
                : authMode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Text>
          </Pressable>
        </View>

        {/* Mode switch */}
        <Pressable style={{ marginTop: 24, alignItems: 'center', padding: 8 }} onPress={switchMode}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              {authMode === 'login' ? 'Register' : 'Sign in'}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
