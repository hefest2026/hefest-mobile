import * as React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Field({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.field, style]}>{children}</View>;
}

export function FieldLabel({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const c = useTheme();
  return <Text style={[styles.label, { color: c.foreground }, style]}>{children}</Text>;
}

export function FieldDescription({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const c = useTheme();
  return <Text style={[styles.description, { color: c.muted }, style]}>{children}</Text>;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  const c = useTheme();
  if (!children) return null;
  return <Text style={[styles.error, { color: c.destructive }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
});
