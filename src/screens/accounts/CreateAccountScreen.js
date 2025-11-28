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
import { useCreateAccountMutation } from "../../api";
import { colors, spacing, typography, borderRadius } from "../../theme/colors";

const ACCOUNT_TYPES = [
  {
    id: "checking",
    name: "Текущий счёт",
    description: "Для ежедневных операций и платежей",
    icon: "wallet-outline",
    features: [
      "Бесплатное обслуживание",
      "Мгновенные переводы",
      "Онлайн-платежи",
    ],
  },
  {
    id: "savings",
    name: "Сберегательный счёт",
    description: "Для накоплений с начислением процентов",
    icon: "trending-up-outline",
    rate: "8% годовых",
    features: [
      "Ежемесячное начисление",
      "Без ограничений на снятие",
      "Капитализация",
    ],
  },
  {
    id: "deposit",
    name: "Депозитный счёт",
    description: "Максимальная доходность при фиксированном сроке",
    icon: "lock-closed-outline",
    rate: "до 14% годовых",
    features: ["Высокая ставка", "Фиксированный срок", "Гарантия АФК"],
  },
  {
    id: "credit",
    name: "Бизнес-счёт",
    description: "Для индивидуальных предпринимателей",
    icon: "briefcase-outline",
    features: ["Бизнес-переводы", "Зарплатный проект", "Интеграция с 1С"],
  },
];

const CURRENCIES = [
  { id: "KZT", name: "Тенге", symbol: "₸", flag: "🇰🇿" },
  { id: "USD", name: "Доллар США", symbol: "$", flag: "🇺🇸" },
  { id: "EUR", name: "Евро", symbol: "€", flag: "🇪🇺" },
  { id: "RUB", name: "Рубль", symbol: "₽", flag: "🇷🇺" },
  { id: "GBP", name: "Фунт стерлингов", symbol: "£", flag: "🇬🇧" },
  { id: "CNY", name: "Юань", symbol: "¥", flag: "🇨🇳" },
];

const CreateAccountScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("KZT");
  const [accountName, setAccountName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      Alert.alert("Ошибка", "Выберите тип счёта");
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
    if (!agreedToTerms) {
      Alert.alert("Ошибка", "Необходимо согласиться с условиями");
      return;
    }

    try {
      await createAccount({
        account_type: selectedType.id,
        currency: selectedCurrency,
        name: accountName || `${selectedType.name} ${selectedCurrency}`,
      }).unwrap();

      Alert.alert("Успешно", "Счёт успешно открыт!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Ошибка", error.data?.message || "Не удалось открыть счёт");
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Выберите тип счёта</Text>
      {ACCOUNT_TYPES.map((type) => (
        <TouchableOpacity key={type.id} onPress={() => setSelectedType(type)}>
          <Card
            style={[
              styles.typeCard,
              selectedType?.id === type.id && styles.typeCardSelected,
            ]}
          >
            <View style={styles.typeHeader}>
              <View
                style={[
                  styles.typeIcon,
                  selectedType?.id === type.id && styles.typeIconSelected,
                ]}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={
                    selectedType?.id === type.id ? colors.white : colors.primary
                  }
                />
              </View>
              <View style={styles.typeInfo}>
                <View style={styles.typeNameRow}>
                  <Text style={styles.typeName}>{type.name}</Text>
                  {type.rate && (
                    <Text style={styles.typeRate}>{type.rate}</Text>
                  )}
                </View>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
              {selectedType?.id === type.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>
            <View style={styles.typeFeatures}>
              {type.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={16} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Выберите валюту</Text>
      <View style={styles.currencyList}>
        {CURRENCIES.map((currency) => (
          <TouchableOpacity
            key={currency.id}
            onPress={() => setSelectedCurrency(currency.id)}
          >
            <Card
              style={[
                styles.currencyCard,
                selectedCurrency === currency.id && styles.currencyCardSelected,
              ]}
            >
              <Text style={styles.currencyFlag}>{currency.flag}</Text>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.id}</Text>
              </View>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              {selectedCurrency === currency.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Подтверждение</Text>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name={selectedType?.icon}
              size={32}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.summaryTitle}>{selectedType?.name}</Text>
            <Text style={styles.summaryCurrency}>
              {CURRENCIES.find((c) => c.id === selectedCurrency)?.name} (
              {selectedCurrency})
            </Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Тип счёта</Text>
            <Text style={styles.summaryValue}>{selectedType?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Валюта</Text>
            <Text style={styles.summaryValue}>{selectedCurrency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Обслуживание</Text>
            <Text style={styles.summaryValue}>Бесплатно</Text>
          </View>
          {selectedType?.rate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ставка</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {selectedType.rate}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Account Name */}
      <Card style={styles.formCard}>
        <FormInput
          label="Название счёта (необязательно)"
          placeholder={`${selectedType?.name} ${selectedCurrency}`}
          value={accountName}
          onChangeText={setAccountName}
        />
      </Card>

      {/* Terms */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
      >
        <View
          style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
        >
          {agreedToTerms && (
            <Ionicons name="checkmark" size={16} color={colors.white} />
          )}
        </View>
        <Text style={styles.termsText}>
          Я согласен с{" "}
          <Text style={styles.termsLink}>условиями обслуживания</Text> и{" "}
          <Text style={styles.termsLink}>тарифами банка</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Открыть счёт</Text>
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
          title={step === 3 ? "Открыть счёт" : "Далее"}
          onPress={handleNext}
          loading={isLoading}
          fullWidth
          disabled={step === 3 && !agreedToTerms}
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
  typeCard: { marginBottom: spacing.sm },
  typeCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  typeHeader: { flexDirection: "row", alignItems: "center" },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  typeIconSelected: { backgroundColor: colors.primary },
  typeInfo: { flex: 1 },
  typeNameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  typeName: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  typeRate: {
    ...typography.caption,
    color: colors.success,
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  typeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeFeatures: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  featureText: { ...typography.caption, color: colors.textSecondary },
  currencyList: {},
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  currencyCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  currencyFlag: { fontSize: 32, marginRight: spacing.md },
  currencyInfo: { flex: 1 },
  currencyName: {
    ...typography.body1,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  currencyCode: { ...typography.caption, color: colors.textSecondary },
  currencySymbol: {
    ...typography.h3,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  summaryCard: { marginBottom: spacing.md },
  summaryHeader: { flexDirection: "row", alignItems: "center" },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  summaryTitle: { ...typography.h4, color: colors.textPrimary },
  summaryCurrency: { ...typography.body2, color: colors.textSecondary },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: spacing.md,
  },
  summaryDetails: {},
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  summaryLabel: { ...typography.body2, color: colors.textSecondary },
  summaryValue: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  formCard: { marginBottom: spacing.md },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: { ...typography.body2, color: colors.textSecondary, flex: 1 },
  termsLink: { color: colors.primary },
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

export default CreateAccountScreen;
