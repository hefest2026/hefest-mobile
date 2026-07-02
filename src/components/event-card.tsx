import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculateDuration, formatDateTimeDisplay } from '@/lib/format';
import type { PublishedEvent } from '@/lib/types';

function Detail({ label, value }: { label: string; value: string }) {
  const c = useTheme();
  return (
    <View style={styles.detail}>
      <Text style={[styles.detailLabel, { color: c.subtle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

export interface EventCardProps {
  event: PublishedEvent;
  currentStudentId: string;
  onRegister: (eventId: string) => void;
  onJoinWaitlist: (eventId: string) => void;
  onCancel: (eventId: string) => void;
}

/** Ported from the web `student part/student-events.tsx` EventCard. */
export function EventCard({
  event,
  currentStudentId,
  onRegister,
  onJoinWaitlist,
  onCancel,
}: EventCardProps) {
  const c = useTheme();

  const isFull = event.participants.length >= event.capacity;
  const isParticipating = event.participants.includes(currentStudentId);
  const isWaitlisted = event.waitlist.includes(currentStudentId);
  const availableSpots = event.capacity - event.participants.length;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.foreground }]}>{event.title}</Text>
          <Text style={[styles.description, { color: c.muted }]}>{event.description}</Text>
        </View>
        <Badge label="АКТИВНО" tone="success" />
      </View>

      <View style={[styles.detailsGrid, { borderBottomColor: c.border }]}>
        <Detail label="Начало" value={formatDateTimeDisplay(event.starts_at)} />
        {event.ends_at ? <Detail label="Край" value={formatDateTimeDisplay(event.ends_at)} /> : null}
        <Detail label="Капацитет" value={`${event.participants.length}/${event.capacity}`} />
        {event.ends_at ? (
          <Detail label="Продължителност" value={calculateDuration(event.starts_at, event.ends_at)} />
        ) : null}
        {event.location ? (
          <View style={styles.detailFull}>
            <Text style={[styles.detailLabel, { color: c.subtle }]}>Местоположение</Text>
            <Text style={[styles.detailValue, { color: c.foreground }]}>{event.location}</Text>
          </View>
        ) : null}
      </View>

      {/* Status blocks */}
      <View style={styles.statusArea}>
        {isParticipating ? (
          <View style={[styles.statusBox, { backgroundColor: c.successBg }]}>
            <Text style={[styles.statusText, { color: c.successFg }]}>
              ✓ Регистриран си за това събитие
            </Text>
          </View>
        ) : null}

        {isWaitlisted ? (
          <View style={[styles.statusBox, { backgroundColor: c.warningBg }]}>
            <Text style={[styles.statusText, { color: c.warningFg }]}>
              ⏳ В списъка на чакащите (№{event.waitlist.indexOf(currentStudentId) + 1})
            </Text>
          </View>
        ) : null}

        {!isFull && !isParticipating ? (
          <View style={[styles.statusBox, { backgroundColor: c.secondary }]}>
            <Text style={[styles.statusText, { color: c.foreground }]}>
              📍 {availableSpots}
              {availableSpots === 1 ? ' свободно място' : ' свободни места'}
            </Text>
          </View>
        ) : null}

        {isFull && !isParticipating && !isWaitlisted ? (
          <View style={[styles.statusBox, { backgroundColor: c.dangerBg }]}>
            <Text style={[styles.statusText, { color: c.dangerFg }]}>
              ⚠ Събитието е пълно. Можеш да се присъединиш към списъка на чакащите.
            </Text>
          </View>
        ) : null}

        {event.waitlist.length > 0 ? (
          <Text style={[styles.waitlistNote, { color: c.muted }]}>
            {event.waitlist.length} студент{event.waitlist.length === 1 ? '' : 'и'} чакат място
          </Text>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isParticipating ? (
          <Button variant="outline" size="sm" danger onPress={() => onCancel(event.id)}>
            Откажи участието
          </Button>
        ) : null}

        {!isParticipating && !isWaitlisted && !isFull ? (
          <Button size="sm" onPress={() => onRegister(event.id)}>
            Участвай
          </Button>
        ) : null}

        {!isParticipating && !isWaitlisted && isFull ? (
          <Button variant="outline" size="sm" onPress={() => onJoinWaitlist(event.id)}>
            Добави се в списъка
          </Button>
        ) : null}

        {isWaitlisted ? (
          <Button variant="outline" size="sm" danger onPress={() => onCancel(event.id)}>
            Напусни списъка
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: { flex: 1, gap: Spacing.one },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20 },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
    rowGap: Spacing.three,
  },
  detail: { width: '50%', paddingRight: Spacing.two },
  detailFull: { width: '100%', paddingRight: Spacing.two },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  statusArea: { gap: Spacing.two },
  statusBox: {
    borderRadius: Radius.sm,
    padding: Spacing.two + 2,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  waitlistNote: { fontSize: 12, marginTop: Spacing.one },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
