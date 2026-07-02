import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fetchProviders } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { messageFromError } from '@/auth/errors';
import { Button } from '@/components/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Renders a "Continue with {provider}" button per enabled SSO provider, below
 * an "or" divider. Hidden entirely when no providers are advertised.
 */
export function SsoButtons({ onError }: { onError?: (message: string) => void }) {
  const theme = useTheme();
  const { loginWithSso } = useAuth();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: fetchProviders,
  });

  const providers = data?.providers ?? [];
  if (providers.length === 0) {
    return null;
  }

  const onPress = async (providerId: string) => {
    setPendingId(providerId);
    try {
      await loginWithSso(providerId);
    } catch (error) {
      onError?.(messageFromError(error));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.rule, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
        <View style={[styles.rule, { backgroundColor: theme.border }]} />
      </View>
      {providers.map((provider) => (
        <Button
          key={provider.name}
          variant="secondary"
          title={`Continue with ${provider.name}`}
          loading={pendingId === provider.name}
          disabled={pendingId !== null}
          onPress={() => onPress(provider.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: 500,
  },
});
