import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useGetFaqQuery, useSearchFaqQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: faqData } = useGetFaqQuery();
  const { data: searchData } = useSearchFaqQuery(searchQuery, { skip: !searchQuery });

  const faqItems = searchQuery ? (searchData?.data || []) : (faqData?.data || []);

  const categories = [
    { id: 'all', label: 'Все', icon: 'apps-outline' },
    { id: 'cards', label: 'Карты', icon: 'card-outline' },
    { id: 'transfers', label: 'Переводы', icon: 'swap-horizontal-outline' },
    { id: 'payments', label: 'Платежи', icon: 'cash-outline' },
    { id: 'security', label: 'Безопасность', icon: 'shield-outline' },
    { id: 'account', label: 'Счёт', icon: 'wallet-outline' },
  ];

  // Mock FAQ data
  const mockFaqItems = [
    {
      id: '1',
      category: 'cards',
      question: 'Как заблокировать карту?',
      answer: 'Вы можете заблокировать карту в разделе "Карты". Выберите нужную карту и нажмите "Заблокировать". Также можно позвонить на горячую линию банка: 8 800 XXX XX XX.',
    },
    {
      id: '2',
      category: 'cards',
      question: 'Как изменить PIN-код карты?',
      answer: 'Для изменения PIN-кода перейдите в раздел "Карты", выберите карту и нажмите "Изменить PIN". Также можно изменить PIN в любом банкомате нашего банка.',
    },
    {
      id: '3',
      category: 'transfers',
      question: 'Какой лимит на переводы?',
      answer: 'Лимит на переводы зависит от типа карты. Для стандартных карт: до 500 000 ₸ в сутки. Для премиальных: до 5 000 000 ₸ в сутки. Вы можете изменить лимиты в настройках карты.',
    },
    {
      id: '4',
      category: 'transfers',
      question: 'Сколько идёт перевод?',
      answer: 'Переводы внутри банка — мгновенно. Переводы в другие банки — до 1 рабочего дня. Международные переводы — 1-3 рабочих дня.',
    },
    {
      id: '5',
      category: 'payments',
      question: 'Как оплатить коммунальные услуги?',
      answer: 'Перейдите в раздел "Переводы" → "Провайдеры услуг" → выберите категорию "Коммунальные". Найдите нужного поставщика и введите номер лицевого счёта.',
    },
    {
      id: '6',
      category: 'security',
      question: 'Как включить Face ID / Touch ID?',
      answer: 'Перейдите в "Настройки" → "Безопасность". Включите переключатель "Face ID" или "Touch ID". После этого вы сможете входить в приложение и подтверждать операции биометрией.',
    },
    {
      id: '7',
      category: 'security',
      question: 'Что делать при подозрительной операции?',
      answer: 'Немедленно заблокируйте карту в приложении. Свяжитесь со службой поддержки по телефону 8 800 XXX XX XX. Вы можете оспорить операцию в течение 120 дней.',
    },
    {
      id: '8',
      category: 'account',
      question: 'Как открыть новый счёт?',
      answer: 'Перейдите в раздел "Счета" и нажмите "Открыть счёт". Выберите тип счёта и валюту. Счёт будет открыт мгновенно.',
    },
  ];

  const displayedFaq = faqItems.length > 0 ? faqItems : mockFaqItems;
  const filteredFaq = selectedCategory === 'all'
    ? displayedFaq
    : displayedFaq.filter((item) => item.category === selectedCategory);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFaqItem = (item) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.faqItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.gray400}
          />
        </View>
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Частые вопросы</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по вопросам"
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.faqList}>
        <Card style={styles.faqCard}>
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <View key={item.id}>
                {renderFaqItem(item)}
                {index < filteredFaq.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Ничего не найдено</Text>
              <Text style={styles.emptyText}>Попробуйте изменить запрос</Text>
            </View>
          )}
        </Card>

        {/* Contact Support */}
        <Card style={styles.supportCard}>
          <View style={styles.supportContent}>
            <View style={styles.supportIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>Не нашли ответ?</Text>
              <Text style={styles.supportText}>Напишите нам в чат поддержки</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.supportButtonText}>Открыть чат</Text>
          </TouchableOpacity>
        </Card>
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
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  searchContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, ...typography.body1, color: colors.textPrimary },
  categoriesContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryButtonActive: { backgroundColor: colors.primary },
  categoryText: { ...typography.body2, color: colors.textSecondary },
  categoryTextActive: { color: colors.white },
  faqList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  faqCard: { padding: 0, marginBottom: spacing.md },
  faqItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { ...typography.body1, fontWeight: '500', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  faqAnswerContainer: { marginTop: spacing.sm },
  faqAnswer: { ...typography.body2, color: colors.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.gray100 },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
  supportCard: { marginBottom: spacing.lg },
  supportContent: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  supportInfo: { flex: 1 },
  supportTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  supportText: { ...typography.body2, color: colors.textSecondary },
  supportButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  supportButtonText: { ...typography.body2, color: colors.white, fontWeight: '600' },
});

export default FAQScreen;
