import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

const Logo = ({
  size = 'medium', // 'small' | 'medium' | 'large'
  variant = 'full', // 'full' | 'icon' | 'text'
  color = colors.primary,
  style,
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 32, textSize: 18 };
      case 'large':
        return { iconSize: 64, textSize: 32 };
      default:
        return { iconSize: 48, textSize: 24 };
    }
  };

  const { iconSize, textSize } = getSizeConfig();

  const renderIcon = () => (
    <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
      <Ionicons name="wallet" size={iconSize * 0.6} color={colors.white} />
    </View>
  );

  const renderText = () => (
    <View style={styles.textContainer}>
      <Text style={[styles.title, { fontSize: textSize, color }]}>
        BankApp
      </Text>
      {size !== 'small' && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          SuperApp
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {(variant === 'full' || variant === 'icon') && renderIcon()}
      {(variant === 'full' || variant === 'text') && renderText()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default Logo;
