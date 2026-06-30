import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { GoogleAuthButton } from '@/features/auth/components/google-auth-button';
import {
  useGoogleSignInMutation,
  usePasswordLoginMutation,
} from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string, password?: string, global?: string}>({});

  const passwordLogin = usePasswordLoginMutation();
  const googleSignIn = useGoogleSignInMutation();

  const busy = passwordLogin.isPending || googleSignIn.isPending;

  const handlePasswordSignIn = () => {
    const normalizedEmail = normalizeEmail(email);
    const nextErrors: typeof errors = {};
    let hasError = false;

    if (!normalizedEmail) {
      nextErrors.email = 'Please enter your email address.';
      hasError = true;
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.';
      hasError = true;
    }

    setErrors(nextErrors);

    if (hasError) {
      return;
    }

    passwordLogin.mutate(
      {
        email: normalizedEmail,
        password,
      },
      {
        onError: (error) => {
          const errorMsg = getAuthErrorMessage(error, 'Unable to sign in right now.');
          if (errorMsg.toLowerCase().includes('credential') || errorMsg.toLowerCase().includes('incorrect')) {
            setErrors({ email: 'Incorrect email or password.', password: 'Incorrect email or password.' });
          } else if (errorMsg.toLowerCase().includes('password')) {
            setErrors({ password: errorMsg });
          } else {
            setErrors({ email: errorMsg });
          }
        },
      },
    );
  };

  return (
    <AuthShell
      heroEyebrow=""
      subtitle=""
      title="Sign in"
    >
      <View style={{ gap: 22 }}>
        <View style={{ gap: 16 }}>
          <AuthTextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) setErrors(e => ({ ...e, email: undefined }));
            }}
            placeholder="name@example.com"
            returnKeyType="next"
            value={email}
            error={!!errors.email}
            errorText={errors.email}
          />

          <AuthTextField
            autoComplete="password"
            label="Password"
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) setErrors(e => ({ ...e, password: undefined }));
            }}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="done"
            value={password}
            error={!!errors.password}
            errorText={errors.password}
          />
        </View>

        <AuthActionButton
          disabled={busy}
          label={passwordLogin.isPending ? 'Signing in...' : 'Sign in'}
          onPress={handlePasswordSignIn}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <AppText tone="primary" variant="caption">
              Forgot password
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('OtpLogin')}
          >
            <AppText tone="primary" variant="caption">
              Login with OTP
            </AppText>
          </Pressable>
        </View>

        <AuthActionButton
          label="Create account"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />

        <View style={{ gap: 14 }}>
          <View style={{ alignItems: 'center' }}>
            <AppText tone="muted" variant="caption">
              or continue with Google
            </AppText>
          </View>

          <GoogleAuthButton
            disabled={busy}
            label={
              googleSignIn.isPending
                ? 'Connecting to Google...'
                : 'Continue with Google'
            }
            onPress={() => {
              googleSignIn.mutate('login', {
                onError: (error) => {
                  setErrors({
                    email: getAuthErrorMessage(
                      error,
                      'Google sign-in could not be completed.',
                    )
                  });
                },
              });
            }}
          />
        </View>
      </View>
    </AuthShell>
  );
}
