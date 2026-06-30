import type { 
  UnifiedHomeData, 
  UnifiedPlaylist, 
  UnifiedCollection, 
  UnifiedArtist, 
  UnifiedTrack 
} from './models';

/**
 * The standard interface that all music content providers must implement.
 * This guarantees the application can seamlessly swap or aggregate providers
 * (e.g., JioSaavn, Spotify, YouTube Music) without changing UI logic.
 */
export interface IMusicProvider {
  /**
   * Uniquely identifies the provider (e.g., 'jiosaavn', 'spotify').
   */
  get id(): string;

  /**
   * Display name for the provider.
   */
  get name(): string;

  /**
   * Fetches the massive aggregated home screen data.
   */
  getHomeContent(): Promise<UnifiedHomeData>;

  /**
   * Fetches details and tracks for a specific playlist or channel.
   */
  getPlaylistDetails(id: string, type?: 'playlist' | 'channel'): Promise<UnifiedPlaylist>;

  /**
   * Fetches details and tracks for a specific album.
   */
  getAlbumDetails(id: string): Promise<UnifiedPlaylist>;

  /**
   * Fetches rich details, discography, and top songs for an artist.
   */
  getArtistDetails(id: string): Promise<UnifiedArtist>;

  /**
   * Fetches paginated top songs for an artist.
   */
  getArtistMoreSongs(id: string, page: number): Promise<{ items: UnifiedTrack[], hasMore: boolean }>;

  /**
   * Fetches an infinitely paginated list of new global albums.
   */
  getPaginatedAlbums(page: number, limit: number): Promise<UnifiedCollection[]>;

  /**
   * Fetches an infinitely paginated list of search results.
   */
  search(query: string, type: 'song' | 'album' | 'playlist' | 'artist', page: number, limit: number): Promise<any[]>;
  
  getLyrics?(trackId: string): Promise<{ lyrics: string; snippet: string } | null>;
}
