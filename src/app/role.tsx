import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';
import type { Role } from '@/lib/types';

interface RoleOption {
  role: Role;
  emoji: string;
  title: string;
  description: string;
  href: '/organizer' | '/student';
}

const OPTIONS: RoleOption[] = [
  {
    role: 'organizer',
    emoji: '🗂️',
    title: 'Организатор',
    description: 'Създавайте, редактирайте и публикувайте събития и уъркшопи.',
    href: '/organizer',
  },
  {
    role: 'student',
    emoji: '🎓',
    title: 'Ученик',
    description: 'Разглеждайте публикувани събития и се записвайте за участие.',
    href: '/student',
  },
];

export default function RoleScreen() {
  const c = useTheme();
  const { selectRole } = useSession();

  const choose = (option: RoleOption) => {
    selectRole(option.role);
    router.replace(option.href);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.heading}>
            <Text style={[styles.title, { color: c.foreground }]}>Изберете роля</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Как искате да използвате EventHub?
            </Text>
          </View>

          {OPTIONS.map((option) => (
            <Pressable
              key={option.role}
              onPress={() => choose(option)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.surface, borderColor: c.border },
                pressed && { borderColor: c.primary },
              ]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: c.foreground }]}>{option.title}</Text>
                <Text style={[styles.cardDescription, { color: c.muted }]}>{option.description}</Text>
              </View>
              <Text style={[styles.chevron, { color: c.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.three },
  inner: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: Spacing.three },
  heading: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.two },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.four,
  },
  emoji: { fontSize: 34 },
  cardText: { flex: 1, gap: Spacing.one },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDescription: { fontSize: 13, lineHeight: 19 },
  chevron: { fontSize: 28, fontWeight: '300' },
});
