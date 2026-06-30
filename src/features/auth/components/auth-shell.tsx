import { useMemo, type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/primitives/AppText';
import { AuthLogo } from '@/features/auth/components/auth-logo';
import { useAppTheme } from '@/theme/useAppTheme';

type AuthShellProps = PropsWithChildren<{
  badge?: string;
  heroEyebrow?: string;
  subtitle?: string;
  title: string;
  topActionLabel?: string;
  onTopActionPress?: () => void;
}>;

export function AuthShell({
  badge,
  children,
  heroEyebrow,
  onTopActionPress,
  subtitle,
  title,
  topActionLabel,
}: AuthShellProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const contentContainerStyle = useMemo(
    () => ({
      flexGrow: 1,
      paddingBottom: Math.max(insets.bottom, 18) + 36,
      paddingHorizontal: 24,
      paddingTop: insets.top + 8,
    }),
    [insets.bottom, insets.top],
  );

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={contentContainerStyle}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              alignSelf: 'center',
              gap: 24,
              maxWidth: 430,
              width: '100%',
            }}
          >
            <View style={{ gap: 18 }}>
              <View style={{ alignItems: 'center', gap: 10 }}>
                <AuthLogo />
                <AppText
                  style={{
                    letterSpacing: 3.2,
                    textAlign: 'center',
                  }}
                  variant="label"
                >
                  BIRVANA
                </AppText>
              </View>

              <View style={{ alignItems: 'center', gap: 8 }}>
                {heroEyebrow ? (
                  <AppText tone="muted" variant="caption">
                    {heroEyebrow}
                  </AppText>
                ) : null}
                <AppText
                  style={{
                    fontSize: 40,
                    lineHeight: 46,
                    textAlign: 'center',
                  }}
                  variant="display"
                >
                  {title}
                </AppText>
                {subtitle ? (
                  <AppText
                    style={{
                      maxWidth: 320,
                      textAlign: 'center',
                    }}
                    tone="muted"
                  >
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
            </View>

            {topActionLabel && onTopActionPress ? (
              <View style={{ alignItems: 'center' }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={onTopActionPress}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.76 : 1,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  })}
                >
                  <AppText tone="primary" variant="caption">
                    {topActionLabel}
                  </AppText>
                </Pressable>
              </View>
            ) : null}

            {badge ? (
              <AppText style={{ textAlign: 'center' }} tone="muted" variant="caption">
                {badge}
              </AppText>
            ) : null}

            <View style={{ gap: 20 }}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
