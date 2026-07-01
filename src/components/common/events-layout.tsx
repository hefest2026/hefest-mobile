import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { BrandMark } from './brand-mark';

export interface EventsTab {
  id: string;
  label: string;
}

interface EventsLayoutProps {
  tabs: EventsTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}

export function EventsLayout({ tabs, activeTab, onTabChange, children }: EventsLayoutProps) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const allTabs: EventsTab[] = [...tabs, { id: 'account', label: 'Акаунт' }];

  const handleTabChange = (id: string) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <Pressable onPress={() => handleTabChange(tabs[0]?.id ?? 'account')}>
          <BrandMark />
        </Pressable>

        <View style={styles.desktopNav}>
          {allTabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={[
                styles.tabButton,
                activeTab === tab.id && { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText type="smallBold" style={activeTab === tab.id ? { color: theme.primaryForeground } : { color: theme.textSecondary }}>
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
          <Pressable style={[styles.outlineButton, { borderColor: theme.border }]}> 
            <ThemedText type="smallBold" themeColor="textSecondary">
              Изход
            </ThemedText>
          </Pressable>
        </View>

        <Pressable onPress={() => setMenuOpen((value) => !value)} style={[styles.mobileMenuButton, { borderColor: theme.border }]}> 
          <ThemedText type="smallBold" themeColor="textSecondary">
            ☰
          </ThemedText>
        </Pressable>
      </View>

      {menuOpen ? (
        <View style={[styles.mobileMenu, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          {allTabs.map((tab) => (
            <Pressable key={tab.id} onPress={() => handleTabChange(tab.id)} style={[styles.mobileTab, activeTab === tab.id && { backgroundColor: theme.primary }]}> 
              <ThemedText type="smallBold" style={activeTab === tab.id ? { color: theme.primaryForeground } : { color: theme.text }}>
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.main}>
        {children}
      </View>

      <ThemedView type="card" style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          EventHub — Платформа за училищни събития и уъркшопи.
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    display: 'none',
  },
  tabButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  mobileMenuButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  mobileMenu: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.one,
  },
  mobileTab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  main: {
    flex: 1,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  footer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
});
