import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';

/** Ported from the web `common/account-tab.tsx`, plus a mobile sign-out action. */
export function AccountTab() {
  const c = useTheme();
  const { user, signOut } = useSession();
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  const name = user?.name ?? 'Иван Петров';
  const email = user?.email ?? 'ivan.petrov@example.com';
  const initials = user?.initials ?? 'ИП';

  const handleSignOut = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: c.foreground }]}>Редактиране на профила</Text>

        {/* User info card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: c.foreground }]}>
              <Text style={[styles.avatarText, { color: c.surface }]}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.name, { color: c.foreground }]}>{name}</Text>
              <Text style={[styles.email, { color: c.subtle }]}>{email}</Text>
            </View>
            <Button variant="outline" size="sm">
              Редактиране
            </Button>
          </View>
        </View>

        {/* Security settings card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Настройки за сигурност</Text>

          <View style={[styles.settingRow, { borderBottomColor: c.border, borderBottomWidth: 1 }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: c.foreground }]}>Парола</Text>
              <Text style={[styles.settingHint, { color: c.subtle }]}>
                Последно променена преди 3 месеца
              </Text>
            </View>
            <Button variant="outline" size="sm">
              Промяна
            </Button>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: c.foreground }]}>Имейл известия</Text>
              <Text style={[styles.settingHint, { color: c.subtle }]}>
                Получавайте отчети за записванията
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ true: c.primary, false: c.border }}
            />
          </View>
        </View>

        <Button variant="outline" danger onPress={handleSignOut}>
          Изход
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingHint: {
    fontSize: 12,
    marginTop: 2,
  },
});
