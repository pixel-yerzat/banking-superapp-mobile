import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

const Card = ({
  children,
  variant = 'elevated', // 'elevated' | 'outlined' | 'filled'
  onPress,
  disabled = false,
  style,
  contentStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      default:
        return styles.elevated;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, getVariantStyles(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  filled: {
    backgroundColor: colors.gray50,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Card;
