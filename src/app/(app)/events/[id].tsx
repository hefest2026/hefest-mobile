import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/list-states';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDateRange } from '@/events/format';
import { useEvent } from '@/events/use-event';
import { useTheme } from '@/hooks/use-theme';

/** Full event detail, pushed on top of the feed inside the Events stack. */
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading, isError, refetch } = useEvent(id);
  const theme = useTheme();

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event' }} />
        <View testID="detail-loading" style={styles.center}>
          <ActivityIndicator color={theme.brand} />
        </View>
      </>
    );
  }

  if (isError || event === undefined) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event' }} />
        <ErrorState
          onRetry={isError ? () => refetch() : () => router.back()}
          message={isError ? 'Something went wrong.' : 'This event could not be found.'}
          retryLabel="Go back"
        />
      </>
    );
  }

  const spotsRemaining = event.capacity === 0 ? null : event.capacity - (event.confirmed_count ?? 0);

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <View style={styles.body}>
        <ThemedText type="subtitle">{event.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDateRange(event.starts_at, event.ends_at)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {event.location}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {event.organizer_name}
        </ThemedText>
        <ThemedText type="default">{event.description}</ThemedText>
        <ThemedText type="smallBold">
          {event.confirmed_count ?? 0} / {event.capacity} confirmed
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {spotsRemaining !== null ? `${spotsRemaining} spots left` : 'Unlimited'}
        </ThemedText>
        {event.waitlist_count > 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {event.waitlist_count} on waitlist
          </ThemedText>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
