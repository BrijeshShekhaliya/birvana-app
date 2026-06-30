import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UIState {
  isOnboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  // Drives the mini player bottom position.
  // Screens WITHOUT a tab bar (Playlist, Artist, Category) set this to false
  // on focus and true on blur via useFocusEffect — this is the reliable way
  // because useFocusEffect fires AFTER transition animations complete.
  miniPlayerHasTabBar: boolean;
  setMiniPlayerHasTabBar: (value: boolean) => void;
  isStacEnabled: boolean;
  setStacEnabled: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isOnboardingComplete: false,
      setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),
      miniPlayerHasTabBar: true,
      setMiniPlayerHasTabBar: (value) => set({ miniPlayerHasTabBar: value }),
      isStacEnabled: false,
      setStacEnabled: (value) => set({ isStacEnabled: value }),
    }),
    {
      name: 'birvana_ui',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist the volatile position flag
      partialize: (state) => ({ 
        isOnboardingComplete: state.isOnboardingComplete,
        isStacEnabled: state.isStacEnabled 
      }),
    },
  ),
);
