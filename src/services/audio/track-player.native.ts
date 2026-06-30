import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';

let configured = false;
let setupPromise: Promise<void> | null = null;

export async function setupTrackPlayer() {
  if (configured) {
    return;
  }

  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
      minBuffer: 15,
      maxBuffer: 50,
      playBuffer: 2.5,
      backBuffer: 10,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      // These control what appears in the Android notification / lock screen
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      progressUpdateEventInterval: 1,
    });

    configured = true;
  })();

  try {
    await setupPromise;
  } finally {
    setupPromise = null;
  }
}
