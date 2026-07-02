/**
 * Theme tokens for the Hefest / EventHub mobile app.
 *
 * Ported from the web app's `src/index.css` oklch design tokens (converted to
 * hex) plus the gray-scale page chrome the web screens use directly
 * (bg-gray-50, border-gray-200, text-gray-900, status pills, etc.).
 */

import { Platform } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  subtle: string;
  border: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  ring: string;
  destructive: string;
  successBg: string;
  successFg: string;
  warningBg: string;
  warningFg: string;
  dangerBg: string;
  dangerFg: string;
  neutralBg: string;
  neutralFg: string;
  overlay: string;
}

export const Colors: { light: Palette; dark: Palette } = {
  light: {
    // page + surfaces
    background: '#F9FAFB', // page background (gray-50)
    surface: '#FFFFFF', // cards, headers, inputs
    foreground: '#111827', // primary text (gray-900)
    muted: '#4B5563', // secondary text (gray-600)
    subtle: '#6B7280', // tertiary text (gray-500)
    border: '#E5E7EB', // gray-200
    // brand
    primary: '#B4531F', // warm orange (oklch 0.555 0.163 49)
    primaryForeground: '#FFFFFF',
    secondary: '#F3F4F6',
    secondaryForeground: '#1F2937',
    ring: '#B4531F',
    destructive: '#DC2626',
    // status intents (bg + fg)
    successBg: '#DCFCE7',
    successFg: '#15803D',
    warningBg: '#FEF9C3',
    warningFg: '#A16207',
    dangerBg: '#FEF2F2',
    dangerFg: '#B91C1C',
    neutralBg: '#F3F4F6',
    neutralFg: '#374151',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    background: '#171412',
    surface: '#272220',
    foreground: '#FAFAF9',
    muted: '#A8A29E',
    subtle: '#8A837D',
    border: '#34302C',
    primary: '#C25E28',
    primaryForeground: '#FFFFFF',
    secondary: '#2E2A27',
    secondaryForeground: '#FAFAF9',
    ring: '#C25E28',
    destructive: '#F05252',
    successBg: '#14321F',
    successFg: '#86EFAC',
    warningBg: '#3B310A',
    warningFg: '#FDE047',
    dangerBg: '#3B1717',
    dangerFg: '#FCA5A5',
    neutralBg: '#2E2A27',
    neutralFg: '#D6D3D1',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export type ThemeColor = keyof Palette;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Web uses `rounded-none` on primitives; pills keep a small radius. */
export const Radius = {
  none: 0,
  sm: 2,
  md: 4,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
