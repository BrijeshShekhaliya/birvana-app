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

type SearchHistoryState = {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => {
          const filtered = state.history.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
          return {
            history: [trimmed, ...filtered].slice(0, 5), 
          };
        });
      },
      removeSearch: (query: string) =>
        set((state) => ({
          history: state.history.filter((q) => q.toLowerCase() !== query.toLowerCase()),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'search-history-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
