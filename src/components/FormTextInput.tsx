import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  error?: string;
};

export function FormTextInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
  error,
}: Props) {
  const { colors, commonStyles } = useAppTheme();

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={commonStyles.label}>{label}</Text>
      <TextInput
        style={commonStyles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {error ? <Text style={{ color: colors.danger, marginTop: 6 }}>{error}</Text> : null}
    </View>
  );
}
