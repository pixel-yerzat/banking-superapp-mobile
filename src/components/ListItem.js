import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const ListItem = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftElement,
  rightIcon,
  rightElement,
  rightText,
  rightTextStyle,
  onPress,
  showChevron = true,
  showDivider = true,
  disabled = false,
  selected = false,
  style,
  titleStyle,
  subtitleStyle,
  ...props
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {(leftIcon || leftElement) && (
          <View style={styles.leftContainer}>
            {leftElement || (
              <View style={styles.iconContainer}>
                <Ionicons name={leftIcon} size={24} color={colors.primary} />
              </View>
            )}
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightText && (
            <Text style={[styles.rightText, rightTextStyle]}>{rightText}</Text>
          )}
          {rightElement}
          {showChevron && onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.gray400}
              style={styles.chevron}
            />
          )}
          {rightIcon && !showChevron && (
            <Ionicons name={rightIcon} size={20} color={colors.gray400} />
          )}
        </View>
      </View>

      {showDivider && <View style={styles.divider} />}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.gray50,
  },
  disabled: {
    opacity: 0.5,
  },
  leftContainer: {
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  rightText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginLeft: spacing.md + 40 + spacing.md,
  },
});

export default ListItem;
