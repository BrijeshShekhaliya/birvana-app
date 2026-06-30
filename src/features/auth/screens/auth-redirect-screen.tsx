import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { Screen } from '@/components/primitives/Screen';
import { useAppTheme } from '@/theme/useAppTheme';

export function AuthRedirectScreen() {
  const theme = useAppTheme();

  return (
    <Screen contentClassName="items-center justify-center gap-4">
      <ActivityIndicator color={theme.colors.primary} />
      <View className="items-center gap-2">
        <AppText variant="heading">Completing sign-in...</AppText>
        <AppText style={{ textAlign: 'center' }} tone="muted">
          Birvana is finishing your authentication session.
        </AppText>
      </View>
    </Screen>
  );
}
