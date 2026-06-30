import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '@/theme/useTokens';

interface Props extends TextInputProps {
  onClear?: () => void;
}

export const SearchInput = ({ value, onChangeText, onClear, ...rest }: Props) => {
  const { colors, radius } = useTokens();

  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: colors.cardBackground, 
      borderRadius: radius.card,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderColor: colors.borderSubtle
    }}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        style={{
          flex: 1,
          marginLeft: 8,
          color: colors.textPrimary,
          fontSize: 16,
          height: '100%',
        }}
        {...rest}
      />

      {value ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
