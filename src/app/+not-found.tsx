import { Redirect } from 'expo-router';

/**
 * Replaces Expo Router's default Unmatched screen, whose sitemap link crashes
 * in production/staging builds (the `_sitemap` route is not bundled there). Any
 * unresolved path bounces back to the root redirect, which routes by session.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
