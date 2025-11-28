import React from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';

const IconButton = ({
  icon,
  onPress,
  size = 'medium', // 'small' | 'medium' | 'large'
  variant = 'default', // 'default' | 'filled' | 'outlined' | 'tonal'
  color,
  backgroundColor,
  disabled = false,
  loading = false,
  badge,
  style,
  iconStyle,
  ...props
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { containerSize: 32, iconSize: 18 };
      case 'large':
        return { containerSize: 56, iconSize: 28 };
      default:
        return { containerSize: 44, iconSize: 24 };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: backgroundColor || colors.primary,
          },
          iconColor: color || colors.white,
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: color || colors.primary,
          },
          iconColor: color || colors.primary,
        };
      case 'tonal':
        return {
          container: {
            backgroundColor: backgroundColor || `${colors.primary}15`,
          },
          iconColor: color || colors.primary,
        };
      default:
        return {
          container: {
            backgroundColor: 'transparent',
          },
          iconColor: color || colors.textPrimary,
        };
    }
  };

  const { containerSize, iconSize } = getSizeConfig();
  const { container: variantContainer, iconColor } = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
        variantContainer,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={icon} size={iconSize} color={iconColor} style={iconStyle} />
      )}
      
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <View style={styles.badgeInner}>
            {badge <= 99 && (
              <Ionicons name="ellipse" size={8} color={colors.white} />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
