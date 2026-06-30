import { useEffect, type PropsWithChildren } from 'react';
import { Linking, Platform } from 'react-native';

import { authApi } from '@/features/auth/api/auth-api';
import {
  initializeSupabaseLifecycle,
  supabase,
} from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const completeHydration = useAuthStore((state) => state.completeHydration);
  const setAuthEvent = useAuthStore((state) => state.setAuthEvent);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const unbindLifecycle = initializeSupabaseLifecycle();
    let mounted = true;

    const hydrateSession = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        try {
          await authApi.restoreSessionFromUrl(initialUrl);
        } catch {
          // Ignore unrelated links and surface auth failures through the mutation flow.
        }
      }

      return authApi.getSession();
    };

    void hydrateSession()
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        setSession(data.session);
        completeHydration();
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setSession(null);
        completeHydration();
      });

    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      // Dismiss the browser if it's open for auth
      if (Platform.OS !== 'web') {
        import('expo-web-browser').then((WebBrowser) => {
          WebBrowser.dismissBrowser();
        });
      }

      void authApi
        .restoreSessionFromUrl(url)
        .then((session) => {
          if (session) {
            setSession(session);
          }
        })
        .catch(() => {
          // Ignore unrelated links and surface auth failures through the mutation flow.
        });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setAuthEvent(event);
      completeHydration();
      
      if (event === 'SIGNED_OUT') {
        try {
          const { resetPlayback } = await import('@/services/audio/playback-controller.native');
          await resetPlayback();
        } catch {
          // Ignore if playback controller cannot be loaded
        }
      }
    });

    return () => {
      mounted = false;
      linkSubscription.remove();
      subscription.unsubscribe();
      unbindLifecycle();
    };
  }, [completeHydration, setAuthEvent, setSession]);

  return children;
}
