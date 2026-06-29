import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { messageFromError } from '@/auth/errors';
import { Button } from '@/components/button';
import { FormBanner } from '@/components/form-banner';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

/**
 * Deep-link target (`hefestmobile://verify-email?token=…`) and the dev
 * auto-verify destination. Lives outside the route groups so it resolves with
 * or without a session; on success the root redirect pulls the user into the app.
 */
export default function VerifyEmailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { verify } = useAuth();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const hasToken = token != null && token !== '';
  // A missing token is a render-time error; only verification *failures* need state.
  const [failure, setFailure] = useState<string | null>(null);
  // Guard against the effect firing twice (param identity churn / StrictMode).
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !hasToken) {
      return;
    }
    attempted.current = true;
    verify(token).catch((e) => setFailure(messageFromError(e)));
  }, [hasToken, token, verify]);

  const error = !hasToken
    ? 'This verification link is invalid or expired.'
    : failure;

  if (error !== null) {
    return (
      <ScreenContainer>
        <ThemedText type="subtitle">Verification failed</ThemedText>
        <FormBanner message={error} />
        <Button title="Back to register" onPress={() => router.replace('/register')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ActivityIndicator color={theme.brand} />
      <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Verifying your email…
      </ThemedText>
    </ScreenContainer>
  );
}
