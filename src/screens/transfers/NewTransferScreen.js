import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Button, FormInput, Avatar } from '../../components';
import {
  useGetAccountsQuery,
  useTransferByPhoneMutation,
  useTransferByAccountMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { CURRENCY_SYMBOLS, QUICK_AMOUNTS, PHONE_REGEX } from '../../constants';
import { formatAmount, formatPhone } from '../../utils/formatters';

const transferSchema = yup.object().shape({
  recipient: yup.string().required('Введите получателя'),
  amount: yup
    .number()
    .typeError('Введите сумму')
    .required('Введите сумму')
    .min(1, 'Минимальная сумма: 1 ₸')
    .max(10000000, 'Максимальная сумма: 10 000 000 ₸'),
  message: yup.string().max(140, 'Максимум 140 символов'),
});

const NewTransferScreen = ({ navigation, route }) => {
  const { recipient: initialRecipient, amount: initialAmount } = route.params || {};
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transferType, setTransferType] = useState('phone'); // phone, account, card
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const { data: accountsData } = useGetAccountsQuery();
  const [transferByPhone, { isLoading: isPhoneLoading }] = useTransferByPhoneMutation();
  const [transferByAccount, { isLoading: isAccountLoading }] = useTransferByAccountMutation();

  const accounts = accountsData?.data?.filter((a) => a.status === 'active') || [];
  const isLoading = isPhoneLoading || isAccountLoading;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      recipient: initialRecipient || '',
      amount: initialAmount || '',
      message: '',
    },
  });

  const watchedAmount = watch('amount');

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  const onSubmit = async (data) => {
    if (!selectedAccount) {
      Alert.alert('Ошибка', 'Выберите счёт списания');
      return;
    }

    try {
      const transferData = {
        from_account_id: selectedAccount.id,
        amount: data.amount,
        description: data.message,
      };

      if (transferType === 'phone') {
        await transferByPhone({
          ...transferData,
          phone: data.recipient,
        }).unwrap();
      } else {
        await transferByAccount({
          ...transferData,
          to_account: data.recipient,
        }).unwrap();
      }

      Alert.alert('Успешно', 'Перевод выполнен', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось выполнить перевод');
    }
  };

  const handleQuickAmount = (amount) => {
    setValue('amount', amount);
  };

  const transferTypes = [
    { id: 'phone', label: 'По телефону', icon: 'call-outline' },
    { id: 'account', label: 'По счёту', icon: 'document-text-outline' },
    { id: 'card', label: 'На карту', icon: 'card-outline' },
  ];

  const getRecipientPlaceholder = () => {
    switch (transferType) {
      case 'phone':
        return '+7 XXX XXX XX XX';
      case 'account':
        return 'KZ0000000000000000';
      case 'card':
        return '0000 0000 0000 0000';
      default:
        return '';
    }
  };

  const getRecipientLabel = () => {
    switch (transferType) {
      case 'phone':
        return 'Номер телефона';
      case 'account':
        return 'Номер счёта (IBAN)';
      case 'card':
        return 'Номер карты';
      default:
        return 'Получатель';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Новый перевод</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Transfer Type Selector */}
          <View style={styles.typeSelector}>
            {transferTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeButton, transferType === type.id && styles.typeButtonActive]}
                onPress={() => setTransferType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={transferType === type.id ? colors.white : colors.textSecondary}
                />
                <Text
                  style={[styles.typeText, transferType === type.id && styles.typeTextActive]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* From Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Откуда</Text>
            <TouchableOpacity onPress={() => setShowAccountPicker(!showAccountPicker)}>
              <Card style={styles.accountCard}>
                {selectedAccount ? (
                  <View style={styles.selectedAccount}>
                    <View style={styles.accountIcon}>
                      <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>
                        {selectedAccount.name || 'Основной счёт'}
                      </Text>
                      <Text style={styles.accountBalance}>
                        {formatAmount(selectedAccount.available_balance, selectedAccount.currency)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={colors.gray400} />
                  </View>
                ) : (
                  <Text style={styles.selectAccountText}>Выберите счёт</Text>
                )}
              </Card>
            </TouchableOpacity>

            {/* Account Picker */}
            {showAccountPicker && (
              <Card style={styles.accountPicker}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountOption,
                      selectedAccount?.id === account.id && styles.accountOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAccount(account);
                      setShowAccountPicker(false);
                    }}
                  >
                    <View style={styles.accountOptionInfo}>
                      <Text style={styles.accountOptionName}>
                        {account.name || `Счёт •••• ${account.account_number.slice(-4)}`}
                      </Text>
                      <Text style={styles.accountOptionBalance}>
                        {formatAmount(account.available_balance, account.currency)}
                      </Text>
                    </View>
                    {selectedAccount?.id === account.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            )}
          </View>

          {/* Recipient */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Куда</Text>
            <Card style={styles.formCard}>
              <Controller
                control={control}
                name="recipient"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label={getRecipientLabel()}
                    placeholder={getRecipientPlaceholder()}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={transferType === 'phone' ? 'phone-pad' : 'default'}
                    error={errors.recipient?.message}
                    rightIcon="qr-code-outline"
                    onRightIconPress={() => navigation.navigate('QRScanner')}
                  />
                )}
              />
            </Card>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Сумма</Text>
            <Card style={styles.formCard}>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label="Сумма перевода"
                    placeholder="0"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(text ? parseInt(text, 10) : '')}
                    keyboardType="numeric"
                    error={errors.amount?.message}
                    rightElement={
                      <Text style={styles.currencySymbol}>
                        {CURRENCY_SYMBOLS[selectedAccount?.currency || 'KZT']}
                      </Text>
                    }
                  />
                )}
              />

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickAmountButton,
                      watchedAmount === amount && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => handleQuickAmount(amount)}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        watchedAmount === amount && styles.quickAmountTextActive,
                      ]}
                    >
                      {amount >= 1000 ? `${amount / 1000}K` : amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Сообщение (необязательно)</Text>
            <Card style={styles.formCard}>
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    placeholder="Добавить сообщение"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    maxLength={140}
                    error={errors.message?.message}
                  />
                )}
              />
            </Card>
          </View>

          {/* Commission Info */}
          <Card style={styles.commissionCard}>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Комиссия</Text>
              <Text style={styles.commissionValue}>0 ₸</Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Итого к списанию</Text>
              <Text style={styles.commissionTotal}>
                {formatAmount(watchedAmount || 0, selectedAccount?.currency || 'KZT')}
              </Text>
            </View>
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Перевести"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            disabled={!selectedAccount || !watchedAmount}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    gap: spacing.xs,
  },
  typeButtonActive: { backgroundColor: colors.primary },
  typeText: { ...typography.caption, color: colors.textSecondary },
  typeTextActive: { color: colors.white },
  section: { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  accountCard: {},
  selectedAccount: { flexDirection: 'row', alignItems: 'center' },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  accountInfo: { flex: 1 },
  accountName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  accountBalance: { ...typography.body2, color: colors.success },
  selectAccountText: { ...typography.body1, color: colors.textSecondary },
  accountPicker: { marginTop: spacing.sm },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  accountOptionSelected: {},
  accountOptionInfo: {},
  accountOptionName: { ...typography.body2, color: colors.textPrimary },
  accountOptionBalance: { ...typography.caption, color: colors.textSecondary },
  formCard: {},
  currencySymbol: { ...typography.h4, color: colors.textSecondary },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  quickAmountButtonActive: { backgroundColor: colors.primary },
  quickAmountText: { ...typography.body2, color: colors.textSecondary },
  quickAmountTextActive: { color: colors.white },
  commissionCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commissionLabel: { ...typography.body2, color: colors.textSecondary },
  commissionValue: { ...typography.body2, color: colors.textPrimary },
  commissionTotal: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  submitContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
});

export default NewTransferScreen;
