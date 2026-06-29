import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};

/** Primary/secondary CTA with explicit pressed / disabled / loading states. */
export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      style={(state) => [
        styles.base,
        {
          backgroundColor: isPrimary
            ? state.pressed
              ? theme.brandPressed
              : theme.brand
            : 'transparent',
          borderColor: isPrimary ? 'transparent' : theme.border,
          borderWidth: isPrimary ? 0 : StyleSheet.hairlineWidth * 2,
          opacity: isInactive ? 0.5 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.onBrand : theme.brand} />
      ) : (
        <Text
          style={[styles.label, { color: isPrimary ? theme.onBrand : theme.text }]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 600,
  },
});
