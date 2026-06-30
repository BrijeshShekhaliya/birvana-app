import { Pressable, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';

type GoogleAuthButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export function GoogleAuthButton({
  disabled,
  label,
  onPress,
}: GoogleAuthButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-center gap-3 rounded-3xl border px-5 py-4"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View className="h-6 w-6 items-center justify-center">
        <View
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: '#EA4335', marginLeft: 8 }}
        />
        <View
          className="-mt-1 h-3 w-3 rounded-full"
          style={{ backgroundColor: '#FBBC04', marginRight: 8 }}
        />
        <View className="-mt-1 flex-row gap-1">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: '#34A853' }}
          />
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: '#4285F4' }}
          />
        </View>
      </View>
      <AppText variant="label">{label}</AppText>
    </Pressable>
  );
}
