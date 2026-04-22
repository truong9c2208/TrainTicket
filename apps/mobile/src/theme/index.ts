import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '../store/theme.store';

const palette = {
  light: {
    background: '#f3f4f6',
    card: '#ffffff',
    cardBorder: '#e5e7eb',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    accent: '#4f46e5',
    accentAlt: '#4338ca',
    accentText: '#ffffff',
    danger: '#ef4444',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
  },
  dark: {
    background: '#1d1d1d',
    card: '#262626',
    cardBorder: '#333333',
    textPrimary: '#f5f5f5',
    textSecondary: '#a3a3a3',
    accent: '#e5e5e5',
    accentAlt: '#303030',
    accentText: '#1d1d1d',
    danger: '#ef4444',
    inputBg: '#101010',
    inputBorder: '#404040',
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
          color: colors.accentText,
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
