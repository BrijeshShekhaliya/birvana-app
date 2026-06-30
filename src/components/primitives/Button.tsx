import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';
import { cn } from '@/utils/cn';

type ButtonVariant = 'ghost' | 'primary' | 'secondary';

type ButtonProps = PressableProps & {
  className?: string;
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

export function Button({
  className,
  disabled,
  label,
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const theme = useAppTheme();
  const flattenedStyle = (StyleSheet.flatten(style) ?? {}) as ViewStyle;

  const variants: Record<ButtonVariant, ViewStyle> = {
    ghost: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: '#8BC4FF',
      borderWidth: 1,
      boxShadow: '0px 16px 36px rgba(78, 161, 255, 0.34)',
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
  };

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(className)}
      disabled={disabled}
      style={({ pressed }) => ({
        alignItems: 'center',
        borderRadius: theme.radii.lg,
        justifyContent: 'center',
        minHeight: 58,
        opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        width: '100%',
        ...variants[variant],
        ...flattenedStyle,
      })}
      {...props}
    >
      <AppText
        tone={variant === 'secondary' ? 'secondary' : 'default'}
        variant="label"
        style={{
          color:
            variant === 'primary'
              ? '#F8FBFF'
              : variant === 'secondary'
                ? theme.colors.text
                : theme.colors.text,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
