import 'react-native-url-polyfill/auto';

import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@/types/supabase';

const storage = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

export const supabase: SupabaseClient<Database> = createClient<Database>(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web',
      lock: processLock,
      persistSession: true,
      storage,
    },
  },
);

let lifecycleBound = false;

export function initializeSupabaseLifecycle() {
  if (lifecycleBound) {
    return () => undefined;
  }

  lifecycleBound = true;

  if (Platform.OS !== 'web') {
    supabase.auth.startAutoRefresh();
  }

  const subscription = AppState.addEventListener('change', (state) => {
    if (Platform.OS === 'web') {
      return;
    }

    if (state === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  });

  return () => {
    if (Platform.OS !== 'web') {
      supabase.auth.stopAutoRefresh();
    }

    subscription.remove();
    lifecycleBound = false;
  };
}
