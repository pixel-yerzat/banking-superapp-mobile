import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ConfirmModal } from '../../components';
import {
  useGetAutoPaymentsQuery,
  useToggleAutoPaymentMutation,
  useDeleteAutoPaymentMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount, formatDate } from '../../utils/formatters';

const AutoPaymentsScreen = ({ navigation }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { data, isLoading, refetch } = useGetAutoPaymentsQuery();
  const [toggleAutoPayment] = useToggleAutoPaymentMutation();
  const [deleteAutoPayment, { isLoading: isDeleting }] = useDeleteAutoPaymentMutation();

  // Mock data
  const mockAutoPayments = [
    {
      id: '1',
      name: 'Мобильная связь Beeline',
      provider: 'Beeline',
      provider_icon: '🐝',
      amount: 5000,
      currency: 'KZT',
      frequency: 'monthly',
      next_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      account_number: '1234',
      is_active: true,
      last_payment: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Интернет Kazakhtelecom',
      provider: 'Kazakhtelecom',
      provider_icon: '🌐',
      amount: 8990,
      currency: 'KZT',
      frequency: 'monthly',
      next_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      account_number: '5678',
      is_active: true,
      last_payment: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Коммунальные услуги',
      provider: 'АлматыЭнергоСбыт',
      provider_icon: '⚡',
      amount: null,
      currency: 'KZT',
      frequency: 'monthly',
      next_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      account_number: '9012',
      is_active: false,
      last_payment: null,
    },
  ];

  const autoPayments = data?.data || mockAutoPayments;

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      case 'quarterly': return 'Ежеквартально';
      case 'yearly': return 'Ежегодно';
      default: return frequency;
    }
  };

  const handleToggle = async (payment) => {
    try {
      await toggleAutoPayment(payment.id).unwrap();
      refetch();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить статус');
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      await deleteAutoPayment(selectedPayment.id).unwrap();
      setDeleteModalVisible(false);
      setSelectedPayment(null);
      refetch();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить автоплатёж');
    }
  };

  const handleEdit = (payment) => {
    navigation.navigate('EditAutoPayment', { paymentId: payment.id });
  };

  const handleCreate = () => {
    navigation.navigate('CreateAutoPayment');
  };

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Автоплатежи</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Active Payments */}
        {autoPayments.filter((p) => p.is_active).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Активные</Text>
            {autoPayments
              .filter((p) => p.is_active)
              .map((payment) => {
                const daysUntil = getDaysUntil(payment.next_date);
                return (
                  <Card key={payment.id} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <View style={styles.providerIcon}>
                        <Text style={styles.providerEmoji}>{payment.provider_icon}</Text>
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentName}>{payment.name}</Text>
                        <Text style={styles.paymentProvider}>{payment.provider}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggle, payment.is_active && styles.toggleActive]}
                        onPress={() => handleToggle(payment)}
                      >
                        <View style={[styles.toggleThumb, payment.is_active && styles.toggleThumbActive]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.paymentDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Сумма</Text>
                        <Text style={styles.detailValue}>
                          {payment.amount ? formatAmount(payment.amount, payment.currency) : 'По счёту'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Периодичность</Text>
                        <Text style={styles.detailValue}>{getFrequencyLabel(payment.frequency)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Следующий платёж</Text>
                        <View style={styles.nextDateContainer}>
                          <Text style={styles.detailValue}>{formatDate(payment.next_date, 'short')}</Text>
                          <Text style={[styles.daysUntil, daysUntil <= 3 && styles.daysUntilSoon]}>
                            {daysUntil === 0 ? 'Сегодня' : daysUntil === 1 ? 'Завтра' : `через ${daysUntil} дн.`}
                          </Text>
                        </View>
                      </View>
                      {payment.last_payment && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Последний платёж</Text>
                          <Text style={styles.detailValue}>{formatDate(payment.last_payment, 'short')}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.paymentActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEdit(payment)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                        <Text style={styles.actionText}>Изменить</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedPayment(payment);
                          setDeleteModalVisible(true);
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                        <Text style={[styles.actionText, { color: colors.error }]}>Удалить</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
          </View>
        )}

        {/* Inactive Payments */}
        {autoPayments.filter((p) => !p.is_active).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Приостановленные</Text>
            {autoPayments
              .filter((p) => !p.is_active)
              .map((payment) => (
                <Card key={payment.id} style={[styles.paymentCard, styles.inactiveCard]}>
                  <View style={styles.paymentHeader}>
                    <View style={[styles.providerIcon, styles.inactiveIcon]}>
                      <Text style={styles.providerEmoji}>{payment.provider_icon}</Text>
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentName, styles.inactiveText]}>{payment.name}</Text>
                      <Text style={styles.paymentProvider}>{payment.provider}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, payment.is_active && styles.toggleActive]}
                      onPress={() => handleToggle(payment)}
                    >
                      <View style={[styles.toggleThumb, payment.is_active && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inactiveActions}>
                    <Button
                      title="Активировать"
                      size="small"
                      onPress={() => handleToggle(payment)}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPayment(payment);
                        setDeleteModalVisible(true);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
          </View>
        )}

        {/* Empty State */}
        {autoPayments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="sync-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Нет автоплатежей</Text>
            <Text style={styles.emptyText}>
              Настройте автоматическую оплату услуг, чтобы не забывать о платежах
            </Text>
            <Button
              title="Создать автоплатёж"
              onPress={handleCreate}
              style={styles.createButton}
            />
          </View>
        )}

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Как работают автоплатежи</Text>
            <Text style={styles.infoText}>
              Средства списываются автоматически в указанную дату. Вы получите уведомление за день до списания.
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* FAB */}
      {autoPayments.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreate}>
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDelete}
        title="Удалить автоплатёж?"
        message={`Автоплатёж "${selectedPayment?.name}" будет удалён. Это действие нельзя отменить.`}
        confirmText="Удалить"
        confirmVariant="danger"
        icon="trash"
        loading={isDeleting}
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
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  paymentCard: { marginBottom: spacing.sm },
  inactiveCard: { opacity: 0.7 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center' },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  inactiveIcon: { backgroundColor: colors.gray200 },
  providerEmoji: { fontSize: 24 },
  paymentInfo: { flex: 1 },
  paymentName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  inactiveText: { color: colors.textSecondary },
  paymentProvider: { ...typography.caption, color: colors.textSecondary },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: colors.gray200, padding: 2 },
  toggleActive: { backgroundColor: colors.success },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  toggleThumbActive: { marginLeft: 22 },
  paymentDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: { ...typography.caption, color: colors.textSecondary },
  detailValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  nextDateContainer: { alignItems: 'flex-end' },
  daysUntil: { ...typography.caption, color: colors.success },
  daysUntilSoon: { color: colors.warning },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { ...typography.body2, color: colors.primary },
  inactiveActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  createButton: { marginTop: spacing.lg },
  infoCard: { flexDirection: 'row', backgroundColor: `${colors.info}10`, marginTop: spacing.lg },
  infoContent: { flex: 1, marginLeft: spacing.sm },
  infoTitle: { ...typography.body2, fontWeight: '600', color: colors.textPrimary },
  infoText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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

export default AutoPaymentsScreen;
