import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { GoogleAuthButton } from '@/features/auth/components/google-auth-button';
import {
  heardAboutOptions,
  type HeardAboutValue,
  type SignUpDraft,
} from '@/features/auth/auth.types';
import {
  useGoogleSignInMutation,
  useRequestRegisterOtpMutation,
} from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAppTheme } from '@/theme/useAppTheme';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const theme = useAppTheme();
  const setSignupVerification = useAuthFlowStore(
    (state) => state.setSignupVerification,
  );
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [heardAbout, setHeardAbout] = useState<HeardAboutValue | null>(null);
  const [errors, setErrors] = useState<{name?: string, email?: string, password?: string, confirmPassword?: string, heardAbout?: string, global?: string}>({});

  const requestRegisterOtp = useRequestRegisterOtpMutation();
  const googleSignIn = useGoogleSignInMutation();

  const busy = requestRegisterOtp.isPending || googleSignIn.isPending;

  const draft = useMemo<SignUpDraft | null>(() => {
    if (!heardAbout) {
      return null;
    }

    return {
      displayName: displayName.trim(),
      email: normalizeEmail(email),
      heardAbout,
      password,
    };
  }, [displayName, email, heardAbout, password]);

  const handleContinue = () => {
    const nextErrors: typeof errors = {};
    let hasError = false;

    if (!displayName.trim()) {
      nextErrors.name = 'Please enter your full name.';
      hasError = true;
    }
    
    if (!normalizeEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
      hasError = true;
    } else if (!email.includes('@') || !email.includes('.')) {
      nextErrors.email = 'Please enter a valid email address.';
      hasError = true;
    }

    if (!password) {
      nextErrors.password = 'Please enter a password.';
      hasError = true;
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
      hasError = true;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
      hasError = true;
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
      hasError = true;
    }

    if (!draft && !hasError) {
      nextErrors.heardAbout = 'Please select how you heard about us.';
      hasError = true;
    }

    setErrors(nextErrors);

    if (hasError || !draft) {
      return;
    }

    requestRegisterOtp.mutate(draft, {
      onError: (error) => {
        const errorMsg = getAuthErrorMessage(error, 'Unable to create account right now.');
        // Map common errors to fields if possible
        if (errorMsg.toLowerCase().includes('already registered')) {
          setErrors({ email: 'This email is already registered. Please sign in.' });
        } else if (errorMsg.toLowerCase().includes('password')) {
          setErrors({ password: errorMsg });
        } else {
          setErrors({ email: errorMsg });
        }
      },
      onSuccess: (response) => {
        setSignupVerification(draft, response.pendingSignupToken);
        navigation.navigate('VerifyCode', {
          email: draft.email,
          flow: 'signup',
        });
      },
    });
  };

  return (
    <AuthShell
      badge=""
      heroEyebrow="Create account"
      onTopActionPress={() => navigation.navigate('Login')}
      subtitle=""
      title="Create account"
      topActionLabel="Sign in"
    >
      <View className="gap-5">
        <View className="gap-4">
          <AuthTextField
            autoComplete="name"
            label="Full name"
            onChangeText={(value) => {
              setDisplayName(value);
              if (errors.name) setErrors(e => ({ ...e, name: undefined }));
            }}
            placeholder="Your name"
            value={displayName}
            error={!!errors.name}
            errorText={errors.name}
          />

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
            value={email}
            error={!!errors.email}
            errorText={errors.email}
          />

          <AuthTextField
            autoComplete="new-password"
            label="Password"
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) setErrors(e => ({ ...e, password: undefined }));
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
            error={!!errors.password}
            errorText={errors.password}
          />

          <AuthTextField
            autoComplete="new-password"
            label="Confirm password"
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (errors.confirmPassword) setErrors(e => ({ ...e, confirmPassword: undefined }));
            }}
            placeholder="Repeat your password"
            secureTextEntry
            value={confirmPassword}
            error={!!errors.confirmPassword}
            errorText={errors.confirmPassword}
          />
        </View>

        <View className="gap-2">
          <AppText variant="label">How did you hear about Birvana?</AppText>
          <View className="flex-row flex-wrap gap-3">
            {heardAboutOptions.map((option) => {
              const active = heardAbout === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  className="rounded-full border px-4 py-3"
                  onPress={() => {
                    setHeardAbout(option.value);
                    if (errors.heardAbout) setErrors(e => ({ ...e, heardAbout: undefined }));
                  }}
                  style={{
                    backgroundColor: active
                      ? theme.colors.primarySoft
                      : theme.colors.surface,
                    borderColor: active
                      ? theme.colors.primary
                      : errors.heardAbout 
                        ? '#C65C5C'
                        : theme.colors.border,
                  }}
                >
                  <AppText
                    tone={active ? 'primary' : 'default'}
                    variant="caption"
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.heardAbout && (
             <AppText style={{ color: '#C65C5C', fontSize: 12, paddingLeft: 8 }}>{errors.heardAbout}</AppText>
          )}
        </View>

        <AuthActionButton
          disabled={busy}
          label={
            requestRegisterOtp.isPending
              ? 'Sending verification code...'
              : 'Create account'
          }
          onPress={handleContinue}
        />

        <AuthActionButton
          label="Already have an account? Sign in"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
        />

        <View className="gap-3">
          <View className="items-center">
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
              googleSignIn.mutate('register', {
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
