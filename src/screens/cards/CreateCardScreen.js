import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button, FormInput } from "../../components";
import { useGetAccountsQuery, useCreateCardMutation } from "../../api";
import { colors, spacing, typography, borderRadius } from "../../theme/colors";
import { formatAmount } from "../../utils/formatters";

const CARD_TYPES = [
  {
    id: "visa",
    name: "Visa Classic",
    card_type: "debit",

    description: "Базовая карта для ежедневных покупок",
    fee: 0,
    cashback: "0.5%",
    limits: { daily: 500000, monthly: 3000000 },
    color: "#1E3A5F",
    icon: "card-outline",
  },
  {
    id: "mir",
    card_type: "debit",
    name: "Visa Gold",
    description: "Повышенный кэшбэк и страховка путешествий",
    fee: 5000,
    cashback: "1%",
    limits: { daily: 1000000, monthly: 10000000 },
    color: "#D4AF37",
    icon: "star-outline",
  },
  {
    id: "mastercard",
    name: "Mastercard Platinum",
    card_type: "debit",

    description: "Премиальные привилегии и консьерж-сервис",
    fee: 15000,
    cashback: "2%",
    limits: { daily: 3000000, monthly: 30000000 },
    color: "#1A1A2E",
    icon: "diamond-outline",
  },
  {
    id: "unionpay",
    card_type: "virtual",

    name: "Виртуальная карта",
    description: "Для онлайн-покупок, выпуск мгновенно",
    fee: 0,
    cashback: "0.5%",
    limits: { daily: 200000, monthly: 1000000 },
    color: "#00B4D8",
    icon: "phone-portrait-outline",
  },
];

const CURRENCIES = [
  { id: "KZT", label: "Тенге (KZT)", symbol: "₸" },
  { id: "USD", label: "Доллар (USD)", symbol: "$" },
  { id: "EUR", label: "Евро (EUR)", symbol: "€" },
  { id: "RUB", label: "Рубль (RUB)", symbol: "₽" },
];

const CreateCardScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("KZT");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [cardName, setCardName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { data: accountsData } = useGetAccountsQuery();
  const [createCard, { isLoading }] = useCreateCardMutation();

  const accounts =
    accountsData?.data?.filter((a) => a.status === "active") || [];

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      Alert.alert("Ошибка", "Выберите тип карты");
      return;
    }
    if (step === 2 && !selectedAccount) {
      Alert.alert("Ошибка", "Выберите счёт для привязки");
      return;
    }
    if (step < 3) {
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
    try {
      await createCard({
        card_type: selectedType.card_type,
        currency: selectedCurrency,
        payment_system: selectedType.id,
        account_id: selectedAccount.id,
        card_name: cardName || selectedType.name,
        delivery_address:
          selectedType.id !== "unionpay" ? deliveryAddress : null,
      }).unwrap();

      Alert.alert(
        "Успешно",
        selectedType.id === "unionpay"
          ? "Виртуальная карта выпущена!"
          : "Заявка на карту отправлена. Карта будет доставлена в течение 3-5 рабочих дней.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Ошибка", error.data?.message || "Не удалось создать карту");
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Выберите тип карты</Text>
      {CARD_TYPES.map((type) => (
        <TouchableOpacity key={type.id} onPress={() => setSelectedType(type)}>
          <Card
            style={[
              styles.cardTypeItem,
              selectedType?.id === type.id && styles.cardTypeItemSelected,
            ]}
          >
            <View style={[styles.cardPreview, { backgroundColor: type.color }]}>
              <Ionicons name={type.icon} size={32} color={colors.white} />
            </View>
            <View style={styles.cardTypeInfo}>
              <View style={styles.cardTypeHeader}>
                <Text style={styles.cardTypeName}>{type.name}</Text>
                {selectedType?.id === type.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </View>
              <Text style={styles.cardTypeDescription}>{type.description}</Text>
              <View style={styles.cardTypeDetails}>
                <View style={styles.cardTypeDetail}>
                  <Text style={styles.detailLabel}>Обслуживание</Text>
                  <Text style={styles.detailValue}>
                    {type.fee > 0
                      ? `${formatAmount(type.fee, "KZT")}/год`
                      : "Бесплатно"}
                  </Text>
                </View>
                <View style={styles.cardTypeDetail}>
                  <Text style={styles.detailLabel}>Кэшбэк</Text>
                  <Text style={styles.detailValue}>{type.cashback}</Text>
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Привяжите счёт</Text>

      {/* Currency Selection */}
      <Text style={styles.sectionLabel}>Валюта карты</Text>
      <View style={styles.currencyGrid}>
        {CURRENCIES.map((currency) => (
          <TouchableOpacity
            key={currency.id}
            style={[
              styles.currencyItem,
              selectedCurrency === currency.id && styles.currencyItemSelected,
            ]}
            onPress={() => setSelectedCurrency(currency.id)}
          >
            <Text
              style={[
                styles.currencySymbol,
                selectedCurrency === currency.id &&
                  styles.currencySymbolSelected,
              ]}
            >
              {currency.symbol}
            </Text>
            <Text
              style={[
                styles.currencyLabel,
                selectedCurrency === currency.id &&
                  styles.currencyLabelSelected,
              ]}
            >
              {currency.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Selection */}
      <Text style={styles.sectionLabel}>Счёт для привязки</Text>
      {accounts.length > 0 ? (
        accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            onPress={() => setSelectedAccount(account)}
          >
            <Card
              style={[
                styles.accountItem,
                selectedAccount?.id === account.id &&
                  styles.accountItemSelected,
              ]}
            >
              <View style={styles.accountIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {account.name || "Основной счёт"}
                </Text>
                <Text style={styles.accountNumber}>
                  •••• {account.account_number.slice(-4)}
                </Text>
              </View>
              <View style={styles.accountBalance}>
                <Text style={styles.balanceAmount}>
                  {formatAmount(account.available_balance, account.currency)}
                </Text>
                {selectedAccount?.id === account.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Нет доступных счетов</Text>
          <Button
            title="Открыть счёт"
            variant="outline"
            onPress={() => navigation.navigate("CreateAccount")}
          />
        </Card>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Подтверждение</Text>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View
          style={[
            styles.summaryCardPreview,
            { backgroundColor: selectedType?.color },
          ]}
        >
          <Text style={styles.summaryCardName}>{selectedType?.name}</Text>
          <Text style={styles.summaryCardNumber}>•••• •••• •••• ****</Text>
        </View>

        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Тип карты</Text>
            <Text style={styles.summaryValue}>{selectedType?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Валюта</Text>
            <Text style={styles.summaryValue}>{selectedCurrency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Привязка к счёту</Text>
            <Text style={styles.summaryValue}>
              •••• {selectedAccount?.account_number.slice(-4)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Стоимость выпуска</Text>
            <Text style={styles.summaryValue}>Бесплатно</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Обслуживание</Text>
            <Text style={styles.summaryValue}>
              {selectedType?.fee > 0
                ? `${formatAmount(selectedType?.fee, "KZT")}/год`
                : "Бесплатно"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Card Name */}
      <Card style={styles.formCard}>
        <FormInput
          label="Название карты (необязательно)"
          placeholder={selectedType?.name}
          value={cardName}
          onChangeText={setCardName}
        />
      </Card>

      {/* Delivery Address (for physical cards) */}
      {selectedType?.id !== "virtual" && (
        <Card style={styles.formCard}>
          <FormInput
            label="Адрес доставки"
            placeholder="Введите адрес"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
          />
          <Text style={styles.deliveryNote}>
            Доставка бесплатная. Срок: 3-5 рабочих дней.
          </Text>
        </Card>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая карта</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={step === 3 ? "Выпустить карту" : "Далее"}
          onPress={handleNext}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray200,
  },
  progressStepActive: { backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  stepTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTypeItem: { flexDirection: "row", marginBottom: spacing.sm },
  cardTypeItemSelected: { borderColor: colors.primary, borderWidth: 2 },
  cardPreview: {
    width: 80,
    height: 100,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardTypeInfo: { flex: 1 },
  cardTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTypeName: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardTypeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardTypeDetails: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  cardTypeDetail: {},
  detailLabel: { ...typography.caption, color: colors.textTertiary },
  detailValue: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  currencyGrid: { flexDirection: "row", gap: spacing.sm },
  currencyItem: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  currencyItemSelected: { borderColor: colors.primary },
  currencySymbol: { ...typography.h3, color: colors.textPrimary },
  currencySymbolSelected: { color: colors.primary },
  currencyLabel: { ...typography.caption, color: colors.textSecondary },
  currencyLabelSelected: { color: colors.primary },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  accountItemSelected: { borderColor: colors.primary, borderWidth: 2 },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  accountInfo: { flex: 1 },
  accountName: {
    ...typography.body1,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  accountNumber: { ...typography.caption, color: colors.textSecondary },
  accountBalance: { alignItems: "flex-end" },
  balanceAmount: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.success,
  },
  emptyCard: { alignItems: "center", paddingVertical: spacing.lg },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  summaryCard: { marginBottom: spacing.md },
  summaryCardPreview: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  summaryCardName: {
    ...typography.body1,
    color: colors.white,
    fontWeight: "600",
  },
  summaryCardNumber: {
    ...typography.h4,
    color: colors.white,
    marginTop: spacing.sm,
  },
  summaryDetails: {},
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  summaryLabel: { ...typography.body2, color: colors.textSecondary },
  summaryValue: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  formCard: { marginBottom: spacing.md },
  deliveryNote: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  bottomContainer: {
    position: "absolute",
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

export default CreateCardScreen;
