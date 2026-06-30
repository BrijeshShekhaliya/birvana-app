import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withTiming, withRepeat, Easing } from 'react-native-reanimated';

import { useTokens } from '@/theme/useTokens';
import TrackPlayer, { useActiveTrack, useIsPlaying } from 'react-native-track-player';
import { playTrack, togglePlayback } from '@/services/audio/playback-controller';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import type { UnifiedHomeData, UnifiedCollection, UnifiedTrack } from '@/services/providers/models';

import { AppFlashList } from '@/components/AppFlashList';
import { Skeleton } from '@/components/Skeleton';
import { SquareCard } from '@/components/SquareCard';
import { ArtistCircularCard } from '@/components/ArtistCircularCard';
import { WideCard } from '@/components/WideCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { profileQueryOptions } from '@/features/auth/queries/profile.query';
import { useUIStore } from '@/store/uiStore';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, typography } = useTokens();
  const [homeData, setHomeData] = React.useState<UnifiedHomeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const user = useAuthStore((state) => state.user);
  const profileQuery = useQuery(profileQueryOptions(user?.id ?? ''));

  const avatarUrl =
    profileQuery.data?.avatar_url ||
    ((user?.user_metadata?.avatar_url as string | undefined) ??
      (user?.user_metadata?.picture as string | undefined) ??
      null);


  const scrollY = useSharedValue(0);
  const prevScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value,
  }));

  const onScroll = useAnimatedScrollHandler((event) => {
    const currentY = event.contentOffset.y;
    const diff = currentY - prevScrollY.value;
    
    if (currentY > 100) { // Only hide after scrolling down a bit
      headerTranslateY.value = Math.max(-100, Math.min(0, headerTranslateY.value - diff));
    } else {
      headerTranslateY.value = 0;
    }
    prevScrollY.value = currentY;
    scrollY.value = currentY;
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: interpolate(headerTranslateY.value, [-100, 0], [0, 1], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const provider = ProviderRegistry.getProvider('jiosaavn');
        if (provider) {
          const data = await provider.getHomeContent();
          setHomeData(data);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const renderSection = useCallback((title: string, data: any[] | undefined, CardComponent: React.ComponentType<any>, type: 'playlist' | 'album' | 'artist' | 'track' | 'category' = 'playlist') => {
    if (loading) {
      return (
        <View style={{ marginBottom: spacing.sectionGap }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.horizontalPadding }}>
            <Text style={[{ color: colors.textPrimary, marginBottom: 12 }, typography.sectionHeader as any]}>{title}</Text>
          </View>
          <Skeleton count={4} cardType={CardComponent === ArtistCircularCard ? 'circular' : 'square'} />
        </View>
      );
    }
    
    if (!data || data.length === 0) return null;

    return (
      <View style={{ marginBottom: spacing.sectionGap }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.horizontalPadding, alignItems: 'flex-end', marginBottom: 16 }}>
          <Text style={[{ color: colors.textPrimary }, typography.sectionHeader as any]}>{title}</Text>
        </View>
        <AppFlashList
          data={data}
          horizontal
          estimatedItemSize={140}
          keyExtractor={(item: any) => item.id?.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <CardComponent 
              data={item} 
              onPress={() => {
                if (type === 'playlist' || type === 'album') {
                  navigation.navigate('Playlist', { playlistId: item.id, type });
                } else if (type === 'category') {
                  navigation.navigate('Category', { categoryId: item.id, title: item.title });
                } else if (type === 'artist') {
                  navigation.navigate('Artist', { artistId: item.id });
                } else if (type === 'track') {
                  playTrack({
                    id: item.id,
                    title: item.title || 'Unknown',
                    artist: item.artistString || 'Unknown Artist',
                    artworkUrl: item.artworkUrl || '',
                    streamUrl: item.streamUrl || '',
                    durationSeconds: item.durationSeconds || 0,
                    albumId: item.albumId || null
                  });
                }
              }} 
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: spacing.cardGapHorizontal }} />}
          contentContainerStyle={{ paddingHorizontal: spacing.horizontalPadding }}
        />
      </View>
    );
  }, [homeData, loading, colors, spacing, typography, navigation]);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const heroItem = homeData?.trending?.[0];
  const activeTrack = useActiveTrack();
  const { playing } = useIsPlaying();
  const isHeroPlaying = activeTrack?.id === heroItem?.id && playing;

  const heroContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.15, 1], Extrapolation.CLAMP);
    return {
      opacity: 1,
      transform: [{ scale }],
    };
  });

  const heroImageParallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 300], [0, 80], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.pageBackground }}>
      <Animated.ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: Math.max(insets.top, 16) + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header content moved to floating header below */}

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <Animated.View style={animatedLogoStyle}>
              <Image source={require('../../assets/birvana-mark.png')} style={{ width: 100, height: 100 }} contentFit="contain" />
            </Animated.View>
          </View>
        ) : (
          <>
            {/* Greeting */}
            <View style={{ paddingHorizontal: spacing.horizontalPadding, marginBottom: 24 }}>
              <Text style={[{ color: colors.textPrimary, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }]}>
                {greeting}
              </Text>
              
              {!useUIStore.getState().isStacEnabled ? (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Profile')}
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                >
                  <Text style={{ color: colors.primaryAccent, fontSize: 14, fontWeight: '500' }}>
                    Enable Stac Engine in Profile for full experience 
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primaryAccent} style={{ marginLeft: 2, marginTop: 1 }} />
                </TouchableOpacity>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 4 }}>
                  Ready for some music?
                </Text>
              )}
            </View>

            {/* Hero Banner (Featured Trending Track) */}
            {heroItem && (
              <Animated.View style={[{ marginHorizontal: spacing.horizontalPadding, marginBottom: 32, borderRadius: 24, overflow: 'hidden', height: 280, backgroundColor: colors.elevatedSurface }, heroContainerStyle]}>
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  style={{ flex: 1 }}
                  onPress={() => {
                    if (!heroItem) return;
                    if (activeTrack?.id === heroItem.id) {
                      togglePlayback();
                    } else {
                      playTrack({
                        id: heroItem.id,
                        title: heroItem.title,
                        artist: heroItem.artistString || 'Unknown Artist',
                        artworkUrl: heroItem.artworkUrl || '',
                        streamUrl: (heroItem as any).streamUrl || '',
                        durationSeconds: heroItem.durationSeconds || 0,
                        albumId: heroItem.albumId || null
                      });
                    }
                  }}
                >
                  <Animated.View style={[{ position: 'absolute', top: -40, left: 0, right: 0, bottom: -40 }, heroImageParallaxStyle]}>
                    <Image 
                      source={{ uri: heroItem.artworkUrl }} 
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </Animated.View>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', padding: 24, justifyContent: 'flex-end' }}
                  >
                    <Text style={{ color: colors.primaryAccent, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Featured Trending</Text>
                    <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }} numberOfLines={1}>{heroItem.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 4, fontWeight: '500' }} numberOfLines={1}>{heroItem.artistString}</Text>
                  </LinearGradient>
                  <View style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryAccent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primaryAccent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}>
                    <Ionicons name={isHeroPlaying ? "pause" : "play"} size={24} color="#FFF" style={{ marginLeft: isHeroPlaying ? 0 : 3 }} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Sections */}
            {renderSection('Trending Now', homeData?.trending?.slice(1), SquareCard, 'track')}
            {renderSection('Top Charts', homeData?.charts, SquareCard, 'playlist')}
            {renderSection('Popular Artists', homeData?.popularArtists, ArtistCircularCard, 'artist')}
            {renderSection('Browse & Discover', homeData?.discover, WideCard, 'category')}
            {renderSection('Popular Playlists', homeData?.topPlaylists, SquareCard, 'playlist')}
            {renderSection('Global Albums', homeData?.allPlaylists, SquareCard, 'playlist')}
          </>
        )}

      </Animated.ScrollView>

      {/* Floating Modern Header */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: colors.pageBackground, paddingTop: Math.max(insets.top, 16), paddingBottom: 16, paddingHorizontal: spacing.horizontalPadding, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }, animatedHeaderStyle]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={require('../../assets/birvana-mark.png')} style={{ width: 44, height: 44, marginTop: 4 }} contentFit="contain" />
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>Birvana</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, overflow: 'hidden' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default HomeScreen;
