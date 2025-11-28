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
import { Card, Button, ConfirmModal } from '../../components';
import {
  useGetDepositByIdQuery,
  useCloseDepositMutation,
  useToggleAutoRenewalMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount, formatDate } from '../../utils/formatters';
import { DEPOSIT_TYPE_LABELS } from '../../constants';

const DepositDetailScreen = ({ navigation, route }) => {
  const { depositId } = route.params;
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { data, isLoading, refetch } = useGetDepositByIdQuery(depositId);
  const [closeDeposit, { isLoading: isClosing }] = useCloseDepositMutation();
  const [toggleAutoRenewal, { isLoading: isToggling }] = useToggleAutoRenewalMutation();

  const deposit = data?.data;

  const handleCloseDeposit = async () => {
    try {
      await closeDeposit(depositId).unwrap();
      Alert.alert('Успешно', 'Депозит закрыт. Средства переведены на счёт.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось закрыть депозит');
    }
  };

  const handleToggleAutoRenewal = async () => {
    try {
      await toggleAutoRenewal(depositId).unwrap();
      refetch();
      Alert.alert('Успешно', deposit?.auto_renewal ? 'Автопролонгация отключена' : 'Автопролонгация включена');
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось изменить настройку');
    }
  };

  if (isLoading || !deposit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const startDate = new Date(deposit.start_date);
  const endDate = new Date(deposit.end_date);
  const now = new Date();
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const passedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, totalDays - passedDays);
  const progressPercent = Math.min(100, (passedDays / totalDays) * 100);

  const accruedInterest = deposit.current_balance - deposit.initial_amount;
  const expectedTotal = deposit.initial_amount + (deposit.expected_income || accruedInterest);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали вклада</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Main Card */}
        <Card style={styles.mainCard}>
          <View style={styles.depositHeader}>
            <View style={styles.depositType}>
              <View style={styles.depositIcon}>
                <Ionicons name="wallet-outline" size={28} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.depositName}>{DEPOSIT_TYPE_LABELS[deposit.deposit_type] || deposit.deposit_type}</Text>
                <Text style={styles.depositRate}>{deposit.interest_rate}% годовых</Text>
              </View>
            </View>
            {deposit.auto_renewal && (
              <View style={styles.autoRenewalBadge}>
                <Ionicons name="refresh" size={14} color={colors.success} />
                <Text style={styles.autoRenewalText}>Автопролонгация</Text>
              </View>
            )}
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Текущий баланс</Text>
            <Text style={styles.balanceAmount}>{formatAmount(deposit.current_balance, deposit.currency)}</Text>
            <Text style={styles.incomeText}>
              +{formatAmount(accruedInterest, deposit.currency)} начислено
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>До окончания срока</Text>
              <Text style={styles.progressDays}>{remainingDays} дн.</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressDates}>
              <Text style={styles.progressDate}>{formatDate(deposit.start_date, 'short')}</Text>
              <Text style={styles.progressDate}>{formatDate(deposit.end_date, 'short')}</Text>
            </View>
          </View>
        </Card>

        {/* Expected Income */}
        <Card style={styles.incomeCard}>
          <View style={styles.incomeRow}>
            <View>
              <Text style={styles.incomeLabel}>Ожидаемый доход</Text>
              <Text style={styles.incomeDescription}>На конец срока вклада</Text>
            </View>
            <Text style={styles.incomeAmount}>+{formatAmount(deposit.expected_income || accruedInterest * 2, deposit.currency)}</Text>
          </View>
          <View style={styles.incomeDivider} />
          <View style={styles.incomeRow}>
            <Text style={styles.incomeTotalLabel}>Итого получите</Text>
            <Text style={styles.incomeTotalAmount}>{formatAmount(expectedTotal, deposit.currency)}</Text>
          </View>
        </Card>

        {/* Deposit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Условия вклада</Text>
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Начальная сумма</Text>
              <Text style={styles.detailValue}>{formatAmount(deposit.initial_amount, deposit.currency)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Процентная ставка</Text>
              <Text style={[styles.detailValue, { color: colors.success }]}>{deposit.interest_rate}% годовых</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Срок вклада</Text>
              <Text style={styles.detailValue}>{deposit.term_months} мес.</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Капитализация</Text>
              <Text style={styles.detailValue}>{deposit.capitalization ? 'Да' : 'Нет'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дата открытия</Text>
              <Text style={styles.detailValue}>{formatDate(deposit.start_date, 'short')}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Дата закрытия</Text>
              <Text style={styles.detailValue}>{formatDate(deposit.end_date, 'short')}</Text>
            </View>
          </Card>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Возможности</Text>
          <Card style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <Ionicons
                name={deposit.can_replenish ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={deposit.can_replenish ? colors.success : colors.gray400}
              />
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>Пополнение</Text>
                <Text style={styles.featureDescription}>
                  {deposit.can_replenish ? 'Доступно' : 'Недоступно'}
                </Text>
              </View>
              {deposit.can_replenish && (
                <Button
                  title="Пополнить"
                  size="small"
                  variant="outline"
                  onPress={() => navigation.navigate('ReplenishDeposit', { depositId })}
                />
              )}
            </View>
            <View style={styles.featureRow}>
              <Ionicons
                name={deposit.can_withdraw ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={deposit.can_withdraw ? colors.success : colors.gray400}
              />
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>Частичное снятие</Text>
                <Text style={styles.featureDescription}>
                  {deposit.can_withdraw ? 'Доступно' : 'Недоступно'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow} onPress={handleToggleAutoRenewal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Автопролонгация</Text>
                <Text style={styles.settingDescription}>
                  Автоматическое продление вклада на тех же условиях
                </Text>
              </View>
              <View style={[styles.toggle, deposit.auto_renewal && styles.toggleActive]}>
                <View style={[styles.toggleThumb, deposit.auto_renewal && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Interest History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>История начислений</Text>
          <Card style={styles.historyCard}>
            {deposit.interest_history?.length > 0 ? (
              deposit.interest_history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{formatDate(item.date, 'short')}</Text>
                  <Text style={styles.historyAmount}>+{formatAmount(item.amount, deposit.currency)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={32} color={colors.gray300} />
                <Text style={styles.emptyText}>Начисления ещё не производились</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {deposit.can_replenish && (
            <Button
              title="Пополнить вклад"
              onPress={() => navigation.navigate('ReplenishDeposit', { depositId })}
              fullWidth
              style={styles.actionButton}
            />
          )}
          <Button
            title="Закрыть вклад досрочно"
            variant="outline"
            onPress={() => setShowCloseModal(true)}
            fullWidth
          />
          <Text style={styles.warningText}>
            При досрочном закрытии проценты будут пересчитаны по ставке 0.1% годовых
          </Text>
        </View>
      </ScrollView>

      {/* Close Deposit Modal */}
      <ConfirmModal
        visible={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleCloseDeposit}
        title="Закрыть вклад досрочно?"
        message="При досрочном закрытии вы потеряете накопленные проценты. Средства будут переведены на основной счёт."
        confirmText="Закрыть вклад"
        confirmVariant="danger"
        icon="warning"
        loading={isClosing}
      />
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
  mainCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  depositHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  depositType: { flexDirection: 'row', alignItems: 'center' },
  depositIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  depositName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  depositRate: { ...typography.body2, color: colors.success },
  autoRenewalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  autoRenewalText: { ...typography.caption, color: colors.success },
  balanceSection: { alignItems: 'center', marginVertical: spacing.md },
  balanceLabel: { ...typography.body2, color: colors.textSecondary },
  balanceAmount: { ...typography.h1, color: colors.textPrimary, marginVertical: spacing.xs },
  incomeText: { ...typography.body2, color: colors.success },
  progressSection: { marginTop: spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressLabel: { ...typography.body2, color: colors.textSecondary },
  progressDays: { ...typography.body2, fontWeight: '600', color: colors.primary },
  progressBar: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  progressDates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  progressDate: { ...typography.caption, color: colors.textTertiary },
  incomeCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: `${colors.success}10` },
  incomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incomeLabel: { ...typography.body2, fontWeight: '600', color: colors.textPrimary },
  incomeDescription: { ...typography.caption, color: colors.textSecondary },
  incomeAmount: { ...typography.h4, color: colors.success },
  incomeDivider: { height: 1, backgroundColor: colors.gray200, marginVertical: spacing.sm },
  incomeTotalLabel: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  incomeTotalAmount: { ...typography.h3, color: colors.primary },
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
  featuresCard: {},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  featureInfo: { flex: 1, marginLeft: spacing.md },
  featureLabel: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  featureDescription: { ...typography.caption, color: colors.textSecondary },
  settingsCard: {},
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flex: 1 },
  settingLabel: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  settingDescription: { ...typography.caption, color: colors.textSecondary },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: colors.gray200, padding: 2 },
  toggleActive: { backgroundColor: colors.success },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  toggleThumbActive: { marginLeft: 22 },
  historyCard: {},
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  historyDate: { ...typography.body2, color: colors.textSecondary },
  historyAmount: { ...typography.body2, fontWeight: '500', color: colors.success },
  emptyHistory: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { ...typography.body2, color: colors.textTertiary, marginTop: spacing.sm },
  actionsSection: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  actionButton: { marginBottom: spacing.sm },
  warningText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
});

export default DepositDetailScreen;
