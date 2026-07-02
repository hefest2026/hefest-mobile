import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FormBannerTone = 'error' | 'success';

export type FormBannerProps = {
  message: string;
  tone?: FormBannerTone;
  onDismiss?: () => void;
};

/** Dismissible request-level error / success banner. */
export function FormBanner({ message, tone = 'error', onDismiss }: FormBannerProps) {
  const theme = useTheme();
  const accent = tone === 'error' ? theme.destructive : theme.brand;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { borderColor: accent, backgroundColor: theme.backgroundElement }]}
    >
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      {onDismiss != null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={Spacing.two}
          onPress={onDismiss}
        >
          <Text style={[styles.dismiss, { color: theme.textSecondary }]}>Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderRadius: 10,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
  },
  dismiss: {
    fontSize: 13,
    fontWeight: 600,
  },
});
