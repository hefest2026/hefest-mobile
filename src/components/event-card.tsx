import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateRange } from '@/events/format';
import type { EventResponse } from '@/events/types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type EventCardProps = {
  event: EventResponse;
};

/** Presentational feed card. Tapping navigates to the detail screen. */
export function EventCard({ event }: EventCardProps) {
  const theme = useTheme();
  const spotsLabel =
    event.capacity === 0
      ? 'Unlimited'
      : `${event.capacity - (event.confirmed_count ?? 0)} spots left`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/events/${event.id}`)}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {formatDateRange(event.starts_at, event.ends_at)}
      </Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>{event.location}</Text>
      <View style={styles.footer}>
        <Text numberOfLines={2} style={[styles.description, { color: theme.text }]}>
          {event.description}
        </Text>
        <Text style={[styles.spots, { color: theme.brand }]}>{spotsLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    borderRadius: 10,
    padding: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
  },
  meta: {
    fontSize: 13,
    fontWeight: 500,
  },
  footer: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  spots: {
    fontSize: 13,
    fontWeight: 600,
  },
});
