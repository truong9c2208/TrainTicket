import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '../store/theme.store';

const palette = {
  light: {
    background: '#f2f6fb',
    card: '#ffffff',
    cardBorder: '#d9e2ec',
    textPrimary: '#172b4d',
    textSecondary: '#486581',
    accent: '#005f73',
    accentAlt: '#0a9396',
    danger: '#ba181b',
    inputBg: '#f8fafc',
    inputBorder: '#bcccdc',
  },
  dark: {
    background: '#0f172a',
    card: '#111827',
    cardBorder: '#334155',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    accent: '#408A71',
    accentAlt: '#285A48',
    danger: '#f87171',
    inputBg: '#1e293b',
    inputBorder: '#334155',
  },
};

export function useAppTheme() {
  const mode = useThemeStore((s) => s.mode);
  const colors = palette[mode];

  const commonStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        heading: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: 12,
        },
        bodyText: {
          color: colors.textSecondary,
        },
        button: {
          backgroundColor: colors.accent,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          alignItems: 'center',
        },
        buttonSecondary: {
          backgroundColor: colors.accentAlt,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          alignItems: 'center',
        },
        buttonDanger: {
          backgroundColor: colors.danger,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          alignItems: 'center',
        },
        buttonText: {
          color: '#ffffff',
          fontWeight: '700',
        },
        label: {
          marginBottom: 6,
          color: colors.textPrimary,
          fontWeight: '600',
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: colors.inputBg,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );

  return { mode, colors, commonStyles };
}
