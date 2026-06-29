import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/** Authenticated shell. HEF-42's event feed lands as the home tab. */
export default function AppLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Events' }} />
    </Tabs>
  );
}
