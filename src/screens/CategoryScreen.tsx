import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, InteractionManager, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { useTokens } from '@/theme/useTokens';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import { TrackListItem } from '@/components/TrackListItem';
import { EmptyState } from '@/components/EmptyState';
import { usePlayerStore } from '@/store/playerStore';
import { useNoTabBarScreen } from '@/hooks/useNoTabBarScreen';
import type { UnifiedPlaylist } from '@/services/providers/models';

const { width: windowWidth } = Dimensions.get('window');
const HEADER_HEIGHT = windowWidth * 0.8;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

const CategoryScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTokens();

  // Tell mini player this screen has no tab bar
  useNoTabBarScreen();
  
  const { categoryId, title } = route.params || {};
  const [playlist, setPlaylist] = useState<UnifiedPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const provider = ProviderRegistry.getProvider('jiosaavn');
        if (provider) {
          const data = await provider.getPlaylistDetails(categoryId);
          InteractionManager.runAfterInteractions(() => {
            setPlaylist(data);
            setLoading(false);
          });
        }
      } catch (err) {
        console.warn('Failed to fetch category', err);
        InteractionManager.runAfterInteractions(() => {
          setLoading(false);
        });
      }
    };
    if (categoryId) fetchCategory();
    else setLoading(false);
  }, [categoryId]);

  const topBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [HEADER_HEIGHT - 120, HEADER_HEIGHT - 60], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.pageBackground, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.pageBackground }}>
        <EmptyState icon="musical-notes" title="Category Not Found" subtitle="Could not load this content" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <Animated.View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.pageBackground }, topBarAnimatedStyle]}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{title || playlist.name}</Text>
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10000, backgroundColor: colors.pageBackground, zIndex: -1 }} />
            <LinearGradient
              colors={[colors.primaryAccent, colors.pageBackground]}
              style={{ paddingTop: Math.max(insets.top, 60), paddingHorizontal: spacing.horizontalPadding, paddingBottom: 40 }}
            >
              <Text style={{ color: '#FFF', fontSize: 48, fontWeight: '900', letterSpacing: -1.5, marginTop: 40 }}>
                {title || playlist.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 8, fontWeight: '500' }}>
                {playlist.songCount} Premium Tracks
              </Text>
            </LinearGradient>
          </View>
        }
        renderItem={({ item: track }: any) => (
          <View style={{ backgroundColor: colors.pageBackground, paddingHorizontal: spacing.horizontalPadding }}>
            <TrackListItem track={track} />
          </View>
        )}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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

export default CategoryScreen;
