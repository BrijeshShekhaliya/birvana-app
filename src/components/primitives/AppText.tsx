import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { cn } from '@/utils/cn';

type TextTone = 'default' | 'muted' | 'primary' | 'secondary';
type TextVariant = 'body' | 'caption' | 'display' | 'heading' | 'label' | 'title';

type AppTextProps = TextProps & {
  className?: string;
  style?: StyleProp<TextStyle>;
  tone?: TextTone;
  variant?: TextVariant;
};

export function AppText({
  className,
  style,
  tone = 'default',
  variant = 'body',
  ...props
}: AppTextProps) {
  const theme = useAppTheme();

  const colors: Record<TextTone, string> = {
    default: theme.colors.text,
    muted: theme.colors.muted,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
  };

  return (
    <Text
      {...props}
      className={cn(className)}
      style={[
        theme.typography[variant],
        {
          color: colors[tone],
        },
        style,
      ]}
    />
  );
}
