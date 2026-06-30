import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const zustandStorage = {
  setItem: async (name: string, value: string) => {
    return await AsyncStorage.setItem(name, value);
  },
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value ?? null;
  },
  removeItem: async (name: string) => {
    return await AsyncStorage.removeItem(name);
  },
};

type ThemePreference = 'dark' | 'light' | 'system';

type PreferencesStore = {
  colorMode: ThemePreference;
  hydrated: boolean;
  reduceMotion: boolean;
  markHydrated: () => void;
  setColorMode: (value: ThemePreference) => void;
  setReduceMotion: (value: boolean) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      colorMode: 'dark',
      hydrated: false,
      markHydrated: () => {
        set({ hydrated: true });
      },
      reduceMotion: false,
      setColorMode: (value) => {
        set({ colorMode: value });
      },
      setReduceMotion: (value) => {
        set({ reduceMotion: value });
      },
    }),
    {
      name: 'preferences-store',
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      partialize: (state) => ({
        colorMode: state.colorMode,
        reduceMotion: state.reduceMotion,
      }),
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    },
  ),
);
