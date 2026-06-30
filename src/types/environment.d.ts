declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_APP_ENV?: 'development' | 'preview' | 'production';
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_ENABLE_TRACK_PLAYER?: 'true' | 'false';
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
      EXPO_PUBLIC_SUPABASE_URL?: string;
    }
  }
}

export {};
