import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTokens } from '@/theme/useTokens';

type CardProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onPress?: () => void;
};

export const Card: React.FC<CardProps> = ({ title, subtitle, imageUrl, onPress }) => {
  const { colors, spacing, radius } = useTokens();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, { backgroundColor: colors.cardBackground, borderRadius: radius.card, margin: spacing.horizontalPadding / 2 }]}> 
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
