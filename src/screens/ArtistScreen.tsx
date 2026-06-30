import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, InteractionManager } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useAnimatedScrollHandler, useSharedValue, interpolate, Extrapolation, withSequence, withTiming, withSpring, FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { useTokens } from '@/theme/useTokens';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import { TrackListItem } from '@/components/TrackListItem';
import { SquareCard } from '@/components/SquareCard';
import { EmptyState } from '@/components/EmptyState';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useNoTabBarScreen } from '@/hooks/useNoTabBarScreen';
import type { UnifiedArtist, UnifiedTrack } from '@/services/providers/models';

const { width: windowWidth } = Dimensions.get('window');
const HEADER_HEIGHT = windowWidth;

const ArtistScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Tell mini player this screen has no tab bar
  useNoTabBarScreen();

  const { colors, spacing, typography } = useTokens();
  
  const artistId = route.params?.artistId;
  const [artist, setArtist] = useState<UnifiedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [allSongs, setAllSongs] = useState<UnifiedTrack[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const toggleArtist = useLibraryStore((s) => s.toggleArtist);
  const isSaved = useLibraryStore((s) => artist ? s.artists.some(a => a.id === artist.id) : false);

  const followScale = useSharedValue(1);
  const animatedFollowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followScale.value }],
  }));

  const handleFollow = () => {
    if (!artist) return;
    followScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    toggleArtist(artist);
  };

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const provider = ProviderRegistry.getProvider('jiosaavn');
        if (provider) {
          const data = await provider.getArtistDetails(artistId);
          InteractionManager.runAfterInteractions(() => {
            setArtist(data);
            setAllSongs(data.topSongs || []);
            setLoading(false);
          });
        }
      } catch (err) {
        console.warn('Failed to fetch artist', err);
        InteractionManager.runAfterInteractions(() => {
          setLoading(false);
        });
      }
    };
    fetchArtist();
  }, [artistId]);

  const loadMoreSongs = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const provider = ProviderRegistry.getProvider('jiosaavn');
      if (provider) {
        const nextPage = page + 1;
        const data = await provider.getArtistMoreSongs(artistId, nextPage);
        setAllSongs(prev => {
          const newSongs = data.items.filter(item => !prev.some(p => p.id === item.id));
          return [...prev, ...newSongs];
        });
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [-100, 0, HEADER_HEIGHT], [-50, 0, HEADER_HEIGHT * 0.5], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [-100, 0], [1.5, 1], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY },
        { scale }
      ]
    };
  });

  const topBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [HEADER_HEIGHT - 100, HEADER_HEIGHT], [0, 1], Extrapolation.CLAMP);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ width: 200, height: 40, backgroundColor: colors.elevatedSurface, borderRadius: 8 }} />
            <View style={{ width: 80, height: 32, backgroundColor: colors.elevatedSurface, borderRadius: 16 }} />
          </View>
          
          <View style={{ width: 120, height: 24, backgroundColor: colors.elevatedSurface, borderRadius: 6, marginBottom: 16 }} />
          
          {Array.from({ length: 5 }).map((_, i) => (
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

  if (!artist) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.pageBackground }}>
        <EmptyState icon="person" title="Artist Not Found" subtitle="Could not load artist details" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <Animated.View style={[styles.headerImageContainer, headerAnimatedStyle]}>
        <Image source={{ uri: artist.imageUrl }} style={styles.headerImage} contentFit="cover" contentPosition="top center" />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        <LinearGradient
          colors={['transparent', colors.pageBackground]}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.pageBackground, opacity: 0 }, topBarAnimatedStyle]}>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>{artist.name}</Text>
      </Animated.View>

      <View style={[styles.backButton, { top: Math.max(insets.top, 16) }]}>
        <Ionicons name="arrow-back" size={24} color="#FFF" onPress={() => navigation.goBack()} />
      </View>

      <Animated.ScrollView 
        onScroll={onScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 80, paddingBottom: 100 }}
      >
        {/* Solid background for content area to prevent bleeding */}
        <View style={{ backgroundColor: colors.pageBackground, minHeight: 800, paddingTop: 20 }}>
          <View style={{ paddingHorizontal: spacing.horizontalPadding }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ color: '#FFF', fontSize: 36, fontWeight: 'bold', letterSpacing: -1, flex: 1, paddingRight: 16 }}>
                {artist.name}
              </Text>
              <Animated.View style={animatedFollowStyle}>
                <TouchableOpacity 
                  onPress={handleFollow}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryAccent, backgroundColor: isSaved ? colors.primaryAccent : 'transparent' }}
                >
                  <Text style={{ color: isSaved ? '#000' : colors.primaryAccent, fontWeight: '700' }}>{isSaved ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <Text style={[typography.sectionHeader as any, { color: colors.textPrimary }]}>Top Songs</Text>
              {allSongs.length > 5 && (
                <TouchableOpacity onPress={() => setShowAllSongs(!showAllSongs)}>
                  <Text style={{ color: colors.primaryAccent, fontSize: 14, fontWeight: '600' }}>
                    {showAllSongs ? 'Show Less' : 'Show All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {(showAllSongs ? allSongs : allSongs.slice(0, 5)).map((track, index) => (
              <TrackListItem 
                key={track.id} 
                track={track} 
              />
            ))}
            
            {showAllSongs && hasMore && (
              <TouchableOpacity onPress={loadMoreSongs} style={{ alignItems: 'center', marginVertical: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: colors.elevatedSurface }}>
                {loadingMore ? (
                  <ActivityIndicator size="small" color={colors.primaryAccent} />
                ) : (
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Load More Songs</Text>
                )}
              </TouchableOpacity>
            )}

          {artist.topAlbums.length > 0 && (
            <>
              <Text style={[typography.sectionHeader as any, { color: colors.textPrimary, marginTop: 32, marginBottom: 16 }]}>Albums</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {artist.topAlbums.map((album) => (
                  <View key={album.id} style={{ marginRight: spacing.cardGapHorizontal }}>
                    <SquareCard 
                      data={album} 
                      onPress={() => navigation.navigate('Playlist', { playlistId: album.id, type: 'album' })} 
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {artist.similarArtists.length > 0 && (
            <>
              <Text style={[typography.sectionHeader as any, { color: colors.textPrimary, marginTop: 32, marginBottom: 16 }]}>Similar Artists</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {artist.similarArtists.map((simArtist) => (
                  <View key={simArtist.id} style={{ marginRight: spacing.cardGapHorizontal }}>
                    <SquareCard 
                      data={simArtist} 
                      onPress={() => navigation.push('Artist', { artistId: simArtist.id })} 
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  headerImage: {
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

export default ArtistScreen;
