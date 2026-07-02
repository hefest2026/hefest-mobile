import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand-header';
import { EventForm } from '@/components/event-form';
import { PublishConfirmation } from '@/components/publish-confirmation';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useEvents } from '@/context/events';
import { useTheme } from '@/hooks/use-theme';
import { formatDisplayDate } from '@/lib/format';
import type { DraftEvent } from '@/lib/types';

export default function OrganizerManageScreen() {
  const c = useTheme();
  const { publishedEvents, isOwn, publishDraft, deletePublished } = useEvents();

  const [publishing, setPublishing] = React.useState<DraftEvent | null>(null);

  const ownPublished = publishedEvents.filter((e) => isOwn(e.id));

  const confirmPublish = (id: string) => {
    publishDraft(id);
    setPublishing(null);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.background }]}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <EventForm onPublishRequest={setPublishing} />

          {ownPublished.length > 0 ? (
            <View style={[styles.section, { borderTopColor: c.border }]}>
              <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                Вашите публикувани събития ({ownPublished.length})
              </Text>
              {ownPublished.map((event) => (
                <View
                  key={event.id}
                  style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: c.foreground }]}>{event.title}</Text>
                    <Text style={[styles.cardMeta, { color: c.subtle }]}>
                      Публикувано на: {formatDisplayDate(event.published_at)}
                    </Text>
                  </View>
                  <Button variant="outline" size="sm" danger onPress={() => deletePublished(event.id)}>
                    Изтриване
                  </Button>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <PublishConfirmation
        event={publishing}
        onPublish={confirmPublish}
        onCancel={() => setPublishing(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.five },
  section: {
    borderTopWidth: 1,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.three,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 13, marginTop: 2 },
});
