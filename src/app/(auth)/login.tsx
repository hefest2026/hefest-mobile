import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { messageFromError } from '@/auth/errors';
import { validateEmail, validatePassword } from '@/auth/validation';
import { Button } from '@/components/button';
import { FormBanner } from '@/components/form-banner';
import { ScreenContainer } from '@/components/screen-container';
import { SsoButtons } from '@/components/sso-buttons';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr !== null || pErr !== null) {
      return;
    }
    setBanner(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      setBanner(messageFromError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="subtitle">Welcome back</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Sign in to continue to Hefest.
      </ThemedText>

      {banner !== null ? (
        <FormBanner message={banner} onDismiss={() => setBanner(null)} />
      ) : null}

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        editable={!submitting}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
        editable={!submitting}
      />

      <Button title="Sign in" onPress={onSubmit} loading={submitting} />

      <SsoButtons onError={setBanner} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          No account?{' '}
        </ThemedText>
        <Link href="/register" replace>
          <ThemedText type="small" style={{ color: theme.brand, fontWeight: '600' }}>
            Create one
          </ThemedText>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
});
