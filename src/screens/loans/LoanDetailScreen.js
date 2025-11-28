import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useGetLoanByIdQuery, useGetLoanPaymentScheduleQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount, formatDate } from '../../utils/formatters';
import { LOAN_TYPE_LABELS } from '../../constants';

const LoanDetailScreen = ({ navigation, route }) => {
  const { loanId } = route.params;
  const [showSchedule, setShowSchedule] = useState(false);

  const { data: loanData, isLoading } = useGetLoanByIdQuery(loanId);
  const { data: scheduleData } = useGetLoanPaymentScheduleQuery(loanId);

  const loan = loanData?.data;
  const schedule = scheduleData?.data || [];

  // Mock schedule if not available
  const mockSchedule = Array.from({ length: 12 }, (_, i) => ({
    payment_number: i + 1,
    payment_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_payment: 45000,
    principal: 35000,
    interest: 10000,
    remaining_balance: loan?.remaining_amount - (35000 * (i + 1)) || 0,
    status: i === 0 ? 'upcoming' : 'scheduled',
  }));

  const paymentSchedule = schedule.length > 0 ? schedule : mockSchedule;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Активный', color: colors.success };
      case 'overdue':
        return { label: 'Просрочен', color: colors.error };
      case 'closed':
        return { label: 'Закрыт', color: colors.gray400 };
      default:
        return { label: status, color: colors.gray400 };
    }
  };

  if (isLoading || !loan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = getStatusBadge(loan.status);
  const progressPercent = ((loan.amount - loan.remaining_amount) / loan.amount) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали кредита</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Loan Card */}
        <Card style={styles.loanCard}>
          <View style={styles.loanHeader}>
            <View style={styles.loanType}>
              <View style={styles.loanIcon}>
                <Ionicons name="cash-outline" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.loanName}>{LOAN_TYPE_LABELS[loan.loan_type] || loan.loan_type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.loanAmount}>{formatAmount(loan.amount, loan.currency)}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Выплачено</Text>
              <Text style={styles.progressPercent}>{progressPercent.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressValues}>
              <Text style={styles.progressPaid}>
                {formatAmount(loan.amount - loan.remaining_amount, loan.currency)}
              </Text>
              <Text style={styles.progressRemaining}>
                Остаток: {formatAmount(loan.remaining_amount, loan.currency)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Next Payment */}
        {loan.status === 'active' && loan.next_payment && (
          <Card style={styles.nextPaymentCard}>
            <View style={styles.nextPaymentHeader}>
              <View>
                <Text style={styles.nextPaymentLabel}>Следующий платёж</Text>
                <Text style={styles.nextPaymentDate}>
                  {formatDate(loan.next_payment.date, 'long')}
                </Text>
              </View>
              <Text style={styles.nextPaymentAmount}>
                {formatAmount(loan.next_payment.amount || loan.monthly_payment, loan.currency)}
              </Text>
            </View>
            <Button
              title="Оплатить сейчас"
              onPress={() => navigation.navigate('LoanPayment', { loanId, amount: loan.next_payment.amount || loan.monthly_payment })}
              fullWidth
            />
          </Card>
        )}

        {/* Overdue Warning */}
        {loan.status === 'overdue' && (
          <Card style={styles.overdueCard}>
            <Ionicons name="warning" size={24} color={colors.error} />
            <View style={styles.overdueInfo}>
              <Text style={styles.overdueTitle}>Просрочка платежа</Text>
              <Text style={styles.overdueText}>
                Сумма просрочки: {formatAmount(loan.overdue_amount || 0, loan.currency)}
              </Text>
            </View>
            <Button
              title="Погасить"
              variant="danger"
              size="small"
              onPress={() => navigation.navigate('LoanPayment', { loanId, amount: loan.overdue_amount })}
            />
          </Card>
        )}

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Условия кредита</Text>
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Сумма кредита</Text>
              <Text style={styles.detailValue}>{formatAmount(loan.amount, loan.currency)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Процентная ставка</Text>
              <Text style={styles.detailValue}>{loan.interest_rate}% годовых</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Срок кредита</Text>
              <Text style={styles.detailValue}>{loan.term_months} мес.</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ежемесячный платёж</Text>
              <Text style={styles.detailValue}>{formatAmount(loan.monthly_payment, loan.currency)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дата оформления</Text>
              <Text style={styles.detailValue}>{formatDate(loan.created_at, 'short')}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Дата закрытия</Text>
              <Text style={styles.detailValue}>{formatDate(loan.end_date, 'short')}</Text>
            </View>
          </Card>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Структура платежей</Text>
          <Card style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.breakdownLabel}>Основной долг</Text>
              <Text style={styles.breakdownValue}>
                {formatAmount(loan.amount - (loan.total_interest || loan.amount * 0.2), loan.currency)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.breakdownLabel}>Проценты</Text>
              <Text style={styles.breakdownValue}>
                {formatAmount(loan.total_interest || loan.amount * 0.2, loan.currency)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownTotalLabel}>Общая сумма</Text>
              <Text style={styles.breakdownTotalValue}>
                {formatAmount(loan.total_amount || loan.amount * 1.2, loan.currency)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Payment Schedule */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.scheduleHeader}
            onPress={() => setShowSchedule(!showSchedule)}
          >
            <Text style={styles.sectionTitle}>График платежей</Text>
            <Ionicons
              name={showSchedule ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showSchedule && (
            <Card style={styles.scheduleCard}>
              {paymentSchedule.slice(0, 12).map((payment, index) => (
                <View
                  key={index}
                  style={[styles.scheduleItem, index === paymentSchedule.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.scheduleLeft}>
                    <Text style={styles.scheduleNumber}>#{payment.payment_number}</Text>
                    <Text style={styles.scheduleDate}>{formatDate(payment.payment_date, 'short')}</Text>
                  </View>
                  <View style={styles.scheduleRight}>
                    <Text style={styles.scheduleAmount}>{formatAmount(payment.total_payment, loan.currency)}</Text>
                    <Text style={styles.scheduleDetails}>
                      Осн: {formatAmount(payment.principal, loan.currency)} | %: {formatAmount(payment.interest, loan.currency)}
                    </Text>
                  </View>
                  {payment.status === 'paid' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  )}
                  {payment.status === 'upcoming' && (
                    <Ionicons name="time" size={20} color={colors.warning} />
                  )}
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Досрочное погашение"
            variant="outline"
            onPress={() => navigation.navigate('EarlyRepayment', { loanId })}
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Заказать справку"
            variant="outline"
            onPress={() => Alert.alert('Справка', 'Справка будет отправлена на email')}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  loanCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  loanType: { flexDirection: 'row', alignItems: 'center' },
  loanIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  loanName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing.xs },
  statusText: { ...typography.caption, fontWeight: '500' },
  loanAmount: { ...typography.h3, color: colors.textPrimary },
  progressSection: { marginTop: spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressLabel: { ...typography.body2, color: colors.textSecondary },
  progressPercent: { ...typography.body2, fontWeight: '600', color: colors.primary },
  progressBar: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressValues: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  progressPaid: { ...typography.caption, color: colors.success },
  progressRemaining: { ...typography.caption, color: colors.textSecondary },
  nextPaymentCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  nextPaymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  nextPaymentLabel: { ...typography.body2, color: colors.textSecondary },
  nextPaymentDate: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  nextPaymentAmount: { ...typography.h3, color: colors.primary },
  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: `${colors.error}10`,
    gap: spacing.md,
  },
  overdueInfo: { flex: 1 },
  overdueTitle: { ...typography.body2, fontWeight: '600', color: colors.error },
  overdueText: { ...typography.caption, color: colors.textSecondary },
  section: { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  detailsCard: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  detailLabel: { ...typography.body2, color: colors.textSecondary },
  detailValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  breakdownCard: {},
  breakdownItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  breakdownDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  breakdownLabel: { ...typography.body2, color: colors.textSecondary, flex: 1 },
  breakdownValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  breakdownDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: spacing.sm },
  breakdownTotalLabel: { ...typography.body1, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  breakdownTotalValue: { ...typography.body1, fontWeight: '700', color: colors.primary },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleCard: {},
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  scheduleLeft: { width: 80 },
  scheduleNumber: { ...typography.body2, fontWeight: '600', color: colors.textPrimary },
  scheduleDate: { ...typography.caption, color: colors.textSecondary },
  scheduleRight: { flex: 1, marginLeft: spacing.md },
  scheduleAmount: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  scheduleDetails: { ...typography.caption, color: colors.textTertiary },
  actionsSection: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  actionButton: { marginBottom: spacing.sm },
});

export default LoanDetailScreen;
