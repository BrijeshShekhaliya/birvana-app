import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { usePreferencesStore } from '@/stores/preferences.store';
import {
  createAppTheme,
  type AppColorMode,
  type AppTheme,
} from '@/theme/tokens';

type ThemeContextValue = {
  colorMode: AppColorMode;
  preference: 'system' | 'light' | 'dark';
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const preference = usePreferencesStore((state) => state.colorMode);

  const colorMode: AppColorMode =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  const value = useMemo(
    () => ({
      colorMode,
      preference,
      theme,
    }),
    [colorMode, preference, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used inside ThemeProvider');
  }

  return context;
}
