import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { View, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';

export interface CachedImageProps extends Omit<ExpoImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: React.ReactNode;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

/**
 * A highly reliable, aggressively cached Image component utilizing expo-image.
 * Prevents flickering, provides smooth crossfades, and uses a default blurhash.
 */
export function CachedImage({ style, containerStyle, fallbackIcon, source, ...rest }: CachedImageProps) {
  return (
    <View style={[styles.container, containerStyle, style as ViewStyle]}>
      {fallbackIcon && !source ? (
        <View style={styles.fallbackContainer}>{fallbackIcon}</View>
      ) : (
        <ExpoImage
          source={source}
          placeholder={blurhash}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          recyclingKey={typeof source === 'string' ? source : Array.isArray(source) ? (source[0] as any)?.uri : (source as any)?.uri}
          style={[StyleSheet.absoluteFill, style]}
          {...rest}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1E1C19', // Dark placeholder color
  },
  fallbackContainer: {
    ...(StyleSheet.absoluteFill as any),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1C19',
  },
});
