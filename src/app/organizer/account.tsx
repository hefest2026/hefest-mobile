import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountTab } from '@/components/account-tab';
import { BrandHeader } from '@/components/brand-header';
import { useTheme } from '@/hooks/use-theme';

export default function OrganizerAccountScreen() {
  const c = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      <BrandHeader />
      <AccountTab />
    </SafeAreaView>
  );
}
