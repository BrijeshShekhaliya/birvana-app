import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';

type AuthStatusTone = 'error' | 'info' | 'success';

type AuthStatusBannerProps = {
  message: string;
  tone?: AuthStatusTone;
};

export function AuthStatusBanner({
  message,
  tone = 'info',
}: AuthStatusBannerProps) {
  const theme = useAppTheme();

  const palette = {
    error: {
      backgroundColor: theme.isDark ? '#341A1A' : '#FBE4E4',
      color: theme.isDark ? '#F5B5B5' : '#9E1C1C',
    },
    info: {
      backgroundColor: theme.colors.primarySoft,
      color: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.secondarySoft,
      color: theme.colors.secondary,
    },
  } satisfies Record<
    AuthStatusTone,
    { backgroundColor: string; color: string }
  >;

  return (
    <View
      className="rounded-2xl px-4 py-3"
      style={{ backgroundColor: palette[tone].backgroundColor }}
    >
      <AppText
        selectable
        style={{ color: palette[tone].color }}
        variant="caption"
      >
        {message}
      </AppText>
    </View>
  );
}
