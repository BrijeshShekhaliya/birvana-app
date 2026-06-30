import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/useAppTheme';
import { cn } from '@/utils/cn';

type ScreenProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
}> &
  ViewProps &
  Pick<ScrollViewProps, 'contentContainerStyle' | 'keyboardShouldPersistTaps'>;

export function Screen({
  children,
  className,
  contentClassName,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  scroll = false,
  style,
  ...props
}: ScreenProps) {
  const theme = useAppTheme();

  if (scroll) {
    return (
      <SafeAreaView
        className={cn('flex-1', className)}
        style={[{ backgroundColor: theme.colors.background }, style]}
        edges={['top', 'bottom']}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={contentContainerStyle}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          <View className={cn('flex-1 px-5 py-6', contentClassName)}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={cn('flex-1', className)}
      style={[{ backgroundColor: theme.colors.background }, style]}
      edges={['top', 'bottom']}
      {...props}
    >
      <View className={cn('flex-1 px-5 py-6', contentClassName)}>{children}</View>
    </SafeAreaView>
  );
}
