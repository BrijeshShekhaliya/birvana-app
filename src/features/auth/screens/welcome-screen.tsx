import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { AuthActionButton } from '@/features/auth/components/auth-action-button';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { GoogleAuthButton } from '@/features/auth/components/google-auth-button';
import { useGoogleSignInMutation } from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import type { AuthStackParamList } from '@/navigation/types';

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const googleSignIn = useGoogleSignInMutation();

  return (
    <AuthShell
      badge="Auth access"
      heroEyebrow="Authentication phase"
      subtitle="Choose the path that matches how you want to enter Birvana on mobile."
      title="Welcome to Birvana."
    >
      <View className="gap-5">
        <View className="gap-2">
          <AppText variant="title">Choose your entry point.</AppText>
          <AppText tone="muted">
            Separate flows keep sign-in simple: password, email code, account
            creation, or Google.
          </AppText>
        </View>

        <View className="gap-3">
          <AuthActionButton
            label="Sign in with password"
            onPress={() => navigation.navigate('Login')}
          />
          <AuthActionButton
            label="Sign in with email code"
            onPress={() => navigation.navigate('OtpLogin')}
            variant="ghost"
          />
          <AuthActionButton
            label="Create account"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
          />
        </View>

        <View className="gap-3">
          <View className="items-center">
            <AppText tone="muted" variant="caption">
              or continue with Google
            </AppText>
          </View>

          <GoogleAuthButton
            disabled={googleSignIn.isPending}
            label={
              googleSignIn.isPending
                ? 'Connecting to Google...'
                : 'Continue with Google'
            }
            onPress={() => {
              googleSignIn.mutate('login');
            }}
          />
        </View>

        {googleSignIn.isError ? (
          <AuthStatusBanner
            message={getAuthErrorMessage(
              googleSignIn.error,
              'Google sign-in could not be completed.',
            )}
            tone="error"
          />
        ) : null}
      </View>
    </AuthShell>
  );
}
