import { Stack } from 'expo-router';

/** Stack for the signed-out screens (login / register). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
