import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculateDuration, formatDateTimeDisplay } from '@/lib/format';
import type { DraftEvent } from '@/lib/types';

export interface PublishConfirmationProps {
  event: DraftEvent | null;
  onPublish: (eventId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/** Ported from the web `organizer part/event-confirmation.tsx` as an RN modal. */
export function PublishConfirmation({
  event,
  onPublish,
  onCancel,
  isLoading = false,
}: PublishConfirmationProps) {
  const c = useTheme();

  return (
    <Modal
      visible={!!event}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: c.surface, borderColor: c.border }]}>
          {event ? (
            <ScrollView bounces={false}>
              <View style={styles.headerBlock}>
                <Text style={[styles.title, { color: c.foreground }]}>Публикуване на събитието</Text>
                <Text style={[styles.subtitle, { color: c.muted }]}>
                  Преглед на детайлите преди публикуване
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: c.background }]}>
                <View style={styles.detailHead}>
                  <Text style={[styles.eventTitle, { color: c.foreground }]}>{event.title}</Text>
                  <Text style={[styles.eventDescription, { color: c.muted }]}>
                    {event.description}
                  </Text>
                </View>

                <View style={[styles.grid, { borderTopColor: c.border }]}>
                  <Meta label="НАЧАЛО" value={formatDateTimeDisplay(event.starts_at)} />
                  {event.ends_at ? (
                    <Meta label="КРАЙ" value={formatDateTimeDisplay(event.ends_at)} />
                  ) : null}
                  <Meta
                    label="КАПАЦИТЕТ"
                    value={`${event.capacity} ${event.capacity === 1 ? 'човек' : 'човека'}`}
                  />
                  {event.ends_at ? (
                    <Meta
                      label="ПРОДЪЛЖИТЕЛНОСТ"
                      value={calculateDuration(event.starts_at, event.ends_at)}
                    />
                  ) : null}
                  {event.location ? (
                    <View style={styles.metaFull}>
                      <Text style={[styles.metaLabel, { color: c.subtle }]}>МЕСТОПОЛОЖЕНИЕ</Text>
                      <Text style={[styles.metaValue, { color: c.foreground }]}>
                        {event.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={[styles.note, { backgroundColor: c.secondary }]}>
                <Text style={[styles.noteText, { color: c.neutralFg }]}>
                  След публикуване събитието ще бъде видимо за всички. Можете да го редактирате или
                  скриете по-късно.
                </Text>
              </View>

              <View style={styles.actions}>
                <Button variant="outline" onPress={onCancel} disabled={isLoading} style={styles.action}>
                  Отказ
                </Button>
                <Button
                  onPress={() => onPublish(event.id)}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.action}
                >
                  Публикуване
                </Button>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const c = useTheme();
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaLabel, { color: c.subtle }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.four,
  },
  headerBlock: { marginBottom: Spacing.four },
  title: { fontSize: 20, fontWeight: '600', marginBottom: Spacing.one },
  subtitle: { fontSize: 14 },
  detailCard: {
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  detailHead: { gap: Spacing.one },
  eventTitle: { fontSize: 16, fontWeight: '600' },
  eventDescription: { fontSize: 14, lineHeight: 21 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    rowGap: Spacing.three,
  },
  meta: { width: '50%', paddingRight: Spacing.two },
  metaFull: { width: '100%' },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: Spacing.one,
  },
  metaValue: { fontSize: 14, fontWeight: '600' },
  note: {
    padding: Spacing.two + 2,
    marginBottom: Spacing.four,
  },
  noteText: { fontSize: 12, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  action: { minWidth: 120 },
});
