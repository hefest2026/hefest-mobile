import { StyleSheet, Text, type StyleProp, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

export function Badge({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();

  const toneMap: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: c.neutralBg, fg: c.neutralFg },
    success: { bg: c.successBg, fg: c.successFg },
    warning: { bg: c.warningBg, fg: c.warningFg },
    danger: { bg: c.dangerBg, fg: c.dangerFg },
    primary: { bg: c.primary, fg: c.primaryForeground },
  };

  const { bg, fg } = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
