import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SKELETON_CARD_COUNT = 4;

/** Placeholder cards shown while the first feed page is loading. */
export function FeedSkeleton() {
  const theme = useTheme();

  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <View
          key={index}
          testID="feed-skeleton-card"
          style={[styles.skeletonCard, { backgroundColor: theme.backgroundElement }]}
        />
      ))}
    </View>
  );
}

/** Shown when the feed has loaded but no published events remain. */
export function EmptyState() {
  return (
    <View style={styles.center}>
      <ThemedText type="subtitle">No events yet</ThemedText>
    </View>
  );
}

export type ErrorStateProps = {
  onRetry: () => void;
  message?: string;
  retryLabel?: string;
};

/** Shown on a failed fetch, with a retry action. */
export function ErrorState({
  onRetry,
  message = 'Something went wrong.',
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <ThemedText type="subtitle">{message}</ThemedText>
      <Button title={retryLabel} variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  skeletonCard: {
    height: 96,
    borderRadius: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
