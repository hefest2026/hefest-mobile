import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { AccountTab } from '@/components/common/account-tab';
import { EventsLayout } from '@/components/common/events-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const tabs = [
  { id: 'events', label: 'Събития' },
  { id: 'notifications', label: 'Известия' },
];

export default function HomeTabScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('events');

  return (
    <EventsLayout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
        <SafeAreaView style={styles.safeArea}>
          {activeTab === 'account' ? (
            <AccountTab
              me={{ full_name: 'Александра Петрова', email: 'alex@example.com', role: 'student' }}
            />
          ) : (
            <View style={styles.content}>
              <ThemedText type="title" style={styles.title}>
                {activeTab === 'events' ? 'Събития' : 'Известия'}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                {activeTab === 'events'
                  ? 'Добре дошли! Тук ще виждате вашите важни училищни събития и известия.'
                  : 'Проверете всяка нова актуализация за вашите събития.'}
              </ThemedText>
            </View>
          )}
        </SafeAreaView>
      </ThemedView>
    </EventsLayout>
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
    gap: Spacing.two,
  },
  content: {
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
