import { DiscoveryAggregator } from '../discovery/DiscoveryAggregator';
import type { IMusicProvider } from './IMusicProvider';
import type { 
  UnifiedHomeData, 
  UnifiedPlaylist, 
  UnifiedCollection, 
  UnifiedArtist, 
  UnifiedTrack 
} from './models';

import { fetchSaavn } from '@/services/saavn/api-client';
import { decryptUrl } from '@/services/saavn/saavn-search.query';
import { ContentValidator } from '../validation/ContentValidator';
import { SearchRelevanceEngine } from '../search/SearchRelevanceEngine';

export class JioSaavnProvider implements IMusicProvider {
  get id() { return 'jiosaavn'; }
  get name() { return 'JioSaavn'; }

  private mapTrack(track: any, index: number): UnifiedTrack {
    let artworkUrl = track.image || track.artwork || '';
    artworkUrl = artworkUrl.replace('150x150', '500x500').replace('50x50', '500x500');

    let streamUrl = '';
    const encUrl = track.more_info?.encrypted_media_url || track.encrypted_media_url;
    if (encUrl) streamUrl = decryptUrl(encUrl);

    // Only aggressively upgrade to 320kbps if the CDN actually has it, otherwise it causes 403 Forbidden
    if (streamUrl && track.more_info?.['320kbps'] === 'true') {
      streamUrl = streamUrl.replace(/_\d+\.m4a/, '_320.m4a');
    } else if (streamUrl && track.more_info?.['320kbps'] !== 'true') {
      // Safely upgrade 96 to 160 if 320 isn't available, or leave it alone
      streamUrl = streamUrl.replace('_96.m4a', '_160.m4a');
    }

    let artistString = track.subtitle || '';
    
    if (!artistString || artistString === 'Unknown Artist' || artistString === 'Various Artists') {
      if (typeof track.more_info?.singers === 'string' && track.more_info.singers) {
        artistString = track.more_info.singers;
      } else if (typeof track.more_info?.primary_artists === 'string' && track.more_info.primary_artists) {
        artistString = track.more_info.primary_artists;
      } else if (typeof track.singers === 'string' && track.singers) {
        artistString = track.singers;
      } else if (typeof track.primary_artists === 'string' && track.primary_artists) {
        artistString = track.primary_artists;
      } else {
        artistString = 'Unknown Artist';
      }
    }
    
    let primaryArtists = [];
    if (track.more_info?.artistMap?.primary_artists && track.more_info.artistMap.primary_artists.length > 0) {
      primaryArtists = track.more_info.artistMap.primary_artists.map((a: any) => ({
        id: a.id,
        name: a.name,
      }));
      artistString = primaryArtists.map((a: any) => a.name).join(', ');
    } else if (track.more_info?.artistMap?.artists && track.more_info.artistMap.artists.length > 0) {
      artistString = track.more_info.artistMap.artists.map((a: any) => a.name).join(', ');
    }

    return {
      id: track.id,
      title: track.title || track.song || 'Unknown',
      artistString,
      primaryArtists,
      albumId: track.more_info?.album_id || null,
      artworkUrl,
      streamUrl,
      durationSeconds: parseInt(track.more_info?.duration || '0', 10) || null,
      playCount: parseInt(track.play_count || '0', 10) || 0,
      position: index + 1,
      hasLyrics: track.more_info?.has_lyrics === 'true',
    };
  }

  private mapCollection(item: any, type: 'playlist' | 'album' | 'channel' | 'artist'): UnifiedCollection {
    let subtitle = item.subtitle || '';
    if (type === 'album' && item.more_info?.artistMap?.artists?.length) {
      subtitle = item.more_info.artistMap.artists.map((a: any) => a.name).join(', ');
    }
    let imageUrl = item.image || item.image_url || '';
    imageUrl = imageUrl.replace('150x150', '500x500').replace('50x50', '500x500');

    return {
      id: item.id,
      title: item.title || item.name || '',
      subtitle,
      imageUrl,
      type,
    };
  }

