import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, BankCard, ConfirmModal } from '../../components';
import {
  useGetCardByIdQuery,
  useBlockCardMutation,
  useUnblockCardMutation,
  useSetCardLimitsMutation,
} from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { formatAmount, formatCardNumber, maskCardNumber } from '../../utils/formatters';

const CardDetailScreen = ({ navigation, route }) => {
  const { cardId } = route.params;
  
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);

  const { data, isLoading, refetch } = useGetCardByIdQuery(cardId);
  const [blockCard, { isLoading: isBlocking }] = useBlockCardMutation();
  const [unblockCard, { isLoading: isUnblocking }] = useUnblockCardMutation();

  const card = data?.data;

  const handleCopyCardNumber = () => {
    if (card?.card_number) {
      Clipboard.setString(card.card_number);
      Alert.alert('Скопировано', 'Номер карты скопирован в буфер обмена');
    }
  };

  const handleBlockCard = async () => {
    try {
      if (card?.status === 'blocked') {
        await unblockCard(cardId).unwrap();
        Alert.alert('Успешно', 'Карта разблокирована');
      } else {
        await blockCard(cardId).unwrap();
        Alert.alert('Успешно', 'Карта заблокирована');
      }
      setShowBlockModal(false);
      refetch();
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось выполнить операцию');
    }
  };

  const quickActions = [
    { id: 'limits', label: 'Лимиты', icon: 'speedometer-outline', onPress: () => setShowLimitsModal(true) },
    { id: 'pin', label: 'PIN-код', icon: 'keypad-outline', onPress: () => navigation.navigate('ChangePIN', { cardId }) },
    { id: 'block', label: card?.status === 'blocked' ? 'Разблокировать' : 'Заблокировать', icon: card?.status === 'blocked' ? 'lock-open-outline' : 'lock-closed-outline', onPress: () => setShowBlockModal(true) },
    { id: 'reissue', label: 'Перевыпуск', icon: 'refresh-outline', onPress: () => Alert.alert('Перевыпуск', 'Функция в разработке') },
  ];

  const settingsItems = [
    { id: 'online', label: 'Онлайн-платежи', value: card?.settings?.online_payments, icon: 'globe-outline' },
    { id: 'contactless', label: 'Бесконтактная оплата', value: card?.settings?.contactless, icon: 'wifi-outline' },
    { id: 'abroad', label: 'Платежи за рубежом', value: card?.settings?.abroad_payments, icon: 'airplane-outline' },
    { id: 'atm', label: 'Снятие в банкоматах', value: card?.settings?.atm_withdrawal, icon: 'cash-outline' },
  ];

  if (isLoading || !card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали карты</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CardSettings', { cardId })}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Card Visual */}
        <View style={styles.cardContainer}>
          <BankCard
            cardNumber={showCardNumber ? formatCardNumber(card.card_number) : maskCardNumber(card.card_number)}
            cardHolder={card.card_holder_name}
            expiryDate={card.expiry_date}
            cardType={card.card_type}
            balance={card.balance}
            currency={card.currency}
            isBlocked={card.status === 'blocked'}
          />
        </View>

        {/* Card Number Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cardAction}
            onPress={() => setShowCardNumber(!showCardNumber)}
          >
            <Ionicons
              name={showCardNumber ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.cardActionText}>
              {showCardNumber ? 'Скрыть номер' : 'Показать номер'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAction} onPress={handleCopyCardNumber}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
            <Text style={styles.cardActionText}>Копировать</Text>
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        {card.status === 'blocked' && (
          <Card style={styles.statusCard}>
            <Ionicons name="lock-closed" size={24} color={colors.error} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Карта заблокирована</Text>
              <Text style={styles.statusText}>Разблокируйте карту для совершения операций</Text>
            </View>
            <Button
              title="Разблокировать"
              variant="outline"
              size="small"
              onPress={() => setShowBlockModal(true)}
            />
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о карте</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Тип карты</Text>
              <Text style={styles.infoValue}>{card.card_type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Платёжная система</Text>
              <Text style={styles.infoValue}>{card.payment_system}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Валюта</Text>
              <Text style={styles.infoValue}>{card.currency}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Срок действия</Text>
              <Text style={styles.infoValue}>{card.expiry_date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Привязан к счёту</Text>
              <Text style={styles.infoValue}>•••• {card.account_number?.slice(-4)}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>CVV</Text>
              <TouchableOpacity
                style={styles.cvvContainer}
                onPress={() => setShowCVV(!showCVV)}
              >
                <Text style={styles.infoValue}>{showCVV ? card.cvv || '123' : '•••'}</Text>
                <Ionicons
                  name={showCVV ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  color={colors.gray400}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Лимиты</Text>
          <Card style={styles.limitsCard}>
            <View style={styles.limitItem}>
              <View style={styles.limitInfo}>
                <Text style={styles.limitLabel}>Дневной лимит</Text>
                <Text style={styles.limitUsed}>
                  Использовано: {formatAmount(card.limits?.daily_used || 0, card.currency)}
                </Text>
              </View>
              <Text style={styles.limitValue}>
                {formatAmount(card.limits?.daily || 500000, card.currency)}
              </Text>
            </View>
            <View style={styles.limitProgress}>
              <View
                style={[
                  styles.limitProgressBar,
                  { width: `${((card.limits?.daily_used || 0) / (card.limits?.daily || 500000)) * 100}%` },
                ]}
              />
            </View>

            <View style={[styles.limitItem, { marginTop: spacing.md }]}>
              <View style={styles.limitInfo}>
                <Text style={styles.limitLabel}>Месячный лимит</Text>
                <Text style={styles.limitUsed}>
                  Использовано: {formatAmount(card.limits?.monthly_used || 0, card.currency)}
                </Text>
              </View>
              <Text style={styles.limitValue}>
                {formatAmount(card.limits?.monthly || 5000000, card.currency)}
              </Text>
            </View>
            <View style={styles.limitProgress}>
              <View
                style={[
                  styles.limitProgressBar,
                  { width: `${((card.limits?.monthly_used || 0) / (card.limits?.monthly || 5000000)) * 100}%` },
                ]}
              />
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          <Card style={styles.settingsCard}>
            {settingsItems.map((item, index) => (
              <View
                key={item.id}
                style={[styles.settingItem, index === settingsItems.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                <View style={[styles.toggle, item.value && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, item.value && styles.toggleThumbActive]} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Последние операции</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CardTransactions', { cardId })}>
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.transactionsCard}>
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={32} color={colors.gray300} />
              <Text style={styles.emptyText}>Нет операций по карте</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Block Modal */}
      <ConfirmModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockCard}
        title={card.status === 'blocked' ? 'Разблокировать карту?' : 'Заблокировать карту?'}
        message={
          card.status === 'blocked'
            ? 'Карта станет доступна для операций'
            : 'Карта будет временно заблокирована. Вы сможете разблокировать её в любой момент.'
        }
        confirmText={card.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
        confirmVariant={card.status === 'blocked' ? 'primary' : 'danger'}
        icon={card.status === 'blocked' ? 'lock-open' : 'lock-closed'}
        loading={isBlocking || isUnblocking}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  cardContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardActionText: { ...typography.body2, color: colors.primary },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: `${colors.error}10`,
    gap: spacing.md,
  },
  statusInfo: { flex: 1 },
  statusTitle: { ...typography.body2, fontWeight: '600', color: colors.error },
  statusText: { ...typography.caption, color: colors.textSecondary },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  quickAction: { flex: 1, alignItems: 'center' },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  seeAllText: { ...typography.body2, color: colors.primary },
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: { ...typography.body2, color: colors.textSecondary },
  infoValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  cvvContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  limitsCard: {},
  limitItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  limitInfo: {},
  limitLabel: { ...typography.body2, color: colors.textPrimary },
  limitUsed: { ...typography.caption, color: colors.textSecondary },
  limitValue: { ...typography.body2, fontWeight: '600', color: colors.primary },
  limitProgress: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: 3,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  limitProgressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  settingsCard: {},
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingLabel: { ...typography.body2, color: colors.textPrimary },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: colors.gray200, padding: 2 },
  toggleActive: { backgroundColor: colors.primary },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  toggleThumbActive: { marginLeft: 22 },
  transactionsCard: {},
  emptyTransactions: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { ...typography.body2, color: colors.textTertiary, marginTop: spacing.sm },
});

export default CardDetailScreen;
