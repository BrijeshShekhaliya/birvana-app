import type { IMusicProvider } from './IMusicProvider';
import type { UnifiedHomeData, UnifiedPlaylist, UnifiedArtist, UnifiedTrack, UnifiedCollection } from './models';

// Array of 12 distinct royalty-free tracks
const mockTracks: UnifiedTrack[] = [
  {
    id: 'rf-1', title: 'Midnight Chill', artistString: 'Lofi Vibes',
    primaryArtists: [{ id: 'rf-artist-1', name: 'Lofi Vibes' }], albumId: 'rf-album-1',
    artworkUrl: 'https://picsum.photos/seed/rf1/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 140, playCount: 15400, position: 0,
  },
  {
    id: 'rf-2', title: 'Summer Breeze', artistString: 'Acoustic Soul',
    primaryArtists: [{ id: 'rf-artist-2', name: 'Acoustic Soul' }], albumId: 'rf-album-1',
    artworkUrl: 'https://picsum.photos/seed/rf2/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 165, playCount: 12000, position: 1,
  },
  {
    id: 'rf-3', title: 'Neon Lights', artistString: 'Synthwave Maker',
    primaryArtists: [{ id: 'rf-artist-3', name: 'Synthwave Maker' }], albumId: 'rf-album-2',
    artworkUrl: 'https://picsum.photos/seed/rf3/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 180, playCount: 9800, position: 2,
  },
  {
    id: 'rf-4', title: 'Morning Dew', artistString: 'Nature Sounds',
    primaryArtists: [{ id: 'rf-artist-4', name: 'Nature Sounds' }], albumId: 'rf-album-3',
    artworkUrl: 'https://picsum.photos/seed/rf4/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 135, playCount: 22000, position: 3,
  },
  {
    id: 'rf-5', title: 'City Beats', artistString: 'Urban Groove',
    primaryArtists: [{ id: 'rf-artist-5', name: 'Urban Groove' }], albumId: 'rf-album-2',
    artworkUrl: 'https://picsum.photos/seed/rf5/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 190, playCount: 18500, position: 4,
  },
  {
    id: 'rf-6', title: 'Ocean Waves', artistString: 'Ambient Dreams',
    primaryArtists: [{ id: 'rf-artist-6', name: 'Ambient Dreams' }], albumId: 'rf-album-4',
    artworkUrl: 'https://picsum.photos/seed/rf6/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 210, playCount: 31000, position: 5,
  },
  {
    id: 'rf-7', title: 'Forest Hike', artistString: 'Nature Sounds',
    primaryArtists: [{ id: 'rf-artist-4', name: 'Nature Sounds' }], albumId: 'rf-album-3',
    artworkUrl: 'https://picsum.photos/seed/rf7/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 145, playCount: 8900, position: 6,
  },
  {
    id: 'rf-8', title: 'Deep Space', artistString: 'Ambient Dreams',
    primaryArtists: [{ id: 'rf-artist-6', name: 'Ambient Dreams' }], albumId: 'rf-album-4',
    artworkUrl: 'https://picsum.photos/seed/rf8/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 205, playCount: 14200, position: 7,
  },
  {
    id: 'rf-9', title: 'Coffee Shop', artistString: 'Lofi Vibes',
    primaryArtists: [{ id: 'rf-artist-1', name: 'Lofi Vibes' }], albumId: 'rf-album-1',
    artworkUrl: 'https://picsum.photos/seed/rf9/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 155, playCount: 27000, position: 8,
  },
  {
    id: 'rf-10', title: 'Sunset Drive', artistString: 'Synthwave Maker',
    primaryArtists: [{ id: 'rf-artist-3', name: 'Synthwave Maker' }], albumId: 'rf-album-2',
    artworkUrl: 'https://picsum.photos/seed/rf10/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 175, playCount: 11500, position: 9,
  },
  {
    id: 'rf-11', title: 'Acoustic Fire', artistString: 'Acoustic Soul',
    primaryArtists: [{ id: 'rf-artist-2', name: 'Acoustic Soul' }], albumId: 'rf-album-1',
    artworkUrl: 'https://picsum.photos/seed/rf11/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 150, playCount: 16800, position: 10,
  },
  {
    id: 'rf-12', title: 'Street Jazz', artistString: 'Urban Groove',
    primaryArtists: [{ id: 'rf-artist-5', name: 'Urban Groove' }], albumId: 'rf-album-2',
    artworkUrl: 'https://picsum.photos/seed/rf12/300/300',
    streamUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', durationSeconds: 195, playCount: 20100, position: 11,
  },
];

const mockPlaylists: UnifiedCollection[] = [
  { id: 'rf-pl-1', title: 'Relaxing Lofi', subtitle: 'Perfect for studying', imageUrl: mockTracks[0].artworkUrl, type: 'playlist' },
  { id: 'rf-pl-2', title: 'Electronic Vibes', subtitle: 'Upbeat and energetic', imageUrl: mockTracks[2].artworkUrl, type: 'playlist' },
  { id: 'rf-pl-3', title: 'Acoustic Covers', subtitle: 'Calm acoustic guitar', imageUrl: mockTracks[1].artworkUrl, type: 'playlist' },
  { id: 'rf-pl-4', title: 'Nature Sounds', subtitle: 'Relax and unwind', imageUrl: mockTracks[5].artworkUrl, type: 'playlist' },
];

