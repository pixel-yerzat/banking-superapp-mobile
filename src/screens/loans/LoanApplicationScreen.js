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
import Slider from "@react-native-community/slider";
import { Card, Button, FormInput } from "../../components";
import { useSubmitLoanApplicationMutation } from "../../api";
import { colors, spacing, typography, borderRadius } from "../../theme/colors";
import { formatAmount } from "../../utils/formatters";

const LOAN_PURPOSES = [
  { id: "consumer", label: "Потребительский", icon: "cart-outline", rate: 18 },
  { id: "car", label: "Автокредит", icon: "car-outline", rate: 14 },
  { id: "mortgage", label: "Ипотека", icon: "home-outline", rate: 12 },
  {
    id: "refinance",
    label: "Рефинансирование",
    icon: "refresh-outline",
    rate: 16,
  },
  { id: "business", label: "Бизнес", icon: "briefcase-outline", rate: 20 },
];

const EMPLOYMENT_TYPES = [
  { id: "employed", label: "Работаю по найму" },
  { id: "self_employed", label: "Самозанятый / ИП" },
  { id: "business_owner", label: "Владелец бизнеса" },
  { id: "retired", label: "Пенсионер" },
];

const LoanApplicationScreen = ({ navigation, route }) => {
  const { presetAmount, presetTerm, presetType } = route.params || {};

  const [step, setStep] = useState(1);
  const [loanPurpose, setLoanPurpose] = useState(
    LOAN_PURPOSES.find((p) => p.id === presetType) || null
  );
  const [amount, setAmount] = useState(presetAmount || 500000);
  const [term, setTerm] = useState(presetTerm || 24);
  const [employmentType, setEmploymentType] = useState(null);
  const [income, setIncome] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [submitApplication, { isLoading }] = useSubmitLoanApplicationMutation();

  const currentRate = loanPurpose?.rate || 18;
  const monthlyRate = currentRate / 100 / 12;
  const monthlyPayment =
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
    (Math.pow(1 + monthlyRate, term) - 1);
  const totalPayment = monthlyPayment * term;
  const overpayment = totalPayment - amount;

  const handleNext = () => {
    if (step === 1 && !loanPurpose) {
      Alert.alert("Ошибка", "Выберите цель кредита");
      return;
    }
    if (step === 3 && !employmentType) {
      Alert.alert("Ошибка", "Укажите тип занятости");
      return;
    }
    if (step === 3 && !income) {
      Alert.alert("Ошибка", "Укажите ежемесячный доход");
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
      Alert.alert("Ошибка", "Необходимо согласиться с условиями");
      return;
    }

    try {
      await submitApplication({
        loan_type: loanPurpose.id,
        principal_amount: amount,
        term_months: term,
        interest_rate: loanPurpose.rate,
        employment_type: employmentType,
        monthly_income: parseInt(income, 10),
        work_experience: parseInt(workExperience, 10) || 0,
      }).unwrap();

      Alert.alert(
        "Заявка отправлена",
        "Мы рассмотрим вашу заявку в течение 15 минут. Уведомление придёт в приложение.",
        [{ text: "OK", onPress: () => navigation.navigate("Loans") }]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error.data?.message || "Не удалось отправить заявку"
      );
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Цель кредита</Text>
      {LOAN_PURPOSES.map((purpose) => (
        <TouchableOpacity
          key={purpose.id}
          onPress={() => setLoanPurpose(purpose)}
        >
          <Card
            style={[
              styles.purposeCard,
              loanPurpose?.id === purpose.id && styles.purposeCardSelected,
            ]}
          >
            <View
              style={[
                styles.purposeIcon,
                loanPurpose?.id === purpose.id && styles.purposeIconSelected,
              ]}
            >
              <Ionicons
                name={purpose.icon}
                size={24}
                color={
                  loanPurpose?.id === purpose.id ? colors.white : colors.primary
                }
              />
            </View>
            <View style={styles.purposeInfo}>
              <Text style={styles.purposeLabel}>{purpose.label}</Text>
              <Text style={styles.purposeRate}>от {purpose.rate}% годовых</Text>
            </View>
            {loanPurpose?.id === purpose.id && (
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
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Параметры кредита</Text>

      <Card style={styles.paramCard}>
        <View style={styles.paramHeader}>
          <Text style={styles.paramLabel}>Сумма кредита</Text>
          <Text style={styles.paramValue}>{formatAmount(amount, "KZT")}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={100000}
          maximumValue={loanPurpose?.id === "mortgage" ? 50000000 : 10000000}
          step={50000}
          value={amount}
          onValueChange={setAmount}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.gray200}
          thumbTintColor={colors.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>100 000 ₸</Text>
          <Text style={styles.sliderLabel}>
            {loanPurpose?.id === "mortgage" ? "50 млн ₸" : "10 млн ₸"}
          </Text>
        </View>
      </Card>

      <Card style={styles.paramCard}>
        <View style={styles.paramHeader}>
          <Text style={styles.paramLabel}>Срок кредита</Text>
          <Text style={styles.paramValue}>{term} мес.</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={3}
          maximumValue={loanPurpose?.id === "mortgage" ? 300 : 60}
          step={1}
          value={term}
          onValueChange={setTerm}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.gray200}
          thumbTintColor={colors.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>3 мес.</Text>
          <Text style={styles.sliderLabel}>
            {loanPurpose?.id === "mortgage" ? "25 лет" : "5 лет"}
          </Text>
        </View>
      </Card>

      {/* Calculation Summary */}
      <Card style={styles.calcCard}>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Ежемесячный платёж</Text>
          <Text style={styles.calcValue}>
            {formatAmount(Math.round(monthlyPayment), "KZT")}
          </Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Процентная ставка</Text>
          <Text style={styles.calcValue}>{currentRate}% годовых</Text>
        </View>
        <View style={styles.calcDivider} />
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Переплата</Text>
          <Text style={[styles.calcValue, { color: colors.warning }]}>
            {formatAmount(Math.round(overpayment), "KZT")}
          </Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabelBold}>Общая сумма</Text>
          <Text style={styles.calcValueBold}>
            {formatAmount(Math.round(totalPayment), "KZT")}
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Информация о доходах</Text>

      <Text style={styles.sectionLabel}>Тип занятости</Text>
      {EMPLOYMENT_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          onPress={() => setEmploymentType(type.id)}
        >
          <Card
            style={[
              styles.employmentCard,
              employmentType === type.id && styles.employmentCardSelected,
            ]}
          >
            <Text style={styles.employmentLabel}>{type.label}</Text>
            {employmentType === type.id && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />
            )}
          </Card>
        </TouchableOpacity>
      ))}

      <Card style={styles.formCard}>
        <FormInput
          label="Ежемесячный доход"
          placeholder="0"
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          rightElement={<Text style={styles.inputSuffix}>₸</Text>}
        />
        <FormInput
          label="Стаж на текущем месте (мес.)"
          placeholder="0"
          value={workExperience}
          onChangeText={setWorkExperience}
          keyboardType="numeric"
        />
      </Card>

      {income && parseInt(income, 10) < monthlyPayment * 2 && (
        <Card style={styles.warningCard}>
          <Ionicons name="warning-outline" size={24} color={colors.warning} />
          <Text style={styles.warningText}>
            Рекомендуемый доход для такого платежа:{" "}
            {formatAmount(Math.round(monthlyPayment * 2), "KZT")}
          </Text>
        </Card>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Подтверждение заявки</Text>

      <Card style={styles.summaryCard}>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Параметры кредита</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Цель</Text>
            <Text style={styles.summaryValue}>{loanPurpose?.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Сумма</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(amount, "KZT")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Срок</Text>
            <Text style={styles.summaryValue}>{term} мес.</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ставка</Text>
            <Text style={styles.summaryValue}>{currentRate}% годовых</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Платежи</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ежемесячно</Text>
            <Text style={styles.summaryValueHighlight}>
              {formatAmount(Math.round(monthlyPayment), "KZT")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Переплата</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(Math.round(overpayment), "KZT")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Всего к возврату</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(Math.round(totalPayment), "KZT")}
            </Text>
          </View>
        </View>
      </Card>

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
          Я согласен на проверку кредитной истории и обработку персональных
          данных
        </Text>
      </TouchableOpacity>

      <Card style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={colors.info}
        />
        <Text style={styles.infoText}>
          Решение по заявке принимается в течение 15 минут. После одобрения
          деньги будут зачислены на ваш счёт.
        </Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Заявка на кредит</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
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
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={step === 4 ? "Отправить заявку" : "Далее"}
          onPress={handleNext}
          loading={isLoading}
          fullWidth
          disabled={step === 4 && !agreedToTerms}
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
    marginBottom: spacing.sm,
  },
  purposeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  purposeCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  purposeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  purposeIconSelected: { backgroundColor: colors.primary },
  purposeInfo: { flex: 1 },
  purposeLabel: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  purposeRate: { ...typography.caption, color: colors.success },
  paramCard: { marginBottom: spacing.md },
  paramHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  paramLabel: { ...typography.body2, color: colors.textSecondary },
  paramValue: { ...typography.h4, color: colors.primary },
  slider: { height: 40 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
  sliderLabel: { ...typography.caption, color: colors.textTertiary },
  calcCard: { backgroundColor: `${colors.primary}08` },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  calcLabel: { ...typography.body2, color: colors.textSecondary },
  calcValue: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  calcLabelBold: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  calcValueBold: {
    ...typography.body1,
    fontWeight: "700",
    color: colors.primary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  employmentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  employmentCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  employmentLabel: { ...typography.body1, color: colors.textPrimary },
  formCard: { marginTop: spacing.md },
  inputSuffix: { ...typography.body1, color: colors.textSecondary },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}15`,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  warningText: { ...typography.caption, color: colors.warning, flex: 1 },
  summaryCard: {},
  summarySection: { marginBottom: spacing.md },
  summaryTitle: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  summaryLabel: { ...typography.body2, color: colors.textSecondary },
  summaryValue: {
    ...typography.body2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  summaryValueHighlight: {
    ...typography.body1,
    fontWeight: "700",
    color: colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: spacing.sm,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.info}10`,
    gap: spacing.sm,
  },
  infoText: { ...typography.caption, color: colors.info, flex: 1 },
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

export default LoanApplicationScreen;
