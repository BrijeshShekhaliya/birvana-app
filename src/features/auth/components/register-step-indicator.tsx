import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';

type RegisterStepIndicatorProps = {
  step: 1 | 2 | 3;
};

export function RegisterStepIndicator({
  step,
}: RegisterStepIndicatorProps) {
  const theme = useAppTheme();

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <AppText tone="muted" variant="caption">
          Registration flow
        </AppText>
        <AppText tone="muted" variant="caption">
          Step {step} of 3
        </AppText>
      </View>

      <View className="flex-row gap-2">
        {[1, 2, 3].map((value) => (
          <View
            key={value}
            className="h-2 flex-1 rounded-full"
            style={{
              backgroundColor:
                value <= step ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
