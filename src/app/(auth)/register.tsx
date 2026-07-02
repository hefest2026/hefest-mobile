import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { errorCodeFromError, messageFromError } from '@/auth/errors';
import {
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/auth/validation';
import { Button } from '@/components/button';
import { FormBanner } from '@/components/form-banner';
import { ScreenContainer } from '@/components/screen-container';
import { SsoButtons } from '@/components/sso-buttons';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set when registration succeeds without a dev `verify_token` (email path).
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const onSubmit = async () => {
    const nErr = validateFullName(fullName);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (nErr !== null || eErr !== null || pErr !== null) {
      return;
    }
    setBanner(null);
    setSubmitting(true);
    try {
      const result = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      // Dev shortcut: chain straight into verification without email.
      if (result.verify_token != null) {
        router.replace(`/verify-email?token=${encodeURIComponent(result.verify_token)}`);
      } else {
        setPendingEmail(email.trim());
      }
    } catch (error) {
      if (errorCodeFromError(error) === 'email_exists') {
        setEmailError(messageFromError(error));
      } else {
        setBanner(messageFromError(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingEmail !== null) {
    return (
      <ScreenContainer>
        <ThemedText type="subtitle">Check your email</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          We sent a verification link to {pendingEmail}. Open it to activate your
          account, then come back and sign in.
        </ThemedText>
        <Button title="Back to sign in" variant="secondary" onPress={() => router.replace('/login')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ThemedText type="subtitle">Create your account</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Join Hefest to follow school events.
      </ThemedText>

      {banner !== null ? (
        <FormBanner message={banner} onDismiss={() => setBanner(null)} />
      ) : null}

      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        error={nameError}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        editable={!submitting}
      />
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
        textContentType="newPassword"
        editable={!submitting}
      />

      <Button title="Create account" onPress={onSubmit} loading={submitting} />

      <SsoButtons onError={setBanner} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Already have an account?{' '}
        </ThemedText>
        <Link href="/login" replace>
          <ThemedText type="small" style={{ color: theme.brand, fontWeight: '600' }}>
            Sign in
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
