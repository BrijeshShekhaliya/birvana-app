import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerState {
  trackId: string | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  setTrack: (id: string, duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (pos: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      trackId: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      setTrack: (id, dur) => set({ trackId: id, duration: dur, position: 0, isPlaying: true }),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setPosition: (pos) => set({ position: pos }),
    }),
    {
      name: 'birvana_player',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
