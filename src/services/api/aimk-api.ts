import { env } from '@/config/env';

const TIMEOUT_MS = 8000;

class AimkApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AimkApiError';
  }
}

async function aimkFetch<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(`${env.aimkApiUrl}${path}`, {
      headers: { Accept: 'application/json' },
      method: 'GET',
      signal: combinedSignal,
    });

    if (!response.ok) {
      throw new AimkApiError(
        `Aimk API error: ${response.status}`,
        response.status,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- Types ---

export type AimkTrack = {
  albumId?: string | null;
  albumTitle?: string | null;
  artist: string;
  artworkUrl: string;
  directStreamUrl?: string | null;
  durationSeconds?: number | null;
  id: string;
  lazyStreamUrl?: string;
  playCount?: number;
  position?: number;
  provider?: string;
  providerKey?: string;
  proxyArtworkUrl?: string;
  proxyStreamUrl?: string;
  streamUrl: string;
  title: string;
  titleMatch?: boolean;
  trackUrl?: string | null;
};

export type AimkPlaylistSummary = {
  artworkUrl: string;
  description?: string;
  id: string;
  name: string;
  playCount?: number;
  provider?: string;
  providerKey?: string;
  proxyArtworkUrl?: string;
  songCount?: number;
  sourceUrl?: string | null;
  spotifyId?: string | null;
};

type TrackSearchResponse = {
  count: number;
  items: AimkTrack[];
  notes?: string[];
  query: string;
  source: string;
  tookMs?: number;
};

type PlaylistSearchResponse = {
  count: number;
  items: AimkPlaylistSummary[];
  notes?: string[];
  query: string;
  searchMode?: string;
};

type PopularTracksResponse = {
  items: AimkTrack[];
  playlist?: AimkPlaylistSummary;
};

type PopularPlaylistsResponse = {
  items: AimkPlaylistSummary[];
};

type PlaylistDetailResponse = {
  playlist: AimkPlaylistSummary & {
    followerCount?: number;
    visibility?: string;
  };
  tracks: AimkTrack[];
};

// --- API functions ---

export async function searchTracks(
  query: string,
  options?: { limit?: number; signal?: AbortSignal; source?: string },
): Promise<TrackSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(options?.limit ?? 12),
    source: options?.source ?? 'spotify',
    eager: '0',
  });

  return aimkFetch<TrackSearchResponse>(
    `/api/mobile/search/tracks?${params}`,
    options?.signal,
  );
}

export async function searchPlaylists(
  query: string,
  options?: { limit?: number; signal?: AbortSignal },
): Promise<PlaylistSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(options?.limit ?? 10),
  });

  return aimkFetch<PlaylistSearchResponse>(
    `/api/mobile/search/playlists?${params}`,
    options?.signal,
  );
}

export async function getPopularTracks(
  options?: { limit?: number; playlistId?: string; signal?: AbortSignal },
): Promise<PopularTracksResponse> {
  const params = new URLSearchParams({
    limit: String(options?.limit ?? 10),
  });

  if (options?.playlistId) {
    params.set('playlistId', options.playlistId);
  }

  return aimkFetch<PopularTracksResponse>(
    `/api/mobile/popular-tracks?${params}`,
    options?.signal,
  );
}

export async function getPopularPlaylists(
  options?: { limit?: number; signal?: AbortSignal },
): Promise<PopularPlaylistsResponse> {
  const params = new URLSearchParams({
    limit: String(options?.limit ?? 10),
  });

  return aimkFetch<PopularPlaylistsResponse>(
    `/api/mobile/popular-playlists?${params}`,
    options?.signal,
  );
}

export async function getPlaylistDetails(
  playlistId: string,
  options?: { signal?: AbortSignal },
): Promise<PlaylistDetailResponse> {
  return aimkFetch<PlaylistDetailResponse>(
    `/api/mobile/playlists/${encodeURIComponent(playlistId)}`,
    options?.signal,
  );
}
