import { useThemeContext } from '@/theme/ThemeProvider';

export function useAppTheme() {
  return useThemeContext().theme;
}
