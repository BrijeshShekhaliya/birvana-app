import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTokens } from '@/theme/useTokens';
import type { UnifiedCollection, UnifiedArtist } from '@/services/providers/models';

type Props = {
  data: UnifiedCollection | UnifiedArtist;
  onPress: () => void;
  fullWidth?: boolean;
};

export const ArtistCircularCard = ({ data, onPress, fullWidth = false }: Props) => {
  const { colors } = useTokens();

  const title = 'name' in data ? data.name : data.title;
  const imageUrl = data.imageUrl;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ width: fullWidth ? '100%' : 120, alignItems: 'center' }}>
      <View style={{ width: fullWidth ? '100%' : 120, aspectRatio: 1, borderRadius: 1000, overflow: 'hidden', backgroundColor: colors.elevatedSurface, marginBottom: 12 }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" recyclingKey={imageUrl} />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }} />
        )}
      </View>
      <Text style={[{ color: colors.textPrimary, fontWeight: '600', textAlign: 'center' }]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
