import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_STATUS_LABELS, CURRENCY_SYMBOLS } from '../constants';

const TransactionItem = ({
  type = 'transfer',
  status = 'completed',
  amount,
  currency = 'KZT',
  title,
  subtitle,
  date,
  isIncoming = false,
  onPress,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'transfer':
        return isIncoming ? 'arrow-down' : 'arrow-up';
      case 'payment':
        return 'receipt-outline';
      case 'deposit':
        return 'add-circle-outline';
      case 'withdrawal':
        return 'remove-circle-outline';
      default:
        return 'swap-horizontal';
    }
  };

  const getIconBackgroundColor = () => {
    if (status === 'failed') return colors.errorLight;
    if (status === 'pending') return colors.warningLight;
    return isIncoming ? colors.successLight : colors.gray100;
  };

  const getIconColor = () => {
    if (status === 'failed') return colors.error;
    if (status === 'pending') return colors.warning;
    return isIncoming ? colors.success : colors.textSecondary;
  };

  const getAmountColor = () => {
    if (status === 'failed') return colors.textTertiary;
    if (status === 'pending') return colors.warning;
    return isIncoming ? colors.success : colors.textPrimary;
  };

  const formatAmount = (amount) => {
    const formatted = new Intl.NumberFormat('ru-RU').format(Math.abs(amount));
    const sign = isIncoming ? '+' : '-';
    return `${sign} ${formatted}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrencySymbol = () => {
    return CURRENCY_SYMBOLS[currency] || currency;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
        <Ionicons name={getIcon()} size={20} color={getIconColor()} />
      </View>

      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title || TRANSACTION_TYPE_LABELS[type]}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: getAmountColor() }]}>
              {formatAmount(amount)} {getCurrencySymbol()}
            </Text>
            {status !== 'completed' && (
              <View style={[styles.statusBadge, { backgroundColor: status === 'pending' ? colors.warningLight : colors.errorLight }]}>
                <Text style={[styles.statusText, { color: status === 'pending' ? colors.warning : colors.error }]}>
                  {TRANSACTION_STATUS_LABELS[status]}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body1,
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

export default TransactionItem;
