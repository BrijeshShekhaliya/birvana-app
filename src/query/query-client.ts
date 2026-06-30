import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryClient,
} from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 1,
    },
    queries: {
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection (was 24 hours)
      refetchOnReconnect: true,
      refetchOnWindowFocus: true, // Enables dynamic source synchronization on background/foreground
      retry: 2,
      staleTime: 1000 * 30, // 30 seconds stale time for fresh content (was 5 minutes)
    },
  },
});

let managersBound = false;

export function bindQueryManagers() {
  if (managersBound) {
    return () => undefined;
  }

  managersBound = true;

  void NetInfo.fetch().then((state) => {
    onlineManager.setOnline(Boolean(state.isConnected));
  });

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
    }),
  );

  const subscription = AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(state === 'active');
    }
  });

  return () => {
    subscription.remove();
    managersBound = false;
  };
}
