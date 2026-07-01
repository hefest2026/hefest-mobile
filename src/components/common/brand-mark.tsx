import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function BrandMark() {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { borderColor: theme.primary }]}> 
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          E
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={{ color: theme.text }}>
        EventHub
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
