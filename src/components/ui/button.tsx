import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type Size = 'sm' | 'default' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Renders the label in the destructive color (web `text-red-600` pattern). */
  danger?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const SIZE: Record<Size, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 38, paddingHorizontal: Spacing.three, fontSize: 13 },
  default: { height: 44, paddingHorizontal: Spacing.three, fontSize: 14 },
  lg: { height: 50, paddingHorizontal: Spacing.four, fontSize: 15 },
};

export function Button({
  children,
  variant = 'default',
  size = 'default',
  danger = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const c = useTheme();
  const dims = SIZE[size];

  const containerByVariant: Record<Variant, ViewStyle> = {
    default: { backgroundColor: c.primary },
    outline: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    secondary: { backgroundColor: c.secondary },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: c.dangerBg },
    link: { backgroundColor: 'transparent' },
  };

  const textColorByVariant: Record<Variant, string> = {
    default: c.primaryForeground,
    outline: c.foreground,
    secondary: c.secondaryForeground,
    ghost: c.foreground,
    destructive: c.dangerFg,
    link: c.primary,
  };

  const labelColor = danger ? c.destructive : textColorByVariant[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { height: dims.height, paddingHorizontal: dims.paddingHorizontal, borderRadius: Radius.none },
        containerByVariant[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.label,
                { color: labelColor, fontSize: dims.fontSize },
                variant === 'link' && styles.link,
                textStyle,
              ]}
              numberOfLines={1}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600', textAlign: 'center' },
  link: { textDecorationLine: 'underline' },
});
