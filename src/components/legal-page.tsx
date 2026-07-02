import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface LegalSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  const c = useTheme();
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.back}>
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              ← Назад
            </Button>
          </View>

          <Text style={[styles.title, { color: c.primary }]}>{title}</Text>

          {sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={[styles.heading, { color: c.foreground }]}>{section.heading}</Text>
              {section.body ? (
                <Text style={[styles.body, { color: c.muted }]}>{section.body}</Text>
              ) : null}
              {section.bullets?.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: c.muted }]}>{'\u2022'}</Text>
                  <Text style={[styles.body, styles.bulletText, { color: c.muted }]}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  back: { alignSelf: 'flex-start', marginLeft: -Spacing.two },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  section: { gap: Spacing.two },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  bulletDot: { fontSize: 14, lineHeight: 21 },
  bulletText: { flex: 1 },
});
