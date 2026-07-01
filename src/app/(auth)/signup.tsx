import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const theme = useTheme();

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    fullName.length > 0 &&
    email.length > 0 &&
    password.length >= 12 &&
    !passwordMismatch;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Създайте акаунт
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Регистрирайте се, за да следите училищните събития и известия.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}> 
          <ThemedText type="smallBold" style={styles.fieldLabel}>
            Име и фамилия
          </ThemedText>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Вашето име"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
            textContentType="name"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          <ThemedText type="smallBold" style={styles.fieldLabel}>
            Имейл
          </ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="m@example.com"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          <ThemedText type="smallBold" style={styles.fieldLabel}>
            Парола
          </ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Поне 12 символа"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            textContentType="newPassword"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          <ThemedText type="smallBold" style={styles.fieldLabel}>
            Потвърдете паролата
          </ThemedText>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Повторете паролата"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            textContentType="password"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          {passwordMismatch ? (
            <ThemedText type="small" themeColor="destructive" style={styles.errorText}>
              Паролите не съвпадат.
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.helperText}>
              Паролата трябва да бъде поне 12 символа.
            </ThemedText>
          )}

          <Pressable
            style={[styles.primaryButton, { opacity: canSubmit ? 1 : 0.65, backgroundColor: theme.primary }]}
            disabled={!canSubmit}
            onPress={() => {
              // TODO: Hook into auth flow
            }}
          >
            <ThemedText type="smallBold" style={[styles.primaryButtonText, { color: theme.primaryForeground }]}>
              Регистрирайте се
            </ThemedText>
          </Pressable>

          <ThemedText type="small" style={[styles.helperText, { color: theme.textSecondary }]}>
            Вече имате акаунт? <Link href="/login"><ThemedText type="linkPrimary">Влезте</ThemedText></Link>
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    gap: Spacing.two,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  fieldLabel: {
    marginTop: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.two,
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  helperText: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  errorText: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
