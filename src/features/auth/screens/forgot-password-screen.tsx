import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { useRequestPasswordResetMutation } from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const resetPassword = useRequestPasswordResetMutation();

  const handleSubmit = () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setErrorMessage('Enter your email first.');
      return;
    }

    setErrorMessage('');
    setNotice('');

    resetPassword.mutate(normalizedEmail, {
      onError: (error) => {
        setErrorMessage(
          getAuthErrorMessage(error, 'Unable to send reset instructions.'),
        );
      },
      onSuccess: () => {
        setNotice('Reset instructions were sent to your email.');
      },
    });
  };

  return (
    <AuthShell
      subtitle=""
      title="Reset password"
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
          disabled={resetPassword.isPending}
          label={
            resetPassword.isPending
              ? 'Sending...'
              : 'Send reset link'
          }
          onPress={handleSubmit}
        />

        {errorMessage ? (
          <AuthStatusBanner message={errorMessage} tone="error" />
        ) : null}
        {notice ? <AuthStatusBanner message={notice} tone="success" /> : null}

        <View style={{ alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
          >
            <AppText tone="primary" variant="caption">
              Back to sign in
            </AppText>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  );
}
