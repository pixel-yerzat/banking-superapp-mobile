import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ConfirmModal } from '../../components';
import {
  useGetTemplatesQuery,
  useDeleteTemplateMutation,
  usePayByTemplateMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount } from '../../utils/formatters';

const TemplatesScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, refetch } = useGetTemplatesQuery({});
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();
  const [payByTemplate, { isLoading: isPaying }] = usePayByTemplateMutation();

  const templates = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePayByTemplate = async (template) => {
    try {
      await payByTemplate(template.id).unwrap();
      Alert.alert('Успешно', `Платёж по шаблону "${template.template_name}" выполнен`);
      refetch();
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось выполнить платёж');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await deleteTemplate(selectedTemplate.id).unwrap();
      Alert.alert('Успешно', 'Шаблон удалён');
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось удалить шаблон');
    }
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'transfer':
        return 'swap-horizontal-outline';
      case 'payment':
        return 'card-outline';
      case 'mobile':
        return 'phone-portrait-outline';
      case 'utilities':
        return 'flash-outline';
      default:
        return 'document-outline';
    }
  };

  const renderTemplate = ({ item }) => (
    <Card style={styles.templateCard}>
      <TouchableOpacity
        style={styles.templateContent}
        onPress={() => handlePayByTemplate(item)}
      >
        <View style={[styles.templateIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons
            name={getTemplateIcon(item.template_type)}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.template_name}</Text>
          <Text style={styles.templateRecipient}>{item.recipient_name}</Text>
          {item.amount && (
            <Text style={styles.templateAmount}>
              {formatAmount(item.amount, item.currency || 'KZT')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayByTemplate(item)}
        >
          <Ionicons name="play" size={20} color={colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditTemplate', { templateId: item.id })}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Изменить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedTemplate(item);
            setShowDeleteModal(true);
          }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyTitle}>Нет шаблонов</Text>
      <Text style={styles.emptyText}>
        Создайте шаблон для быстрых платежей
      </Text>
      <Button
        title="Создать шаблон"
        onPress={() => navigation.navigate('CreateTemplate')}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Шаблоны</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTemplate')}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Templates List */}
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTemplate')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTemplate(null);
        }}
        onConfirm={handleDeleteTemplate}
        title="Удалить шаблон?"
        message={`Шаблон "${selectedTemplate?.template_name}" будет удалён`}
        confirmText="Удалить"
        confirmVariant="danger"
        icon="trash"
        loading={isDeleting}
      />
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  templateCard: { marginBottom: spacing.md },
  templateContent: { flexDirection: 'row', alignItems: 'center' },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  templateInfo: { flex: 1 },
  templateName: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  templateRecipient: { ...typography.body2, color: colors.textSecondary },
  templateAmount: { ...typography.body2, fontWeight: '500', color: colors.primary, marginTop: 2 },
  payButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: spacing.md,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { ...typography.body2, color: colors.primary },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyButton: { minWidth: 160 },
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default TemplatesScreen;
