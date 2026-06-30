import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTokens } from '@/theme/useTokens';
import { ProviderRegistry } from '@/services/providers/ProviderRegistry';
import { SearchInput } from '@/components/SearchInput';
import { TrackListItem } from '@/components/TrackListItem';
import { SquareCard } from '@/components/SquareCard';
import { ArtistCircularCard } from '@/components/ArtistCircularCard';
import { EmptyState } from '@/components/EmptyState';
import { AppFlashList } from '@/components/AppFlashList';
import { playTrack } from '@/services/audio/playback-controller';
import type { UnifiedTrack, UnifiedCollection, UnifiedArtist } from '@/services/providers/models';
import type { PlayerTrack } from '@/features/player/player.types';

type SearchCategory = 'song' | 'album' | 'artist' | 'playlist';

const CATEGORIES: { label: string; value: SearchCategory }[] = [
  { label: 'Songs', value: 'song' },
  { label: 'Albums', value: 'album' },
  { label: 'Artists', value: 'artist' },
  { label: 'Playlists', value: 'playlist' },
];

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, typography, spacing } = useTokens();
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('song');
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results when debounced query or active category changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const provider = ProviderRegistry.getProvider('jiosaavn');
        if (provider) {
          const data = await provider.search(debouncedQuery, activeCategory, 1, 30);
          setResults(data);
        }
      } catch (err) {
        console.warn('Search Error:', err);
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, activeCategory]);

  const handleTrackPress = (track: UnifiedTrack) => {
    // Build a proper PlayerTrack and hand it to the audio engine
    const pt: PlayerTrack = {
      id: track.id,
      title: track.title,
      artist: track.artistString,
      artworkUrl: track.artworkUrl,
      streamUrl: track.streamUrl || '',
      durationSeconds: track.durationSeconds,
      albumId: track.albumId,
      hasLyrics: track.hasLyrics,
    };
    void playTrack(pt);
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeCategory === 'song') {
      return (
        <TrackListItem 
          track={item} 
          onPress={() => handleTrackPress(item)} 
        />
      );
    }
    
    if (activeCategory === 'artist') {
      return (
        <View style={{ width: '100%', padding: 8, alignItems: 'center' }}>
          <ArtistCircularCard 
            data={item} 
            onPress={() => navigation.navigate('Artist', { artistId: item.id })} 
            fullWidth
          />
        </View>
      );
    }

    // Album or Playlist
    return (
      <View style={{ width: '100%', padding: 8, alignItems: 'center' }}>
        <SquareCard 
          data={item} 
          onPress={() => navigation.navigate('Playlist', { playlistId: item.id, type: activeCategory })} 
          fullWidth
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.pageBackground }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: Math.max(insets.top, 16), paddingHorizontal: spacing.horizontalPadding }}>
        <Text style={[{ color: colors.textPrimary, marginBottom: 16 }, typography.screenTitle as any]}>Search</Text>
        
        <SearchInput 
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Artists, songs, or podcasts"
          autoFocus
        />

        {/* Categories / Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16, marginBottom: 8 }}
          contentContainerStyle={{ paddingRight: spacing.horizontalPadding }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setActiveCategory(cat.value)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primaryAccent : colors.elevatedSurface,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primaryAccent : colors.borderSubtle
                }}
              >
                <Text style={{ 
                  color: isActive ? '#FFF' : colors.textPrimary, 
                  fontWeight: isActive ? '700' : '500' 
                }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Area */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primaryAccent} />
          </View>
        ) : error ? (
          <EmptyState icon="alert-circle" title="Error" subtitle={error} />
        ) : (!query.trim() && !debouncedQuery.trim()) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Ionicons name="search" size={64} color={colors.borderSubtle} style={{ marginBottom: 16 }} />
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Find what you love</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Search for your favorite artists, albums, or tracks.</Text>
          </View>
        ) : results.length === 0 ? (
          <EmptyState icon="search" title="No results found" subtitle={`We couldn't find anything for "${debouncedQuery}"`} />
        ) : (
          <AppFlashList
            data={results}
            numColumns={activeCategory === 'song' ? 1 : 2}
            key={activeCategory} // Force re-render of list when columns change
            keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
            estimatedItemSize={activeCategory === 'song' ? 70 : 200}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SearchScreen;
