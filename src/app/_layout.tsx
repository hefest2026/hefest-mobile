import { QueryClientProvider } from '@tanstack/react-query';
import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { queryClient } from '@/api/query-client';
import { AuthProvider, useAuth } from '@/auth/auth-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

/**
 * Reads session state and steers navigation between the signed-out `(auth)`
 * group, the authenticated `(app)` group, and the standalone `verify-email`
 * deep-link target.
 */
function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'bootstrapping') {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';
    const onVerify = segments[0] === 'verify-email';

    if (status === 'signedOut' && !inAuthGroup && !onVerify) {
      router.replace('/login');
    } else if (status === 'signedIn' && (inAuthGroup || onVerify)) {
      router.replace('/');
    }
  }, [status, segments, router]);

  return (
    <View style={styles.flex}>
      <Slot />
      {status === 'bootstrapping' ? <AnimatedSplashOverlay /> : null}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = { flex: { flex: 1 } } as const;
