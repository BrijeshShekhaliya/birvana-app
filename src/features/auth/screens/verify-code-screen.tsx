import { useEffect, useMemo, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { OtpCodeInput } from '@/features/auth/components/otp-pin-input';
import { OTP_LENGTH } from '@/features/auth/auth.types';
import {
  useRequestLoginOtpMutation,
  useRequestRegisterOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
} from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthFlowStore } from '@/stores/auth-flow.store';

type VerifyCodeScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'VerifyCode'
>;

type OtpStatus = 'error' | 'idle' | 'success' | 'typing' | 'verifying';

function sanitizeOtpInput(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, OTP_LENGTH);
}

export function VerifyCodeScreen({
  navigation,
  route,
}: VerifyCodeScreenProps) {
  const clearPendingVerification = useAuthFlowStore(
    (state) => state.clearPendingVerification,
  );
  const pendingVerification = useAuthFlowStore(
    (state) => state.pendingVerification,
  );
  const updatePendingSignupToken = useAuthFlowStore(
    (state) => state.updatePendingSignupToken,
  );

  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [token, setToken] = useState('');
  const lastSubmittedToken = useRef('');

  const requestLoginOtp = useRequestLoginOtpMutation();
  const requestRegisterOtp = useRequestRegisterOtpMutation();
  const verifyLoginOtp = useVerifyLoginOtpMutation();
  const verifyRegisterOtp = useVerifyRegisterOtpMutation();

  const flow = pendingVerification?.flow ?? route.params.flow;
  const email = pendingVerification?.email ?? route.params.email ?? '';
  const missingVerificationState = useMemo(() => {
    if (!pendingVerification) {
      return true;
    }

    return pendingVerification.flow !== route.params.flow;
  }, [pendingVerification, route.params.flow]);

  useEffect(() => {
    setResendCooldown(40);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const verifyCurrentToken = () => {
    if (!pendingVerification) {
      setErrorMessage('Your verification session expired. Start again.');
      return;
    }

    if (token.length !== OTP_LENGTH) {
      setErrorMessage('Enter the full verification code.');
      return;
    }

    setErrorMessage('');
    setNotice('');
    setOtpStatus('verifying');

    if (pendingVerification.flow === 'login') {
      verifyLoginOtp.mutate(
        { email: pendingVerification.email, token },
        {
          onError: (error) => {
            setErrorMessage(
              getAuthErrorMessage(
                error,
                'The verification code could not be confirmed.',
              ),
            );
            setOtpStatus('error');
            setToken('');
            lastSubmittedToken.current = '';
          },
          onSuccess: () => {
            setOtpStatus('success');
            setNotice('Code verified. Opening Birvana...');
          },
        },
      );

      return;
    }

    verifyRegisterOtp.mutate(
      {
        email: pendingVerification.email,
        password: pendingVerification.draft.password,
        pendingSignupToken: pendingVerification.pendingSignupToken,
        token,
      },
      {
        onError: (error) => {
          setErrorMessage(
            getAuthErrorMessage(
              error,
              'The verification code could not be confirmed.',
            ),
          );
          setOtpStatus('error');
          setToken('');
          lastSubmittedToken.current = '';
        },
        onSuccess: () => {
          setOtpStatus('success');
          setNotice('Email verified. Opening Birvana...');
        },
      },
    );
  };

  useEffect(() => {
    if (token.length !== OTP_LENGTH) {
      return;
    }

    if (
      verifyLoginOtp.isPending ||
      verifyRegisterOtp.isPending ||
      lastSubmittedToken.current === token
    ) {
      return;
    }

    lastSubmittedToken.current = token;
    verifyCurrentToken();
  }, [
    token,
    verifyLoginOtp.isPending,
    verifyRegisterOtp.isPending,
  ]);

  const handleResend = () => {
    if (!pendingVerification) {
      setErrorMessage('Your verification session expired. Start again.');
      return;
    }

    setErrorMessage('');
    setNotice('');

    if (pendingVerification.flow === 'login') {
      requestLoginOtp.mutate(pendingVerification.email, {
        onError: (error) => {
          setErrorMessage(
            getAuthErrorMessage(
              error,
              'Unable to resend the verification code.',
            ),
          );
        },
        onSuccess: () => {
          setResendCooldown(40);
          setNotice('A new verification code was sent.');
          setOtpStatus('typing');
          setToken('');
          lastSubmittedToken.current = '';
        },
      });

      return;
    }

    requestRegisterOtp.mutate(pendingVerification.draft, {
      onError: (error) => {
        setErrorMessage(
          getAuthErrorMessage(error, 'Unable to resend the verification code.'),
        );
      },
      onSuccess: (response) => {
        updatePendingSignupToken(response.pendingSignupToken);
        setResendCooldown(40);
        setNotice('A new verification code was sent.');
        setOtpStatus('typing');
        setToken('');
        lastSubmittedToken.current = '';
      },
    });
  };

  const handleChangeDetails = () => {
    clearPendingVerification();
    if (flow === 'signup') {
      navigation.replace('Register');
    } else {
      navigation.replace('OtpLogin');
    }
  };

  if (missingVerificationState) {
    return (
      <AuthShell
        subtitle=""
        title="Start again"
      >
        <View style={{ gap: 16 }}>
          <AuthStatusBanner
            message="Your verification session expired."
            tone="error"
          />
          <AuthActionButton
            label={route.params.flow === 'signup' ? 'Back to register' : 'Back to email code'}
            onPress={handleChangeDetails}
          />
        </View>
      </AuthShell>
    );
  }

  const isBusy =
    requestLoginOtp.isPending ||
    requestRegisterOtp.isPending ||
    verifyLoginOtp.isPending ||
    verifyRegisterOtp.isPending;

  return (
    <AuthShell
      onTopActionPress={handleChangeDetails}
      subtitle=""
      title="Enter code"
      topActionLabel="Change email"
    >
      <View style={{ gap: 18 }}>
        <View style={{ alignItems: 'center' }}>
          <AppText tone="muted" variant="caption">
            {email}
          </AppText>
        </View>

        <OtpCodeInput
          autoFocus
          onChangeText={(value) => {
            const nextToken = sanitizeOtpInput(value);
            setToken(nextToken);
            setErrorMessage('');
            setNotice('');
            setOtpStatus(nextToken ? 'typing' : 'idle');
          }}
          status={otpStatus}
          value={token}
        />

        <View style={{ alignItems: 'center', gap: 6 }}>
          <AppText tone="muted" variant="caption">
            {verifyLoginOtp.isPending || verifyRegisterOtp.isPending
              ? 'Checking code...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Didn't get the code?"}
          </AppText>
          <Pressable
            accessibilityRole="button"
            disabled={isBusy || resendCooldown > 0}
            onPress={handleResend}
          >
            <AppText
              tone={isBusy || resendCooldown > 0 ? 'muted' : 'primary'}
              variant="label"
            >
              Resend code
            </AppText>
          </Pressable>
        </View>

        {errorMessage ? (
          <AuthStatusBanner message={errorMessage} tone="error" />
        ) : null}
        {notice ? <AuthStatusBanner message={notice} tone="success" /> : null}
      </View>
    </AuthShell>
  );
}
