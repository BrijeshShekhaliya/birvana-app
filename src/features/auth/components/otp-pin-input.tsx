import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type TextInput as NativeTextInput,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/primitives/AppText';
import { OTP_LENGTH } from '@/features/auth/auth.types';
import { useAppTheme } from '@/theme/useAppTheme';

type OtpCodeInputProps = {
  autoFocus?: boolean;
  status?: 'error' | 'idle' | 'success' | 'typing' | 'verifying';
  value: string;
  onChangeText: (value: string) => void;
};

type OtpCellProps = {
  character: string;
  current: boolean;
  size: number;
  status: NonNullable<OtpCodeInputProps['status']>;
};

function OtpCell({ character, current, size, status }: OtpCellProps) {
  const theme = useAppTheme();
  const glow = useSharedValue(character ? 1 : 0);
  const scale = useSharedValue(current ? 1.02 : 1);

  useEffect(() => {
    glow.value = withTiming(character || status === 'success' ? 1 : 0, {
      duration: 180,
    });
    scale.value = withTiming(current ? 1.03 : 1, {
      duration: 180,
    });
  }, [character, current, glow, scale, status]);

  const animatedStyle = useAnimatedStyle(() => {
    const success = status === 'success';
    const error = status === 'error';
    const borderColor = error
      ? '#C65C5C'
      : success
        ? '#35D17F'
        : current
          ? theme.colors.primary
          : theme.colors.border;

    const backgroundColor = success
      ? 'rgba(53, 209, 127, 0.12)'
      : current
        ? theme.colors.surface
        : theme.colors.surfaceRaised;

    return {
      backgroundColor,
      borderColor,
      borderWidth: current || success || error ? 1.5 : 1,
      shadowColor: error ? '#C65C5C' : success ? '#35D17F' : theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: error || success ? 0.22 + glow.value * 0.1 : current ? 0.14 : 0,
      shadowRadius: error || success ? 12 + glow.value * 4 : current ? 8 : 0,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          alignItems: 'center',
          borderRadius: 18,
          height: 58,
          justifyContent: 'center',
          width: size,
        },
      ]}
    >
      <AppText
        style={{
          fontSize: 22,
          fontVariant: ['tabular-nums'],
          opacity: character ? 1 : 0.34,
        }}
        variant="heading"
      >
        {character || (current ? '|' : '')}
      </AppText>
    </Animated.View>
  );
}

export function OtpCodeInput({
  autoFocus = false,
  onChangeText,
  status = 'idle',
  value,
}: OtpCodeInputProps) {
  const inputRef = useRef<NativeTextInput | null>(null);
  const hasAutoFocusedRef = useRef(false);
  const { width: screenWidth } = useWindowDimensions();
  const theme = useAppTheme();
  const gap = screenWidth <= 380 ? 4 : 6;
  const cellSize = useMemo(() => {
    const availableWidth = Math.min(430, Math.max(280, screenWidth - 48));
    const rawCellWidth = Math.floor(
      (availableWidth - gap * (OTP_LENGTH - 1)) / OTP_LENGTH,
    );

    return Math.max(34, Math.min(42, rawCellWidth));
  }, [gap, screenWidth]);

  const reopenKeyboard = useCallback(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.blur();

    setTimeout(() => {
      input.focus();
      input.setNativeProps({
        selection: {
          end: value.length,
          start: value.length,
        },
      });
    }, 40);
  }, [value.length]);

  const focusInput = useCallback(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.setNativeProps({
      selection: {
        end: value.length,
        start: value.length,
      },
    });
  }, [value.length]);

  useEffect(() => {
    if (!autoFocus || hasAutoFocusedRef.current) {
      return;
    }

    hasAutoFocusedRef.current = true;

    const timer = setTimeout(() => {
      focusInput();
    }, 250);

    return () => clearTimeout(timer);
  }, [autoFocus, focusInput]);

  return (
    <View style={{ gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        onPress={reopenKeyboard}
        style={{
          gap: 12,
          width: '100%',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
          }}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const character = value[index] ?? '';
            const current = index === value.length && value.length < OTP_LENGTH;

            return (
              <OtpCell
                character={character}
                current={current}
                key={index}
                size={cellSize}
                status={status}
              />
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          autoComplete="one-time-code"
          autoCorrect={false}
          autoFocus={autoFocus}
          blurOnSubmit={false}
          caretHidden
          contextMenuHidden
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          onChangeText={onChangeText}
          selectionColor={theme.colors.primary}
          selection={{
            end: value.length,
            start: value.length,
          }}
          showSoftInputOnFocus
          style={{
            height: 1,
            opacity: 0,
            position: 'absolute',
            width: 1,
          }}
          value={value}
        />
      </Pressable>
    </View>
  );
}
