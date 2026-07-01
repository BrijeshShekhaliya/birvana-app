const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  aimkApiUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_AIMK_API_URL ?? 'http://localhost:8765',
  ),
  apiUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_API_URL ?? 'https://birvana.vercel.app',
  ),
  enableTrackPlayer: process.env.EXPO_PUBLIC_ENABLE_TRACK_PLAYER === 'true',
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_EDzfAPD5vFiwDJ7gAGsgfw_T9lRmWlh',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ngashsoxymyzqqqisvij.supabase.co',
} as const;
