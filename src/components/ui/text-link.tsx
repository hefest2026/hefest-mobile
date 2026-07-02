import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Inline underlined link rendered as tappable text. */
export function TextLink({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
}) {
  const c = useTheme();
  return (
    <Text onPress={onPress} style={[styles.link, { color: c.primary }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
