import { type Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import type { SignUpDraft } from '@/features/auth/auth.types';
import { apiClient } from '@/services/api/api-client';
import { supabase } from '@/services/supabase/client';

const mobileHeaders = {
  'X-Birvana-Client': 'mobile',
} as const;

const nativeAuthRedirectUrl = 'birvana://auth/callback';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
};

type AuthSessionResponse = {
  ok: true;
  session: AuthSessionPayload | null;
};

type RegisterOtpResponse = {
  email: string;
  ok: true;
  pendingSignupToken: string;
};

type GoogleAuthSource = 'login' | 'register';

type VerifyLoginOtpInput = {
  email: string;
  token: string;
};

type VerifyRegisterOtpInput = {
  email?: string;
  password?: string;
  pendingSignupToken: string;
  token: string;
};

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

function normalizeDeepLinkSession(url: string) {
  // Supabase returns tokens in the URL hash fragment (#access_token=...)
  const normalizedUrl = url.replace('#', '?');
  const deepLink = new URL(normalizedUrl);
  const error = deepLink.searchParams.get('error') || deepLink.searchParams.get('error_description');

  if (error) {
    throw new Error(error);
  }

  const accessToken = deepLink.searchParams.get('access_token');
  const refreshToken = deepLink.searchParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  } satisfies AuthSessionPayload;
}

async function applySessionPayload(
  session: AuthSessionPayload | null,
  fallback?: () => Promise<Session | null>,
) {
  if (session) {
    const { data, error } = await supabase.auth.setSession(session);

    if (error) {
      throw error;
    }

    return data.session;
  }

  const {
    data: { session: currentSession },
  } = await supabase.auth.getSession();

  if (currentSession) {
    return currentSession;
  }

  if (fallback) {
    const nextSession = await fallback();

    if (nextSession) {
      return nextSession;
    }
  }

  throw new Error('Authentication completed without a session.');
}

export const authApi = {
  async getAccessToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  async refreshSession(refreshToken?: string) {
    return supabase.auth.refreshSession(
      refreshToken ? { refresh_token: refreshToken } : undefined,
    );
  },

  async requestLoginOtp(email: string) {
    const normalizedEmail = normalizeEmail(email);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: nativeAuthRedirectUrl,
        shouldCreateUser: false,
      },
    });

    if (error) throw error;
    return { ok: true } as const;
  },

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);

    if (error) {
      throw error;
    }

    return { ok: true } as const;
  },

  async requestRegisterOtp(draft: SignUpDraft) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(draft.email),
      password: draft.password,
      options: {
        data: {
          full_name: draft.displayName,
        },
        emailRedirectTo: nativeAuthRedirectUrl,
      },
    });
    if (error) throw error;

    // Supabase returns an empty identities array if the email already exists
    // (when "Prevent Email Enumeration" is enabled in Supabase Auth settings)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('This email address is already registered. Please log in instead.');
    }

    if (data.session) {
      await supabase.auth.signOut();
      throw new Error(
        'Supabase email confirmation must stay enabled before signup can continue.',
      );
    }

    // We return a mock pendingSignupToken since it's no longer used in direct Supabase auth, but types expect it
    return {
      ok: true,
      email: normalizeEmail(draft.email),
      pendingSignupToken: 'direct',
    } as const;
  },

  async restoreSessionFromUrl(url: string) {
    const session = normalizeDeepLinkSession(url);

    if (!session) {
      return null;
    }

    return applySessionPayload(session);
  },

  async setSession(session: Pick<Session, 'access_token' | 'refresh_token'>) {
    return supabase.auth.setSession(session);
  },

  async signInWithGoogle(source: GoogleAuthSource) {
    const callbackUrl = new URL('/auth/callback', env.apiUrl);
    callbackUrl.searchParams.set('from', source);
    callbackUrl.searchParams.set('next', '/discover');
    callbackUrl.searchParams.set('native_redirect', nativeAuthRedirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
        redirectTo: nativeAuthRedirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error('Google sign-in is unavailable right now.');
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      nativeAuthRedirectUrl,
    );

    if (result.type !== 'success') {
      throw new Error('Google sign-in was cancelled.');
    }

    const session = await authApi.restoreSessionFromUrl(result.url);

    if (!session) {
      throw new Error('Google sign-in is unavailable right now.');
    }

    return session;
  },

  async signInWithPassword(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.session) throw new Error('Authentication completed without a session.');

    return data.session;
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async verifyLoginOtp(input: VerifyLoginOtpInput) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(input.email),
      token: input.token,
      type: 'email',
    });

    if (error) throw error;
    if (!data.session) throw new Error('Authentication completed without a session.');

    return data.session;
  },

  async verifyRegisterOtp(input: VerifyRegisterOtpInput) {
    if (!input.email) throw new Error('Email is required for verification.');
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(input.email),
      token: input.token,
      type: 'signup',
    });

    if (error) throw error;
    if (!data.session) throw new Error('Authentication completed without a session.');

    return data.session;
  },
};
