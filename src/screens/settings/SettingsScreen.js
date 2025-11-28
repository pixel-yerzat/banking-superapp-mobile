import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Card, ListItem, Avatar } from '../../components';
import { selectUser } from '../../store/slices/authSlice';
import { selectTheme, setTheme } from '../../store/slices/uiSlice';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const theme = useSelector(selectTheme);

  const settingsSections = [
    {
      title: 'Аккаунт',
      items: [
        { id: 'profile', icon: 'person-outline', label: 'Профиль', screen: 'Profile' },
        { id: 'security', icon: 'shield-checkmark-outline', label: 'Безопасность', screen: 'Security' },
        { id: 'notifications', icon: 'notifications-outline', label: 'Уведомления', screen: 'NotificationSettings' },
      ],
    },
    {
      title: 'Приложение',
      items: [
        { id: 'language', icon: 'language-outline', label: 'Язык', value: 'Русский', screen: 'LanguageSettings' },
        { id: 'currency', icon: 'cash-outline', label: 'Валюта по умолчанию', value: 'KZT', screen: 'CurrencySettings' },
        { id: 'theme', icon: 'moon-outline', label: 'Тёмная тема', isSwitch: true },
      ],
    },
    {
      title: 'О приложении',
      items: [
        { id: 'about', icon: 'information-circle-outline', label: 'О приложении', screen: 'About' },
        { id: 'terms', icon: 'document-text-outline', label: 'Условия использования', screen: 'Terms' },
        { id: 'privacy', icon: 'lock-closed-outline', label: 'Политика конфиденциальности', screen: 'Privacy' },
      ],
    },
  ];

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Настройки</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Profile Section */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Card style={styles.profileCard}>
            <Avatar
              name={user ? `${user.first_name} ${user.last_name}` : 'User'}
              size={64}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user ? `${user.first_name} ${user.last_name}` : 'Пользователь'}
              </Text>
              <Text style={styles.profilePhone}>{user?.phone || '+7 XXX XXX XX XX'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </Card>
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {item.isSwitch ? (
                    <View style={styles.switchItem}>
                      <View style={styles.switchLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons name={item.icon} size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                      </View>
                      <Switch
                        value={theme === 'dark'}
                        onValueChange={handleThemeToggle}
                        trackColor={{ false: colors.gray200, true: colors.primaryLight }}
                        thumbColor={theme === 'dark' ? colors.primary : colors.gray400}
                      />
                    </View>
                  ) : (
                    <ListItem
                      title={item.label}
                      leftIcon={item.icon}
                      rightText={item.value}
                      onPress={() => item.screen && navigation.navigate(item.screen)}
                      showDivider={index < section.items.length - 1}
                    />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Support Section */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <ListItem
              title="Связаться с поддержкой"
              leftIcon="headset-outline"
              onPress={() => navigation.navigate('Support')}
            />
            <ListItem
              title="Оценить приложение"
              leftIcon="star-outline"
              onPress={() => {}}
              showDivider={false}
            />
          </Card>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Версия 1.0.0 (Build 1)</Text>
        </View>
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  profileName: { ...typography.h4, color: colors.textPrimary },
  profilePhone: { ...typography.body2, color: colors.textSecondary, marginTop: 2 },
  profileEmail: { ...typography.caption, color: colors.textTertiary },
  section: { marginBottom: spacing.md },
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
  switchLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemLabel: { ...typography.body1, color: colors.textPrimary },
  versionContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  versionText: { ...typography.caption, color: colors.textTertiary },
});

export default SettingsScreen;
