import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing
} from 'react-native-reanimated';
import { usePlaybackState, State } from 'react-native-track-player';
import { useTokens } from '@/theme/useTokens';

export function ActiveIndicator() {
  const { colors } = useTokens();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing || playbackState.state === State.Buffering || playbackState.state === State.Loading;

  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.8);
  const bar3 = useSharedValue(0.5);

  useEffect(() => {
    if (isPlaying) {
      bar1.value = withRepeat(withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ), -1, true);

      bar2.value = withRepeat(withSequence(
        withDelay(150, withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) })),
        withTiming(0.4, { duration: 350, easing: Easing.inOut(Easing.ease) })
      ), -1, true);

      bar3.value = withRepeat(withSequence(
        withDelay(300, withTiming(1, { duration: 450, easing: Easing.inOut(Easing.ease) })),
        withTiming(0.2, { duration: 450, easing: Easing.inOut(Easing.ease) })
      ), -1, true);
    } else {
      bar1.value = withTiming(0.2, { duration: 300 });
      bar2.value = withTiming(0.2, { duration: 300 });
      bar3.value = withTiming(0.2, { duration: 300 });
    }
  }, [isPlaying]);

  const style1 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar3.value }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { backgroundColor: colors.primaryAccent }, style1]} />
      <Animated.View style={[styles.bar, { backgroundColor: colors.primaryAccent }, style2]} />
      <Animated.View style={[styles.bar, { backgroundColor: colors.primaryAccent }, style3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 14,
    height: 14,
    gap: 2,
  },
  bar: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
});
