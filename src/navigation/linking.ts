import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/types';

export const linking: LinkingOptions<RootStackParamList> = {
  config: {
    screens: {
      App: {
        screens: {
          Playlist: 'playlist/:playlistId',
          Player: 'player',
          MainTabs: {
            screens: {
              Home: '',
              Playlists: 'playlists',
              PopularToday: 'popular-today',
            },
          },
        },
      },
      Auth: {
        screens: {
          AuthRedirect: 'auth/callback',
          Login: 'login',
          Register: 'register',
          VerifyCode: 'verify',
          Welcome: 'welcome',
        },
      },
    },
  },
  prefixes: ['birvana://', 'https://birvana.app', 'https://birvana.vercel.app'],
};
