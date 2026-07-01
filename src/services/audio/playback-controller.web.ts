import type { PlayerTrack } from '@/features/player/player.types';

export function getPlayerContext() {
  return { name: undefined, id: undefined };
}

export function getIsShuffled() {
  return false;
}

export function setIsShuffledGlobal(val: boolean) {}

export async function loadTrackQueue(
  tracks: PlayerTrack[],
  activeTrackId: string,
  options?: { autoplay?: boolean }
) {}

export async function playTrack(track: PlayerTrack, queue?: PlayerTrack[]) {}

export async function togglePlayback() {}

export async function skipToNextTrack() {}

export async function skipToPreviousTrack() {}

export async function seekTo(seconds: number) {}

export async function getUpcomingTrack(): Promise<any | null> {
  return null;
}

export async function toggleShuffle() {}

export async function toggleRepeat() {}

export async function resetPlayback() {}
