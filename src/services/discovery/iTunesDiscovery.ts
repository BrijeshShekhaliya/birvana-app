export class ITunesDiscoveryProvider {
  private static readonly REGIONS = ['us', 'gb', 'kr', 'es', 'ng', 'jp', 'br', 'de', 'fr', 'ca'];
  
  private static getRandomRegion() {
    return this.REGIONS[Math.floor(Date.now() / 1000) % this.REGIONS.length];
  }

  /**
   * Fetches the top trending tracks globally using a rotating region.
   * Resolves organically diverse music (K-Pop, Afrobeats, Latin, etc.)
   */
  static async getGlobalTrendingTracks(limit = 20): Promise<{ title: string; artist: string }[]> {
    const region = this.getRandomRegion();
    const url = `https://itunes.apple.com/${region}/rss/topsongs/limit=${limit}/json`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const entries = data?.feed?.entry || [];
      return entries.map((e: any) => ({
        title: e['im:name']?.label || '',
        artist: e['im:artist']?.label || '',
      })).filter((e: any) => e.title && e.artist);
    } catch (e) {
      console.warn('iTunesDiscoveryProvider: Failed to fetch trending tracks', e);
      return [];
    }
  }

  /**
   * Fetches the top trending artists globally using a rotating region.
   * iTunes doesn't have an explicit 'artists' endpoint, but we can extract them from Top Albums.
   */
  static async getGlobalTrendingArtists(limit = 25): Promise<string[]> {
    const region = this.getRandomRegion();
    const url = `https://itunes.apple.com/${region}/rss/topalbums/limit=${limit}/json`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const entries = data?.feed?.entry || [];
      const artists = entries.map((e: any) => e['im:artist']?.label || '').filter(Boolean);
      
      // Deduplicate artists
      return Array.from(new Set(artists));
    } catch (e) {
      console.warn('iTunesDiscoveryProvider: Failed to fetch trending artists', e);
      return [];
    }
  }

  /**
   * Fetches global playlists by searching iTunes for playlist entities.
   * Uses diverse themes to simulate a rich, dynamic homepage.
   */
  static async getGlobalPlaylists(themes: string[], limit = 5): Promise<any[]> {
    const playlists: any[] = [];
    
    for (const theme of themes) {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(theme)}&entity=musicTrack&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
           // We map a cluster of tracks into a "Playlist" collection
           playlists.push({
             id: `itunes-pl-${theme.replace(/\s+/g, '-').toLowerCase()}`,
             title: theme,
             subtitle: 'Global Curated Playlist',
             type: 'playlist',
             image: data.results[0].artworkUrl100?.replace('100x100', '500x500') || '',
             tracks: data.results.map((t: any) => ({
                id: t.trackId.toString(),
                title: t.trackName,
                artist: t.artistName,
                image: t.artworkUrl100?.replace('100x100', '500x500') || '',
             }))
           });
        }
      } catch (e) {
        console.warn(`Failed to fetch playlist for theme: ${theme}`);
      }
    }
    
    return playlists;
  }
}
