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
import { Card, Button, FormInput } from '../../components';
import { useGetAccountsQuery, useCreateTemplateMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount } from '../../utils/formatters';

const TEMPLATE_TYPES = [
  { id: 'transfer', label: 'Перевод', icon: 'swap-horizontal-outline' },
  { id: 'mobile', label: 'Мобильная связь', icon: 'phone-portrait-outline' },
  { id: 'utilities', label: 'Коммунальные', icon: 'flash-outline' },
  { id: 'internet', label: 'Интернет', icon: 'wifi-outline' },
  { id: 'tv', label: 'Телевидение', icon: 'tv-outline' },
  { id: 'other', label: 'Другое', icon: 'ellipsis-horizontal-outline' },
];

const CreateTemplateScreen = ({ navigation, route }) => {
  const { prefillData } = route.params || {};

  const [templateName, setTemplateName] = useState(prefillData?.name || '');
  const [templateType, setTemplateType] = useState(
    TEMPLATE_TYPES.find((t) => t.id === prefillData?.type) || TEMPLATE_TYPES[0]
  );
  const [recipient, setRecipient] = useState(prefillData?.recipient || '');
  const [recipientName, setRecipientName] = useState(prefillData?.recipientName || '');
  const [amount, setAmount] = useState(prefillData?.amount?.toString() || '');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const { data: accountsData } = useGetAccountsQuery();
  const [createTemplate, { isLoading }] = useCreateTemplateMutation();

  const accounts = accountsData?.data?.filter((a) => a.status === 'active') || [];

  const handleSubmit = async () => {
    if (!templateName.trim()) {
      Alert.alert('Ошибка', 'Введите название шаблона');
      return;
    }
    if (!recipient.trim()) {
      Alert.alert('Ошибка', 'Введите получателя');
      return;
    }

    try {
      await createTemplate({
        template_name: templateName,
        template_type: templateType.id,
        recipient,
        recipient_name: recipientName,
        amount: amount ? parseInt(amount, 10) : null,
        from_account_id: selectedAccount?.id,
      }).unwrap();

      Alert.alert('Успешно', 'Шаблон создан', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось создать шаблон');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый шаблон</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Template Name */}
        <Card style={styles.formCard}>
          <FormInput
            label="Название шаблона"
            placeholder="Например: Оплата интернета"
            value={templateName}
            onChangeText={setTemplateName}
          />
        </Card>

        {/* Template Type */}
        <Text style={styles.sectionTitle}>Тип платежа</Text>
        <View style={styles.typeGrid}>
          {TEMPLATE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeItem, templateType.id === type.id && styles.typeItemSelected]}
              onPress={() => setTemplateType(type)}
            >
              <View style={[styles.typeIcon, templateType.id === type.id && styles.typeIconSelected]}>
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={templateType.id === type.id ? colors.white : colors.primary}
                />
              </View>
              <Text style={[styles.typeLabel, templateType.id === type.id && styles.typeLabelSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recipient */}
        <Text style={styles.sectionTitle}>Получатель</Text>
        <Card style={styles.formCard}>
          <FormInput
            label={templateType.id === 'transfer' ? 'Номер телефона / Счёт' : 'Номер лицевого счёта'}
            placeholder={templateType.id === 'transfer' ? '+7 XXX XXX XX XX' : 'Введите номер'}
            value={recipient}
            onChangeText={setRecipient}
            keyboardType={templateType.id === 'transfer' ? 'phone-pad' : 'default'}
          />
          <FormInput
            label="Имя получателя (необязательно)"
            placeholder="Для удобства"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </Card>

        {/* Amount */}
        <Text style={styles.sectionTitle}>Сумма (необязательно)</Text>
        <Card style={styles.formCard}>
          <FormInput
            label="Сумма платежа"
            placeholder="Оставьте пустым для ввода каждый раз"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            rightElement={<Text style={styles.currencySymbol}>₸</Text>}
          />
        </Card>

        {/* From Account */}
        <Text style={styles.sectionTitle}>Счёт списания (необязательно)</Text>
        <TouchableOpacity onPress={() => setShowAccountPicker(!showAccountPicker)}>
          <Card style={styles.accountCard}>
            {selectedAccount ? (
              <View style={styles.selectedAccount}>
                <View style={styles.accountIcon}>
                  <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{selectedAccount.name || 'Основной счёт'}</Text>
                  <Text style={styles.accountBalance}>
                    {formatAmount(selectedAccount.available_balance, selectedAccount.currency)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAccount(null)}>
                  <Ionicons name="close-circle" size={24} color={colors.gray400} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectAccount}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.selectAccountText}>Выбрать счёт</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {showAccountPicker && (
          <Card style={styles.accountPicker}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountOption}
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
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Info Note */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.info} />
          <Text style={styles.infoText}>
            Шаблон позволит быстро совершать повторяющиеся платежи одним нажатием.
          </Text>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Создать шаблон"
          onPress={handleSubmit}
          loading={isLoading}
          fullWidth
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  formCard: { marginBottom: spacing.md },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeItem: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  typeItemSelected: { borderColor: colors.primary },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  typeIconSelected: { backgroundColor: colors.primary },
  typeLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  typeLabelSelected: { color: colors.primary, fontWeight: '600' },
  currencySymbol: { ...typography.body1, color: colors.textSecondary },
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
  selectAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selectAccountText: { ...typography.body1, color: colors.primary },
  accountPicker: { marginTop: spacing.sm },
  accountOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  accountOptionInfo: {},
  accountOptionName: { ...typography.body2, color: colors.textPrimary },
  accountOptionBalance: { ...typography.caption, color: colors.textSecondary },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.info}10`,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoText: { ...typography.caption, color: colors.info, flex: 1 },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
});

export default CreateTemplateScreen;
