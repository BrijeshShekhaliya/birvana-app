import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTokens } from '@/theme/useTokens';
import { useActiveTrack } from 'react-native-track-player';
import { ActiveIndicator } from '@/components/ActiveIndicator';
import type { UnifiedCollection, UnifiedTrack } from '@/services/providers/models';

type Props = {
  data: UnifiedCollection | UnifiedTrack;
  onPress: () => void;
  fullWidth?: boolean;
};

export const SquareCard = ({ data, onPress, fullWidth = false }: Props) => {
  const { colors, typography, radius } = useTokens();

  const isTrack = 'durationSeconds' in data || 'streamUrl' in data;
  const activeTrack = useActiveTrack();
  const isActive = isTrack && activeTrack?.id === data.id;

  const title = data.title;
  const subtitle = 'subtitle' in data ? data.subtitle : (data.artistString || '');
  const imageUrl = 'imageUrl' in data ? data.imageUrl : data.artworkUrl;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ width: fullWidth ? '100%' : 140 }}>
      <View style={{ width: fullWidth ? '100%' : 140, aspectRatio: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.elevatedSurface, marginBottom: 12 }}>
        {imageUrl ? (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" recyclingKey={imageUrl} />
            {isActive && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }]}>
                <ActiveIndicator />
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' }}>
            {isActive ? <ActiveIndicator /> : <Text style={{ color: colors.textMuted }}>No Image</Text>}
          </View>
        )}
      </View>
      <Text style={[{ color: isActive ? colors.primaryAccent : colors.textPrimary, marginBottom: 4, fontWeight: '600' }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[{ color: colors.textMuted, fontSize: 13 }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};
