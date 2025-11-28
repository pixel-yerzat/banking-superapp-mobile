import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Logo } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

const AboutScreen = ({ navigation }) => {
  const handleRateApp = () => {
    Alert.alert(
      'Оценить приложение',
      'Вы будете перенаправлены в магазин приложений',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Оценить', onPress: () => Linking.openURL('market://details?id=com.banking.superapp') },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      // Share API would be used here
      Alert.alert('Поделиться', 'Функция в разработке');
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку');
    });
  };

  const menuItems = [
    {
      id: 'terms',
      label: 'Условия использования',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      id: 'privacy',
      label: 'Политика конфиденциальности',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      id: 'licenses',
      label: 'Лицензии',
      icon: 'ribbon-outline',
      onPress: () => navigation.navigate('Licenses'),
    },
  ];

  const socialLinks = [
    { id: 'instagram', icon: 'logo-instagram', url: 'https://instagram.com/bankingsuperapp' },
    { id: 'facebook', icon: 'logo-facebook', url: 'https://facebook.com/bankingsuperapp' },
    { id: 'twitter', icon: 'logo-twitter', url: 'https://twitter.com/bankingsuperapp' },
    { id: 'telegram', icon: 'paper-plane-outline', url: 'https://t.me/bankingsuperapp' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>О приложении</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* App Info Card */}
        <Card style={styles.appInfoCard}>
          <View style={styles.logoContainer}>
            <Logo size={80} />
          </View>
          <Text style={styles.appName}>Banking SuperApp</Text>
          <Text style={styles.appTagline}>Ваш надёжный финансовый помощник</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Версия {APP_VERSION}</Text>
            <Text style={styles.buildText}>Сборка {BUILD_NUMBER}</Text>
          </View>
        </Card>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Возможности</Text>
          <Card style={styles.featuresCard}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Управление счетами и картами</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="swap-horizontal-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Мгновенные переводы</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Аналитика расходов</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Безопасность и биометрия</Text>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Card style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleRateApp}>
              <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Ionicons name="star" size={24} color={colors.warning} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Оценить приложение</Text>
                <Text style={styles.actionDescription}>Поделитесь своим мнением</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem} onPress={handleShareApp}>
              <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="share-social" size={24} color={colors.success} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Поделиться</Text>
                <Text style={styles.actionDescription}>Расскажите друзьям</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мы в социальных сетях</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.socialButton}
                onPress={() => handleOpenLink(link.url)}
              >
                <Ionicons name={link.icon} size={24} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Developer Info */}
        <View style={styles.developerInfo}>
          <Text style={styles.developerText}>Разработано с ❤️</Text>
          <Text style={styles.copyrightText}>© 2024 Banking SuperApp</Text>
          <Text style={styles.copyrightText}>Все права защищены</Text>
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
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  appInfoCard: { alignItems: 'center', paddingVertical: spacing.xl },
  logoContainer: { marginBottom: spacing.md },
  appName: { ...typography.h2, color: colors.textPrimary },
  appTagline: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
  versionContainer: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  buildText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  featuresCard: {},
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: { ...typography.body2, color: colors.textPrimary },
  menuCard: { padding: 0 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuItemLabel: { ...typography.body2, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.gray100, marginLeft: spacing.md },
  actionsCard: { padding: 0 },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionInfo: { flex: 1 },
  actionLabel: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  actionDescription: { ...typography.caption, color: colors.textSecondary },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  developerInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  developerText: { ...typography.body2, color: colors.textSecondary },
  copyrightText: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
});

export default AboutScreen;
