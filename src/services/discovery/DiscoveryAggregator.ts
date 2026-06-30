import { fetchSaavn } from '@/services/saavn/api-client';
import { ContentValidator } from '@/services/validation/ContentValidator';
import type { UnifiedCollection, UnifiedTrack } from '@/services/providers/models';

export class DiscoveryAggregator {
  
  static async getDynamicPopularArtists(providerMapCollection: (item: any, type: 'artist') => UnifiedCollection): Promise<UnifiedCollection[]> {
    // Top global artists for the carousel
    const THEMES = ['Ed Sheeran', 'The Weeknd', 'Taylor Swift', 'Dua Lipa', 'BTS', 'Drake', 'Bad Bunny', 'Eminem', 'Rihanna', 'Ariana Grande', 'Justin Bieber'];
    const shuffled = THEMES.sort(() => 0.5 - Math.random()).slice(0, 10);

    const promises = shuffled.map(async (name) => {
      const q = encodeURIComponent(name);
      const url = `https://www.jiosaavn.com/api.php?__call=search.getArtistResults&q=${q}&n=1&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
      const res = await fetchSaavn(url);
      
      const firstHit = res?.results?.[0];
      if (!firstHit) return null;
      
      return providerMapCollection(firstHit, 'artist');
    });

    const results = await Promise.allSettled(promises);
    const resolvedArtists = results
      .filter((r): r is PromiseFulfilledResult<UnifiedCollection> => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value);

    return ContentValidator.validateCollections(resolvedArtists);
  }

  static async getDynamicTrendingTracks(providerMapTrack: (item: any, idx: number) => UnifiedTrack): Promise<UnifiedTrack[]> {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=top+charts+global&n=15&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const res = await fetchSaavn(url);
    const hits = res?.results || [];
    const tracks = hits.map((t: any, idx: number) => providerMapTrack(t, idx));
    return ContentValidator.validateTracks(tracks);
  }

  static async getDynamicPlaylists(providerMapCollection: (item: any, type: 'playlist') => UnifiedCollection): Promise<UnifiedCollection[]> {
    const THEMES = [
      'Global Top 50', 'Billboard Hot 100', 'Viral Hits', 'Pop Rising',
      'Lo-Fi Beats', 'Acoustic Chill', 'Gym Motivation', 'Romance',
      'K-Pop', 'Afrobeats', 'Focus', 'Party Hits', 'TikTok Viral',
      'New Music Friday', 'Rap Caviar', 'Indie Mix', 'Gaming Music',
      'Jazz Classics', 'Classical Focus', 'EDM Bangers'
    ];
    
    // Pick 5 random themes
    const shuffled = THEMES.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const promises = shuffled.map(async (theme) => {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&q=${encodeURIComponent(theme)}&n=5&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
      const res = await fetchSaavn(url);
      
      const results = res?.results || [];
      return results.map((p: any) => providerMapCollection(p, 'playlist'));
    });

    const results = await Promise.allSettled(promises);
    
    const resolvedPlaylists = results
      .filter((r): r is PromiseFulfilledResult<UnifiedCollection[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    return ContentValidator.validateCollections(resolvedPlaylists);
  }
}
