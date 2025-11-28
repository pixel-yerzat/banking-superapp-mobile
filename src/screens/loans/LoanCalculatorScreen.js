import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Card, Button, FormInput } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { LOAN_TYPE_LABELS, CURRENCY_SYMBOLS } from '../../constants';

const LoanCalculatorScreen = ({ navigation }) => {
  const [loanType, setLoanType] = useState('consumer');
  const [amount, setAmount] = useState(500000);
  const [term, setTerm] = useState(12);
  const [rate, setRate] = useState(18);
  const [showSchedule, setShowSchedule] = useState(false);

  const loanTypes = [
    { id: 'consumer', label: 'Потребительский', rate: 18 },
    { id: 'mortgage', label: 'Ипотека', rate: 12 },
    { id: 'car', label: 'Автокредит', rate: 15 },
    { id: 'business', label: 'Бизнес', rate: 20 },
  ];

  const calculation = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    // Generate schedule
    const schedule = [];
    let remainingBalance = amount;
    for (let i = 1; i <= term; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        payment_number: i,
        principal_payment: principalPayment,
        interest_payment: interestPayment,
        total_payment: monthlyPayment,
        remaining_balance: Math.max(0, remainingBalance),
      });
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      schedule,
    };
  }, [amount, term, rate]);

  const formatAmount = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleLoanTypeChange = (type) => {
    setLoanType(type);
    const typeConfig = loanTypes.find((t) => t.id === type);
    if (typeConfig) {
      setRate(typeConfig.rate);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Калькулятор кредита</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Loan Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тип кредита</Text>
          <View style={styles.loanTypes}>
            {loanTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.loanTypeButton, loanType === type.id && styles.loanTypeButtonActive]}
                onPress={() => handleLoanTypeChange(type.id)}
              >
                <Text style={[styles.loanTypeText, loanType === type.id && styles.loanTypeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Slider */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionTitle}>Сумма кредита</Text>
            <Text style={styles.sliderValue}>{formatAmount(amount)} ₸</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={100000}
            maximumValue={10000000}
            step={50000}
            value={amount}
            onValueChange={setAmount}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.gray200}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>100 000 ₸</Text>
            <Text style={styles.sliderLabel}>10 000 000 ₸</Text>
          </View>
        </View>

        {/* Term Slider */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionTitle}>Срок кредита</Text>
            <Text style={styles.sliderValue}>{term} мес.</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={3}
            maximumValue={60}
            step={1}
            value={term}
            onValueChange={setTerm}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.gray200}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>3 мес.</Text>
            <Text style={styles.sliderLabel}>60 мес.</Text>
          </View>
        </View>

        {/* Rate */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionTitle}>Процентная ставка</Text>
            <Text style={styles.sliderValue}>{rate}%</Text>
          </View>
        </View>

        {/* Results */}
        <Card style={styles.resultsCard}>
          <View style={styles.mainResult}>
            <Text style={styles.mainResultLabel}>Ежемесячный платёж</Text>
            <Text style={styles.mainResultValue}>
              {formatAmount(calculation.monthlyPayment)} {CURRENCY_SYMBOLS.KZT}
            </Text>
          </View>

          <View style={styles.resultsDivider} />

          <View style={styles.resultsRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Сумма кредита</Text>
              <Text style={styles.resultValue}>{formatAmount(amount)} ₸</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Переплата</Text>
              <Text style={[styles.resultValue, { color: colors.error }]}>
                {formatAmount(calculation.totalInterest)} ₸
              </Text>
            </View>
          </View>

          <View style={styles.resultsRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Общая сумма</Text>
              <Text style={styles.resultValue}>{formatAmount(calculation.totalPayment)} ₸</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Эффективная ставка</Text>
              <Text style={styles.resultValue}>{(rate * 1.1).toFixed(1)}%</Text>
            </View>
          </View>
        </Card>

        {/* Schedule Toggle */}
        <TouchableOpacity
          style={styles.scheduleToggle}
          onPress={() => setShowSchedule(!showSchedule)}
        >
          <Text style={styles.scheduleToggleText}>График платежей</Text>
          <Ionicons
            name={showSchedule ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Schedule Table */}
        {showSchedule && (
          <Card style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={[styles.scheduleCell, styles.scheduleHeaderText]}>№</Text>
              <Text style={[styles.scheduleCell, styles.scheduleHeaderText, { flex: 2 }]}>Основной</Text>
              <Text style={[styles.scheduleCell, styles.scheduleHeaderText, { flex: 2 }]}>Проценты</Text>
              <Text style={[styles.scheduleCell, styles.scheduleHeaderText, { flex: 2 }]}>Остаток</Text>
            </View>
            {calculation.schedule.slice(0, 12).map((row) => (
              <View key={row.payment_number} style={styles.scheduleRow}>
                <Text style={styles.scheduleCell}>{row.payment_number}</Text>
                <Text style={[styles.scheduleCell, { flex: 2 }]}>{formatAmount(Math.round(row.principal_payment))}</Text>
                <Text style={[styles.scheduleCell, { flex: 2 }]}>{formatAmount(Math.round(row.interest_payment))}</Text>
                <Text style={[styles.scheduleCell, { flex: 2 }]}>{formatAmount(Math.round(row.remaining_balance))}</Text>
              </View>
            ))}
            {term > 12 && (
              <Text style={styles.scheduleMore}>...и ещё {term - 12} платежей</Text>
            )}
          </Card>
        )}

        {/* Apply Button */}
        <View style={styles.applyContainer}>
          <Button
            title="Подать заявку на кредит"
            onPress={() => navigation.navigate('LoanApplication', { amount, term, rate, loanType })}
            fullWidth
          />
        </View>
      </ScrollView>
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
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  loanTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  loanTypeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  loanTypeButtonActive: { backgroundColor: colors.primary },
  loanTypeText: { ...typography.body2, color: colors.textSecondary },
  loanTypeTextActive: { color: colors.white },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderValue: { ...typography.h4, color: colors.primary },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { ...typography.caption, color: colors.textTertiary },
  resultsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  mainResult: { alignItems: 'center', marginBottom: spacing.md },
  mainResultLabel: { ...typography.body2, color: colors.textSecondary },
  mainResultValue: { ...typography.h1, color: colors.primary },
  resultsDivider: { height: 1, backgroundColor: colors.gray100, marginBottom: spacing.md },
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  resultItem: { flex: 1 },
  resultLabel: { ...typography.caption, color: colors.textSecondary },
  resultValue: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  scheduleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  scheduleToggleText: { ...typography.body2, color: colors.primary, fontWeight: '500' },
  scheduleCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  scheduleHeader: { flexDirection: 'row', paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  scheduleHeaderText: { fontWeight: '600', color: colors.textSecondary },
  scheduleRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  scheduleCell: { flex: 1, ...typography.caption, color: colors.textPrimary },
  scheduleMore: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
  applyContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});

export default LoanCalculatorScreen;
