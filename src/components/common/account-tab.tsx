import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  organizer: 'Организатор',
};

interface AccountTabProps {
  me?: {
    full_name?: string;
    email?: string;
    role?: string;
  };
  isPending?: boolean;
}

export function AccountTab({ me, isPending }: AccountTabProps) {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        Редактиране на профила
      </ThemedText>

      <ThemedView type="card" style={styles.profileCard}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}> 
          <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
            {isPending ? '…' : getInitials(me?.full_name ?? '')}
          </ThemedText>
        </View>

        <View style={styles.profileInfo}>
          {isPending ? (
            <ThemedText type="small" themeColor="textSecondary">
              Зареждане...
            </ThemedText>
          ) : (
            <>
              <ThemedText type="default" style={styles.profileName}>
                {me?.full_name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {me?.email}
              </ThemedText>
              {me?.role ? (
                <View style={[styles.badge, { borderColor: theme.primary, backgroundColor: theme.secondary }]}> 
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    {ROLE_LABELS[me.role] ?? me.role}
                  </ThemedText>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ThemedView>

      <ThemedView type="card" style={styles.settingsCard}>
        <ThemedText type="smallBold" style={styles.settingsTitle}>
          Настройки
        </ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <ThemedText type="default">Имейл известия</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Получавайте отчети за записванията
            </ThemedText>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </ThemedView>

      <Pressable style={[styles.actionButton, { borderColor: theme.border, backgroundColor: theme.card }]}> 
        <ThemedText type="smallBold" themeColor="textSecondary">
          Настройки на акаунта
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  heading: {
    marginBottom: Spacing.one,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  profileName: {
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.half,
  },
  settingsCard: {
    padding: Spacing.three,
    borderRadius: 16,
  },
  settingsTitle: {
    marginBottom: Spacing.two,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  settingText: {
    flex: 1,
    gap: Spacing.half,
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
  },
});
