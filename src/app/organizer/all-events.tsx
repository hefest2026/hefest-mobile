import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useEvents } from '@/context/events';
import { useTheme } from '@/hooks/use-theme';
import { formatDisplayDate } from '@/lib/format';

function Meta({ label, value }: { label: string; value: string }) {
  const c = useTheme();
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaLabel, { color: c.foreground }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: c.muted }]}>{value}</Text>
    </View>
  );
}

export default function OrganizerAllEventsScreen() {
  const c = useTheme();
  const { publishedEvents, isOwn, deletePublished } = useEvents();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.background }]}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <Text style={[styles.title, { color: c.foreground }]}>
            Всички налични събития в платформата
          </Text>

          {publishedEvents.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.emptyText, { color: c.muted }]}>
                Няма публикувани събития в момента.
              </Text>
            </View>
          ) : (
            publishedEvents.map((event) => {
              const mine = isOwn(event.id);
              return (
                <View
                  key={event.id}
                  style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderText}>
                      <Text style={[styles.cardTitle, { color: c.foreground }]}>{event.title}</Text>
                    </View>
                    <Badge
                      label={mine ? 'ВАШЕ СЪБИТИЕ' : 'ОРГАНИЗАТОР: ДРУГ'}
                      tone={mine ? 'primary' : 'neutral'}
                    />
                  </View>

                  <Text style={[styles.description, { color: c.muted }]}>{event.description}</Text>

                  <View style={[styles.grid, { borderTopColor: c.border }]}>
                    <Meta label="Начало:" value={formatDisplayDate(event.starts_at)} />
                    <Meta label="Място:" value={event.location || 'Не е указано'} />
                    <Meta label="Капацитет:" value={`${event.capacity} места`} />
                  </View>

                  {mine ? (
                    <View style={styles.actions}>
                      <Button variant="outline" size="sm" danger onPress={() => deletePublished(event.id)}>
                        Изтрийте вашето събитие
                      </Button>
                    </View>
                  ) : null}
                </View>
              );
            })
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
  title: { fontSize: 20, fontWeight: '600', marginBottom: Spacing.one },
  empty: {
    borderWidth: 1,
    borderRadius: Radius.none,
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 21 },
  grid: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  meta: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  metaLabel: { fontSize: 13, fontWeight: '700' },
  metaValue: { fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});
