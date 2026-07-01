import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/features/auth/api/auth-api';
import type { SignUpDraft } from '@/features/auth/auth.types';
import { queryKeys } from '@/query/query-keys';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthFlowStore } from '@/stores/auth-flow.store';

export function usePasswordLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.signInWithPassword,
    onSuccess: (session) => {
      setSession(session);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useRequestLoginOtpMutation() {
  return useMutation({
    mutationFn: authApi.requestLoginOtp,
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: authApi.requestPasswordReset,
  });
}

export function useVerifyLoginOtpMutation() {
  const queryClient = useQueryClient();
  const clearPendingVerification = useAuthFlowStore(
    (state) => state.clearPendingVerification,
  );
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.verifyLoginOtp,
    onSuccess: (session) => {
      setSession(session);
      clearPendingVerification();
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useRequestRegisterOtpMutation() {
  return useMutation({
    mutationFn: (draft: SignUpDraft) => authApi.requestRegisterOtp(draft),
  });
}

export function useVerifyRegisterOtpMutation() {
  const queryClient = useQueryClient();
  const clearPendingVerification = useAuthFlowStore(
    (state) => state.clearPendingVerification,
  );
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.verifyRegisterOtp,
    onSuccess: (session) => {
      setSession(session);
      clearPendingVerification();
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useGoogleSignInMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.signInWithGoogle,
    onSuccess: (session) => {
      setSession(session);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearPendingVerification = useAuthFlowStore(
    (state) => state.clearPendingVerification,
  );

  return useMutation({
    mutationFn: authApi.signOut,
    onMutate: async () => {
      try {
        const { resetPlayback } = await import('@/services/audio/playback-controller.native');
        await resetPlayback();
      } catch (e) {
        console.warn('Failed to stop playback on logout', e);
      }
    },
    onSuccess: async () => {
      clearPendingVerification();
      await queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const clearPendingVerification = useAuthFlowStore(
    (state) => state.clearPendingVerification,
  );

  return useMutation({
    mutationFn: authApi.deleteAccount,
    onMutate: async () => {
      try {
        const { resetPlayback } = await import('@/services/audio/playback-controller.native');
        await resetPlayback();
      } catch (e) {
        console.warn('Failed to stop playback on account deletion', e);
      }
    },
    onSuccess: async () => {
      clearPendingVerification();
      await queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
