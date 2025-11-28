import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components";
import {
  useGetCategoryStatsQuery,
  useGetSpendingAnalysisQuery,
  useGetMonthlySummaryQuery,
} from "../../api";
import { colors, spacing, typography, borderRadius } from "../../theme/colors";
import { CURRENCY_SYMBOLS } from "../../constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AnalyticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const { data: categoryData } = useGetCategoryStatsQuery({
    period: selectedPeriod,
  });
  const { data: spendingData } = useGetSpendingAnalysisQuery({
    period: selectedPeriod,
  });
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JS months are 0-based
  const { data: summaryData } = useGetMonthlySummaryQuery({
    year: currentYear,
    month: currentMonth,
  });

  const categories = categoryData?.data || [];
  const spending = spendingData?.data || {};
  const summary = summaryData?.data || {};

  const periods = [
    { id: "week", label: "Неделя" },
    { id: "month", label: "Месяц" },
    { id: "quarter", label: "Квартал" },
    { id: "year", label: "Год" },
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("ru-RU").format(amount || 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "fast-food-outline",
      transport: "car-outline",
      shopping: "bag-outline",
      entertainment: "game-controller-outline",
      utilities: "flash-outline",
      health: "medkit-outline",
      education: "school-outline",
      other: "ellipsis-horizontal-outline",
    };
    return icons[category] || "ellipsis-horizontal-outline";
  };

  const getCategoryColor = (index) => {
    const categoryColors = [
      "#1E3A5F",
      "#00B4D8",
      "#FFB703",
      "#10B981",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
      "#6B7280",
    ];
    return categoryColors[index % categoryColors.length];
  };

  const totalSpending = categories.reduce(
    (sum, cat) => sum + (cat.amount || 0),
    0
  );

  // Mock data for chart
  const chartData = [
    { day: "Пн", amount: 15000 },
    { day: "Вт", amount: 8000 },
    { day: "Ср", amount: 22000 },
    { day: "Чт", amount: 5000 },
    { day: "Пт", amount: 35000 },
    { day: "Сб", amount: 28000 },
    { day: "Вс", amount: 12000 },
  ];

  const maxChartValue = Math.max(...chartData.map((d) => d.amount));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Аналитика</Text>
          <TouchableOpacity>
            <Ionicons
              name="download-outline"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.id && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card
            style={[styles.summaryCard, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.summaryLabel}>Расходы</Text>
            <Text style={styles.summaryAmount}>
              -{formatAmount(summary.total_expenses || totalSpending)} ₸
            </Text>
            <View style={styles.summaryChange}>
              <Ionicons name="arrow-up" size={14} color="#FF6B6B" />
              <Text style={styles.summaryChangeText}>
                +12% к прошлому месяцу
              </Text>
            </View>
          </Card>

          <Card
            style={[styles.summaryCard, { backgroundColor: colors.success }]}
          >
            <Text style={styles.summaryLabel}>Доходы</Text>
            <Text style={styles.summaryAmount}>
              +{formatAmount(summary.total_income || 450000)} ₸
            </Text>
            <View style={styles.summaryChange}>
              <Ionicons name="arrow-up" size={14} color="#90EE90" />
              <Text style={styles.summaryChangeText}>
                +5% к прошлому месяцу
              </Text>
            </View>
          </Card>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Баланс за период</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  {
                    color:
                      (summary.balance || 150000) >= 0
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {(summary.balance || 150000) >= 0 ? "+" : ""}
                {formatAmount(summary.balance || 150000)} ₸
              </Text>
            </View>
            <View style={styles.savingsContainer}>
              <Ionicons name="trending-up" size={24} color={colors.success} />
              <Text style={styles.savingsText}>Сбережения: 33%</Text>
            </View>
          </View>
        </Card>

        {/* Spending Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Расходы по дням</Text>
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(item.amount / maxChartValue) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Расходы по категориям</Text>
          </View>

          {/* Pie Chart Placeholder */}
          <Card style={styles.pieChartCard}>
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChart}>
                {categories.length > 0 ? (
                  <View style={styles.pieChartInner}>
                    <Text style={styles.pieChartAmount}>
                      {formatAmount(totalSpending)}
                    </Text>
                    <Text style={styles.pieChartLabel}>₸</Text>
                  </View>
                ) : (
                  <Text style={styles.pieChartEmpty}>Нет данных</Text>
                )}
              </View>
            </View>

            {/* Category List */}
            <View style={styles.categoriesList}>
              {(categories.length > 0
                ? categories
                : [
                    { category: "food", amount: 45000, percentage: 30 },
                    { category: "transport", amount: 25000, percentage: 17 },
                    { category: "shopping", amount: 35000, percentage: 23 },
                    {
                      category: "entertainment",
                      amount: 20000,
                      percentage: 13,
                    },
                    { category: "utilities", amount: 15000, percentage: 10 },
                    { category: "other", amount: 10000, percentage: 7 },
                  ]
              ).map((cat, index) => (
                <TouchableOpacity key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: getCategoryColor(index) },
                      ]}
                    />
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: `${getCategoryColor(index)}20` },
                      ]}
                    >
                      <Ionicons
                        name={getCategoryIcon(cat.category)}
                        size={18}
                        color={getCategoryColor(index)}
                      />
                    </View>
                    <Text style={styles.categoryName}>
                      {cat.category === "food"
                        ? "Еда"
                        : cat.category === "transport"
                          ? "Транспорт"
                          : cat.category === "shopping"
                            ? "Покупки"
                            : cat.category === "entertainment"
                              ? "Развлечения"
                              : cat.category === "utilities"
                                ? "Коммунальные"
                                : cat.category === "health"
                                  ? "Здоровье"
                                  : cat.category === "education"
                                    ? "Образование"
                                    : "Другое"}
                    </Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      {formatAmount(cat.amount)} ₸
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {cat.percentage ||
                        Math.round((cat.amount / totalSpending) * 100)}
                      %
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Рекомендации</Text>
          <Card style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Расходы на еду выросли</Text>
              <Text style={styles.insightText}>
                В этом месяце вы потратили на 15% больше на еду. Попробуйте
                готовить дома чаще.
              </Text>
            </View>
          </Card>
          <Card style={styles.insightCard}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: `${colors.success}15` },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={colors.success}
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Отличная экономия!</Text>
              <Text style={styles.insightText}>
                Вы сэкономили 33% от дохода. Продолжайте в том же духе!
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  periodContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    alignItems: "center",
  },
  periodButtonActive: { backgroundColor: colors.primary },
  periodText: { ...typography.body2, color: colors.textSecondary },
  periodTextActive: { color: colors.white, fontWeight: "600" },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: { flex: 1, padding: spacing.md },
  summaryLabel: { ...typography.caption, color: "rgba(255,255,255,0.8)" },
  summaryAmount: {
    ...typography.h3,
    color: colors.white,
    marginVertical: spacing.xs,
  },
  summaryChange: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryChangeText: { ...typography.caption, color: "rgba(255,255,255,0.8)" },
  balanceCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: { ...typography.body2, color: colors.textSecondary },
  balanceAmount: { ...typography.h3 },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  savingsText: { ...typography.body2, color: colors.success },
  chartCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  chartTitle: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
  },
  chartBarContainer: { alignItems: "center", flex: 1 },
  chartBarWrapper: { flex: 1, justifyContent: "flex-end", width: 24 },
  chartBar: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    width: "100%",
    minHeight: 4,
  },
  chartLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  pieChartCard: {},
  pieChartContainer: { alignItems: "center", marginBottom: spacing.md },
  pieChart: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 16,
    borderColor: colors.primary,
  },
  pieChartInner: { alignItems: "center" },
  pieChartAmount: { ...typography.h3, color: colors.textPrimary },
  pieChartLabel: { ...typography.body2, color: colors.textSecondary },
  pieChartEmpty: { ...typography.body2, color: colors.textTertiary },
  categoriesList: { marginTop: spacing.sm },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  categoryLeft: { flexDirection: "row", alignItems: "center" },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  categoryName: { ...typography.body2, color: colors.textPrimary },
  categoryRight: { alignItems: "flex-end" },
  categoryAmount: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  categoryPercentage: { ...typography.caption, color: colors.textTertiary },
  insightCard: { flexDirection: "row", marginBottom: spacing.sm },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.warning}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  insightContent: { flex: 1 },
  insightTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  insightText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default AnalyticsScreen;