  async getHomeContent(): Promise<UnifiedHomeData> {
    ContentValidator.resetCache();

    // Static Categories for "Browse & Discover"
    const DISCOVER_CATEGORIES = [
      { id: '87510850', title: 'Romance' },
      { id: '87109788', title: 'Hip Hop' },
      { id: '303128179', title: 'Pop' },
      { id: '73399784', title: 'Workout' },
      { id: '1077765822', title: 'Electronic' },
      { id: '245543595', title: 'Rock' },
      { id: '31533921', title: 'Jazz' },
      { id: '158049570', title: 'Chill' },
      { id: '88850418', title: 'Party' },
      { id: '78037123', title: 'Acoustic' },
      { id: '75008570', title: 'Focus' }
    ];

    try {
      const englishOptions = { headers: { Cookie: 'L=english;' } };
      
      // 1. Start all global data fetches concurrently
      const popularArtistsPromise = DiscoveryAggregator.getDynamicPopularArtists((a, t) => this.mapCollection(a, t));

      // 2. Fetch extensive, dynamic global playlists using JioSaavn's search index
      const chartsPromise = fetchSaavn(`https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&q=${encodeURIComponent('Top Chart English')}&n=15&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`, englishOptions);
      const popularPromise = fetchSaavn(`https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&q=${encodeURIComponent('Popular English')}&n=25&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`, englishOptions);
      const endlessPromise = fetchSaavn(`https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&q=${encodeURIComponent('English')}&n=50&p=1&api_version=4&_format=json&_marker=0&ctx=wap6dot0`, englishOptions);
      
      // 3. Fetch primary global playlist for trending tracks
      const trendingPlaylistPromise = fetchSaavn(`https://www.jiosaavn.com/api.php?__call=playlist.getDetails&listid=1134595537&api_version=4&_format=json&_marker=0&ctx=wap6dot0`, englishOptions);

      // 4. Fetch static category playlists for "Browse & Discover"
      const discoverPromises = DISCOVER_CATEGORIES.map(async (cat) => {
        const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&listid=${cat.id}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
        const res = await fetchSaavn(url, englishOptions);
        if (!res) return null;
        const mapped = this.mapCollection(res, 'playlist');
        mapped.title = cat.title; 
        return mapped;
      });

      // Await all top-level promises
      const [
        popularArtists,
        chartsRes,
        popularRes,
        endlessRes,
        trendingRes,
        discoverResRaw
      ] = await Promise.all([
        popularArtistsPromise,
        chartsPromise,
        popularPromise,
        endlessPromise,
        trendingPlaylistPromise,
        Promise.allSettled(discoverPromises)
      ]);

      // Process mapped playlists
      const charts = chartsRes?.results?.map((p: any) => this.mapCollection(p, 'playlist')) || [];
      const topPlaylists = popularRes?.results?.map((p: any) => this.mapCollection(p, 'playlist')) || [];
      const allPlaylists = endlessRes?.results?.map((p: any) => this.mapCollection(p, 'playlist')) || [];

      // Process trending tracks
      const trackList = Array.isArray(trendingRes?.list) ? trendingRes.list : [];
      const rawTrending = trackList.slice(0, 15).map((t: any, i: number) => this.mapTrack(t, i));

      // Process discover categories
      const discover = discoverResRaw
        .filter((r): r is PromiseFulfilledResult<UnifiedCollection> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      return {
        charts: ContentValidator.validateCollections(charts),
        newAlbums: [], 
        topPlaylists: ContentValidator.validateCollections(topPlaylists),
        discover: ContentValidator.validateCollections(discover), 
        trending: ContentValidator.validateTracks(rawTrending),
        popularArtists,
        allPlaylists: ContentValidator.validateCollections(allPlaylists),
      };
    } catch (error) {
      console.warn('Failed to load global home content:', error);
      return { charts: [], newAlbums: [], topPlaylists: [], discover: [], trending: [], popularArtists: [], allPlaylists: [] };
    }
  }

  async getPlaylistDetails(id: string, type: 'playlist' | 'channel' = 'playlist'): Promise<UnifiedPlaylist> {
    const isChannel = type === 'channel';
    const call = isChannel ? 'channel.getDetails' : 'playlist.getDetails';
    const param = isChannel ? 'channel_id' : 'listid';
    
    const url = `https://www.jiosaavn.com/api.php?__call=${call}&${param}=${id}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const data = await fetchSaavn(url);
    if (!data || data.error) throw new Error(`Provider Error: ${id}`);

    const name = data.title || data.name || data.listname || `Playlist`;
    let artworkUrl = data.image || data.artwork || '';
    artworkUrl = artworkUrl.replace('150x150', '500x500').replace('50x50', '500x500');

    const trackList = Array.isArray(data.top_songs) ? data.top_songs : (Array.isArray(data.list) ? data.list : (Array.isArray(data.songs) ? data.songs : []));
    const tracks = trackList.map((t: any, i: number) => this.mapTrack(t, i));

    return {
      id: data.id || data.listid || id,
      name,
      description: data.header_desc || data.subtitle || '',
      artworkUrl,
      songCount: tracks.length,
      followerCount: parseInt(data.fan_count || '0', 10) || 0,
      playCount: parseInt(data.play_count || '0', 10) || 0,
      visibility: data.type || 'public',
      tracks,
    };
  }

  async getAlbumDetails(id: string): Promise<UnifiedPlaylist> {
    const url = `https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&albumid=${id}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const data = await fetchSaavn(url);
    if (!data || data.error) throw new Error(`Album Error: ${id}`);

    const name = data.title || data.name || `Album`;
    let artworkUrl = data.image || '';
    artworkUrl = artworkUrl.replace('150x150', '500x500').replace('50x50', '500x500');

    const trackList = Array.isArray(data.list) ? data.list : (Array.isArray(data.songs) ? data.songs : []);
    const tracks = trackList.map((t: any, i: number) => this.mapTrack(t, i));

    return {
      id: data.albumid || id,
      name,
      description: data.primary_artists || data.subtitle || '',
      artworkUrl,
      songCount: tracks.length,
      followerCount: parseInt(data.fan_count || '0', 10) || 0,
      playCount: parseInt(data.play_count || '0', 10) || 0,
      visibility: 'public',
      tracks,
    };
  }

  async getArtistDetails(id: string): Promise<UnifiedArtist> {
    const url = `https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&artistId=${id}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const data = await fetchSaavn(url);
    if (!data || data.error) throw new Error(`Artist Error: ${id}`);

    let imageUrl = data.image || '';
    imageUrl = imageUrl.replace('150x150', '500x500').replace('50x50', '500x500');

    const topSongs = (data.topSongs || []).map((t: any, i: number) => this.mapTrack(t, i));
    // Filter out compilation albums where the artist is just a minor contributor
    // We expect the artist's name to appear in the subtitle (which usually holds primary artists for albums)
    const isPrimaryRelease = (col: UnifiedCollection) => 
      col.subtitle.toLowerCase().includes(data.name.toLowerCase()) || 
      col.subtitle.split(',').length <= 3; // Or if it's a solo/duo release

    const rawTopAlbums = (data.topAlbums || []).map((a: any) => this.mapCollection(a, 'album')).filter(isPrimaryRelease);
    const rawSingles = (data.singles || []).map((a: any) => this.mapCollection(a, 'album')).filter(isPrimaryRelease);
    const similarArtists = (data.similarArtists || []).map((a: any) => this.mapCollection(a, 'artist'));

    return {
      id: data.artistId || id,
      name: data.name || 'Unknown Artist',
      subtitle: data.subtitle || '',
      imageUrl,
      followerCount: parseInt(data.follower_count || '0', 10) || 0,
      isVerified: Boolean(data.isVerified),
      dominantLanguage: data.dominantLanguage || null,
      topSongs: ContentValidator.validateTracks(topSongs),
      topAlbums: ContentValidator.validateCollections(rawTopAlbums),
      singles: ContentValidator.validateCollections(rawSingles),
      similarArtists: ContentValidator.validateCollections(similarArtists),
    };
  }

  async getArtistMoreSongs(id: string, page: number): Promise<{ items: UnifiedTrack[], hasMore: boolean }> {
    // Note: JioSaavn's artist.getArtistMoreSong strictly uses `page` (not `p`) and ignores `n`.
    const url = `https://www.jiosaavn.com/api.php?__call=artist.getArtistMoreSong&artistId=${id}&page=${page}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const data = await fetchSaavn(url);
    if (!data || data.error) return { items: [], hasMore: false };

    const trackList = Array.isArray(data.topSongs?.songs) ? data.topSongs.songs : [];
    const tracks = trackList.map((t: any, i: number) => this.mapTrack(t, i));
    
    return {
      items: ContentValidator.validateTracks(tracks),
      hasMore: data.topSongs?.last_page === false
    };
  }

  async getPaginatedAlbums(page: number, limit: number): Promise<UnifiedCollection[]> {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&q=new&n=${limit}&p=${page}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
    const data = await fetchSaavn(url);
    return (data.results || []).map((i: any) => this.mapCollection(i, 'album'));
  }

  async search(query: string, type: 'song' | 'album' | 'playlist' | 'artist', page: number, limit: number): Promise<any[]> {
    const q = encodeURIComponent(query);
    const qLower = query.toLowerCase();
    
    const LANGUAGES = ['english', 'hindi', 'punjabi', 'tamil', 'telugu', 'marathi', 'gujarati', 'bengali', 'kannada', 'bhojpuri', 'malayalam', 'urdu'];
    
    // Check if query explicitly mentions a language
    const explicitLanguage = LANGUAGES.find(lang => qLower.includes(lang));
    
    // Determine the languages to search with
    let languagesToSearch = ['english']; // Default fallback
    if (explicitLanguage) {
      languagesToSearch = [explicitLanguage];
    } else if (qLower.includes('top 50') || qLower.includes('top') || qLower.includes('hits')) {
      // If it's a broad playlist search, iterate through many languages to get diverse results
      // The user wants sequential or "one by one" to get diverse outputs.
      languagesToSearch = LANGUAGES;
    }

    const performSearch = async (langUrl: string, langOptions?: any) => {
      const res = await fetchSaavn(langUrl, langOptions);
      return res?.results || [];
    };

    if (type === 'song') {
      const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${q}&n=${limit}&p=${page}&_format=json&_marker=0&api_version=4&ctx=wap6dot0`;
      const res = await performSearch(searchUrl, explicitLanguage ? { headers: { Cookie: `L=${explicitLanguage};` } } : undefined);
      const items = res.map((t: any, i: number) => this.mapTrack(t, i)) || [];
      const valid = ContentValidator.validateTracks(items);
      return SearchRelevanceEngine.sortResults(query, valid);
    }
    
    if (type === 'artist') {
      const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getArtistResults&q=${q}&n=${limit}&p=${page}&_format=json&_marker=0&api_version=4&ctx=wap6dot0`;
      const res = await performSearch(searchUrl, explicitLanguage ? { headers: { Cookie: `L=${explicitLanguage};` } } : undefined);
      const items = res.map((a: any) => this.mapCollection(a, 'artist')) || [];
      const valid = ContentValidator.validateCollections(items);
      return SearchRelevanceEngine.sortResults(query, valid);
    }
    
    if (type === 'album') {
      const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&q=${q}&n=${limit}&p=${page}&_format=json&_marker=0&api_version=4&ctx=wap6dot0`;
      const res = await performSearch(searchUrl, explicitLanguage ? { headers: { Cookie: `L=${explicitLanguage};` } } : undefined);
      const items = res.map((a: any) => this.mapCollection(a, 'album')) || [];
      const valid = ContentValidator.validateCollections(items);
      return SearchRelevanceEngine.sortResults(query, valid);
    }
    
    if (type === 'playlist') {
      // For playlist diversity, fetch from all languages concurrently.
      // Ask for the full limit per language to ensure we don't get limited empty results.
      const searchPromises = languagesToSearch.map(lang => {
        const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&q=${q}&n=${limit}&p=${page}&_format=json&_marker=0&api_version=4&ctx=wap6dot0`;
        return performSearch(searchUrl, { headers: { Cookie: `L=${lang};` } });
      });
      
      const resultsArray = await Promise.all(searchPromises);
      const allPlaylists = resultsArray.flat();
      
      const items = allPlaylists.map((a: any) => this.mapCollection(a, 'playlist'));
      const valid = ContentValidator.validateCollections(items);
      
      // Deduplicate by ID
      const uniquePlaylists = Array.from(new Map(valid.map(item => [item.id, item])).values());
      
      return SearchRelevanceEngine.sortResults(query, uniquePlaylists).slice(0, limit);
    }
    
    return [];
  }

  async getLyrics(trackId: string): Promise<{ lyrics: string; snippet: string } | null> {
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&lyrics_id=${trackId}&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
      const data = await fetchSaavn(url);
      if (data && data.lyrics) {
        return {
          lyrics: data.lyrics.replace(/<br>/g, '\n'),
          snippet: data.snippet || ''
        };
      }
      return null;
    } catch (error) {
      console.warn(`Failed to fetch lyrics for ${trackId}:`, error);
      return null;
    }
  }
}
