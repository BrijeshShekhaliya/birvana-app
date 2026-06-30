import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { useRequestLoginOtpMutation } from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthFlowStore } from '@/stores/auth-flow.store';

type OtpLoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'OtpLogin'>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function OtpLoginScreen({ navigation }: OtpLoginScreenProps) {
  const setLoginVerification = useAuthFlowStore(
    (state) => state.setLoginVerification,
  );
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const requestLoginOtp = useRequestLoginOtpMutation();

  const handleContinue = () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setErrorMessage('Enter your email first.');
      return;
    }

    setErrorMessage('');

    requestLoginOtp.mutate(normalizedEmail, {
      onError: (error) => {
        setErrorMessage(
          getAuthErrorMessage(error, 'Unable to send the verification code.'),
        );
      },
      onSuccess: () => {
        setLoginVerification(normalizedEmail);
        navigation.navigate('VerifyCode', {
          email: normalizedEmail,
          flow: 'login',
        });
      },
    });
  };

  return (
    <AuthShell
      subtitle=""
      title="Sign in with OTP"
    >
      <View style={{ gap: 20 }}>
        <AuthTextField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => {
            setEmail(value);
            setErrorMessage('');
          }}
          placeholder="name@example.com"
          returnKeyType="done"
          value={email}
        />

        <AuthActionButton
          disabled={requestLoginOtp.isPending}
          label={requestLoginOtp.isPending ? 'Sending code...' : 'Send code'}
          onPress={handleContinue}
        />

        {errorMessage ? (
          <AuthStatusBanner message={errorMessage} tone="error" />
        ) : null}
      </View>
    </AuthShell>
  );
}
