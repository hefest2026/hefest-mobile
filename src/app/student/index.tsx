import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand-header';
import { EventCard } from '@/components/event-card';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useEvents } from '@/context/events';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';

export default function StudentEventsScreen() {
  const c = useTheme();
  const { currentStudentId } = useSession();
  const { publishedEvents, register, joinWaitlist, cancel } = useEvents();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.background }]}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <Text style={[styles.title, { color: c.foreground }]}>Публикувани събития</Text>

          {publishedEvents.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: c.muted }]}>
                Няма налични събития в момента.
              </Text>
            </View>
          ) : (
            publishedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentStudentId={currentStudentId}
                onRegister={(id) => register(id, currentStudentId)}
                onJoinWaitlist={(id) => joinWaitlist(id, currentStudentId)}
                onCancel={(id) => cancel(id, currentStudentId)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  title: { fontSize: 22, fontWeight: '600', marginBottom: Spacing.one },
  empty: { paddingVertical: Spacing.five, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
