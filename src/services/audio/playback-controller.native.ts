import TrackPlayer, { State, RepeatMode, Track } from 'react-native-track-player';
import { Alert } from 'react-native';
import type { PlayerTrack } from '@/features/player/player.types';
import { setupTrackPlayer } from './track-player.native';

let pendingTrackId: string | null = null;

let globalContextName: string | undefined;
let globalContextId: string | undefined;
let globalIsShuffled: boolean = false;

export function getPlayerContext() {
  return { name: globalContextName, id: globalContextId };
}

export function getIsShuffled() {
  return globalIsShuffled;
}

export function setIsShuffledGlobal(val: boolean) {
  globalIsShuffled = val;
}

function buildTrack(track: PlayerTrack): Track {
  return {
    id: track.id,
    url: track.streamUrl,
    title: track.title,
    artist: track.artist,
    artwork: track.artworkUrl,
    duration: track.durationSeconds ?? undefined,
    hasLyrics: track.hasLyrics,
    contextName: track.contextName,
    contextId: track.contextId,
    albumId: track.albumId,
  };
}

async function ensureConfigured() {
  await setupTrackPlayer();
}

export async function loadTrackQueue(
  tracks: PlayerTrack[],
  activeTrackId: string,
  options?: { autoplay?: boolean },
) {
  if (tracks.length === 0) return;

  await ensureConfigured();
  
  // Filter out completely unplayable tracks to prevent the entire batch from crashing the engine.
  const validTracks = tracks.filter(t => t.streamUrl && t.streamUrl.trim() !== '');
  if (validTracks.length === 0) return;

  const index = Math.max(0, validTracks.findIndex((track) => track.id === activeTrackId));
  const tpTracks = validTracks.map(buildTrack);
  
  try {
    // 1. Immediately inject the requested track into the queue to make it the active track instantly.
    // Using setQueue completely replaces the queue without destroying the player state (like reset does).
    // This entirely prevents the Mini Player from disappearing and reappearing.
    const activeTpTrack = tpTracks[index];
    if (activeTpTrack) {
      await TrackPlayer.setQueue([activeTpTrack]);
      
      // 2. Start playback immediately so the user doesn't wait for the rest of the queue
      if (options?.autoplay ?? true) {
        await TrackPlayer.play();
      }

      // 3. Silently reconstruct the queue around the actively playing track
      if (index > 0) {
        const beforeTracks = tpTracks.slice(0, index);
        // Insert before index 0. The engine shifts the active track index safely to `index`
        await TrackPlayer.add(beforeTracks, 0);
      }
      
      if (index < tpTracks.length - 1) {
        const afterTracks = tpTracks.slice(index + 1);
        await TrackPlayer.add(afterTracks);
      }
      
      // Verification: Check if active track was successfully set
      const verifyTrack = await TrackPlayer.getActiveTrack();
      if (!verifyTrack || verifyTrack.id !== activeTrackId) {
        console.warn(`Playback Sync Warning: Active track mismatch. Expected ${activeTrackId}, got ${verifyTrack?.id}`);
      }
    }
  } catch (error) {
    console.error('Playback Pipeline Error: Exception during queue load', error);
    Alert.alert('Playback Error', 'An unexpected error occurred while loading the track.');
  } finally {
    // Clear the lock once the load completes
    if (pendingTrackId === activeTrackId) {
      pendingTrackId = null;
    }
  }
}

