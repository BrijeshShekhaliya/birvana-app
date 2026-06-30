import { useEffect, type PropsWithChildren } from 'react';

import { env } from '@/config/env';

export function AudioProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (!env.enableTrackPlayer) {
      return;
    }

    void import('@/services/audio/track-player')
      .then(({ setupTrackPlayer }) => setupTrackPlayer())
      .catch((error: unknown) => {
        console.error('Track Player setup failed', error);
      });
  }, []);

  return children;
}
