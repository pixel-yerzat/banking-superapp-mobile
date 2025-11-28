import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Card, IconButton, BankCard, TransactionItem } from '../components';
import { useGetAccountsQuery, useGetTotalBalanceQuery, useGetTransactionsQuery } from '../api';
import { selectUser } from '../store/slices/authSlice';
import { selectShowBalance, toggleShowBalance, selectUnreadNotifications } from '../store/slices/uiSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/colors';
import { CURRENCY_SYMBOLS, ACCOUNT_TYPE_LABELS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const showBalance = useSelector(selectShowBalance);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: accountsData, refetch: refetchAccounts, isLoading: accountsLoading } = useGetAccountsQuery();
  const { data: balanceData, refetch: refetchBalance } = useGetTotalBalanceQuery();
  const { data: transactionsData, refetch: refetchTransactions } = useGetTransactionsQuery({ page: 1, limit: 5 });

  const accounts = accountsData?.data || [];
  const totalBalance = balanceData?.data || {};
  const transactions = transactionsData?.data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccounts(), refetchBalance(), refetchTransactions()]);
    setRefreshing(false);
  };

  const formatBalance = (amount) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const getTotalKZT = () => {
    return totalBalance.KZT?.total || 0;
  };

  const getAvailableKZT = () => {
    return totalBalance.KZT?.available || 0;
  };

  const quickActions = [
    { id: 'transfer', icon: 'swap-horizontal', label: 'Перевести', screen: 'NewTransfer' },
    { id: 'payment', icon: 'receipt-outline', label: 'Оплатить', screen: 'Providers' },
    { id: 'topup', icon: 'add-circle-outline', label: 'Пополнить', screen: 'TopUp' },
    { id: 'qr', icon: 'qr-code-outline', label: 'QR-код', screen: 'QRScanner' },
    { id: 'more', icon: 'ellipsis-horizontal', label: 'Ещё', screen: 'More' },
  ];

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderAccountCard = ({ item }) => (
    <TouchableOpacity
      style={styles.accountCard}
      onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
    >
      <View style={styles.accountCardHeader}>
        <View style={[styles.accountTypeIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.accountType}>{ACCOUNT_TYPE_LABELS[item.account_type]}</Text>
      </View>
      <Text style={styles.accountNumber}>•••• {item.account_number.slice(-4)}</Text>
      <Text style={styles.accountBalance}>
        {formatBalance(item.balance)} {CURRENCY_SYMBOLS[item.currency]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => navigation.navigate('Profile')}
          >
            <Avatar
              name={user ? `${user.first_name} ${user.last_name}` : 'User'}
              size={44}
            />
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Добро пожаловать</Text>
              <Text style={styles.userName}>
                {user?.first_name || 'Пользователь'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications-outline"
              onPress={() => navigation.navigate('Notifications')}
              badge={unreadNotifications}
            />
            <IconButton
              icon="qr-code-outline"
              onPress={() => navigation.navigate('QRScanner')}
            />
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Общий баланс</Text>
            <TouchableOpacity onPress={() => dispatch(toggleShowBalance())}>
              <Ionicons
                name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceAmount}>
            {formatBalance(getTotalKZT())} {CURRENCY_SYMBOLS.KZT}
          </Text>
          
          <View style={styles.availableBalance}>
            <Text style={styles.availableLabel}>Доступно:</Text>
            <Text style={styles.availableAmount}>
              {formatBalance(getAvailableKZT())} {CURRENCY_SYMBOLS.KZT}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.topUpButton}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.topUpText}>Пополнить</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои счета</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Accounts')}>
              <Text style={styles.seeAll}>Все</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={accounts.slice(0, 3)}
            renderItem={renderAccountCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsContainer}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addAccountCard}
                onPress={() => navigation.navigate('CreateAccount')}
              >
                <View style={styles.addAccountIcon}>
                  <Ionicons name="add" size={28} color={colors.primary} />
                </View>
                <Text style={styles.addAccountText}>Открыть{'\n'}счёт</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>История операций</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>Все</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.transactionsCard}>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  type={transaction.transaction_type}
                  status={transaction.status}
                  amount={transaction.amount}
                  currency={transaction.currency}
                  title={transaction.description || 'Операция'}
                  date={transaction.created_at}
                  isIncoming={transaction.to_account_id === accounts[0]?.id}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
                />
              ))
            ) : (
              <View style={styles.emptyTransactions}>
                <Ionicons name="receipt-outline" size={48} color={colors.gray300} />
                <Text style={styles.emptyText}>Нет операций</Text>
              </View>
            )}
          </Card>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    marginLeft: spacing.sm,
  },
  greetingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  availableBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  availableLabel: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.7)',
    marginRight: spacing.xs,
  },
  availableAmount: {
    ...typography.body1,
    color: colors.white,
    fontWeight: '600',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  topUpText: {
    ...typography.button,
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  accountsContainer: {
    paddingHorizontal: spacing.lg,
  },
  accountCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accountTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  accountType: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  accountNumber: {
    ...typography.body2,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  accountBalance: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  addAccountCard: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray200,
  },
  addAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addAccountText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transactionsCard: {
    marginHorizontal: spacing.lg,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});

export default HomeScreen;
