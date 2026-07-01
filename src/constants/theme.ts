/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2F2A22',
    background: '#FFFFFF',
    backgroundElement: '#F7F3EB',
    backgroundSelected: '#EDE4D3',
    textSecondary: '#7A6F5B',
    card: '#FFFFFF',
    cardForeground: '#2F2A22',
    popover: '#FFFFFF',
    popoverForeground: '#2F2A22',
    primary: '#8E6A22',
    primaryForeground: '#FFF8EC',
    secondary: '#F5EFE5',
    secondaryForeground: '#3C352B',
    muted: '#F6F2EA',
    mutedForeground: '#7A6F5B',
    accent: '#F6F2EA',
    accentForeground: '#3C352B',
    destructive: '#B8402C',
    border: '#E6DDCF',
    input: '#F1E9DE',
    ring: '#B68C45',
  },
  dark: {
    text: '#F7F2E7',
    background: '#2A231C',
    backgroundElement: '#342A20',
    backgroundSelected: '#403226',
    textSecondary: '#C8B8A1',
    card: '#30271F',
    cardForeground: '#F7F2E7',
    popover: '#30271F',
    popoverForeground: '#F7F2E7',
    primary: '#A76F2A',
    primaryForeground: '#FFF3E4',
    secondary: '#413527',
    secondaryForeground: '#FAF3E8',
    muted: '#3D3124',
    mutedForeground: '#C8B8A1',
    accent: '#3D3124',
    accentForeground: '#F7F2E7',
    destructive: '#B2704E',
    border: 'rgba(255,255,255,0.12)',
    input: 'rgba(255,255,255,0.14)',
    ring: '#A98A5A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
