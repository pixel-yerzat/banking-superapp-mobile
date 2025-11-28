import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useGetDepositsQuery, useGetDepositStatsQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { DEPOSIT_TYPE_LABELS, CURRENCY_SYMBOLS } from '../../constants';

const DepositsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: depositsData, refetch: refetchDeposits } = useGetDepositsQuery();
  const { data: statsData, refetch: refetchStats } = useGetDepositStatsQuery();

  const deposits = depositsData?.data || [];
  const stats = statsData?.data || {};

  const activeDeposits = deposits.filter((d) => d.status === 'active');
  const closedDeposits = deposits.filter((d) => d.status === 'closed' || d.status === 'matured');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDeposits(), refetchStats()]);
    setRefreshing(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const getDaysRemaining = (maturityDate) => {
    const now = new Date();
    const maturity = new Date(maturityDate);
    const diff = maturity - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercentage = (startDate, maturityDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const renderDepositCard = (deposit) => (
    <Card
      key={deposit.id}
      style={styles.depositCard}
      onPress={() => navigation.navigate('DepositDetail', { depositId: deposit.id })}
    >
      <View style={styles.depositHeader}>
        <View style={styles.depositTypeContainer}>
          <View style={[styles.depositIcon, { backgroundColor: `${colors.secondary}15` }]}>
            <Ionicons name="trending-up-outline" size={20} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.depositType}>{DEPOSIT_TYPE_LABELS[deposit.deposit_type]}</Text>
            <Text style={styles.depositRate}>{deposit.interest_rate}% годовых</Text>
          </View>
        </View>
        {deposit.is_auto_renewal && (
          <View style={styles.autoRenewalBadge}>
            <Ionicons name="repeat-outline" size={14} color={colors.success} />
            <Text style={styles.autoRenewalText}>Автопролонгация</Text>
          </View>
        )}
      </View>

      <View style={styles.depositBalance}>
        <View>
          <Text style={styles.balanceLabel}>Сумма вклада</Text>
          <Text style={styles.principalAmount}>
            {formatAmount(deposit.principal_amount)} {CURRENCY_SYMBOLS.KZT}
          </Text>
        </View>
        <View style={styles.currentBalance}>
          <Text style={styles.balanceLabel}>Текущий баланс</Text>
          <Text style={styles.balanceAmount}>
            {formatAmount(deposit.current_balance)} {CURRENCY_SYMBOLS.KZT}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgressPercentage(deposit.start_date, deposit.maturity_date)}%` },
            ]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Осталось {getDaysRemaining(deposit.maturity_date)} дней
          </Text>
          <Text style={styles.maturityDate}>
            до {new Date(deposit.maturity_date).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Депозиты</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DepositCalculator')}>
            <Ionicons name="calculator-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_deposits || 0}</Text>
              <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active_deposits || 0}</Text>
              <Text style={styles.statLabel}>Активных</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                +{formatAmount(stats.estimated_interest)}
              </Text>
              <Text style={styles.statLabel}>Ожидаемый доход</Text>
            </View>
          </View>
          <View style={styles.totalInvested}>
            <Text style={styles.totalLabel}>Всего вложено:</Text>
            <Text style={styles.totalAmount}>
              {formatAmount(stats.total_invested)} {CURRENCY_SYMBOLS.KZT}
            </Text>
          </View>
        </Card>

        {/* Active Deposits */}
        {activeDeposits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Активные депозиты</Text>
            {activeDeposits.map(renderDepositCard)}
          </View>
        )}

        {/* Closed Deposits */}
        {closedDeposits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Закрытые</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Все</Text>
              </TouchableOpacity>
            </View>
            {closedDeposits.slice(0, 2).map((deposit) => (
              <Card key={deposit.id} style={styles.closedDepositCard}>
                <View style={styles.closedDepositRow}>
                  <Text style={styles.closedDepositType}>{DEPOSIT_TYPE_LABELS[deposit.deposit_type]}</Text>
                  <Text style={styles.closedDepositAmount}>{formatAmount(deposit.principal_amount)} ₸</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {deposits.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Нет депозитов</Text>
            <Text style={styles.emptyText}>Откройте депозит и начните зарабатывать</Text>
            <Button
              title="Открыть депозит"
              onPress={() => navigation.navigate('OpenDeposit')}
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('OpenDeposit')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
  statsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  statItem: { alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statDivider: { width: 1, backgroundColor: colors.gray200 },
  totalInvested: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  totalLabel: { ...typography.body2, color: colors.textSecondary },
  totalAmount: { ...typography.h4, color: colors.secondary },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.md },
  seeAll: { ...typography.body2, color: colors.primary },
  depositCard: { marginBottom: spacing.md },
  depositHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  depositTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  depositIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  depositType: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  depositRate: { ...typography.caption, color: colors.textSecondary },
  autoRenewalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  autoRenewalText: { ...typography.caption, color: colors.success },
  depositBalance: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  balanceLabel: { ...typography.caption, color: colors.textSecondary },
  principalAmount: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  currentBalance: { alignItems: 'flex-end' },
  balanceAmount: { ...typography.body1, fontWeight: '600', color: colors.success },
  progressContainer: { marginTop: spacing.sm },
  progressBar: { height: 6, backgroundColor: colors.gray200, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 3 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { ...typography.caption, color: colors.textSecondary },
  maturityDate: { ...typography.caption, color: colors.textTertiary },
  closedDepositCard: { marginBottom: spacing.sm },
  closedDepositRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closedDepositType: { ...typography.body2, color: colors.textSecondary },
  closedDepositAmount: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  emptyButton: { minWidth: 160 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

export default DepositsScreen;
