import { router } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TextLink } from '@/components/ui/text-link';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';

function OrDivider({ label }: { label: string }) {
  const c = useTheme();
  return (
    <View style={styles.divider}>
      <Separator style={styles.dividerLine} />
      <Text style={[styles.dividerText, { color: c.muted, backgroundColor: c.surface }]}>
        {label}
      </Text>
    </View>
  );
}

export default function SignupScreen() {
  const c = useTheme();
  const { signIn } = useSession();
  const [form, setForm] = React.useState({
    name: '',
    schoolClass: '',
    email: '',
    password: '',
    confirm: '',
  });

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSignup = () => {
    signIn();
    router.push('/role');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            <Card>
              <CardHeader style={styles.center}>
                <CardTitle>Регистрирайте се</CardTitle>
                <View style={styles.social}>
                  <Button variant="secondary" style={styles.socialButton}>
                    Microsoft
                  </Button>
                  <Button variant="secondary" style={styles.socialButton}>
                    Google
                  </Button>
                </View>
                <OrDivider label="или" />
                <CardDescription>
                  Попълнете информацията по-долу, за да създадете акаунт
                </CardDescription>
              </CardHeader>
              <CardContent style={styles.content}>
                <Field>
                  <FieldLabel>Двете имена</FieldLabel>
                  <Input value={form.name} onChangeText={(v) => set({ name: v })} placeholder="John Doe" />
                </Field>

                <Field>
                  <FieldLabel>Клас</FieldLabel>
                  <Input
                    value={form.schoolClass}
                    onChangeText={(v) => set({ schoolClass: v })}
                    placeholder="10A"
                  />
                </Field>

                <Field>
                  <FieldLabel>Имейл</FieldLabel>
                  <Input
                    value={form.email}
                    onChangeText={(v) => set({ email: v })}
                    placeholder="m@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </Field>

                <View style={styles.row}>
                  <Field style={styles.rowItem}>
                    <FieldLabel>Парола</FieldLabel>
                    <Input
                      value={form.password}
                      onChangeText={(v) => set({ password: v })}
                      secureTextEntry
                    />
                  </Field>
                  <Field style={styles.rowItem}>
                    <FieldLabel>Потвърждение на паролата</FieldLabel>
                    <Input
                      value={form.confirm}
                      onChangeText={(v) => set({ confirm: v })}
                      secureTextEntry
                    />
                  </Field>
                </View>
                <FieldDescription>Паролата трябва да състои от поне 8 символа.</FieldDescription>

                <Button fullWidth onPress={handleSignup}>
                  Създай акаунта
                </Button>

                <Text style={[styles.footerText, { color: c.muted }]}>
                  Вече имате акаунт? <TextLink onPress={() => router.replace('/')}>Влезте</TextLink>
                </Text>
              </CardContent>
            </Card>

            <Text style={[styles.legal, { color: c.muted }]}>
              Със създаването на акаунта, Вие се съгласявате с нашите{' '}
              <TextLink onPress={() => router.push('/terms')}>Условията за ползване</TextLink> и{' '}
              <TextLink onPress={() => router.push('/privacy')}>Политиката за поверителност</TextLink>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.three },
  inner: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: Spacing.three },
  center: { alignItems: 'center', gap: Spacing.two },
  social: { flexDirection: 'row', gap: Spacing.two, alignSelf: 'stretch' },
  socialButton: { flex: 1 },
  content: { gap: Spacing.three },
  divider: { alignItems: 'center', justifyContent: 'center', height: 20, alignSelf: 'stretch' },
  dividerLine: { position: 'absolute', top: '50%' },
  dividerText: { fontSize: 12, paddingHorizontal: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  rowItem: { flex: 1 },
  footerText: { fontSize: 13, textAlign: 'center' },
  legal: { fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.four },
});