export async function playTrack(track: PlayerTrack, queue?: PlayerTrack[]) {
  if (!track || !track.id) {
    console.error('Playback Pipeline Error: Invalid track object provided to playTrack.');
    Alert.alert('Playback Error', 'The selected track is corrupted or invalid.');
    return;
  }

  // Validate the streamUrl directly since we are on pure JioSaavn now
  if (!track.streamUrl || track.streamUrl.trim() === '') {
    console.warn(`Playback Pipeline Warning: Stream URL missing for track ${track.id}.`);
    Alert.alert('Stream Unavailable', 'The audio stream for this track could not be resolved.');
    return;
  }

  await ensureConfigured();
  
  // If the user taps the track currently being loaded, ignore it or toggle
  if (pendingTrackId === track.id) {
    const playbackState = await TrackPlayer.getPlaybackState();
    if (playbackState.state === State.Playing) await TrackPlayer.pause();
    return;
  }
  
  const activeTrack = await TrackPlayer.getActiveTrack();

  if (activeTrack && activeTrack.id === track.id) {
    await togglePlayback();
    return;
  }

  // Set the lock
  pendingTrackId = track.id;
  if (track.contextName) globalContextName = track.contextName;
  if (track.contextId) globalContextId = track.contextId;

  const nextQueue = queue && queue.some((q) => q.id === track.id) ? queue : [track];
  await loadTrackQueue(nextQueue, track.id, { autoplay: true });
}

export async function togglePlayback() {
  await ensureConfigured();
  const playbackState = await TrackPlayer.getPlaybackState();
  const currentState = playbackState.state;

  const isPlaying = currentState === State.Playing || currentState === State.Buffering || currentState === State.Loading;

  if (isPlaying) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function skipToNextTrack() {
  await ensureConfigured();
  await TrackPlayer.skipToNext();
}

export async function skipToPreviousTrack() {
  await ensureConfigured();
  const progress = await TrackPlayer.getProgress();
  
  if (progress.position > 3) {
    await seekTo(0);
    return;
  }
  
  await TrackPlayer.skipToPrevious();
}

export async function seekTo(seconds: number) {
  await ensureConfigured();
  await TrackPlayer.seekTo(seconds);
}

export async function getUpcomingTrack(): Promise<Track | null> {
  await ensureConfigured();
  const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
  const queue = await TrackPlayer.getQueue();
  
  if (activeTrackIndex === undefined || activeTrackIndex < 0 || activeTrackIndex >= queue.length - 1) return null;
  return queue[activeTrackIndex + 1] ?? null;
}

export async function toggleShuffle() {
  await ensureConfigured();
  
  const queue = await TrackPlayer.getQueue();
  const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
  
  if (activeTrackIndex === undefined || activeTrackIndex < 0 || queue.length <= 1) return;
  
  const activeTrack = queue[activeTrackIndex];
  if (!activeTrack) return;

  const upcomingTracks = queue.slice(activeTrackIndex + 1).filter((t): t is Track => t !== undefined);
  
  for (let i = upcomingTracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tempI = upcomingTracks[i];
    const tempJ = upcomingTracks[j];
    if (tempI && tempJ) {
      upcomingTracks[i] = tempJ;
      upcomingTracks[j] = tempI;
    }
  }
  
  // To avoid restarting playback, we remove upcoming tracks and append the shuffled ones
  const indicesToRemove = Array.from({ length: queue.length - activeTrackIndex - 1 }, (_, i) => activeTrackIndex + 1 + i);
  if (indicesToRemove.length > 0) {
    await TrackPlayer.remove(indicesToRemove);
  }
  
  if (upcomingTracks.length > 0) {
    await TrackPlayer.add(upcomingTracks);
  }
}

export async function toggleRepeat() {
  await ensureConfigured();
  const repeatMode = await TrackPlayer.getRepeatMode();
  
  if (repeatMode === RepeatMode.Off) {
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  } else if (repeatMode === RepeatMode.Queue) {
    await TrackPlayer.setRepeatMode(RepeatMode.Track);
  } else {
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
  }
  return await TrackPlayer.getRepeatMode();
}

export async function resetPlayback() {
  try {
    const TrackPlayer = (await import('react-native-track-player')).default;
    await TrackPlayer.pause();
    await TrackPlayer.reset();
  } catch (error) {
    console.warn('Could not reset playback', error);
  }
}
