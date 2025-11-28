import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Card, ListItem } from '../../components';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const MoreScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const { logout } = useAuth();

  const menuSections = [
    {
      title: 'Финансы',
      items: [
        { id: 'loans', icon: 'cash-outline', label: 'Кредиты', screen: 'Loans' },
        { id: 'deposits', icon: 'trending-up-outline', label: 'Депозиты', screen: 'Deposits' },
        { id: 'analytics', icon: 'bar-chart-outline', label: 'Аналитика', screen: 'Analytics' },
      ],
    },
    {
      title: 'Платежи',
      items: [
        { id: 'templates', icon: 'document-outline', label: 'Шаблоны', screen: 'Templates' },
        { id: 'autopay', icon: 'repeat-outline', label: 'Автоплатежи', screen: 'AutoPayments' },
        { id: 'providers', icon: 'business-outline', label: 'Провайдеры услуг', screen: 'Providers' },
      ],
    },
    {
      title: 'Настройки',
      items: [
        { id: 'settings', icon: 'settings-outline', label: 'Настройки', screen: 'Settings' },
        { id: 'security', icon: 'shield-checkmark-outline', label: 'Безопасность', screen: 'Security' },
        { id: 'notifications', icon: 'notifications-outline', label: 'Уведомления', screen: 'NotificationSettings' },
      ],
    },
    {
      title: 'Помощь',
      items: [
        { id: 'chat', icon: 'chatbubble-outline', label: 'Помощник', screen: 'Chat' },
        { id: 'faq', icon: 'help-circle-outline', label: 'FAQ', screen: 'FAQ' },
        { id: 'support', icon: 'headset-outline', label: 'Поддержка', screen: 'Support' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ещё</Text>
        </View>

        {/* Profile Card */}
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
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </Card>
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, index) => (
                <ListItem
                  key={item.id}
                  title={item.label}
                  leftIcon={item.icon}
                  onPress={() => navigation.navigate(item.screen)}
                  showDivider={index < section.items.length - 1}
                />
              ))}
            </Card>
          </View>
        ))}

        {/* About */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <ListItem
              title="О приложении"
              leftIcon="information-circle-outline"
              onPress={() => navigation.navigate('About')}
            />
            <ListItem
              title="Оценить приложение"
              leftIcon="star-outline"
              onPress={() => {}}
              showDivider={false}
            />
          </Card>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Версия 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  profilePhone: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    paddingVertical: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body1,
    color: colors.error,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default MoreScreen;
