import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack, usePlaybackState, useProgress, State } from 'react-native-track-player';
import { CachedImage } from '@/components/primitives/CachedImage';

import { AppText } from '@/components/primitives/AppText';
import { togglePlayback } from '@/services/audio/playback-controller';

type StaticMiniPlayerProps = {
  onOpen: () => void;
};

export const StaticMiniPlayer = memo(function StaticMiniPlayer({ onOpen }: StaticMiniPlayerProps) {
  const insets = useSafeAreaInsets();
  const currentTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  if (!currentTrack) {
    return null;
  }

  const isPlaying = playbackState.state === State.Playing || playbackState.state === State.Buffering || playbackState.state === State.Loading;

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: Math.max(insets.bottom, 6) + 6,
        left: 18,
        position: 'absolute',
        right: 18,
      }}
    >
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => ({
          opacity: pressed ? 0.97 : 1,
        })}
      >
        <View
          style={{
            backgroundColor: '#7B664E',
            borderRadius: 18,
            overflow: 'hidden',
            paddingBottom: 10,
            paddingHorizontal: 14,
            paddingTop: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <CachedImage
              contentFit="cover"
              transition={200}
              source={currentTrack.artwork}
              style={{
                borderRadius: 10,
                height: 60,
                width: 60,
              }}
            />

            <View
              style={{
                flex: 1,
                marginLeft: 14,
                minWidth: 0,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <AppText
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                    variant="label"
                  >
                    {currentTrack.title}
                  </AppText>
                  <AppText
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: 'rgba(255,255,255,0.68)',
                      fontSize: 12,
                      lineHeight: 15,
                      marginTop: 4,
                    }}
                    variant="caption"
                  >
                    {currentTrack.artist && currentTrack.artist.trim() !== '' ? currentTrack.artist : 'Unknown Artist'}
                  </AppText>
                </View>

                <Pressable
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    void togglePlayback();
                  }}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 10,
                    opacity: pressed ? 0.8 : 1,
                    width: 32,
                  })}
                >
                  <Ionicons
                    color="#FFFFFF"
                    name={isPlaying ? 'pause' : 'play'}
                    size={28}
                    style={{ marginLeft: isPlaying ? 0 : 2 }}
                  />
                </Pressable>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.24)',
                  borderRadius: 999,
                  height: 6,
                  marginTop: 11,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 999,
                    height: '100%',
                    width: `${progress * 100}%`,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
});
