import type { PlayerTrack } from '@/features/player/player.types';

export function toPlayerTrack(track: any): PlayerTrack {
  return {
    albumId: track.albumId,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
    durationSeconds: track.durationSeconds,
    id: track.id,
    streamUrl: track.streamUrl,
    title: track.title,
    pluginId: (track as any).provider,
    isPluginTrack: (track as any).isPluginTrack,
  };
}

export function toPlayerQueue(tracks: any[]) {
  return tracks.map(toPlayerTrack);
}
