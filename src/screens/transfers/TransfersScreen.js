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
import { Card, Avatar, Button } from '../../components';
import { useGetTemplatesQuery, useGetPopularProvidersQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const TransfersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: templatesData } = useGetTemplatesQuery({});
  const { data: providersData } = useGetPopularProvidersQuery({ limit: 8 });

  const templates = templatesData?.data || [];
  const providers = providersData?.data || [];

  const quickActions = [
    { id: 'phone', icon: 'call-outline', label: 'По телефону' },
    { id: 'account', icon: 'document-text-outline', label: 'По счёту' },
    { id: 'card', icon: 'card-outline', label: 'На карту' },
    { id: 'qr', icon: 'qr-code-outline', label: 'По QR' },
  ];

  const mockRecipients = [
    { id: '1', name: 'Алексей К.' },
    { id: '2', name: 'Мария С.' },
    { id: '3', name: 'Иван П.' },
    { id: '4', name: 'Анна В.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Переводы</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Номер телефона или счёта"
              placeholderTextColor={colors.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Частые получатели</Text>
          <FlatList
            data={mockRecipients}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipientItem}>
                <Avatar name={item.name} size={48} />
                <Text style={styles.recipientName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipientsList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Шаблоны платежей</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Все</Text></TouchableOpacity>
          </View>
          <Card>
            {templates.length > 0 ? templates.slice(0, 3).map((t) => (
              <TouchableOpacity key={t.id} style={styles.templateItem}>
                <View style={styles.templateIcon}>
                  <Ionicons name="document-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{t.template_name}</Text>
                  <Text style={styles.templateRecipient}>{t.recipient_name}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyTemplates}>
                <Text style={styles.emptyText}>Нет шаблонов</Text>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Провайдеры услуг</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Все</Text></TouchableOpacity>
          </View>
          <View style={styles.providersGrid}>
            {providers.slice(0, 8).map((p) => (
              <TouchableOpacity key={p.id} style={styles.providerItem}>
                <View style={styles.providerIcon}>
                  <Ionicons name="business-outline" size={24} color={colors.secondary} />
                </View>
                <Text style={styles.providerName} numberOfLines={2}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
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
  quickActionsContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.md },
  quickAction: { flex: 1, alignItems: 'center' },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  seeAll: { ...typography.body2, color: colors.primary, fontWeight: '500' },
  recipientsList: { paddingHorizontal: spacing.lg },
  recipientItem: { alignItems: 'center', marginRight: spacing.md, width: 64 },
  recipientName: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  templateItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  templateInfo: { flex: 1 },
  templateName: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  templateRecipient: { ...typography.caption, color: colors.textSecondary },
  emptyTemplates: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { ...typography.body2, color: colors.textTertiary },
  providersGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  providerItem: {
    width: '23%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.secondary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  providerName: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

export default TransfersScreen;
