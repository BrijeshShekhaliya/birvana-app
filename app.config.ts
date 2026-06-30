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
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  },
} as ExpoConfig & { newArchEnabled?: boolean };

export default config;
