import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthSessionProvider } from '@/features/auth/providers/AuthSessionProvider';
import { bindQueryManagers, queryClient } from '@/query/query-client';
import { AudioProvider } from '@/providers/AudioProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => bindQueryManagers(), []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthSessionProvider>
            <AudioProvider>{children}</AudioProvider>
          </AuthSessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
