import { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  type TextInputProps,
  type TextInput as NativeTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/primitives/AppText';
import { useAppTheme } from '@/theme/useAppTheme';

type AuthTextFieldProps = TextInputProps & {
  error?: boolean;
  errorText?: string;
  label: string;
};

export const AuthTextField = forwardRef<NativeTextInput, AuthTextFieldProps>(
  function AuthTextField({ error = false, errorText, label, style, secureTextEntry, ...props }, ref) {
    const theme = useAppTheme();
    const [focused, setFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const active = focused && !error;

    return (
      <View style={{ gap: 10 }}>
        <AppText variant="label">{label}</AppText>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            ref={ref}
            onBlur={(event) => {
              setFocused(false);
              props.onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              props.onFocus?.(event);
            }}
            placeholderTextColor={theme.colors.muted}
            selectionColor={theme.colors.primary}
            secureTextEntry={isSecure}
            style={[
              {
                backgroundColor: theme.colors.surface,
                borderColor: error
                  ? '#C65C5C'
                  : active
                    ? '#5CAEFF'
                    : theme.colors.border,
                borderRadius: 22,
                borderWidth: active ? 1.5 : 1,
                elevation: active ? 2 : 0,
                color: theme.colors.text,
                minHeight: 62,
                paddingLeft: 20,
                paddingRight: secureTextEntry ? 50 : 20,
                paddingVertical: 16,
                shadowColor: active ? '#4EA1FF' : '#000000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: active ? 0.24 : 0,
                shadowRadius: active ? 10 : 0,
              },
              theme.typography.body,
              style,
            ]}
            {...props}
          />
          {secureTextEntry && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSecure(!isSecure)}
              style={{ position: 'absolute', right: 20, zIndex: 10, elevation: 5, padding: 4 }}
            >
              <Ionicons 
                name={isSecure ? "eye-off" : "eye"} 
                size={22} 
                color={theme.colors.secondary} 
              />
            </TouchableOpacity>
          )}
        </View>
        {errorText ? (
          <AppText style={{ color: '#C65C5C', fontSize: 12, marginTop: -4, paddingLeft: 8 }}>
            {errorText}
          </AppText>
        ) : null}
      </View>
    );
  },
);
