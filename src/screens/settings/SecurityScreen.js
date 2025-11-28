import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, ListItem, Button, ConfirmModal } from '../../components';
import { useBiometric } from '../../hooks';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const SecurityScreen = ({ navigation }) => {
  const { isAvailable, isEnabled, biometricType, quickEnable, disable } = useBiometric();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDisableBiometricModal, setShowDisableBiometricModal] = useState(false);

  const handleBiometricToggle = async () => {
    if (isEnabled) {
      setShowDisableBiometricModal(true);
    } else {
      const result = await quickEnable();
      if (!result.success) {
        Alert.alert('Ошибка', result.error || 'Не удалось включить биометрию');
      }
    }
  };

  const handleDisableBiometric = async () => {
    const result = await disable();
    if (result.success) {
      setShowDisableBiometricModal(false);
    } else {
      Alert.alert('Ошибка', result.error);
    }
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      Alert.alert(
        'Отключить 2FA?',
        'Это снизит безопасность вашего аккаунта',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Отключить', style: 'destructive', onPress: () => setTwoFactorEnabled(false) },
        ]
      );
    } else {
      navigation.navigate('Enable2FA');
    }
  };

  const sessions = [
    { id: '1', device: 'iPhone 14 Pro', location: 'Алматы, KZ', date: 'Сейчас', current: true },
    { id: '2', device: 'MacBook Pro', location: 'Алматы, KZ', date: '2 часа назад', current: false },
    { id: '3', device: 'Chrome на Windows', location: 'Нур-Султан, KZ', date: 'Вчера', current: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Безопасность</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Пароль</Text>
          <Card style={styles.sectionCard}>
            <ListItem
              title="Изменить пароль"
              subtitle="Последнее изменение: 15 дней назад"
              leftIcon="key-outline"
              onPress={() => navigation.navigate('ChangePassword')}
              showDivider={false}
            />
          </Card>
        </View>

        {/* PIN Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIN-код</Text>
          <Card style={styles.sectionCard}>
            <ListItem
              title="Установить PIN-код"
              subtitle="Для быстрого входа в приложение"
              leftIcon="keypad-outline"
              onPress={() => navigation.navigate('SetupPIN')}
            />
            <ListItem
              title="Изменить PIN-код"
              leftIcon="create-outline"
              onPress={() => navigation.navigate('ChangePIN')}
              showDivider={false}
            />
          </Card>
        </View>

        {/* Biometric Section */}
        {isAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Биометрия</Text>
            <Card style={styles.sectionCard}>
              <View style={styles.switchItem}>
                <View style={styles.switchLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons
                      name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.itemLabel}>{biometricType}</Text>
                    <Text style={styles.itemSubtitle}>Для входа и подтверждения операций</Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: colors.gray200, true: colors.primaryLight }}
                  thumbColor={isEnabled ? colors.primary : colors.gray400}
                />
              </View>
            </Card>
          </View>
        )}

        {/* 2FA Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Двухфакторная аутентификация</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.switchItem}>
              <View style={styles.switchLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.success}15` }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>2FA</Text>
                  <Text style={styles.itemSubtitle}>Дополнительная защита аккаунта</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleTwoFactorToggle}
                trackColor={{ false: colors.gray200, true: colors.successLight }}
                thumbColor={twoFactorEnabled ? colors.success : colors.gray400}
              />
            </View>
          </Card>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Активные сессии</Text>
          </View>
          <Card style={styles.sectionCard}>
            {sessions.map((session, index) => (
              <View key={session.id}>
                <View style={styles.sessionItem}>
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionDevice}>{session.device}</Text>
                      {session.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Текущая</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sessionLocation}>{session.location}</Text>
                    <Text style={styles.sessionDate}>{session.date}</Text>
                  </View>
                  {!session.current && (
                    <TouchableOpacity style={styles.terminateButton}>
                      <Text style={styles.terminateText}>Завершить</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {index < sessions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
          <Button
            title="Выйти со всех устройств"
            variant="outline"
            onPress={() => Alert.alert('Подтверждение', 'Выйти со всех устройств?')}
            style={styles.logoutAllButton}
          />
        </View>
      </ScrollView>

      {/* Disable Biometric Modal */}
      <ConfirmModal
        visible={showDisableBiometricModal}
        onClose={() => setShowDisableBiometricModal(false)}
        onConfirm={handleDisableBiometric}
        title={`Отключить ${biometricType}?`}
        message="Вам потребуется вводить пароль или PIN для входа"
        confirmText="Отключить"
        confirmVariant="danger"
        icon="finger-print"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionCard: { marginHorizontal: spacing.lg, paddingVertical: 0 },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemLabel: { ...typography.body1, color: colors.textPrimary },
  itemSubtitle: { ...typography.caption, color: colors.textSecondary },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sessionInfo: { flex: 1 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sessionDevice: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  currentBadge: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  currentBadgeText: { ...typography.caption, color: colors.success, fontWeight: '500' },
  sessionLocation: { ...typography.caption, color: colors.textSecondary },
  sessionDate: { ...typography.caption, color: colors.textTertiary },
  terminateButton: { padding: spacing.sm },
  terminateText: { ...typography.body2, color: colors.error },
  divider: { height: 1, backgroundColor: colors.gray100 },
  logoutAllButton: { marginHorizontal: spacing.lg, marginTop: spacing.md },
});

export default SecurityScreen;
