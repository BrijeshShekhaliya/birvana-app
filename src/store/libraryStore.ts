import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UnifiedCollection, UnifiedArtist, UnifiedTrack } from '@/services/providers/models';

export interface LibraryState {
  likedSongs: UnifiedTrack[];
  recentPlays: UnifiedTrack[];
  playlists: UnifiedCollection[];
  artists: UnifiedArtist[];
  
  toggleLiked: (track: UnifiedTrack) => void;
  isLiked: (id: string) => boolean;
  
  addRecent: (track: UnifiedTrack) => void;
  
  togglePlaylist: (playlist: UnifiedCollection) => void;
  isPlaylistSaved: (id: string) => boolean;
  
  toggleArtist: (artist: UnifiedArtist) => void;
  isArtistSaved: (id: string) => boolean;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      recentPlays: [],
      playlists: [],
      artists: [],
      
      toggleLiked: (track) => set((state) => {
        const exists = state.likedSongs.some(t => t.id === track.id);
        if (exists) {
          return { likedSongs: state.likedSongs.filter(t => t.id !== track.id) };
        }
        return { likedSongs: [track, ...state.likedSongs] };
      }),
      isLiked: (id) => get().likedSongs.some(t => t.id === id),
      
      addRecent: (track) => set((state) => {
        const filtered = state.recentPlays.filter(t => t.id !== track.id);
        return { recentPlays: [track, ...filtered].slice(0, 50) };
      }),
      
      togglePlaylist: (playlist) => set((state) => {
        const exists = state.playlists.some(p => p.id === playlist.id);
        if (exists) {
          return { playlists: state.playlists.filter(p => p.id !== playlist.id) };
        }
        return { playlists: [playlist, ...state.playlists] };
      }),
      isPlaylistSaved: (id) => get().playlists.some(p => p.id === id),
      
      toggleArtist: (artist) => set((state) => {
        const exists = state.artists.some(a => a.id === artist.id);
        if (exists) {
          return { artists: state.artists.filter(a => a.id !== artist.id) };
        }
        return { artists: [artist, ...state.artists] };
      }),
      isArtistSaved: (id) => get().artists.some(a => a.id === id),
    }),
    {
      name: 'birvana_library_v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
