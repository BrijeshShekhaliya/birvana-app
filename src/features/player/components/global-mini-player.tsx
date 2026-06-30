import { memo } from 'react';

import { AnimatedMiniPlayer } from './animated-mini-player';
import { navigationRef } from '@/navigation/navigation-ref';

export const GlobalMiniPlayer = memo(function GlobalMiniPlayer({ isPlayerActive }: { isPlayerActive?: boolean }) {
  // If the Player modal is fully visible, we hide the mini player to prevent overlapping
  if (isPlayerActive) {
    return null;
  }

  return (
    <AnimatedMiniPlayer 
      onOpen={() => {
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate('Player');
        }
      }} 
    />
  );
});
