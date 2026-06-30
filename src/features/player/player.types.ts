export type PlayerTrack = {
  albumId: string | null;
  artist: string;
  artworkUrl: string;
  durationSeconds: number | null;
  id: string;
  streamUrl: string;
  title: string;
  isPluginTrack?: boolean;
  pluginId?: string;
  hasLyrics?: boolean;
  contextName?: string;
  contextId?: string;
};

export function formatPlayerTime(totalSeconds: number) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
