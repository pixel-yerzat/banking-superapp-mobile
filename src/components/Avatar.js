import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography } from '../theme/colors';

const Avatar = ({
  source,
  name,
  size = 48,
  variant = 'circle', // 'circle' | 'rounded' | 'square'
  backgroundColor,
  textColor,
  icon,
  iconColor,
  showBadge = false,
  badgeContent,
  badgeColor = colors.error,
  onPress,
  style,
  ...props
}) => {
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'rounded':
        return size / 4;
      case 'square':
        return 0;
      default:
        return size / 2;
    }
  };

  const getTextSize = () => {
    if (size <= 32) return 12;
    if (size <= 48) return 16;
    if (size <= 64) return 20;
    return 24;
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: getBorderRadius(),
    backgroundColor: backgroundColor || colors.primary,
  };

  const Container = onPress ? TouchableOpacity : View;

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={[styles.image, { borderRadius: getBorderRadius() }]}
          resizeMode="cover"
        />
      );
    }

    if (icon) {
      return (
        <Ionicons
          name={icon}
          size={size * 0.5}
          color={iconColor || colors.white}
        />
      );
    }

    if (name) {
      return (
        <Text
          style={[
            styles.initials,
            { fontSize: getTextSize(), color: textColor || colors.white },
          ]}
        >
          {getInitials(name)}
        </Text>
      );
    }

    return (
      <Ionicons
        name="person"
        size={size * 0.5}
        color={iconColor || colors.white}
      />
    );
  };

  return (
    <Container
      style={[styles.container, avatarStyle, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
      
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              minWidth: size * 0.35,
              height: size * 0.35,
              borderRadius: size * 0.175,
            },
          ]}
        >
          {badgeContent && (
            <Text style={styles.badgeText}>{badgeContent}</Text>
          )}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    ...typography.overline,
    color: colors.white,
    fontSize: 10,
  },
});

export default Avatar;
