import { FlashList } from '@shopify/flash-list';
import { SymbolView } from 'expo-symbols';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { EventCard } from '@/components/event-card';
import { EmptyState, ErrorState, FeedSkeleton } from '@/components/list-states';
import { Spacing } from '@/constants/theme';
import type { EventResponse } from '@/events/types';
import { useEventsFeed } from '@/events/use-events-feed';
import { useTheme } from '@/hooks/use-theme';

export function AccountButton() {
  const { logout } = useAuth();
  const theme = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  if (loggingOut) {
    return <ActivityIndicator color={theme.text} style={styles.accountButton} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Account"
      style={styles.accountButton}
      onPress={async () => {
        setLoggingOut(true);
        try {
          await logout();
        } finally {
          setLoggingOut(false);
        }
      }}
    >
      <SymbolView
        name={{ ios: 'person.circle', android: 'account_circle', web: 'account_circle' }}
        size={24}
        tintColor={theme.text}
      />
    </Pressable>
  );
}

/** Authenticated home: infinite feed of published events. */
export default function EventsFeedScreen() {
  const {
    events,
    isLoading,
    isError,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useEventsFeed();

  return (
    <>
      <Stack.Screen options={{ title: 'Events', headerRight: () => <AccountButton /> }} />
      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList<EventResponse>
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  accountButton: {
    padding: Spacing.two,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  footer: {
    paddingVertical: Spacing.three,
  },
});
