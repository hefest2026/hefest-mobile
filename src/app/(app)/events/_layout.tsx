import { Stack } from 'expo-router';

/** Nested stack inside the Events tab: feed pushes detail, tab bar stays visible. */
export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Events' }} />
      <Stack.Screen name="[id]" options={{ title: 'Event' }} />
    </Stack>
  );
}
