import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import Button from './Button';

const ConfirmModal = ({
  visible = false,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmVariant = 'primary',
  icon,
  iconColor,
  showCancel = true,
  loading = false,
  children,
}) => {
  const getIconColor = () => {
    switch (confirmVariant) {
      case 'danger':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {icon && (
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor || getIconColor()}15` }]}>
                  <Ionicons
                    name={icon}
                    size={32}
                    color={iconColor || getIconColor()}
                  />
                </View>
              )}

              {title && <Text style={styles.title}>{title}</Text>}
              
              {message && <Text style={styles.message}>{message}</Text>}
              
              {children}

              <View style={styles.buttonContainer}>
                {showCancel && (
                  <Button
                    title={cancelText}
                    variant="outline"
                    onPress={onClose}
                    style={styles.button}
                    disabled={loading}
                  />
                )}
                <Button
                  title={confirmText}
                  variant={confirmVariant}
                  onPress={onConfirm}
                  style={styles.button}
                  loading={loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...shadows.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default ConfirmModal;
