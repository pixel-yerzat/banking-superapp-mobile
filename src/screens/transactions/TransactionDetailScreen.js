import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useGetTransactionByIdQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_STATUS_LABELS, CURRENCY_SYMBOLS } from '../../constants';
import { formatAmount, formatDate } from '../../utils/formatters';

const TransactionDetailScreen = ({ navigation, route }) => {
  const { transactionId } = route.params;

  const { data, isLoading } = useGetTransactionByIdQuery(transactionId);
  const transaction = data?.data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      case 'cancelled': return colors.gray400;
      default: return colors.gray400;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'transfer': return 'swap-horizontal';
      case 'payment': return 'card';
      case 'deposit': return 'arrow-down';
      case 'withdrawal': return 'arrow-up';
      default: return 'swap-horizontal';
    }
  };

  const handleShare = async () => {
    if (!transaction) return;
    
    try {
      await Share.share({
        message: `Операция: ${TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
Сумма: ${formatAmount(transaction.amount, transaction.currency)}
Дата: ${formatDate(transaction.created_at, 'datetime')}
Статус: ${TRANSACTION_STATUS_LABELS[transaction.status]}
${transaction.description ? `Описание: ${transaction.description}` : ''}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncoming = transaction.to_account_id === route.params?.currentAccountId;
  const amountColor = isIncoming ? colors.success : colors.textPrimary;
  const amountSign = isIncoming ? '+' : '-';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали операции</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(transaction.status)}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                {TRANSACTION_STATUS_LABELS[transaction.status]}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <View style={[styles.typeIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name={getTypeIcon(transaction.transaction_type)} size={32} color={colors.primary} />
            </View>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountSign}{formatAmount(Math.abs(transaction.amount), transaction.currency)}
            </Text>
            <Text style={styles.transactionType}>
              {TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
            </Text>
          </View>

          <Text style={styles.dateTime}>
            {formatDate(transaction.created_at, 'datetime')}
          </Text>
        </Card>

        {/* Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детали</Text>
          <Card style={styles.detailsCard}>
            {transaction.from_account_id && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Счёт списания</Text>
                <Text style={styles.detailValue}>•••• {transaction.from_account_id.slice(-4)}</Text>
              </View>
            )}
            {transaction.to_account_id && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Счёт зачисления</Text>
                <Text style={styles.detailValue}>•••• {transaction.to_account_id.slice(-4)}</Text>
              </View>
            )}
            {transaction.recipient_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Получатель</Text>
                <Text style={styles.detailValue}>{transaction.recipient_name}</Text>
              </View>
            )}
            {transaction.recipient_phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Телефон получателя</Text>
                <Text style={styles.detailValue}>{transaction.recipient_phone}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Комиссия</Text>
              <Text style={styles.detailValue}>
                {transaction.fee ? `${formatAmount(transaction.fee, transaction.currency)}` : 'Без комиссии'}
              </Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>ID операции</Text>
              <Text style={[styles.detailValue, styles.transactionId]}>{transaction.id}</Text>
            </View>
          </Card>
        </View>

        {/* Description */}
        {transaction.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Card style={styles.descriptionCard}>
              <Text style={styles.description}>{transaction.description}</Text>
            </Card>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Повторить операцию"
            onPress={() => navigation.navigate('NewTransfer', { repeatTransaction: transaction })}
            fullWidth
            style={styles.repeatButton}
          />
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Квитанция</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Оспорить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Шаблон</Text>
            </TouchableOpacity>
          </View>
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
  mainCard: { marginHorizontal: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl },
  statusContainer: { marginBottom: spacing.md },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  statusText: { ...typography.body2, fontWeight: '600' },
  amountContainer: { alignItems: 'center' },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  amount: { ...typography.h1, marginBottom: spacing.xs },
  transactionType: { ...typography.body2, color: colors.textSecondary },
  dateTime: { ...typography.body2, color: colors.textTertiary, marginTop: spacing.md },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  detailsCard: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  detailLabel: { ...typography.body2, color: colors.textSecondary },
  detailValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  transactionId: { ...typography.caption, color: colors.textTertiary },
  descriptionCard: {},
  description: { ...typography.body2, color: colors.textPrimary },
  actionsSection: { padding: spacing.lg, paddingBottom: spacing.xxl },
  repeatButton: { marginBottom: spacing.md },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-around' },
  secondaryButton: { alignItems: 'center', padding: spacing.md },
  secondaryButtonText: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
});

export default TransactionDetailScreen;
