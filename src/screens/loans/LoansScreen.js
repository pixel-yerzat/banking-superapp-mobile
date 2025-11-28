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
import { useGetLoansQuery, useGetLoanStatsQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { LOAN_TYPE_LABELS, CURRENCY_SYMBOLS } from '../../constants';

const LoansScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: loansData, refetch: refetchLoans } = useGetLoansQuery();
  const { data: statsData, refetch: refetchStats } = useGetLoanStatsQuery();

  const loans = loansData?.data || [];
  const stats = statsData?.data || {};

  const activeLoans = loans.filter((l) => l.status === 'active');
  const pendingLoans = loans.filter((l) => l.status === 'pending');
  const paidOffLoans = loans.filter((l) => l.status === 'paid_off');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLoans(), refetchStats()]);
    setRefreshing(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const getProgressPercentage = (loan) => {
    const paid = loan.principal_amount - loan.remaining_balance;
    return (paid / loan.principal_amount) * 100;
  };

  const renderLoanCard = (loan) => (
    <Card
      key={loan.id}
      style={styles.loanCard}
      onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
    >
      <View style={styles.loanHeader}>
        <View style={styles.loanTypeContainer}>
          <View style={[styles.loanIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.loanType}>{LOAN_TYPE_LABELS[loan.loan_type]}</Text>
            <Text style={styles.loanRate}>{loan.interest_rate}% годовых</Text>
          </View>
        </View>
        <View style={styles.loanStatus}>
          <Text style={[styles.statusText, { color: loan.status === 'active' ? colors.success : colors.warning }]}>
            {loan.status === 'active' ? 'Активный' : 'На рассмотрении'}
          </Text>
        </View>
      </View>

      <View style={styles.loanBalance}>
        <Text style={styles.balanceLabel}>Остаток долга</Text>
        <Text style={styles.balanceAmount}>
          {formatAmount(loan.remaining_balance)} {CURRENCY_SYMBOLS.KZT}
        </Text>
      </View>

      {loan.status === 'active' && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage(loan)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(getProgressPercentage(loan))}% выплачено</Text>
          </View>

          <View style={styles.nextPayment}>
            <View>
              <Text style={styles.nextPaymentLabel}>Следующий платёж</Text>
              <Text style={styles.nextPaymentDate}>
                {new Date(loan.next_payment_date).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <View style={styles.nextPaymentAmount}>
              <Text style={styles.paymentAmount}>
                {formatAmount(loan.monthly_payment)} {CURRENCY_SYMBOLS.KZT}
              </Text>
              <Button
                title="Оплатить"
                size="small"
                onPress={() => navigation.navigate('LoanPayment', { loanId: loan.id })}
              />
            </View>
          </View>
        </>
      )}
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
          <Text style={styles.headerTitle}>Кредиты</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoanCalculator')}>
            <Ionicons name="calculator-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_loans || 0}</Text>
              <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active_loans || 0}</Text>
              <Text style={styles.statLabel}>Активных</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatAmount(stats.total_remaining)}</Text>
              <Text style={styles.statLabel}>Остаток</Text>
            </View>
          </View>
          <View style={styles.monthlyPayment}>
            <Text style={styles.monthlyLabel}>Ежемесячный платёж:</Text>
            <Text style={styles.monthlyAmount}>
              {formatAmount(stats.monthly_payment_total)} {CURRENCY_SYMBOLS.KZT}
            </Text>
          </View>
        </Card>

        {/* Pending Loans */}
        {pendingLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Заявки</Text>
            {pendingLoans.map(renderLoanCard)}
          </View>
        )}

        {/* Active Loans */}
        {activeLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Активные кредиты</Text>
            {activeLoans.map(renderLoanCard)}
          </View>
        )}

        {/* Paid Off Loans */}
        {paidOffLoans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Погашенные</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Все</Text>
              </TouchableOpacity>
            </View>
            {paidOffLoans.slice(0, 2).map((loan) => (
              <Card key={loan.id} style={styles.paidLoanCard}>
                <View style={styles.paidLoanRow}>
                  <Text style={styles.paidLoanType}>{LOAN_TYPE_LABELS[loan.loan_type]}</Text>
                  <Text style={styles.paidLoanAmount}>{formatAmount(loan.principal_amount)} ₸</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {loans.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Нет кредитов</Text>
            <Text style={styles.emptyText}>У вас пока нет активных кредитов</Text>
            <Button
              title="Подать заявку"
              onPress={() => navigation.navigate('LoanApplication')}
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LoanApplication')}
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
  monthlyPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  monthlyLabel: { ...typography.body2, color: colors.textSecondary },
  monthlyAmount: { ...typography.h4, color: colors.primary },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.md },
  seeAll: { ...typography.body2, color: colors.primary },
  loanCard: { marginBottom: spacing.md },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  loanTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  loanIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  loanType: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  loanRate: { ...typography.caption, color: colors.textSecondary },
  loanStatus: {},
  statusText: { ...typography.caption, fontWeight: '500' },
  loanBalance: { marginBottom: spacing.md },
  balanceLabel: { ...typography.caption, color: colors.textSecondary },
  balanceAmount: { ...typography.h3, color: colors.textPrimary },
  progressContainer: { marginBottom: spacing.md },
  progressBar: { height: 8, backgroundColor: colors.gray200, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  progressText: { ...typography.caption, color: colors.textSecondary },
  nextPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  nextPaymentLabel: { ...typography.caption, color: colors.textSecondary },
  nextPaymentDate: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  nextPaymentAmount: { alignItems: 'flex-end' },
  paymentAmount: { ...typography.body2, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  paidLoanCard: { marginBottom: spacing.sm },
  paidLoanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paidLoanType: { ...typography.body2, color: colors.textSecondary },
  paidLoanAmount: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

export default LoansScreen;
