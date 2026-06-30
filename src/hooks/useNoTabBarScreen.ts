import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useUIStore } from '@/store/uiStore';

/**
 * Call this hook inside any screen that does NOT have a bottom tab bar
 * (e.g. Playlist, Artist, Category). It sets miniPlayerHasTabBar = false
 * when the screen gains focus (AFTER transition animations complete) and
 * restores it to true when the screen loses focus.
 *
 * This is far more reliable than parsing navigationRef state, which reads
 * intermediate values during transition animations.
 */
export function useNoTabBarScreen() {
  const setMiniPlayerHasTabBar = useUIStore((s) => s.setMiniPlayerHasTabBar);

  useFocusEffect(
    useCallback(() => {
      setMiniPlayerHasTabBar(false);
      return () => {
        setMiniPlayerHasTabBar(true);
      };
    }, [setMiniPlayerHasTabBar]),
  );
}
