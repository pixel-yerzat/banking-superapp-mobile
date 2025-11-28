import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const NotificationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useGetNotificationsQuery({ limit: 50, offset: 0 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data?.notifications || [];
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const displayedNotifications = activeTab === 'unread' ? unreadNotifications : notifications;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    refetch();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction':
        return { name: 'swap-horizontal', color: colors.primary };
      case 'security':
        return { name: 'shield-checkmark', color: colors.error };
      case 'marketing':
        return { name: 'megaphone', color: colors.secondary };
      default:
        return { name: 'notifications', color: colors.gray500 };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key;
      if (date.toDateString() === today.toDateString()) {
        key = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Вчера';
      } else {
        key = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
    });
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(displayedNotifications);

  const renderNotificationItem = (notification) => {
    const icon = getNotificationIcon(notification.notification_type);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationItem, !notification.is_read && styles.unreadItem]}
        onPress={() => handleMarkAsRead(notification.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>{formatDate(notification.created_at)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(notification.id)}
        >
          <Ionicons name="close" size={18} color={colors.gray400} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderGroup = ([date, items]) => (
    <View key={date} style={styles.group}>
      <Text style={styles.groupTitle}>{date}</Text>
      <Card style={styles.groupCard}>
        {items.map((notification, index) => (
          <View key={notification.id}>
            {renderNotificationItem(notification)}
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>
    </View>
  );

  const tabs = [
    { id: 'all', label: 'Все' },
    { id: 'unread', label: `Непрочитанные (${unreadNotifications.length})` },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уведомления</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Прочитать все</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={Object.entries(groupedNotifications)}
        renderItem={({ item }) => renderGroup(item)}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'unread' ? 'Все уведомления прочитаны' : 'У вас пока нет уведомлений'}
            </Text>
          </View>
        }
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
  markAllText: { ...typography.body2, color: colors.primary },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.body2, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  group: { marginBottom: spacing.md },
  groupTitle: { ...typography.body2, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm },
  groupCard: { padding: 0 },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  unreadItem: { backgroundColor: `${colors.primary}05` },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  notificationTitle: { ...typography.body2, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.xs },
  notificationMessage: { ...typography.body2, color: colors.textSecondary, marginBottom: spacing.xs },
  notificationTime: { ...typography.caption, color: colors.textTertiary },
  deleteButton: { padding: spacing.xs },
  divider: { height: 1, backgroundColor: colors.gray100 },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
});

export default NotificationsScreen;
