import { useMemo, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

import { RootNavigator } from '@/navigation/RootNavigator';
import { linking } from '@/navigation/linking';
import { navigationRef } from '@/navigation/navigation-ref';
import { AppProviders } from '@/providers/AppProviders';
import { buildNavigationTheme } from '@/theme/navigation';
import { useAppTheme } from '@/theme/useAppTheme';
import { LogBox } from 'react-native';

import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import { JioSaavnProvider } from '@/services/providers/JioSaavnProvider';

// Initialize and register music providers
ProviderRegistry.register(new JioSaavnProvider(), true);

LogBox.ignoreAllLogs(true);

enableScreens(true);

function AppShell() {
  const theme = useAppTheme();
  const navigationTheme = useMemo(() => buildNavigationTheme(theme), [theme]);
  const [isReady, setIsReady] = useState(false);

  const [isPlayerActive, setIsPlayerActive] = useState(false);

  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        translucent
      />
      <NavigationContainer 
        ref={navigationRef}
        linking={linking} 
        theme={navigationTheme} 
        onReady={() => setIsReady(true)}
        onStateChange={(state) => {
          if (!state) return;
          let current = state as any;
          while (current.routes && typeof current.index === 'number') {
            const idx = current.index;
            const route = current.routes[idx];
            if (route && route.state) {
              current = route.state;
            } else {
              break;
            }
          }
          const activeRouteName = current.routes && typeof current.index === 'number' 
            ? current.routes[current.index]?.name
            : undefined;
          
          setIsPlayerActive(activeRouteName === 'Player');
        }}
      >
        <RootNavigator isReady={isReady} isPlayerActive={isPlayerActive} />
      </NavigationContainer>
    </>
  );
}

export function AppRoot() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
