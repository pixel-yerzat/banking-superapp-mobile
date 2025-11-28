import React, { useState, useMemo } from 'react';
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
import Slider from '@react-native-community/slider';
import { Card, Button, FormInput } from '../../components';
import { useGetAccountsQuery, useOpenDepositMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount } from '../../utils/formatters';

const DEPOSIT_TYPES = [
  {
    id: 'fixed',
    name: 'Срочный вклад',
    description: 'Максимальная ставка при фиксированном сроке',
    icon: 'lock-closed-outline',
    baseRate: 14,
    minAmount: 50000,
    canWithdraw: false,
    canReplenish: false,
  },
  {
    id: 'flexible',
    name: 'Универсальный',
    description: 'Пополнение и частичное снятие',
    icon: 'swap-horizontal-outline',
    baseRate: 10,
    minAmount: 10000,
    canWithdraw: true,
    canReplenish: true,
  },
  {
    id: 'savings',
    name: 'Накопительный',
    description: 'Ежемесячное пополнение',
    icon: 'trending-up-outline',
    baseRate: 12,
    minAmount: 5000,
    canWithdraw: false,
    canReplenish: true,
  },
  {
    id: 'children',
    name: 'Детский',
    description: 'Накопления для будущего ребёнка',
    icon: 'heart-outline',
    baseRate: 13,
    minAmount: 10000,
    canWithdraw: false,
    canReplenish: true,
  },
];

const TERMS = [
  { months: 3, bonus: 0 },
  { months: 6, bonus: 0.5 },
  { months: 12, bonus: 1 },
  { months: 24, bonus: 1.5 },
  { months: 36, bonus: 2 },
];

const CURRENCIES = [
  { id: 'KZT', symbol: '₸', flag: '🇰🇿' },
  { id: 'USD', symbol: '$', flag: '🇺🇸' },
  { id: 'EUR', symbol: '€', flag: '🇪🇺' },
];

const OpenDepositScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [amount, setAmount] = useState(100000);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[2]); // 12 months default
  const [currency, setCurrency] = useState('KZT');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [capitalization, setCapitalization] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { data: accountsData } = useGetAccountsQuery();
  const [openDeposit, { isLoading }] = useOpenDepositMutation();

  const accounts = accountsData?.data?.filter(
    (a) => a.status === 'active' && a.currency === currency
  ) || [];

  const currentRate = useMemo(() => {
    if (!selectedType) return 0;
    let rate = selectedType.baseRate + selectedTerm.bonus;
    if (capitalization) rate += 0.5;
    return rate;
  }, [selectedType, selectedTerm, capitalization]);

  const expectedIncome = useMemo(() => {
    if (!selectedType) return 0;
    const monthlyRate = currentRate / 100 / 12;
    if (capitalization) {
      return amount * Math.pow(1 + monthlyRate, selectedTerm.months) - amount;
    }
    return amount * (currentRate / 100) * (selectedTerm.months / 12);
  }, [amount, currentRate, selectedTerm, capitalization]);

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      Alert.alert('Ошибка', 'Выберите тип вклада');
      return;
    }
    if (step === 2 && amount < (selectedType?.minAmount || 0)) {
      Alert.alert('Ошибка', `Минимальная сумма: ${formatAmount(selectedType.minAmount, currency)}`);
      return;
    }
    if (step === 3 && !selectedAccount) {
      Alert.alert('Ошибка', 'Выберите счёт списания');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      Alert.alert('Ошибка', 'Необходимо согласиться с условиями');
      return;
    }

    try {
      await openDeposit({
        deposit_type: selectedType.id,
        amount,
        currency,
        term_months: selectedTerm.months,
        from_account_id: selectedAccount.id,
        auto_renewal: autoRenewal,
        capitalization,
      }).unwrap();

      Alert.alert('Успешно', 'Депозит успешно открыт!', [
        { text: 'OK', onPress: () => navigation.navigate('Deposits') },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось открыть депозит');
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Выберите тип вклада</Text>
      {DEPOSIT_TYPES.map((type) => (
        <TouchableOpacity key={type.id} onPress={() => setSelectedType(type)}>
          <Card style={[styles.typeCard, selectedType?.id === type.id && styles.typeCardSelected]}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIcon, selectedType?.id === type.id && styles.typeIconSelected]}>
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={selectedType?.id === type.id ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
              <View style={styles.typeRateContainer}>
                <Text style={styles.typeRate}>до {type.baseRate + 2}%</Text>
              </View>
            </View>
            <View style={styles.typeFeatures}>
              <View style={styles.featureRow}>
                <Ionicons
                  name={type.canReplenish ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={type.canReplenish ? colors.success : colors.gray400}
                />
                <Text style={styles.featureText}>Пополнение</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name={type.canWithdraw ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={type.canWithdraw ? colors.success : colors.gray400}
                />
                <Text style={styles.featureText}>Частичное снятие</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Параметры вклада</Text>

      {/* Currency */}
      <Text style={styles.sectionLabel}>Валюта</Text>
      <View style={styles.currencyRow}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.currencyBtn, currency === c.id && styles.currencyBtnSelected]}
            onPress={() => setCurrency(c.id)}
          >
            <Text style={styles.currencyFlag}>{c.flag}</Text>
            <Text style={[styles.currencyId, currency === c.id && styles.currencyIdSelected]}>
              {c.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount */}
      <Card style={styles.paramCard}>
        <View style={styles.paramHeader}>
          <Text style={styles.paramLabel}>Сумма вклада</Text>
          <Text style={styles.paramValue}>{formatAmount(amount, currency)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={selectedType?.minAmount || 10000}
          maximumValue={50000000}
          step={10000}
          value={amount}
          onValueChange={setAmount}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.gray200}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.minAmountNote}>
          Минимум: {formatAmount(selectedType?.minAmount || 10000, currency)}
        </Text>
      </Card>

      {/* Term */}
      <Text style={styles.sectionLabel}>Срок вклада</Text>
      <View style={styles.termsGrid}>
        {TERMS.map((term) => (
          <TouchableOpacity
            key={term.months}
            style={[styles.termBtn, selectedTerm.months === term.months && styles.termBtnSelected]}
            onPress={() => setSelectedTerm(term)}
          >
            <Text style={[styles.termMonths, selectedTerm.months === term.months && styles.termMonthsSelected]}>
              {term.months}
            </Text>
            <Text style={[styles.termLabel, selectedTerm.months === term.months && styles.termLabelSelected]}>
              мес.
            </Text>
            {term.bonus > 0 && (
              <Text style={styles.termBonus}>+{term.bonus}%</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Options */}
      <Card style={styles.optionsCard}>
        <TouchableOpacity style={styles.optionRow} onPress={() => setCapitalization(!capitalization)}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Капитализация процентов</Text>
            <Text style={styles.optionDescription}>+0.5% к ставке</Text>
          </View>
          <View style={[styles.toggle, capitalization && styles.toggleActive]}>
            <View style={[styles.toggleThumb, capitalization && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={() => setAutoRenewal(!autoRenewal)}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Автопролонгация</Text>
            <Text style={styles.optionDescription}>Автоматическое продление</Text>
          </View>
          <View style={[styles.toggle, autoRenewal && styles.toggleActive]}>
            <View style={[styles.toggleThumb, autoRenewal && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Calculation */}
      <Card style={styles.calcCard}>
        <View style={styles.calcHeader}>
          <Text style={styles.calcTitle}>Расчёт дохода</Text>
          <Text style={styles.calcRate}>{currentRate}% годовых</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Ожидаемый доход</Text>
          <Text style={styles.calcValue}>{formatAmount(Math.round(expectedIncome), currency)}</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Сумма в конце срока</Text>
          <Text style={styles.calcValueBold}>
            {formatAmount(Math.round(amount + expectedIncome), currency)}
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Счёт списания</Text>
      
      {accounts.length > 0 ? (
        accounts.map((account) => (
          <TouchableOpacity key={account.id} onPress={() => setSelectedAccount(account)}>
            <Card style={[styles.accountCard, selectedAccount?.id === account.id && styles.accountCardSelected]}>
              <View style={styles.accountIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name || 'Основной счёт'}</Text>
                <Text style={styles.accountNumber}>•••• {account.account_number.slice(-4)}</Text>
              </View>
              <View style={styles.accountBalance}>
                <Text style={[
                  styles.balanceAmount,
                  account.available_balance < amount && { color: colors.error }
                ]}>
                  {formatAmount(account.available_balance, account.currency)}
                </Text>
                {selectedAccount?.id === account.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="wallet-outline" size={48} color={colors.gray300} />
          <Text style={styles.emptyTitle}>Нет счетов в {currency}</Text>
          <Text style={styles.emptyText}>Откройте счёт для открытия депозита</Text>
          <Button
            title="Открыть счёт"
            variant="outline"
            onPress={() => navigation.navigate('CreateAccount')}
          />
        </Card>
      )}

      {selectedAccount && selectedAccount.available_balance < amount && (
        <Card style={styles.warningCard}>
          <Ionicons name="warning-outline" size={24} color={colors.error} />
          <Text style={styles.warningText}>
            Недостаточно средств на счёте. Необходимо: {formatAmount(amount, currency)}
          </Text>
        </Card>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Подтверждение</Text>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Ionicons name={selectedType?.icon} size={32} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryTitle}>{selectedType?.name}</Text>
            <Text style={styles.summaryRate}>{currentRate}% годовых</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Сумма вклада</Text>
          <Text style={styles.summaryValue}>{formatAmount(amount, currency)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Срок</Text>
          <Text style={styles.summaryValue}>{selectedTerm.months} мес.</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Капитализация</Text>
          <Text style={styles.summaryValue}>{capitalization ? 'Да' : 'Нет'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Автопролонгация</Text>
          <Text style={styles.summaryValue}>{autoRenewal ? 'Да' : 'Нет'}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ожидаемый доход</Text>
          <Text style={styles.summaryValueGreen}>+{formatAmount(Math.round(expectedIncome), currency)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>В конце срока</Text>
          <Text style={styles.summaryValueBold}>{formatAmount(Math.round(amount + expectedIncome), currency)}</Text>
        </View>
      </Card>

      <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)}>
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
        <Text style={styles.termsText}>
          Я согласен с условиями депозитного договора и тарифами банка
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Открыть вклад</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.progressStep, s <= step && styles.progressStepActive]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={step === 4 ? 'Открыть вклад' : 'Далее'}
          onPress={handleNext}
          loading={isLoading}
          fullWidth
          disabled={(step === 3 && (!selectedAccount || selectedAccount.available_balance < amount)) || (step === 4 && !agreedToTerms)}
        />
      </View>
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
  progressContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray200 },
  progressStepActive: { backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  stepTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.md },
  sectionLabel: { ...typography.body2, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm, marginTop: spacing.md },
  typeCard: { marginBottom: spacing.sm },
  typeCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  typeHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  typeIconSelected: { backgroundColor: colors.primary },
  typeInfo: { flex: 1 },
  typeName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  typeDescription: { ...typography.caption, color: colors.textSecondary },
  typeRateContainer: { backgroundColor: `${colors.success}15`, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  typeRate: { ...typography.body2, fontWeight: '600', color: colors.success },
  typeFeatures: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featureText: { ...typography.caption, color: colors.textSecondary },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
  currencyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, paddingVertical: spacing.md, borderRadius: borderRadius.md, gap: spacing.xs, borderWidth: 2, borderColor: colors.white },
  currencyBtnSelected: { borderColor: colors.primary },
  currencyFlag: { fontSize: 24 },
  currencyId: { ...typography.body1, fontWeight: '600', color: colors.textSecondary },
  currencyIdSelected: { color: colors.primary },
  paramCard: { marginBottom: spacing.md },
  paramHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  paramLabel: { ...typography.body2, color: colors.textSecondary },
  paramValue: { ...typography.h4, color: colors.primary },
  slider: { height: 40 },
  minAmountNote: { ...typography.caption, color: colors.textTertiary },
  termsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  termBtn: { width: '30%', backgroundColor: colors.white, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  termBtnSelected: { borderColor: colors.primary },
  termMonths: { ...typography.h4, color: colors.textPrimary },
  termMonthsSelected: { color: colors.primary },
  termLabel: { ...typography.caption, color: colors.textSecondary },
  termLabelSelected: { color: colors.primary },
  termBonus: { ...typography.caption, color: colors.success, marginTop: 2 },
  optionsCard: {},
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  optionInfo: { flex: 1 },
  optionLabel: { ...typography.body2, color: colors.textPrimary },
  optionDescription: { ...typography.caption, color: colors.textSecondary },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: colors.gray200, padding: 2 },
  toggleActive: { backgroundColor: colors.primary },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  toggleThumbActive: { marginLeft: 22 },
  calcCard: { backgroundColor: `${colors.success}10`, marginTop: spacing.md },
  calcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  calcTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  calcRate: { ...typography.body1, fontWeight: '700', color: colors.success },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  calcLabel: { ...typography.body2, color: colors.textSecondary },
  calcValue: { ...typography.body2, fontWeight: '500', color: colors.success },
  calcValueBold: { ...typography.body1, fontWeight: '700', color: colors.primary },
  accountCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  accountCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  accountIcon: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  accountInfo: { flex: 1 },
  accountName: { ...typography.body1, fontWeight: '500', color: colors.textPrimary },
  accountNumber: { ...typography.caption, color: colors.textSecondary },
  accountBalance: { alignItems: 'flex-end' },
  balanceAmount: { ...typography.body2, fontWeight: '600', color: colors.success },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary, marginBottom: spacing.md },
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.error}10`, gap: spacing.sm, marginTop: spacing.md },
  warningText: { ...typography.caption, color: colors.error, flex: 1 },
  summaryCard: {},
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  summaryIcon: { width: 56, height: 56, borderRadius: borderRadius.lg, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  summaryTitle: { ...typography.h4, color: colors.textPrimary },
  summaryRate: { ...typography.body2, color: colors.success },
  summaryDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { ...typography.body2, color: colors.textSecondary },
  summaryLabelBold: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  summaryValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  summaryValueGreen: { ...typography.body2, fontWeight: '600', color: colors.success },
  summaryValueBold: { ...typography.body1, fontWeight: '700', color: colors.primary },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: borderRadius.xs, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { ...typography.body2, color: colors.textSecondary, flex: 1 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100 },
});

export default OpenDepositScreen;
