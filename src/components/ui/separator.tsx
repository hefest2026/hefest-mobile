import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function Separator({
  orientation = 'horizontal',
  style,
}: {
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: c.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, width: '100%' },
  vertical: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
