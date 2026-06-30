import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, InteractionManager } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withSequence, withTiming, withSpring, FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { useTokens } from '@/theme/useTokens';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import { TrackListItem } from '@/components/TrackListItem';
import { EmptyState } from '@/components/EmptyState';
import { useLibraryStore } from '@/store/libraryStore';
import { playTrack } from '@/services/audio/playback-controller';
import { useNoTabBarScreen } from '@/hooks/useNoTabBarScreen';
import type { UnifiedPlaylist, UnifiedTrack } from '@/services/providers/models';

const { width: windowWidth } = Dimensions.get('window');
const HEADER_HEIGHT = windowWidth;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

const PlaylistScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTokens();

  // Tell mini player this screen has no tab bar
  useNoTabBarScreen();
  
  const { playlistId, type = 'playlist' } = route.params || {};
  const [playlist, setPlaylist] = useState<UnifiedPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  
  const togglePlaylist = useLibraryStore(s => s.togglePlaylist);
  const isSaved = useLibraryStore(s => playlist ? s.playlists.some(p => p.id === playlist.id) : false);

  const saveScale = useSharedValue(1);
  const animatedSaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handleSave = () => {
    if (!playlist) return;
    saveScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    togglePlaylist({
      id: playlist.id,
      title: playlist.name,
      subtitle: playlist.description || '',
      imageUrl: playlist.artworkUrl,
      type: 'playlist'
    });
  };

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const provider = ProviderRegistry.getProvider('jiosaavn');
        if (provider) {
          const data = type === 'album' 
            ? await provider.getAlbumDetails(playlistId)
            : await provider.getPlaylistDetails(playlistId);
          InteractionManager.runAfterInteractions(() => {
            setPlaylist(data);
            setLoading(false);
          });
        }
      } catch (err) {
        console.warn('Failed to fetch playlist', err);
        InteractionManager.runAfterInteractions(() => {
          setLoading(false);
        });
      }
    };
    if (playlistId) fetchPlaylist();
    else setLoading(false);
  }, [playlistId, type]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [-100, 0, HEADER_HEIGHT], [-50, 0, HEADER_HEIGHT * 0.5], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP);
    const blur = interpolate(scrollY.value, [0, HEADER_HEIGHT], [5, 20], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY },
        { scale }
      ],
      // Reanimated can't animate blurRadius directly on all platforms easily, but opacity/scaling works well
    };
  });

  const topBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [HEADER_HEIGHT - 120, HEADER_HEIGHT - 60], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.pageBackground }]}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={[styles.backButton, { top: Math.max(insets.top, 16) }]}>
            <Ionicons name="arrow-back" size={24} color="#FFF" onPress={() => navigation.goBack()} />
          </View>
        </View>
        <Animated.View style={[{ width: '100%', height: HEADER_HEIGHT, backgroundColor: colors.elevatedSurface }]} />
        <View style={{ backgroundColor: colors.pageBackground, minHeight: 800, paddingTop: 24, paddingHorizontal: spacing.horizontalPadding }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <ActivityIndicator size="large" color={colors.primaryAccent} />
          </View>
          <View style={{ marginBottom: 24 }}>
            <View style={{ width: 200, height: 32, backgroundColor: colors.elevatedSurface, borderRadius: 8, marginBottom: 8 }} />
            <View style={{ width: 150, height: 16, backgroundColor: colors.elevatedSurface, borderRadius: 4 }} />
          </View>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 50, height: 50, backgroundColor: colors.elevatedSurface, borderRadius: 8, marginRight: 12 }} />
              <View>
                <View style={{ width: 180, height: 16, backgroundColor: colors.elevatedSurface, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ width: 100, height: 12, backgroundColor: colors.elevatedSurface, borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.pageBackground }}>
        <EmptyState icon="albums" title="Playlist Not Found" subtitle="Could not load this content" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <Animated.View style={[styles.headerBgContainer, headerAnimatedStyle]}>
        <Image source={{ uri: playlist.artworkUrl }} style={styles.headerBgImage} contentFit="cover" contentPosition="center" />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        <LinearGradient
          colors={['transparent', colors.pageBackground]}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.pageBackground, opacity: 0 }, topBarAnimatedStyle]}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{playlist.name}</Text>
      </Animated.View>

      <View style={[styles.backButton, { top: Math.max(insets.top, 16) }]}>
        <Ionicons name="arrow-back" size={24} color="#FFF" onPress={() => navigation.goBack()} />
      </View>

      <AnimatedFlashList
        data={playlist.tracks}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={70}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 80, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ backgroundColor: colors.pageBackground, paddingTop: 24, paddingHorizontal: spacing.horizontalPadding, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10000, backgroundColor: colors.pageBackground, zIndex: -1 }} />
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 8, letterSpacing: -0.5 }}>{playlist.name}</Text>
              {!!playlist.description && <Text style={{ color: colors.textMuted, fontSize: 15, marginBottom: 8 }}>{playlist.description}</Text>}
              <Text style={{ color: colors.primaryAccent, fontSize: 13, fontWeight: '600' }}>{playlist.songCount} Tracks</Text>
            </View>
            <Animated.View style={animatedSaveStyle}>
              <TouchableOpacity 
                onPress={handleSave}
                style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.elevatedSurface, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={colors.primaryAccent} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        }
        renderItem={({ item: track }: any) => (
          <View style={{ paddingHorizontal: spacing.horizontalPadding, backgroundColor: colors.pageBackground }}>
            <TrackListItem 
              track={track} 
              onPress={() => {
                const queue = playlist.tracks.map((t: UnifiedTrack) => ({
                  id: t.id,
                  title: t.title,
                  artist: t.artistString,
                  artworkUrl: t.artworkUrl,
                  streamUrl: t.streamUrl || '',
                  durationSeconds: t.durationSeconds,
                  albumId: t.albumId,
                  hasLyrics: t.hasLyrics,
                  contextName: playlist.name,
                  contextId: playlist.id
                }));
                const pt = queue.find(q => q.id === track.id)!;
                void playTrack(pt, queue);
              }}
            />
          </View>
        )}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  }
});

export default PlaylistScreen;
