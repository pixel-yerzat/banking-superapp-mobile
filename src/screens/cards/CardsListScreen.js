import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BankCard, Card, Button } from '../../components';
import { useGetCardsQuery, useToggleContactlessMutation, useToggleOnlinePaymentsMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { CARD_TYPE_LABELS } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

const CardsListScreen = ({ navigation }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  const { data, refetch } = useGetCardsQuery();
  const [toggleContactless] = useToggleContactlessMutation();
  const [toggleOnlinePayments] = useToggleOnlinePaymentsMutation();

  const cards = data?.data || [];
  const activeCard = cards[activeCardIndex];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== activeCardIndex && index >= 0 && index < cards.length) {
      setActiveCardIndex(index);
    }
  };

  const handleToggleContactless = async () => {
    if (activeCard) {
      await toggleContactless({ cardId: activeCard.id, enabled: !activeCard.is_contactless });
      refetch();
    }
  };

  const handleToggleOnline = async () => {
    if (activeCard) {
      await toggleOnlinePayments({ cardId: activeCard.id, enabled: !activeCard.is_online_payments });
      refetch();
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <BankCard
        cardNumber={item.card_number_masked}
        cardHolder={item.card_holder_name}
        expiryDate={item.expiry_date}
        cardType={item.card_type}
        paymentSystem={item.payment_system}
        status={item.status}
        onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
      />
    </View>
  );

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Карты</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>Нет карт</Text>
          <Button title="Выпустить карту" onPress={() => navigation.navigate('CreateCard')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Карты</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateCard')}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={CARD_WIDTH + spacing.md}
          decelerationRate="fast"
        />

        <View style={styles.indicators}>
          {cards.map((_, index) => (
            <View key={index} style={[styles.indicator, index === activeCardIndex && styles.indicatorActive]} />
          ))}
        </View>

        {activeCard && (
          <View style={styles.detailsContainer}>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Тип карты</Text>
                <Text style={styles.infoValue}>{CARD_TYPE_LABELS[activeCard.card_type]}</Text>
              </View>
            </Card>

            <Card style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>Настройки</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Бесконтактные платежи</Text>
                <Switch
                  value={activeCard.is_contactless}
                  onValueChange={handleToggleContactless}
                  trackColor={{ false: colors.gray200, true: colors.primaryLight }}
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Онлайн платежи</Text>
                <Switch
                  value={activeCard.is_online_payments}
                  onValueChange={handleToggleOnline}
                  trackColor={{ false: colors.gray200, true: colors.primaryLight }}
                />
              </View>
            </Card>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="lock-closed-outline" size={24} color={colors.error} />
                <Text style={styles.actionLabel}>Блокировать</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
                <Text style={styles.actionLabel}>Лимиты</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
                <Text style={styles.actionLabel}>Потеряна</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  addButton: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  carouselContent: { paddingHorizontal: spacing.lg },
  cardContainer: { width: CARD_WIDTH, marginRight: spacing.md },
  indicators: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: spacing.xs },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray300 },
  indicatorActive: { backgroundColor: colors.primary, width: 24 },
  detailsContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  infoCard: { marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { ...typography.body2, color: colors.textSecondary },
  infoValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  settingsCard: { marginBottom: spacing.md },
  settingsTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  settingLabel: { ...typography.body2, color: colors.textPrimary },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md },
  actionButton: { alignItems: 'center', padding: spacing.md },
  actionLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 2 },
  emptyTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.lg },
});

export default CardsListScreen;
