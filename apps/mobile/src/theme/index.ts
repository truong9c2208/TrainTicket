import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/theme.store';

const palette = {
  light: {
    background: '#f1f5f9',
    surface: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textHint: '#94a3b8',
    accent: '#0d9488',
    accentDark: '#0f766e',
    accentText: '#ffffff',
    danger: '#dc2626',
    dangerBg: 'rgba(220, 38, 38, 0.08)',
    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.08)',
    inputBg: '#f8fafc',
    inputBorder: '#cbd5e1',
    divider: '#e2e8f0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadowColor: '#0f172a',
  },
  dark: {
    background: '#0d1117',
    surface: '#0d1117',
    card: '#161b22',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    textHint: '#475569',
    accent: '#0d9488',
    accentDark: '#0f766e',
    accentText: '#ffffff',
    danger: '#f87171',
    dangerBg: 'rgba(248, 113, 113, 0.1)',
    success: '#34d399',
    successBg: 'rgba(52, 211, 153, 0.1)',
    inputBg: '#0d1117',
    inputBorder: 'rgba(255, 255, 255, 0.12)',
    divider: 'rgba(255, 255, 255, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadowColor: '#000000',
  },
};

export function useAppTheme() {
  const mode = useThemeStore((s) => s.mode);
  const colors = palette[mode];

  const commonStyles = useMemo(
    () =>
      StyleSheet.create({
        safeContainer: {
          flex: 1,
          backgroundColor: colors.background,
        },
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          padding: 20,
          paddingBottom: 40,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: mode === 'dark' ? 0.4 : 0.05,
              shadowRadius: 8,
            },
            android: { elevation: 2 },
            default: {},
          }),
        },
        heading: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.textPrimary,
          letterSpacing: -0.5,
          marginBottom: 4,
        },
        subheading: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.3,
        },
        body: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        bodyText: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        caption: {
          fontSize: 12,
          color: colors.textHint,
          lineHeight: 16,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 6,
        },
        button: {
          backgroundColor: colors.accent,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
            default: {},
          }),
        },
        buttonSecondary: {
          backgroundColor: 'transparent',
          borderRadius: 12,
          paddingVertical: 13,
          paddingHorizontal: 20,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        buttonDanger: {
          backgroundColor: colors.dangerBg,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 20,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${colors.danger}33`,
        },
        buttonText: {
          color: colors.accentText,
          fontWeight: '700',
          fontSize: 15,
          letterSpacing: 0.1,
        },
        buttonTextSecondary: {
          color: colors.textPrimary,
          fontWeight: '600',
          fontSize: 15,
        },
        buttonTextDanger: {
          color: colors.danger,
          fontWeight: '600',
          fontSize: 14,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: colors.inputBg,
          color: colors.textPrimary,
          fontSize: 15,
        },
        inputFocused: {
          borderWidth: 1.5,
          borderColor: colors.accent,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: colors.inputBg,
          color: colors.textPrimary,
          fontSize: 15,
        },
        errorText: {
          color: colors.danger,
          fontSize: 12,
          marginTop: 4,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        divider: {
          height: 1,
          backgroundColor: colors.divider,
          marginVertical: 16,
        },
      }),
    [colors, mode],
  );

  return { mode, colors, commonStyles };
}
