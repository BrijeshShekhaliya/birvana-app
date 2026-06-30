export const queryKeys = {
  aimk: {
    all: ['aimk'] as const,
    searchPlaylists: (query: string) =>
      ['aimk', 'search-playlists', query] as const,
    searchTracks: (query: string) =>
      ['aimk', 'search-tracks', query] as const,
  },
  auth: {
    all: ['auth'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
  },
  catalog: {
    all: ['catalog'] as const,
    artist: (artistId: string) => ['catalog', 'artist', artistId] as const,
    playlist: (playlistId: string) =>
      ['catalog', 'playlist', playlistId] as const,
    popularPlaylists: (limit: number) =>
      ['catalog', 'popular-playlists', limit] as const,
    popularTracks: (limit: number) =>
      ['catalog', 'popular-tracks', limit] as const,
    track: (trackId: number | string) =>
      ['catalog', 'track', trackId] as const,
  },
} as const;
