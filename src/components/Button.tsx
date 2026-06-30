import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTokens } from '@/theme/useTokens';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', disabled }) => {
  const { colors, spacing, radius, typography } = useTokens();
  const bgColor = variant === 'primary' ? colors.primaryAccent : colors.cardBackground;
  const textColor = variant === 'primary' ? colors.textOnAccent : colors.textPrimary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: bgColor, borderRadius: radius.button, paddingVertical: spacing.horizontalPadding / 2, opacity: disabled ? 0.5 : 1 }]}>
      <Text style={[{ color: textColor }, typography.buttonLabel as any, styles.label]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
