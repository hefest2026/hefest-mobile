import { router } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
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

export default function LoginScreen() {
  const c = useTheme();
  const { signIn } = useSession();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
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
                <CardTitle>Влезте в акаунта си</CardTitle>
                <CardDescription>Влезте с Google или Microft акаунта</CardDescription>
              </CardHeader>
              <CardContent style={styles.content}>
                <Button variant="outline" fullWidth>
                  Влезте с Microsoft
                </Button>
                <Button variant="outline" fullWidth>
                  Влезте с Google
                </Button>

                <OrDivider label="Или продължете с имейл адреса си" />

                <Field>
                  <FieldLabel>Имейл</FieldLabel>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="m@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </Field>

                <Field>
                  <View style={styles.passwordLabelRow}>
                    <FieldLabel>Парола</FieldLabel>
                    <TextLink style={styles.forgot}>Забравена парола?</TextLink>
                  </View>
                  <Input value={password} onChangeText={setPassword} secureTextEntry />
                </Field>

                <Button fullWidth onPress={handleLogin}>
                  Влезте
                </Button>

                <Text style={[styles.footerText, { color: c.muted }]}>
                  Нямате акаунт? <TextLink onPress={() => router.push('/signup')}>Регистрирайте се</TextLink>
                </Text>
              </CardContent>
            </Card>

            <Text style={[styles.legal, { color: c.muted }]}>
              Продължавайки, се съгласявате с{' '}
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
  center: { alignItems: 'center' },
  content: { gap: Spacing.three },
  divider: { alignItems: 'center', justifyContent: 'center', height: 20 },
  dividerLine: { position: 'absolute', top: '50%' },
  dividerText: { fontSize: 12, paddingHorizontal: Spacing.two },
  passwordLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forgot: { fontWeight: '400', fontSize: 13 },
  footerText: { fontSize: 13, textAlign: 'center' },
  legal: { fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.four },
});
