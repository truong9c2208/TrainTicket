import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  error?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
};

export function FormTextInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
  error,
  keyboardType,
  autoCapitalize = 'none',
}: Props) {
  const { colors, commonStyles } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={commonStyles.label}>{label}</Text>
      <TextInput
        style={[
          focused ? commonStyles.inputFocused : commonStyles.input,
          error ? { borderColor: colors.danger } : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.textHint}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}
    </View>
  );
}
