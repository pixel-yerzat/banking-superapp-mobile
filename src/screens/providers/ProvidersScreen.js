import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useGetProvidersQuery, useSearchProvidersQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const CATEGORIES = [
  { id: 'all', label: 'Все', icon: 'apps-outline' },
  { id: 'mobile', label: 'Связь', icon: 'phone-portrait-outline' },
  { id: 'internet', label: 'Интернет', icon: 'wifi-outline' },
  { id: 'utilities', label: 'Коммунальные', icon: 'flash-outline' },
  { id: 'tv', label: 'ТВ', icon: 'tv-outline' },
  { id: 'transport', label: 'Транспорт', icon: 'car-outline' },
  { id: 'government', label: 'Госуслуги', icon: 'document-text-outline' },
  { id: 'education', label: 'Образование', icon: 'school-outline' },
];

// Mock providers data
const MOCK_PROVIDERS = [
  { id: '1', name: 'Beeline', category: 'mobile', icon: '🐝', popular: true },
  { id: '2', name: 'Kcell', category: 'mobile', icon: '📱', popular: true },
  { id: '3', name: 'Tele2', category: 'mobile', icon: '📶', popular: true },
  { id: '4', name: 'Altel', category: 'mobile', icon: '📡', popular: false },
  { id: '5', name: 'Kazakhtelecom', category: 'internet', icon: '🌐', popular: true },
  { id: '6', name: 'iD Net', category: 'internet', icon: '💻', popular: false },
  { id: '7', name: 'Alma TV', category: 'tv', icon: '📺', popular: true },
  { id: '8', name: 'Алматы Су', category: 'utilities', icon: '💧', popular: true },
  { id: '9', name: 'АлматыЭнергоСбыт', category: 'utilities', icon: '⚡', popular: true },
  { id: '10', name: 'Алматыгаз', category: 'utilities', icon: '🔥', popular: true },
  { id: '11', name: 'КазТрансГаз', category: 'utilities', icon: '🏭', popular: false },
  { id: '12', name: 'Onay', category: 'transport', icon: '🚌', popular: true },
  { id: '13', name: 'EGov', category: 'government', icon: '🏛️', popular: true },
  { id: '14', name: 'Налоги', category: 'government', icon: '📋', popular: false },
  { id: '15', name: 'Детский сад', category: 'education', icon: '🎨', popular: false },
  { id: '16', name: 'Школа', category: 'education', icon: '📚', popular: false },
];

const ProvidersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: providersData } = useGetProvidersQuery({ category: selectedCategory });
  const { data: searchData } = useSearchProvidersQuery(searchQuery, { skip: !searchQuery });

  const providers = searchQuery
    ? (searchData?.data || MOCK_PROVIDERS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    : (providersData?.data || MOCK_PROVIDERS);

  const filteredProviders = selectedCategory === 'all'
    ? providers
    : providers.filter((p) => p.category === selectedCategory);

  const popularProviders = MOCK_PROVIDERS.filter((p) => p.popular);

  const handleProviderSelect = (provider) => {
    navigation.navigate('ProviderPayment', { provider });
  };

  const renderProvider = ({ item }) => (
    <TouchableOpacity
      style={styles.providerItem}
      onPress={() => handleProviderSelect(item)}
    >
      <View style={styles.providerIcon}>
        <Text style={styles.providerEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.providerName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата услуг</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск провайдера"
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
        {CATEGORIES.map((category) => (
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Popular Section */}
        {!searchQuery && selectedCategory === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Популярные</Text>
            <View style={styles.popularGrid}>
              {popularProviders.slice(0, 8).map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.popularItem}
                  onPress={() => handleProviderSelect(provider)}
                >
                  <View style={styles.popularIcon}>
                    <Text style={styles.popularEmoji}>{provider.icon}</Text>
                  </View>
                  <Text style={styles.popularName} numberOfLines={1}>
                    {provider.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Providers List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery
              ? `Результаты поиска (${filteredProviders.length})`
              : selectedCategory === 'all'
              ? 'Все провайдеры'
              : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </Text>

          {filteredProviders.length > 0 ? (
            <Card style={styles.providersCard}>
              {filteredProviders.map((provider, index) => (
                <View key={provider.id}>
                  <TouchableOpacity
                    style={styles.providerRow}
                    onPress={() => handleProviderSelect(provider)}
                  >
                    <View style={styles.providerRowIcon}>
                      <Text style={styles.providerRowEmoji}>{provider.icon}</Text>
                    </View>
                    <View style={styles.providerRowInfo}>
                      <Text style={styles.providerRowName}>{provider.name}</Text>
                      <Text style={styles.providerRowCategory}>
                        {CATEGORIES.find((c) => c.id === provider.category)?.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                  </TouchableOpacity>
                  {index < filteredProviders.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </Card>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Ничего не найдено</Text>
              <Text style={styles.emptyText}>Попробуйте изменить запрос</Text>
            </View>
          )}
        </View>

        {/* Recent Payments */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Недавние оплаты</Text>
            <Card style={styles.recentCard}>
              <View style={styles.recentEmpty}>
                <Ionicons name="time-outline" size={32} color={colors.gray300} />
                <Text style={styles.recentEmptyText}>История оплат пуста</Text>
              </View>
            </Card>
          </View>
        )}
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popularItem: {
    width: '23%',
    alignItems: 'center',
  },
  popularIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  popularEmoji: { fontSize: 28 },
  popularName: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  providersCard: { padding: 0 },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  providerRowIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  providerRowEmoji: { fontSize: 20 },
  providerRowInfo: { flex: 1 },
  providerRowName: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  providerRowCategory: { ...typography.caption, color: colors.textTertiary },
  divider: { height: 1, backgroundColor: colors.gray100, marginLeft: 56 + spacing.md },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: { ...typography.body2, color: colors.textSecondary },
  recentCard: {},
  recentEmpty: { alignItems: 'center', paddingVertical: spacing.lg },
  recentEmptyText: { ...typography.body2, color: colors.textTertiary, marginTop: spacing.sm },
  providerItem: { width: '25%', alignItems: 'center', marginBottom: spacing.md },
  providerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  providerEmoji: { fontSize: 28 },
  providerName: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});

export default ProvidersScreen;