const mockAlbums: UnifiedCollection[] = [
  { id: 'rf-al-1', title: 'Lofi Study Session', subtitle: 'Lofi Vibes', imageUrl: mockTracks[8].artworkUrl, type: 'album' },
  { id: 'rf-al-2', title: 'Midnight Drive', subtitle: 'Synthwave Maker', imageUrl: mockTracks[9].artworkUrl, type: 'album' },
  { id: 'rf-al-3', title: 'Urban Jazz', subtitle: 'Urban Groove', imageUrl: mockTracks[11].artworkUrl, type: 'album' },
];

const mockArtists = [
  { id: 'rf-artist-1', name: 'Lofi Vibes', imageUrl: mockTracks[0].artworkUrl },
  { id: 'rf-artist-2', name: 'Acoustic Soul', imageUrl: mockTracks[1].artworkUrl },
  { id: 'rf-artist-3', name: 'Synthwave Maker', imageUrl: mockTracks[2].artworkUrl },
  { id: 'rf-artist-4', name: 'Nature Sounds', imageUrl: mockTracks[3].artworkUrl },
  { id: 'rf-artist-5', name: 'Urban Groove', imageUrl: mockTracks[4].artworkUrl },
  { id: 'rf-artist-6', name: 'Ambient Dreams', imageUrl: mockTracks[5].artworkUrl },
];

export class RoyaltyFreeProvider implements IMusicProvider {
  id = 'royalty-free';
  name = 'Royalty Free';

  async getHomeContent(): Promise<UnifiedHomeData> {
    return {
      charts: [
        { id: 'rf-chart-1', title: 'Top 50 Global', subtitle: 'Royalty Free', imageUrl: mockTracks[0].artworkUrl, type: 'playlist' },
        { id: 'rf-chart-2', title: 'Trending Today', subtitle: 'Most played', imageUrl: mockTracks[2].artworkUrl, type: 'playlist' },
      ],
      newAlbums: mockAlbums,
      topPlaylists: mockPlaylists,
      discover: [mockPlaylists[2], mockPlaylists[3]],
      trending: mockTracks.slice(0, 5),
      popularArtists: mockArtists.map(a => ({ id: a.id, title: a.name, subtitle: 'Artist', imageUrl: a.imageUrl, type: 'artist' })),
      allPlaylists: mockPlaylists
    };
  }

  async getPlaylistDetails(id: string, type?: 'playlist' | 'channel'): Promise<UnifiedPlaylist> {
    const playlist = mockPlaylists.find(p => p.id === id) || mockPlaylists[0];
    return {
      id: id,
      name: playlist.title,
      description: playlist.subtitle || 'A royalty free collection',
      artworkUrl: playlist.imageUrl || mockTracks[0].artworkUrl,
      songCount: 12,
      followerCount: 5000,
      playCount: 12000,
      visibility: 'public',
      tracks: mockTracks
    };
  }

  async getAlbumDetails(id: string): Promise<UnifiedPlaylist> {
    const album = mockAlbums.find(a => a.id === id) || mockAlbums[0];
    return {
      id: id,
      name: album.title,
      description: `Album by ${album.subtitle}`,
      artworkUrl: album.imageUrl || mockTracks[0].artworkUrl,
      songCount: 12,
      followerCount: 0,
      playCount: 0,
      visibility: 'public',
      tracks: mockTracks
    };
  }

  async getArtistDetails(id: string): Promise<UnifiedArtist> {
    const artist = mockArtists.find(a => a.id === id) || mockArtists[0];
    return {
      id: id,
      name: artist.name,
      subtitle: 'Artist',
      imageUrl: artist.imageUrl,
      followerCount: 15000,
      isVerified: true,
      dominantLanguage: 'en',
      topSongs: mockTracks.filter(t => t.primaryArtists?.[0]?.id === id),
      topAlbums: mockAlbums.filter(a => a.subtitle === artist.name),
      singles: [],
      similarArtists: []
    };
  }

  async getArtistMoreSongs(id: string, page: number): Promise<{ items: UnifiedTrack[], hasMore: boolean }> {
    const songs = mockTracks.filter(t => t.primaryArtists?.[0]?.id === id);
    return { items: songs, hasMore: false };
  }

  async getPaginatedAlbums(page: number, limit: number): Promise<UnifiedCollection[]> {
    return mockAlbums;
  }

  async search(query: string, type: 'song' | 'album' | 'playlist' | 'artist', page: number, limit: number): Promise<any[]> {
    const q = query.toLowerCase();
    if (type === 'song') return mockTracks.filter(t => t.title.toLowerCase().includes(q));
    if (type === 'playlist') return mockPlaylists.filter(p => p.title.toLowerCase().includes(q));
    if (type === 'album') return mockAlbums.filter(a => a.title.toLowerCase().includes(q));
    if (type === 'artist') return mockArtists.filter(a => a.name.toLowerCase().includes(q));
    return [];
  }
}
