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
import { useSelector } from 'react-redux';
import { Card, Button } from '../../components';
import { useGetAccountsQuery } from '../../api';
import { selectShowBalance } from '../../store/slices/uiSlice';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { ACCOUNT_TYPE_LABELS, CURRENCY_SYMBOLS, STATUS_LABELS } from '../../constants';

const AccountsListScreen = ({ navigation }) => {
  const showBalance = useSelector(selectShowBalance);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data, isLoading, refetch } = useGetAccountsQuery();
  const [refreshing, setRefreshing] = useState(false);

  const accounts = data?.data || [];

  const filteredAccounts = accounts.filter((account) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return account.status === 'active';
    if (activeTab === 'blocked') return account.status === 'blocked';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatBalance = (amount) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'blocked':
        return colors.error;
      case 'closed':
        return colors.gray400;
      default:
        return colors.gray400;
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
        return 'wallet-outline';
      case 'savings':
        return 'trending-up-outline';
      case 'deposit':
        return 'lock-closed-outline';
      case 'credit':
        return 'card-outline';
      default:
        return 'wallet-outline';
    }
  };

  const tabs = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'blocked', label: 'Заблокированные' },
  ];

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[styles.tab, activeTab === tab.id && styles.tabActive]}
      onPress={() => setActiveTab(tab.id)}
    >
      <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderAccountItem = ({ item }) => (
    <Card
      style={styles.accountCard}
      onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
    >
      <View style={styles.accountHeader}>
        <View style={[styles.accountIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons
            name={getAccountIcon(item.account_type)}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountType}>
            {ACCOUNT_TYPE_LABELS[item.account_type]}
          </Text>
          <Text style={styles.accountNumber}>
            •••• {item.account_number.slice(-4)}
          </Text>
        </View>
        <View style={styles.accountRight}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.accountBalance}>
        <View>
          <Text style={styles.balanceLabel}>Баланс</Text>
          <Text style={styles.balanceAmount}>
            {formatBalance(item.balance)} {CURRENCY_SYMBOLS[item.currency]}
          </Text>
        </View>
        <View style={styles.availableContainer}>
          <Text style={styles.availableLabel}>Доступно</Text>
          <Text style={styles.availableAmount}>
            {formatBalance(item.available_balance)} {CURRENCY_SYMBOLS[item.currency]}
          </Text>
        </View>
      </View>
      
      <View style={styles.accountActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Пополнить</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Перевести</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Выписка</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyTitle}>Нет счетов</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'all'
          ? 'У вас пока нет открытых счетов'
          : `Нет ${activeTab === 'active' ? 'активных' : 'заблокированных'} счетов`}
      </Text>
      {activeTab === 'all' && (
        <Button
          title="Открыть счёт"
          onPress={() => navigation.navigate('CreateAccount')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Счета</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>

      <FlatList
        data={filteredAccounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateAccount')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  accountCard: {
    marginBottom: spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountNumber: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '500',
  },
  accountBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray100,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  balanceAmount: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  availableContainer: {
    alignItems: 'flex-end',
  },
  availableLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  availableAmount: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.success,
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default AccountsListScreen;
