import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.63;

const BankCard = ({
  cardNumber = '**** **** **** 0000',
  cardHolder = 'CARD HOLDER',
  expiryDate = 'MM/YY',
  cardType = 'debit', // 'debit' | 'credit' | 'virtual'
  paymentSystem = 'visa', // 'visa' | 'mastercard' | 'mir' | 'unionpay'
  status = 'active', // 'active' | 'blocked' | 'expired' | 'lost'
  balance,
  currency = 'KZT',
  showBalance = true,
  onPress,
  style,
  compact = false,
}) => {
  const getGradientColors = () => {
    if (status === 'blocked' || status === 'lost') {
      return ['#6B7280', '#374151'];
    }
    if (status === 'expired') {
      return ['#9CA3AF', '#6B7280'];
    }
    
    switch (cardType) {
      case 'credit':
        return ['#DC2626', '#991B1B'];
      case 'virtual':
        return ['#7C3AED', '#5B21B6'];
      default:
        return [colors.gradientStart, colors.gradientEnd];
    }
  };

  const getPaymentSystemIcon = () => {
    switch (paymentSystem) {
      case 'mastercard':
        return (
          <View style={styles.mastercardLogo}>
            <View style={[styles.mastercardCircle, { backgroundColor: '#EB001B' }]} />
            <View style={[styles.mastercardCircle, styles.mastercardCircleRight, { backgroundColor: '#F79E1B' }]} />
          </View>
        );
      case 'mir':
        return <Text style={styles.paymentSystemText}>МИР</Text>;
      case 'unionpay':
        return <Text style={styles.paymentSystemText}>UnionPay</Text>;
      default:
        return <Text style={styles.visaText}>VISA</Text>;
    }
  };

  const getStatusBadge = () => {
    if (status === 'active') return null;
    
    const statusConfig = {
      blocked: { text: 'Заблокирована', color: colors.error },
      expired: { text: 'Истёк срок', color: colors.warning },
      lost: { text: 'Утеряна', color: colors.error },
    };
    
    const config = statusConfig[status];
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Text style={styles.statusText}>{config.text}</Text>
      </View>
    );
  };

  const formatBalance = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const getCurrencySymbol = () => {
    const symbols = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' };
    return symbols[currency] || currency;
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.compactCard, style]}
        >
          <View style={styles.compactContent}>
            <View style={styles.compactLeft}>
              <Ionicons name="card" size={24} color={colors.white} />
              <Text style={styles.compactNumber}>{cardNumber.slice(-4)}</Text>
            </View>
            {getPaymentSystemIcon()}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {/* Status Badge */}
        {getStatusBadge()}
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
          </View>
          <View style={styles.contactlessIcon}>
            <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
          </View>
        </View>

        {/* Balance */}
        {showBalance && balance !== undefined && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Баланс</Text>
            <Text style={styles.balance}>
              {formatBalance(balance)} {getCurrencySymbol()}
            </Text>
          </View>
        )}

        {/* Card Number */}
        <Text style={styles.cardNumber}>{cardNumber}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.cardInfo}>
            <Text style={styles.label}>Владелец</Text>
            <Text style={styles.cardHolder}>{cardHolder}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.label}>Срок</Text>
            <Text style={styles.expiryDate}>{expiryDate}</Text>
          </View>
          <View style={styles.paymentSystem}>
            {getPaymentSystemIcon()}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...shadows.lg,
  },
  compactCard: {
    width: 120,
    height: 76,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    ...shadows.sm,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactNumber: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chipContainer: {
    width: 44,
    height: 32,
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    overflow: 'hidden',
    padding: 4,
  },
  chip: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  chipLine: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  contactlessIcon: {
    opacity: 0.8,
  },
  balanceContainer: {
    marginTop: spacing.xs,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  balance: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  cardNumber: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardInfo: {},
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardHolder: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  expiryDate: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  paymentSystem: {
    alignItems: 'flex-end',
  },
  visaText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  paymentSystemText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mastercardLogo: {
    flexDirection: 'row',
    width: 48,
    height: 30,
  },
  mastercardCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  mastercardCircleRight: {
    marginLeft: -12,
    opacity: 0.8,
  },
});

export default BankCard;
