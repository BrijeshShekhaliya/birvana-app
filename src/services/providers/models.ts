/**
 * Unified Data Models
 * These models define the standard structure for all music content across the app.
 * Any content provider (e.g., JioSaavn, Spotify, YouTube Music) must map their
 * proprietary data structures into these unified models.
 */

export interface UnifiedTrack {
  id: string;
  title: string;
  artistString: string;
  primaryArtists: { id: string; name: string }[];
  albumId: string | null;
  artworkUrl: string;
  streamUrl: string;
  durationSeconds: number | null;
  playCount: number;
  position: number;
  hasLyrics?: boolean;
}

export interface UnifiedCollection {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: 'playlist' | 'album' | 'channel' | 'artist';
}

export interface UnifiedPlaylist {
  id: string;
  name: string;
  description: string;
  artworkUrl: string;
  songCount: number;
  followerCount: number;
  playCount: number;
  visibility: string;
  tracks: UnifiedTrack[];
}

export interface UnifiedArtist {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  followerCount: number;
  isVerified: boolean;
  dominantLanguage: string | null;
  topSongs: UnifiedTrack[];
  topAlbums: UnifiedCollection[];
  singles: UnifiedCollection[];
  similarArtists: UnifiedCollection[];
}

export interface UnifiedHomeData {
  charts: UnifiedCollection[];
  newAlbums: UnifiedCollection[];
  topPlaylists: UnifiedCollection[];
  discover: UnifiedCollection[];
  trending: UnifiedTrack[];
  popularArtists: UnifiedCollection[];
  allPlaylists: UnifiedCollection[];
}
