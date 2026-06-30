import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { useTokens } from '@/theme/useTokens';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';

import { AppFlashList } from '@/components/AppFlashList';
import { SquareCard } from '@/components/SquareCard';
import { ArtistCircularCard } from '@/components/ArtistCircularCard';
import { TrackListItem } from '@/components/TrackListItem';
import { EmptyState } from '@/components/EmptyState';

const FILTERS = ['All', 'Playlists', 'Artists', 'Songs'];

const LibraryScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = useTokens();
  
  const playlists = useLibraryStore(s => s.playlists);
  const artists = useLibraryStore(s => s.artists);
  const likedSongs = useLibraryStore(s => s.likedSongs);

  const [activeFilter, setActiveFilter] = useState('All');

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const renderHorizontalSection = useCallback((title: string, data: any[] | undefined, CardComponent: React.ComponentType<any>, type: 'playlist' | 'artist') => {
    if (!data || data.length === 0) return null;
    return (
      <View style={{ marginBottom: 32 }}>
        <Text style={[{ color: colors.textPrimary, paddingHorizontal: spacing.horizontalPadding, marginBottom: 16 }, typography.sectionHeader as any]}>{title}</Text>
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
                if (type === 'playlist') navigation.navigate('Playlist', { playlistId: item.id });
                else if (type === 'artist') navigation.push('Artist', { artistId: item.id });
              }} 
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: spacing.cardGapHorizontal }} />}
          contentContainerStyle={{ paddingHorizontal: spacing.horizontalPadding }}
        />
      </View>
    );
  }, [colors, spacing, typography, navigation]);

  const isEmpty = likedSongs.length === 0 && playlists.length === 0 && artists.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: colors.pageBackground, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.horizontalPadding, marginBottom: 20 }}>
          <Text style={[{ color: colors.textPrimary, fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 }]}>Your Library</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.horizontalPadding }}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f}
              onPress={() => setActiveFilter(f)} 
              style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: activeFilter === f ? colors.primaryAccent : colors.elevatedSurface, marginRight: 12 }}
            >
              <Text style={{ color: activeFilter === f ? '#000' : colors.textPrimary, fontWeight: '700' }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isEmpty ? (
        <View style={{ flex: 1, marginTop: 100 }}>
          <EmptyState 
            icon="library-outline" 
            title="Your library is empty" 
            subtitle="Save playlists, follow artists, and like songs to see them here." 
          />
        </View>
      ) : (
        <Animated.ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {activeFilter === 'All' && (
            <>
              {renderHorizontalSection('Saved Playlists', playlists, SquareCard, 'playlist')}
              {renderHorizontalSection('Followed Artists', artists, ArtistCircularCard, 'artist')}
              {likedSongs.length > 0 && (
                <View style={{ marginBottom: 32 }}>
                  <Text style={[{ color: colors.textPrimary, paddingHorizontal: spacing.horizontalPadding, marginBottom: 16 }, typography.sectionHeader as any]}>Liked Songs</Text>
                  <View style={{ paddingHorizontal: spacing.horizontalPadding }}>
                    {likedSongs.slice(0, 5).map(track => (
                      <TrackListItem 
                        key={track.id} 
                        track={track} 
                        onPress={() => usePlayerStore.getState().setTrack(track.id, track.durationSeconds || 0)} 
                      />
                    ))}
                    {likedSongs.length > 5 && (
                      <TouchableOpacity onPress={() => setActiveFilter('Songs')} style={{ marginTop: 16, padding: 12, backgroundColor: colors.elevatedSurface, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: colors.primaryAccent, fontWeight: '600' }}>View all {likedSongs.length} liked songs</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {activeFilter === 'Playlists' && (
            <View style={{ paddingHorizontal: spacing.horizontalPadding, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {playlists.map(playlist => (
                <View key={playlist.id} style={{ width: '48%', marginBottom: 20, alignItems: 'center' }}>
                  <SquareCard 
                    data={playlist} 
                    onPress={() => navigation.navigate('Playlist', { playlistId: playlist.id })} 
                  />
                </View>
              ))}
            </View>
          )}

          {activeFilter === 'Artists' && (
            <View style={{ paddingHorizontal: spacing.horizontalPadding, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {artists.map(artist => (
                <View key={artist.id} style={{ width: '48%', marginBottom: 20, alignItems: 'center' }}>
                  <ArtistCircularCard 
                    data={artist} 
                    onPress={() => navigation.push('Artist', { artistId: artist.id })} 
                  />
                </View>
              ))}
            </View>
          )}

          {activeFilter === 'Songs' && (
            <View style={{ paddingHorizontal: spacing.horizontalPadding }}>
              {likedSongs.map(track => (
                <TrackListItem 
                  key={track.id} 
                  track={track} 
                  onPress={() => usePlayerStore.getState().setTrack(track.id, track.durationSeconds || 0)} 
                />
              ))}
            </View>
          )}

        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LibraryScreen;
