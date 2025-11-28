import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, FormInput } from '../../components';
import { useSubmitSupportTicketMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const SupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [submitTicket, { isLoading }] = useSubmitSupportTicketMutation();

  const contactOptions = [
    {
      id: 'chat',
      label: 'Чат с поддержкой',
      description: 'Ответим в течение 5 минут',
      icon: 'chatbubbles-outline',
      iconColor: colors.primary,
      onPress: () => navigation.navigate('Chat'),
    },
    {
      id: 'phone',
      label: 'Позвонить',
      description: '+7 (727) 123-45-67',
      icon: 'call-outline',
      iconColor: colors.success,
      onPress: () => Linking.openURL('tel:+77271234567'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: '+7 (777) 123-45-67',
      icon: 'logo-whatsapp',
      iconColor: '#25D366',
      onPress: () => Linking.openURL('whatsapp://send?phone=77771234567'),
    },
    {
      id: 'email',
      label: 'Email',
      description: 'support@bankingsuperapp.kz',
      icon: 'mail-outline',
      iconColor: colors.info,
      onPress: () => Linking.openURL('mailto:support@bankingsuperapp.kz'),
    },
  ];

  const categories = [
    { id: 'account', label: 'Счета', icon: 'wallet-outline' },
    { id: 'card', label: 'Карты', icon: 'card-outline' },
    { id: 'transfer', label: 'Переводы', icon: 'swap-horizontal-outline' },
    { id: 'loan', label: 'Кредиты', icon: 'cash-outline' },
    { id: 'deposit', label: 'Депозиты', icon: 'trending-up-outline' },
    { id: 'other', label: 'Другое', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Ошибка', 'Выберите категорию обращения');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Ошибка', 'Введите тему обращения');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Ошибка', 'Введите текст сообщения');
      return;
    }

    try {
      await submitTicket({
        category: selectedCategory,
        subject,
        message,
      }).unwrap();

      Alert.alert(
        'Обращение отправлено',
        'Мы ответим вам в течение 24 часов. Ответ придёт в уведомления.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить обращение');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Поддержка</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Связаться с нами</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactItem}
                onPress={option.onPress}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${option.iconColor}15` }]}>
                  <Ionicons name={option.icon} size={24} color={option.iconColor} />
                </View>
                <Text style={styles.contactLabel}>{option.label}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Link */}
        <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
          <Card style={styles.faqCard}>
            <View style={styles.faqIcon}>
              <Ionicons name="help-circle-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.faqInfo}>
              <Text style={styles.faqTitle}>Часто задаваемые вопросы</Text>
              <Text style={styles.faqText}>Возможно, ответ уже есть в FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray400} />
          </Card>
        </TouchableOpacity>

        {/* Create Ticket */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Написать обращение</Text>

          {/* Categories */}
          <Text style={styles.fieldLabel}>Категория</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.formCard}>
            <FormInput
              label="Тема обращения"
              placeholder="Кратко опишите проблему"
              value={subject}
              onChangeText={setSubject}
            />
            <FormInput
              label="Сообщение"
              placeholder="Подробно опишите вашу проблему или вопрос"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              style={styles.messageInput}
            />
          </Card>

          <Button
            title="Отправить обращение"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            icon={<Ionicons name="send-outline" size={18} color={colors.white} />}
          />
        </View>

        {/* Working Hours */}
        <Card style={styles.hoursCard}>
          <View style={styles.hoursIcon}>
            <Ionicons name="time-outline" size={24} color={colors.info} />
          </View>
          <View style={styles.hoursInfo}>
            <Text style={styles.hoursTitle}>Время работы поддержки</Text>
            <Text style={styles.hoursText}>Чат: круглосуточно, 7 дней в неделю</Text>
            <Text style={styles.hoursText}>Телефон: Пн-Пт 9:00-18:00</Text>
          </View>
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contactItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  contactLabel: { ...typography.body2, fontWeight: '600', color: colors.textPrimary },
  contactDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  faqInfo: { flex: 1 },
  faqTitle: { ...typography.body1, fontWeight: '600', color: colors.textPrimary },
  faqText: { ...typography.caption, color: colors.textSecondary },
  fieldLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
  },
  categoryItemSelected: { borderColor: colors.primary },
  categoryLabel: { ...typography.body2, color: colors.textSecondary },
  categoryLabelSelected: { color: colors.primary, fontWeight: '500' },
  formCard: { marginBottom: spacing.md },
  messageInput: { height: 120, textAlignVertical: 'top' },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.info}10`,
    marginTop: spacing.lg,
  },
  hoursIcon: { marginRight: spacing.md },
  hoursInfo: { flex: 1 },
  hoursTitle: { ...typography.body2, fontWeight: '600', color: colors.textPrimary },
  hoursText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

export default SupportScreen;
