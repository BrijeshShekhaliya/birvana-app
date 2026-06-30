import { Pressable, View, type PressableProps } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';

type AuthActionButtonVariant = 'ghost' | 'primary' | 'secondary';

type AuthActionButtonProps = PressableProps & {
  label: string;
  variant?: AuthActionButtonVariant;
};

export function AuthActionButton({
  disabled,
  label,
  variant = 'primary',
  ...props
}: AuthActionButtonProps) {
  const theme = useAppTheme();

  const primary = variant === 'primary';
  const ghost = variant === 'ghost';

  const fillColor = primary
    ? theme.colors.primary
    : ghost
      ? theme.colors.surfaceRaised
      : theme.colors.surface;

  const borderColor = primary ? '#7EC0FF' : theme.colors.border;
  const textColor = primary ? '#F8FBFF' : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        width: '100%',
      })}
      {...props}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: fillColor,
          borderColor,
          borderRadius: 22,
          borderWidth: primary ? 0 : 1.25,
          elevation: primary ? 8 : 0,
          justifyContent: 'center',
          minHeight: 60,
          paddingHorizontal: 20,
          paddingVertical: 16,
          shadowColor: primary ? '#4EA1FF' : '#000000',
          shadowOffset: { width: 0, height: primary ? 10 : 6 },
          shadowOpacity: primary ? 0.3 : 0.12,
          shadowRadius: primary ? 24 : 12,
        }}
      >
        <AppText
          style={{
            color: textColor,
            textAlign: 'center',
          }}
          variant="label"
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
