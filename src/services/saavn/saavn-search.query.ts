import CryptoJS from 'crypto-js';
import { fetchSaavn } from '@/services/saavn/api-client';

const DES_KEY = '38346591';

export function decryptUrl(url: string): string {
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(url) } as any,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt URL', error);
    return '';
  }
}

export async function fetchSaavnSearch(query: string, options?: { signal?: AbortSignal }, type: 'all' | 'songs' | 'albums' | 'playlists' | 'artists' = 'all') {
  if (!query) return [];

  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&_marker=0&ctx=wap6dot0`;
    const searchJson = await fetchSaavn(url, { signal: options?.signal });

    const trackDetails = searchJson.results || [];
    if (trackDetails.length === 0) return [];

    const results = [];

    for (const track of trackDetails) {
      if (!track) continue;

      const title = track.song || track.title || 'Unknown';
      let artworkUrl = track.image || '';
      artworkUrl = artworkUrl.replace('150x150', '500x500').replace('50x50', '500x500');

      let streamUrl = '';
      if (track.encrypted_media_url) {
        streamUrl = decryptUrl(track.encrypted_media_url);
      }

      // Remove mp4 to m4a replacement as ExoPlayer fully supports mp4 audio and forcing m4a causes 404s on newer streams
      
      const has320 = track.more_info?.['320kbps'] === 'true' || track['320kbps'] === 'true';
      if (streamUrl && has320) {
        streamUrl = streamUrl.replace(/_\d+\.m4a/, '_320.m4a');
      } else if (streamUrl && !has320) {
        streamUrl = streamUrl.replace('_96.m4a', '_160.m4a');
      }

      results.push({
        id: `saavn-${track.id}`,
        title: title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        artist: track.primary_artists || track.singers || 'Unknown Artist',
        artworkUrl: artworkUrl,
        streamUrl: streamUrl,
        provider: 'JioSaavn',
        albumTitle: track.album || '',
        albumId: track.albumid ? `saavn-album-${track.albumid}` : '',
        durationSeconds: parseInt(track.duration || '0', 10),
      });
    }

    return results;
  } catch (error) {
    console.error('Saavn Search Error:', error);
    return [];
  }
}

export async function fetchSaavnAlbumTracks(rawId: string) {
  try {
    const json = await fetchSaavn(`https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&albumid=${rawId}&_format=json&_marker=0&ctx=wap6dot0`);
    
    if (!json || !json.list) {
      throw new Error('Album not found');
    }

    const tracks = json.list.map((track: any, index: number) => {
      const title = track.song || track.title || 'Unknown';
      let artworkUrl = track.image || '';
      artworkUrl = artworkUrl.replace('150x150', '500x500').replace('50x50', '500x500');

      let streamUrl = '';
      if (track.encrypted_media_url) {
        streamUrl = decryptUrl(track.encrypted_media_url);
      }
      if (streamUrl && !streamUrl.includes('.mp4') && !streamUrl.includes('.m4a') && !streamUrl.includes('.mp3')) {
        streamUrl = streamUrl.replace('.mp4', '.m4a');
      }

      return {
        id: `saavn-${track.id}`,
        title: title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        artist: track.primary_artists || track.singers || 'Unknown Artist',
        artworkUrl: artworkUrl,
        streamUrl: streamUrl,
        durationSeconds: parseInt(track.duration || '0', 10),
        playCount: 0,
        position: index,
        albumId: `saavn-album-${rawId}`,
      };
    });

    let albumArtwork = json.image || '';
    albumArtwork = albumArtwork.replace('150x150', '500x500').replace('50x50', '500x500');

    return {
      playlist: {
        id: `saavn-album-${rawId}`,
        name: (json.title || json.name || 'Unknown Album').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        description: json.primary_artists || '',
        artworkUrl: albumArtwork,
        songCount: tracks.length,
        playCount: 0,
        followerCount: 0,
        visibility: 'public'
      },
      tracks
    };
  } catch (error) {
    console.error('Saavn Album Fetch Error:', error);
    throw error;
  }
}
