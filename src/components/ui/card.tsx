import * as React from 'react';
import { StyleSheet, Text, type StyleProp, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ViewProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: ViewProps) {
  const c = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: ViewProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children?: React.ReactNode; style?: StyleProp<any> }) {
  const c = useTheme();
  return <Text style={[styles.title, { color: c.foreground }, style]}>{children}</Text>;
}

export function CardDescription({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<any>;
}) {
  const c = useTheme();
  return <Text style={[styles.description, { color: c.muted }, style]}>{children}</Text>;
}

export function CardContent({ children, style }: ViewProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ children, style }: ViewProps) {
  const c = useTheme();
  return <View style={[styles.footer, { borderTopColor: c.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.none,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  content: {
    paddingHorizontal: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});
