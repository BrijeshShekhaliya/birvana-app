import { View } from 'react-native';
import { CachedImage } from '@/components/primitives/CachedImage';

type AuthLogoProps = {
  compact?: boolean;
};

export function AuthLogo({ compact = false }: AuthLogoProps) {
  const size = compact ? 92 : 108;

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CachedImage
        source={require('../../../../assets/birvana-mark.png')}
        style={{
          borderRadius: size / 2,
          height: size,
          width: size,
        }}
      />
    </View>
  );
}
