import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { cn } from '@/utils/cn';

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className, style, ...props }: CardProps) {
  const theme = useAppTheme();

  return (
    <View
      className={cn('rounded-[28px] border p-5', className)}
      style={[
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
}
