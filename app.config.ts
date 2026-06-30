import type { ExpoConfig } from 'expo/config';

const config = {
  name: 'Birvana',
  slug: 'birvana-mobile',
  scheme: 'birvana',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  plugins: ['expo-web-browser', 'expo-audio', 'expo-image'],
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0E0A07',
  },
  ios: {
    associatedDomains: ['applinks:birvana.app'],
    infoPlist: {
      UIBackgroundModes: ['audio'],
    },
    supportsTablet: false,
    bundleIdentifier: 'com.birvana.mobile',
    runtimeVersion: {
      policy: 'appVersion'
    }
  },
  android: {
    edgeToEdge: true,
    softwareKeyboardLayoutMode: 'resize',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          {
            host: 'birvana.app',
            pathPrefix: '/',
            scheme: 'https',
          },
        ],
      },
    ],
    package: 'com.birvana.mobile',
    adaptiveIcon: {
      backgroundColor: '#0E0A07',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
    allowBackup: false,
    runtimeVersion: '1.0.0',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  updates: {
    url: 'https://u.expo.dev/d71bb4b4-2313-4a93-8734-54c894b4d6e9'
  },
  extra: {
    eas: {
      projectId: 'd71bb4b4-2313-4a93-8734-54c894b4d6e9'
    },
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  },
} as ExpoConfig & { newArchEnabled?: boolean };

export default config;
