import * as React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface TextareaProps extends TextInputProps {
  invalid?: boolean;
}

export function Textarea({ invalid, style, onFocus, onBlur, ...props }: TextareaProps) {
  const c = useTheme();
  const [focused, setFocused] = React.useState(false);

  const borderColor = invalid ? c.destructive : focused ? c.ring : c.border;

  return (
    <TextInput
      multiline
      textAlignVertical="top"
      placeholderTextColor={c.subtle}
      style={[
        styles.textarea,
        { color: c.foreground, backgroundColor: c.surface, borderColor },
        style,
      ]}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 96,
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.none,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
});
