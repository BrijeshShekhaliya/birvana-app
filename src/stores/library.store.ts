import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlayerTrack } from '@/features/player/player.types';

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

type LibraryStore = {
  savedTracks: Record<string, PlayerTrack>;
  toggleSavedTrack: (track: PlayerTrack) => void;
  isSaved: (trackId: string) => boolean;
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      savedTracks: {},
      toggleSavedTrack: (track) => {
        set((state) => {
          const newTracks = { ...state.savedTracks };
          if (newTracks[track.id]) {
            delete newTracks[track.id];
          } else {
            newTracks[track.id] = track;
          }
          return { savedTracks: newTracks };
        });
      },
      isSaved: (trackId) => {
        return !!get().savedTracks[trackId];
      },
    }),
    {
      name: 'library-store',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
