import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTokens } from '@/theme/useTokens';
import type { UnifiedCollection } from '@/services/providers/models';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  data: UnifiedCollection;
  onPress: () => void;
};

export const WideCard = ({ data, onPress }: Props) => {
  const { colors, radius } = useTokens();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ width: 280, height: 140, borderRadius: radius.card, overflow: 'hidden' }}>
      <Image source={{ uri: data.imageUrl }} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit="cover" recyclingKey={data.imageUrl} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ flex: 1, padding: 16, justifyContent: 'flex-end' }}
      >
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }} numberOfLines={2}>{data.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
