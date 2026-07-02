/**
 * Returns the active color palette (light/dark) for the current color scheme.
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
