import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack, usePlaybackState, useProgress, State } from 'react-native-track-player';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing, 
  cancelAnimation,
  SlideInDown,
  FadeOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';

import { CachedImage } from '@/components/primitives/CachedImage';
import { AppText } from '@/components/primitives/AppText';
import { togglePlayback, skipToNextTrack } from '@/services/audio/playback-controller';
import { useUIStore } from '@/store/uiStore';

type AnimatedMiniPlayerProps = {
  onOpen: () => void;
};

export const AnimatedMiniPlayer = memo(function AnimatedMiniPlayer({ onOpen }: AnimatedMiniPlayerProps) {
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(250);

  // Read from store — screens set this via useNoTabBarScreen() useFocusEffect
  const hasTabBar = useUIStore((s) => s.miniPlayerHasTabBar);

  // Cache the track so content never suddenly blanks during a track switch
  const [displayTrack, setDisplayTrack] = useState(activeTrack);
  const [trackKey, setTrackKey] = useState(activeTrack?.id ?? 'init');

  useEffect(() => {
    if (!activeTrack) {
      setDisplayTrack(undefined);
      return;
    }
    if (activeTrack.id !== displayTrack?.id) {
      setTrackKey(activeTrack.id ?? String(Date.now()));
    }
    setDisplayTrack(activeTrack);
  }, [activeTrack, displayTrack?.id]);

  const nativeIsPlaying = playbackState.state === State.Playing
    || playbackState.state === State.Buffering
    || playbackState.state === State.Loading;
  const isBuffering = playbackState.state === State.Buffering || playbackState.state === State.Loading;

  // Optimistic play state — shows new icon instantly on press
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

  // ── Vinyl rotation ────────────────────────────────────────────────────────
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying && !isBuffering) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, { duration: 10000, easing: Easing.linear }),
        -1,
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying, isBuffering, rotation]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // ── Progress bar (UI thread only) ─────────────────────────────────────────
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    const pct = duration > 0 ? Math.min(position / duration, 1) : 0;
    progressWidth.value = withTiming(pct, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [position, duration, progressWidth]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  // ── Dynamic bottom position based on tab bar visibility ───────────────────
  // hasTabBar is read from useUIStore at the top of the component
  const TAB_BAR_HEIGHT = 56;
  const BOTTOM_WITH_TABS = (insets.bottom || 12) + TAB_BAR_HEIGHT + 8;
  const BOTTOM_WITHOUT_TABS = (insets.bottom || 12) + 12;

  // Initialize with the CORRECT position immediately (no flash).
  // hasTabBar is already synchronously correct from its lazy initializer.
  const targetBottom = hasTabBar ? BOTTOM_WITH_TABS : BOTTOM_WITHOUT_TABS;
  const bottomValue = useSharedValue(targetBottom);

  useEffect(() => {
    const target = hasTabBar ? BOTTOM_WITH_TABS : BOTTOM_WITHOUT_TABS;
    // Cancel any in-flight animation before starting a new one to prevent conflicts
    cancelAnimation(bottomValue);
    bottomValue.value = withTiming(target, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [hasTabBar, BOTTOM_WITH_TABS, BOTTOM_WITHOUT_TABS, bottomValue]);

  const containerStyle = useAnimatedStyle(() => ({
    bottom: bottomValue.value,
  }));

  if (!displayTrack) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="box-none"
      style={[
        {
          left: 8,
          position: 'absolute',
          right: 8,
          zIndex: 100,
        },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => ({
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={styles.container}>
          {/* Blurred background — ExpoImage crossfades between artworks smoothly */}
          <ExpoImage 
            source={displayTrack.artwork} 
            style={StyleSheet.absoluteFill as any} 
            blurRadius={60} 
            contentFit="cover"
            transition={500}
          />
          
          <LinearGradient
            colors={['rgba(20, 20, 20, 0.4)', 'rgba(10, 10, 10, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          
          <View style={styles.content}>
            {/* Artwork — CachedImage crossfades between sources */}
            <View style={styles.artworkContainer}>
              <Animated.View style={[styles.artworkWrapper, animatedImageStyle]}>
                <CachedImage
                  contentFit="cover"
                  transition={400}
                  source={displayTrack.artwork}
                  style={styles.artwork}
                />
                <View style={styles.vinylCenter} />
              </Animated.View>
            </View>

            {/* Title / artist — crossfade when track changes */}
            <Animated.View
              key={trackKey}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(150)}
              style={styles.textContainer}
            >
              <AppText
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.title}
                variant="label"
              >
                {displayTrack.title}
              </AppText>
              <AppText
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.artist}
                variant="caption"
              >
                {displayTrack.artist && displayTrack.artist.trim() !== '' ? displayTrack.artist : 'Unknown Artist'}
              </AppText>
            </Animated.View>

            <View style={styles.controls}>
              <Pressable
                hitSlop={16}
                onPress={(event) => {
                  event.stopPropagation();
                  setOptimisticPlaying((prev) => !prev);
                  if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                  void togglePlayback();
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.85 : 1 }],
                  padding: 8,
                })}
              >
                {isPlaying ? (
                  <Ionicons name="pause" color="#FFFFFF" size={24} />
                ) : (
                  <Ionicons name="play" color="#FFFFFF" size={24} style={{ marginLeft: 2 }} />
                )}
              </Pressable>
              
              <Pressable
                hitSlop={16}
                onPress={(event) => {
                  event.stopPropagation();
                  void skipToNextTrack();
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.85 : 1 }],
                  padding: 8,
                })}
              >
                <Ionicons name="play-skip-forward" color="#FFFFFF" size={20} />
              </Pressable>
            </View>
          </View>

          {/* Reanimated progress bar — UI thread only */}
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});


const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gradient: {
    ...StyleSheet.absoluteFill as any,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artworkContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  artworkWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  vinylCenter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 20, 25, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
  },
  artist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 4,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1ED760',
  },
});
