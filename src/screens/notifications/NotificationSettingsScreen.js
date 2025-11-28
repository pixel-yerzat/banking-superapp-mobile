import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button } from "../../components";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "../../api";
import { colors, spacing, typography, borderRadius } from "../../theme/colors";

const NotificationSettingsScreen = ({ navigation }) => {
  const { data, isLoading, refetch } = useGetNotificationSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateNotificationSettingsMutation();

  const [settings, setSettings] = useState({
    // Channels
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    // Types
    transaction_notifications: true,
    security_notifications: true,
    marketing_notifications: false,
    system_notifications: true,
    // Additional
    sound: true,
    vibration: true,
  });

  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await updateSettings(newSettings).unwrap();
    } catch (error) {
      // Revert on error
      setSettings(settings);
      Alert.alert("Ошибка", "Не удалось сохранить настройку");
    }
  };

  const handleTestNotification = () => {
    Alert.alert(
      "Тестовое уведомление",
      "Уведомление будет отправлено в течение минуты"
    );
  };

  const ToggleSwitch = ({ value, onToggle }) => (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );

  const SettingItem = ({ icon, label, description, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <ToggleSwitch value={value} onToggle={onToggle} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки уведомлений</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Channels Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Каналы уведомлений</Text>
          <Card style={styles.sectionCard}>
            <SettingItem
              icon="notifications-outline"
              label="Push-уведомления"
              description="Мгновенные уведомления на устройство"
              value={settings.push_enabled}
              onToggle={() => handleToggle("push_enabled")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="mail-outline"
              label="Email-уведомления"
              description="Уведомления на электронную почту"
              value={settings.email_enabled}
              onToggle={() => handleToggle("email_enabled")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="chatbubble-outline"
              label="SMS-уведомления"
              description="Уведомления по SMS"
              value={settings.sms_enabled}
              onToggle={() => handleToggle("sms_enabled")}
            />
          </Card>
        </View>

        {/* Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Типы уведомлений</Text>
          <Card style={styles.sectionCard}>
            <SettingItem
              icon="card-outline"
              label="Транзакции"
              description="Уведомления о переводах и платежах"
              value={settings.transaction_notifications}
              onToggle={() => handleToggle("transaction_notifications")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark-outline"
              label="Безопасность"
              description="Входы в аккаунт, подозрительные действия"
              value={settings.security_notifications}
              onToggle={() => handleToggle("security_notifications")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="megaphone-outline"
              label="Маркетинг"
              description="Акции, предложения и новости"
              value={settings.marketing_notifications}
              onToggle={() => handleToggle("marketing_notifications")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="settings-outline"
              label="Системные"
              description="Обновления приложения и важные сообщения"
              value={settings.system_notifications}
              onToggle={() => handleToggle("system_notifications")}
            />
          </Card>
        </View>

        {/* Additional Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дополнительно</Text>
          <Card style={styles.sectionCard}>
            <SettingItem
              icon="volume-high-outline"
              label="Звук"
              description="Звуковое оповещение"
              value={settings.sound}
              onToggle={() => handleToggle("sound")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="phone-portrait-outline"
              label="Вибрация"
              description="Вибрация при уведомлениях"
              value={settings.vibration}
              onToggle={() => handleToggle("vibration")}
            />
          </Card>
        </View>

        {/* Test Notification */}
        <View style={styles.section}>
          <Button
            title="Отправить тестовое уведомление"
            variant="outline"
            onPress={handleTestNotification}
            fullWidth
            icon={
              <Ionicons name="send-outline" size={18} color={colors.primary} />
            }
          />
        </View>

        {/* Info */}
        <Card style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.info}
          />
          <Text style={styles.infoText}>
            Некоторые уведомления о безопасности не могут быть отключены для
            защиты вашего аккаунта.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: { padding: 0 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  settingContent: { flex: 1 },
  settingLabel: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: colors.gray100, marginLeft: 56 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray200,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: { alignSelf: "flex-end" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.info}10`,
    gap: spacing.sm,
  },
  infoText: { ...typography.caption, color: colors.info, flex: 1 },
});

export default NotificationSettingsScreen;
