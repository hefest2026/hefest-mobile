import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/auth-context';

/**
 * Resolves the root path `/`. Expo Router's anonymous `(app)` and `(auth)`
 * groups do not register an index route, so without this both the initial URL
 * and the post-login `router.replace('/')` land on the built-in Unmatched
 * screen. Redirect straight to the session-appropriate destination instead.
 */
export default function Index() {
  const { status } = useAuth();

  if (status === 'bootstrapping') {
    return null;
  }

  return <Redirect href={status === 'signedIn' ? '/events' : '/login'} />;
}
