import { create } from 'zustand';
import type { UnifiedPlaylist, UnifiedArtist } from '@/services/providers/models';

type CacheState = {
  playlists: Record<string, { data: UnifiedPlaylist; timestamp: number }>;
  artists: Record<string, { data: UnifiedArtist; timestamp: number }>;
  setPlaylistCache: (id: string, data: UnifiedPlaylist) => void;
  setArtistCache: (id: string, data: UnifiedArtist) => void;
};

export const useCacheStore = create<CacheState>((set) => ({
  playlists: {},
  artists: {},
  setPlaylistCache: (id, data) => set(state => ({ playlists: { ...state.playlists, [id]: { data, timestamp: Date.now() } } })),
  setArtistCache: (id, data) => set(state => ({ artists: { ...state.artists, [id]: { data, timestamp: Date.now() } } })),
}));
