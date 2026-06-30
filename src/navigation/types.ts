export type AuthStackParamList = {
  AuthRedirect: undefined;
  ForgotPassword: { email?: string } | undefined;
  Login: undefined;
  OtpLogin: { email?: string } | undefined;
  Register: undefined;
  VerifyCode: { email: string; flow: 'signup' | 'login' | 'recovery' };
  Welcome: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Playlist: { playlistId: string; type?: 'playlist' | 'album' | 'channel' };
  Profile: undefined;
  Search: undefined; // For deep linking or AppStack direct nav
  Artist: { artistId: string };
  Category: { categoryId: string; title: string };
  Notification: undefined;
};

export type RootStackParamList = {
  App: undefined;
  Auth: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
