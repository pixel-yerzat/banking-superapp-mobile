import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Card, TransactionItem, ConfirmModal } from '../../components';
import {
  useGetAccountByIdQuery,
  useGetAccountTransactionsQuery,
  useBlockAccountMutation,
  useUnblockAccountMutation,
} from '../../api';
import { selectShowBalance } from '../../store/slices/uiSlice';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { ACCOUNT_TYPE_LABELS, CURRENCY_SYMBOLS, STATUS_LABELS } from '../../constants';

const AccountDetailScreen = ({ navigation, route }) => {
  const { accountId } = route.params;
  const showBalance = useSelector(selectShowBalance);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const { data: accountData, refetch: refetchAccount } = useGetAccountByIdQuery(accountId);
  const { data: transactionsData, refetch: refetchTransactions } = useGetAccountTransactionsQuery({
    accountId,
    page: 1,
    limit: 10,
  });
  
  const [blockAccount, { isLoading: isBlocking }] = useBlockAccountMutation();
  const [unblockAccount, { isLoading: isUnblocking }] = useUnblockAccountMutation();

  const account = accountData?.data;
  const transactions = transactionsData?.data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccount(), refetchTransactions()]);
    setRefreshing(false);
  };

  const formatBalance = (amount) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const handleBlockToggle = async () => {
    try {
      if (account?.status === 'active') {
        await blockAccount(accountId).unwrap();
        Alert.alert('Успешно', 'Счёт заблокирован');
      } else {
        await unblockAccount(accountId).unwrap();
        Alert.alert('Успешно', 'Счёт разблокирован');
      }
      setShowBlockModal(false);
      refetchAccount();
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось выполнить операцию');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'blocked': return colors.error;
      default: return colors.gray400;
    }
  };

  if (!account) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ACCOUNT_TYPE_LABELS[account.account_type]}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowBlockModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Номер счёта</Text>
            <Text style={styles.infoValue}>{account.account_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Валюта</Text>
            <Text style={styles.infoValue}>{account.currency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Статус</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(account.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(account.status) }]}>
                {STATUS_LABELS[account.status]}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Баланс</Text>
          <Text style={styles.balanceAmount}>
            {formatBalance(account.balance)} {CURRENCY_SYMBOLS[account.currency]}
          </Text>
          <Text style={styles.availableLabel}>
            Доступно: {formatBalance(account.available_balance)} {CURRENCY_SYMBOLS[account.currency]}
          </Text>
        </Card>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle-outline" size={24} color={colors.success} />
            <Text style={styles.actionTitle}>Пополнить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="swap-horizontal-outline" size={24} color={colors.primary} />
            <Text style={styles.actionTitle}>Перевести</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="card-outline" size={24} color={colors.secondary} />
            <Text style={styles.actionTitle}>Карта</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>История</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Все</Text></TouchableOpacity>
          </View>
          <Card style={styles.transactionsCard}>
            {transactions.length > 0 ? transactions.map((t) => (
              <TransactionItem
                key={t.id}
                type={t.transaction_type}
                status={t.status}
                amount={t.amount}
                currency={t.currency}
                title={t.description || 'Операция'}
                date={t.created_at}
                isIncoming={t.to_account_id === accountId}
              />
            )) : (
              <View style={styles.emptyTransactions}>
                <Ionicons name="receipt-outline" size={48} color={colors.gray300} />
                <Text style={styles.emptyText}>Нет операций</Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockToggle}
        title={account.status === 'active' ? 'Заблокировать счёт?' : 'Разблокировать счёт?'}
        message={account.status === 'active' ? 'Операции будут недоступны' : 'Счёт будет разблокирован'}
        confirmText={account.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
        confirmVariant={account.status === 'active' ? 'danger' : 'primary'}
        icon={account.status === 'active' ? 'lock-closed' : 'lock-open'}
        loading={isBlocking || isUnblocking}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  menuButton: { padding: spacing.xs },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  infoCard: { marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  infoLabel: { ...typography.body2, color: colors.textSecondary },
  infoValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  statusBadge: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full },
  statusText: { ...typography.caption, fontWeight: '600' },
  balanceCard: { marginBottom: spacing.md, alignItems: 'center', paddingVertical: spacing.lg },
  balanceLabel: { ...typography.body2, color: colors.textSecondary },
  balanceAmount: { ...typography.h1, color: colors.textPrimary, marginVertical: spacing.xs },
  availableLabel: { ...typography.body2, color: colors.success },
  actionsContainer: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionCard: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  actionTitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  transactionsSection: { marginTop: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  seeAll: { ...typography.body2, color: colors.primary, fontWeight: '500' },
  transactionsCard: { padding: 0 },
  emptyTransactions: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body2, color: colors.textTertiary, marginTop: spacing.sm },
});

export default AccountDetailScreen;
