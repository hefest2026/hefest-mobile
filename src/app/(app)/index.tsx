import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/**
 * Placeholder home for the authenticated shell. HEF-42 replaces this with the
 * event feed; for HEF-41 it confirms the session and offers logout.
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <ThemedText type="subtitle">You&apos;re signed in</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user != null ? `Signed in as ${user.full_name} (${user.email}).` : 'Session active.'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          The event feed will appear here (HEF-42).
        </ThemedText>
      </View>
      <Button
        title="Log out"
        variant="secondary"
        onPress={onLogout}
        loading={loggingOut}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.two,
  },
});
