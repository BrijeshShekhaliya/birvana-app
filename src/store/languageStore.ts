import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LanguageState {
  selectedLanguage: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: 'hi', // default Hindi
      setLanguage: (lang) => set({ selectedLanguage: lang }),
    }),
    {
      name: 'birvana_language', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
