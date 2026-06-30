import TrackPlayer, { Event } from 'react-native-track-player';

const runSafely = (command: () => Promise<unknown>) => {
  void command().catch((error) => {
    console.warn('Track Player remote command failed', error);
  });
};

const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    runSafely(() => TrackPlayer.pause());
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    runSafely(() => TrackPlayer.play());
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    runSafely(() => TrackPlayer.skipToNext());
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    runSafely(() => TrackPlayer.skipToPrevious());
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    runSafely(() => TrackPlayer.stop());
  });

  TrackPlayer.addEventListener(Event.PlaybackError, async (error) => {
    console.warn('Playback Error:', error);
    // Auto-skip broken/geo-blocked tracks
    try {
      const queue = await TrackPlayer.getQueue();
      const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
      if (currentTrackIndex !== undefined && currentTrackIndex < queue.length - 1) {
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
      } else {
        await TrackPlayer.stop();
      }
    } catch (e) {
      console.warn('Failed to auto-skip broken track', e);
    }
  });
};

let registered = false;

export function registerPlaybackService() {
  if (registered) {
    return;
  }

  TrackPlayer.registerPlaybackService(() => playbackService);
  registered = true;
}
