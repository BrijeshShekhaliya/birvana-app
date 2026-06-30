import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Slider as AwesomeSlider } from 'react-native-awesome-slider';
import TrackPlayer, { useActiveTrack, usePlaybackState, useProgress, State, RepeatMode } from 'react-native-track-player';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';

import { CachedImage } from '@/components/primitives/CachedImage';
import { AppText } from '@/components/primitives/AppText';
import type { AppStackParamList } from '@/navigation/types';
import { useLibraryStore } from '@/store/libraryStore';
import {
  seekTo,
  skipToNextTrack,
  skipToPreviousTrack,
  togglePlayback,
  toggleShuffle,
  toggleRepeat,
  getPlayerContext,
  getIsShuffled,
  setIsShuffledGlobal,
} from '@/services/audio/playback-controller';
import { formatPlayerTime } from '@/features/player/player.types';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';

type PlayerScreenProps = NativeStackScreenProps<AppStackParamList, 'Player'>;

function PlayerIconButton({ icon, size = 28, onPress, active = false, activeColor = '#1E7BFF' }: any) {
  return (
    <Pressable
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        padding: 8,
      })}
    >
      <Ionicons name={icon} size={size} color={active ? activeColor : '#FFFFFF'} />
    </Pressable>
  );
}

export function AnimatedPlayerScreen({ navigation }: PlayerScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // ─── Track state: cached to prevent UI blank during transitions ───────────
  const activeTrack = useActiveTrack();
  const [currentTrack, setCurrentTrack] = useState(activeTrack);

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const nativeIsPlaying = playbackState.state === State.Playing
    || playbackState.state === State.Buffering
    || playbackState.state === State.Loading;
  const isBuffering = playbackState.state === State.Buffering
    || playbackState.state === State.Loading;

  // Optimistic play state: flips instantly on press, then syncs from native
  const [optimisticPlaying, setOptimisticPlaying] = useState(nativeIsPlaying);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setOptimisticPlaying(nativeIsPlaying);
    }, 150);
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [nativeIsPlaying]);

  const isPlaying = optimisticPlaying;

  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyricsData, setLyricsData] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // ─── Slider shared values ─────────────────────────────────────────────────
  const sliderProgress = useSharedValue(0);
  const sliderMinimum = useSharedValue(0);
  const sliderMaximum = useSharedValue(1);
  const sliderIsScrubbing = useSharedValue(false);

  // Use a ref (not state) to track scrubbing to avoid extra re-renders
  const isScrubbing = useRef(false);
  // Hold scrub lock for 800ms after release so native position updates don't conflict
  const scrubLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Shuffle / Repeat ────────────────────────────────────────────────────
  const [isShuffled, setIsShuffled] = useState(getIsShuffled());
  const shuffleScale = useSharedValue(1);
  const shuffleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shuffleScale.value }],
  }));

  const repeatScale = useSharedValue(1);
  const repeatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: repeatScale.value }],
  }));

  const safeDuration = Math.max(duration || (currentTrack?.duration ?? 0), 0);
  const artworkSize = width - 64;

  // ─── Like ────────────────────────────────────────────────────────────────
  const toggleLiked = useLibraryStore((s) => s.toggleLiked);
  const isLiked = useLibraryStore((s) =>
    currentTrack ? s.likedSongs.some((t) => t.id === currentTrack.id) : false,
  );
  const likeScale = useSharedValue(1);
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleLike = () => {
    if (!currentTrack) return;
    likeScale.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    toggleLiked({
      id: currentTrack.id,
      title: currentTrack.title || '',
      artistString: currentTrack.artist || '',
      artworkUrl: currentTrack.artwork?.toString(),
      streamUrl: currentTrack.url,
      durationSeconds: currentTrack.duration,
      albumId: currentTrack.albumId,
    } as any);
  };

  // ─── Track change handler ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTrack) return;

    const idChanged = activeTrack.id !== currentTrack?.id;

    if (idChanged) {
      setCurrentTrack(activeTrack);

      if (scrubLockTimerRef.current) clearTimeout(scrubLockTimerRef.current);
      isScrubbing.current = false;
      sliderIsScrubbing.value = false;

      sliderProgress.value = withTiming(0, { duration: 250 });
      sliderMaximum.value = withTiming(activeTrack.duration ?? 1, { duration: 250 });

      setLyricsOpen(false);
      setLyricsData(null);
    } else {
      setCurrentTrack(activeTrack);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack]);

  // ─── Sync slider max with duration while same track plays ────────────────
  useEffect(() => {
    if (safeDuration > 0 && !isScrubbing.current) {
      sliderMaximum.value = safeDuration;
    }
  }, [safeDuration, sliderMaximum]);

  // ─── Sync slider progress with real position ──────────────────────────────
  useEffect(() => {
    if (!isScrubbing.current) {
      const clamped = Math.max(0, Math.min(position, safeDuration || 0));
      sliderProgress.value = clamped;
    }
  }, [position, safeDuration, sliderProgress]);

  // ─── Repeat mode init ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const mode = await TrackPlayer.getRepeatMode();
      setRepeatMode(mode);
    }
    init();
  }, []);

  // ─── Lyrics ───────────────────────────────────────────────────────────────
  const loadLyrics = async () => {
    if (lyricsOpen) {
      setLyricsOpen(false);
      return;
    }
    if (!currentTrack?.id) return;

    setLyricsOpen(true);
    if (!lyricsData) {
      setLoadingLyrics(true);
      try {
        const jiosaavn = ProviderRegistry.getProvider('jiosaavn');
        if (jiosaavn && jiosaavn.getLyrics) {
          const res = await jiosaavn.getLyrics(currentTrack.id);
          setLyricsData(res ? res.lyrics : 'No lyrics available for this track.');
        }
      } catch {
        setLyricsData('Failed to load lyrics.');
      }
      setLoadingLyrics(false);
    }
  };

  // ─── Scrubbing handlers ───────────────────────────────────────────────────
  const onScrubStart = () => {
    if (scrubLockTimerRef.current) clearTimeout(scrubLockTimerRef.current);
    isScrubbing.current = true;
    sliderIsScrubbing.value = true;
  };

  const onScrubComplete = async (val: number) => {
    // Snap the slider to the target immediately so it doesn't rubber-band
    sliderProgress.value = val;
    await seekTo(val);

    // Keep the scrub lock for 800ms so native position updates don't conflict
    if (scrubLockTimerRef.current) clearTimeout(scrubLockTimerRef.current);
    scrubLockTimerRef.current = setTimeout(() => {
      isScrubbing.current = false;
      sliderIsScrubbing.value = false;
      scrubLockTimerRef.current = null;
    }, 800);
  };

  if (!currentTrack) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;
  }

  const contextName = currentTrack.contextName || getPlayerContext().name;
  const contextId = currentTrack.contextId || getPlayerContext().id;

  return (
    <View style={styles.container}>
      {/* Blurred background — crossfade on track change via keyed Animated.View */}
      <Animated.View
        key={`bg-${currentTrack.artwork?.toString()}`}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
        style={StyleSheet.absoluteFill}
      >
        <ExpoImage
          source={currentTrack.artwork}
          style={StyleSheet.absoluteFill as any}
          blurRadius={90}
          contentFit="cover"
        />
      </Animated.View>
      <LinearGradient
        colors={['rgba(20,20,20,0.5)', 'rgba(10,10,10,0.85)', 'rgba(10,10,10,1)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={{ width: 48 }} />

        <View style={styles.headerContext}>
          <Pressable
            onPress={() => {
              if (contextId) {
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate('Playlist', { playlistId: contextId, type: 'playlist' } as any);
                }, 150);
              }
            }}
          >
            {contextName ? (
              <View style={{ alignItems: 'center' }}>
                <AppText style={styles.contextLabel}>PLAYING FROM PLAYLIST</AppText>
                <AppText style={styles.contextTitle} numberOfLines={1}>{contextName}</AppText>
              </View>
            ) : (
              <AppText style={styles.contextTitle}>Now Playing</AppText>
            )}
          </Pressable>
        </View>

        {currentTrack.hasLyrics ? (
          <PlayerIconButton icon="text" onPress={loadLyrics} active={lyricsOpen} />
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {/* Main Content Area — stable container, NEVER unmounts */}
      <View style={styles.contentArea}>
        {lyricsOpen ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.lyricsContainer}
          >
            {loadingLyrics ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40 }}>
                <AppText style={styles.lyricsText}>{lyricsData}</AppText>
              </ScrollView>
            )}
          </Animated.View>
        ) : (
          // Stable container — no key, never unmounts, no layout reflow.
          // CachedImage handles its own crossfade transition between sources.
          <View style={[styles.artworkWrapper, { width: artworkSize, height: artworkSize }]}>
            <CachedImage
              source={currentTrack.artwork}
              style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
              transition={400}
            />
          </View>
        )}
      </View>

      {/* Controls Area — stable, no key remount */}
      <View style={[styles.controlsArea, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.trackInfo}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <AppText style={styles.title} numberOfLines={1}>{currentTrack.title}</AppText>
            <AppText style={styles.artist} numberOfLines={1}>{currentTrack.artist}</AppText>
          </View>
          <Pressable onPress={handleLike} hitSlop={10} style={{ padding: 4 }}>
            <Animated.View style={likeAnimatedStyle}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? '#1ED760' : '#FFFFFF'}
              />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <AwesomeSlider
            progress={sliderProgress}
            minimumValue={sliderMinimum}
            maximumValue={sliderMaximum}
            onSlidingStart={onScrubStart}
            onSlidingComplete={onScrubComplete}
            isScrubbing={sliderIsScrubbing}
            theme={{
              maximumTrackTintColor: 'rgba(255,255,255,0.2)',
              minimumTrackTintColor: '#FFFFFF',
            }}
            renderThumb={() => <View style={styles.sliderThumb} />}
          />
          <View style={styles.timeRow}>
            <AppText style={styles.timeText}>{formatPlayerTime(position)}</AppText>
            <AppText style={styles.timeText}>
              -{formatPlayerTime(Math.max(safeDuration - position, 0))}
            </AppText>
          </View>
        </View>

        <View style={styles.playbackControls}>
          <Pressable
            hitSlop={10}
            style={{ padding: 4 }}
            onPress={() => {
              shuffleScale.value = withSequence(
                withTiming(1.3, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 200 }),
              );
              const nextState = !isShuffled;
              setIsShuffled(nextState);
              setIsShuffledGlobal(nextState);
              setTimeout(() => { toggleShuffle(); }, 10);
            }}
          >
            <Animated.View style={shuffleAnimatedStyle}>
              <Ionicons name="shuffle" size={26} color={isShuffled ? '#1ED760' : '#FFFFFF'} />
            </Animated.View>
          </Pressable>

          <PlayerIconButton icon="play-skip-back" onPress={skipToPreviousTrack} size={36} />

          <Pressable
            hitSlop={10}
            onPress={() => {
              // Optimistic toggle — flips icon instantly, no waiting for native
              setOptimisticPlaying((prev) => !prev);
              if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
              void togglePlayback();
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, padding: 8 }]}
          >
            <Ionicons
              color="#FFF"
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={76}
            />
          </Pressable>

          <PlayerIconButton icon="play-skip-forward" onPress={skipToNextTrack} size={36} />

          <Pressable
            hitSlop={10}
            style={{ padding: 4 }}
            onPress={() => {
              repeatScale.value = withSequence(
                withTiming(1.3, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 200 }),
              );
              setTimeout(async () => {
                const mode = await toggleRepeat();
                setRepeatMode(mode);
              }, 10);
            }}
          >
            <Animated.View style={[repeatAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="repeat" size={26} color={repeatMode !== RepeatMode.Off ? '#1ED760' : '#FFFFFF'} />
              {repeatMode === RepeatMode.Track && (
                <View style={styles.repeatBadge}>
                  <AppText style={styles.repeatBadgeText}>1</AppText>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContext: {
    alignItems: 'center',
    flex: 1,
  },
  contextLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    marginBottom: 2,
  },
  contextTitle: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  artworkWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  artwork: {
    borderRadius: 16,
  },
  lyricsContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  lyricsText: {
    fontSize: 24,
    lineHeight: 38,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsArea: {
    paddingHorizontal: 32,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    marginBottom: 24,
  },
  sliderThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontVariant: ['tabular-nums'],
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#1ED760',
    borderRadius: 999,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  repeatBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 9,
  },
  bufferingOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
