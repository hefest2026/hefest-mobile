import { StyleSheet, Text, type StyleProp, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "EventHub" brand wordmark used at the top of the app screens. */
export function BrandHeader({
  right,
  style,
}: {
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderBottomColor: c.border }, style]}>
      <View style={styles.brand}>
        <Text style={styles.logo}>🗓️</Text>
        <Text style={[styles.name, { color: c.foreground }]}>EventHub</Text>
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    fontSize: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
