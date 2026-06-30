import { create } from 'zustand';

import type { OtpFlow, SignUpDraft } from '@/features/auth/auth.types';

type LoginVerificationState = {
  email: string;
  flow: 'login';
};

type SignupVerificationState = {
  draft: SignUpDraft;
  email: string;
  flow: 'signup';
  pendingSignupToken: string;
};

type PendingVerificationState =
  | LoginVerificationState
  | SignupVerificationState
  | null;

type AuthFlowStore = {
  pendingVerification: PendingVerificationState;
  clearPendingVerification: () => void;
  setLoginVerification: (email: string) => void;
  setSignupVerification: (
    draft: SignUpDraft,
    pendingSignupToken: string,
  ) => void;
  updatePendingSignupToken: (pendingSignupToken: string) => void;
};

export const useAuthFlowStore = create<AuthFlowStore>((set) => ({
  pendingVerification: null,
  clearPendingVerification: () => {
    set({ pendingVerification: null });
  },
  setLoginVerification: (email) => {
    set({
      pendingVerification: {
        email,
        flow: 'login',
      },
    });
  },
  setSignupVerification: (draft, pendingSignupToken) => {
    set({
      pendingVerification: {
        draft,
        email: draft.email,
        flow: 'signup',
        pendingSignupToken,
      },
    });
  },
  updatePendingSignupToken: (pendingSignupToken) => {
    set((state) => {
      if (state.pendingVerification?.flow !== 'signup') {
        return state;
      }

      return {
        pendingVerification: {
          ...state.pendingVerification,
          pendingSignupToken,
        },
      };
    });
  },
}));

export function isPendingFlow(
  flow: PendingVerificationState,
  expected: OtpFlow,
) {
  return flow?.flow === expected;
}
