export const tokens = {
  colors: {
    pageBackground: '#070707',
    cardBackground: '#111111',
    elevatedSurface: '#1A1A1A',
    activeSurface: '#222222',
    borderSubtle: '#1F1F1F',
    borderStrong: '#2A2A2A',
    primaryAccent: '#1DB954',
    accentDim: '#0C3320',
    accentGlow: 'rgba(29,185,84,0.15)',
    textPrimary: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#555555',
    textOnAccent: '#000000',
    danger: '#E24B4A',
    warning: '#EF9F27',
  },
  typography: {
    heroTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
    screenTitle: { fontSize: 22, fontWeight: '700' },
    sectionHeader: { fontSize: 16, fontWeight: '600' },
    cardTitle: { fontSize: 13, fontWeight: '500' },
    cardSubtitle: { fontSize: 11, fontWeight: '400', color: '#AAA' },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
    caption: { fontSize: 11, fontWeight: '400', color: '#555' },
    buttonLabel: { fontSize: 14, fontWeight: '600' },
  },
  spacing: {
    horizontalPadding: 16,
    sectionGap: 28,
    cardGapHorizontal: 12,
    cardGapVertical: 8,
  },
  radius: {
    albumArt: 8,
    artistCircle: 999,
    card: 10,
    button: 12,
    pill: 999,
    bottomSheetTop: 20,
    playerArt: 16,
  },
  shadows: {},
};

export type Tokens = typeof tokens;

export type AppColorMode = 'light' | 'dark' | 'system';
export type AppTheme = {
  colors: {
    background: string;
    text: string;
    primary: string;
    muted: string;
    secondary: string;
    surface: string;
    border: string;
    surfaceRaised: string;
    primarySoft: string;
    secondarySoft: string;
  };
  isDark: boolean;
  typography?: any;
  radii?: any;
  spacing?: any;
};

export const createAppTheme = (mode: AppColorMode): AppTheme => ({
  colors: {
    background: tokens.colors.pageBackground,
    text: tokens.colors.textPrimary,
    primary: tokens.colors.primaryAccent,
    muted: tokens.colors.textMuted,
    secondary: tokens.colors.textSecondary,
    surface: tokens.colors.cardBackground,
    border: tokens.colors.borderSubtle,
    surfaceRaised: tokens.colors.elevatedSurface,
    primarySoft: tokens.colors.accentGlow,
    secondarySoft: tokens.colors.activeSurface,
  },
  isDark: mode === 'dark' || mode === 'system',
  typography: {
    body: {}, caption: {}, display: {}, heading: {}, label: {}, title: {}
  },
  radii: {},
  spacing: {},
});
