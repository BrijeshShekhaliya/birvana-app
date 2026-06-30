import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

import { StartupScreen } from '@/components/feedback/StartupScreen';
import { AuthRedirectScreen } from '@/features/auth/screens/auth-redirect-screen';
import { ForgotPasswordScreen } from '@/features/auth/screens/forgot-password-screen';
import { LoginScreen } from '@/features/auth/screens/login-screen';
import { OtpLoginScreen } from '@/features/auth/screens/otp-login-screen';
import { RegisterScreen } from '@/features/auth/screens/register-screen';
import { VerifyCodeScreen } from '@/features/auth/screens/verify-code-screen';
import { WelcomeScreen } from '@/features/auth/screens/welcome-screen';
import ArtistScreen from '@/screens/ArtistScreen';
import PlaylistScreen from '@/screens/PlaylistScreen';
import CategoryScreen from '@/screens/CategoryScreen';
import NotificationScreen from '@/screens/NotificationScreen';
import { AnimatedPlayerScreen } from '@/features/player/screens/animated-player-screen';
import { GlobalMiniPlayer } from '@/features/player/components/global-mini-player';
import { ProfileScreen } from '@/features/profile/screens/profile-screen';
import { useAuthStore } from '@/stores/auth.store';
import BottomTabs from '@/navigation/BottomTabs';
import type { AppStackParamList, AuthStackParamList, RootStackParamList } from '@/navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();


function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F0F' },
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
      <AuthStack.Screen component={OtpLoginScreen} name="OtpLogin" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
      <AuthStack.Screen component={VerifyCodeScreen} name="VerifyCode" />
      <AuthStack.Screen component={WelcomeScreen} name="Welcome" />
      <AuthStack.Screen component={AuthRedirectScreen} name="AuthRedirect" />
    </AuthStack.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F0F' },
        animation: 'fade',
      }}
    >
      <AppStack.Screen name="MainTabs" component={BottomTabs} />
      <AppStack.Screen
        name="Player"
        component={AnimatedPlayerScreen}
        options={{
          presentation: 'modal',
          animation: 'fade_from_bottom',
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <AppStack.Screen name="Playlist" component={PlaylistScreen} />
      <AppStack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ presentation: 'transparentModal', animation: 'fade' }} 
      />
      <AppStack.Screen name="Artist" component={ArtistScreen} />
      <AppStack.Screen name="Category" component={CategoryScreen} />
      <AppStack.Screen 
        name="Notification" 
        component={NotificationScreen} 
        options={{ presentation: 'transparentModal', animation: 'fade' }} 
      />
    </AppStack.Navigator>
  );
}

export function RootNavigator({ isReady, isPlayerActive }: { isReady?: boolean, isPlayerActive?: boolean }) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const status = useAuthStore((state) => state.status);

  if (!hydrated) {
    return <StartupScreen />;
  }

  return (
    <>
      <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
        {status === 'authenticated' ? (
          <RootStack.Screen component={AppStackNavigator} name="App" />
        ) : (
          <RootStack.Screen component={AuthStackNavigator} name="Auth" />
        )}
      </RootStack.Navigator>
      {status === 'authenticated' && isReady && <GlobalMiniPlayer isPlayerActive={isPlayerActive} />}
    </>
  );
}
