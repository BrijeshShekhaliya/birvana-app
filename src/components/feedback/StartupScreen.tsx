import { useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

import { Screen } from '@/components/primitives/Screen';
import { useAppTheme } from '@/theme/useAppTheme';

export function StartupScreen() {
  const theme = useAppTheme();
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value,
  }));

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E0A07' }}>
      <Animated.View style={animatedStyle}>
        <Image 
          source={require('../../../assets/birvana-mark.png')} 
          style={{ width: 100, height: 100 }} 
          contentFit="contain" 
        />
      </Animated.View>
    </Screen>
  );
}
