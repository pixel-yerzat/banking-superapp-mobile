import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },

  // Primary variant
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },

  // Secondary variant
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  secondaryText: {
    color: colors.white,
  },

  // Outline variant
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },

  // Ghost variant
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
  },

  // Danger variant
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.white,
  },

  // Small size
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  smallText: {
    fontSize: 14,
  },

  // Medium size
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  mediumText: {
    fontSize: 16,
  },

  // Large size
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
