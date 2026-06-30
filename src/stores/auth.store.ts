import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthStatus = 'anonymous' | 'authenticated' | 'booting';

type AuthStore = {
  hydrated: boolean;
  lastEvent: AuthChangeEvent | 'INITIAL_SESSION' | null;
  session: Session | null;
  status: AuthStatus;
  user: User | null;
  completeHydration: () => void;
  reset: () => void;
  setAuthEvent: (event: AuthStore['lastEvent']) => void;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  hydrated: false,
  lastEvent: null,
  session: null,
  status: 'booting',
  user: null,
  completeHydration: () => {
    set((state) => ({
      ...state,
      hydrated: true,
    }));
  },
  reset: () => {
    set({
      hydrated: true,
      lastEvent: 'SIGNED_OUT',
      session: null,
      status: 'anonymous',
      user: null,
    });
  },
  setAuthEvent: (event) => {
    set((state) => ({
      ...state,
      lastEvent: event,
    }));
  },
  setSession: (session) => {
    set({
      lastEvent: 'INITIAL_SESSION',
      session,
      status: session ? 'authenticated' : 'anonymous',
      user: session?.user ?? null,
    });
  },
}));
