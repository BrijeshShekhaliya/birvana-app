import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';

import type { AppTheme } from '@/theme/tokens';

export function buildNavigationTheme(theme: AppTheme): NavigationTheme {
  const base = theme.isDark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      border: theme.colors.border,
      card: theme.colors.surface,
      notification: theme.colors.primary,
      primary: theme.colors.primary,
      text: theme.colors.text,
    },
  };
}
