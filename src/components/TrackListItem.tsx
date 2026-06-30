import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useActiveTrack } from 'react-native-track-player';
import { useTokens } from '@/theme/useTokens';
import { useLibraryStore } from '@/store/libraryStore';
import { playTrack } from '@/services/audio/playback-controller';
import type { PlayerTrack } from '@/features/player/player.types';
import { ActiveIndicator } from '@/components/ActiveIndicator';
import type { UnifiedTrack } from '@/services/providers/models';

type Props = {
  track: UnifiedTrack;
  onPress?: () => void;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const TrackListItem = React.memo(({ track, onPress }: Props) => {
  const { colors, typography } = useTokens();
  
  const activeTrack = useActiveTrack();
  const isActive = activeTrack?.id === track.id;

  // Selective subscription for instant UI response and no lag
  const toggleLiked = useLibraryStore((s) => s.toggleLiked);
  const liked = useLibraryStore((s) => s.likedSongs.some(t => t.id === track.id));

  const scale = useSharedValue(1);
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = () => {
    // Instant haptic-like animation
    scale.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    toggleLiked(track);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      const pt: PlayerTrack = {
        id: track.id,
        title: track.title,
        artist: track.artistString,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl || '',
        durationSeconds: track.durationSeconds,
        albumId: track.albumId,
        hasLyrics: track.hasLyrics
      };
      void playTrack(pt);
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={handlePress} 
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 }}
    >
      <View style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.elevatedSurface }}>
        {track.artworkUrl ? (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: track.artworkUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" recyclingKey={track.artworkUrl} />
            {isActive && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }]}>
                <ActiveIndicator />
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}>
            {isActive ? <ActiveIndicator /> : <Ionicons name="musical-notes" size={20} color={colors.textMuted} />}
          </View>
        )}
      </View>
      
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
        <Text style={{ color: isActive ? colors.primaryAccent : colors.textPrimary, fontSize: 16, fontWeight: '500', marginBottom: 2 }} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }} numberOfLines={1}>
          {track.artistString}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 16 }}>
          {formatDuration(track.durationSeconds)}
        </Text>
        <TouchableOpacity onPress={handleLike} style={{ padding: 4 }}>
          <Animated.View style={animatedIconStyle}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? colors.primaryAccent : colors.textMuted} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}, (prev, next) => prev.track.id === next.track.id);
