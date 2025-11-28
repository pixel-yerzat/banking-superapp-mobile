import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Avatar, Button, FormInput } from '../../components';
import { selectUser } from '../../store/slices/authSlice';
import { useUpdateProfileMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const profileSchema = yup.object().shape({
  firstName: yup.string().required('Введите имя').min(2, 'Минимум 2 символа'),
  lastName: yup.string().required('Введите фамилию').min(2, 'Минимум 2 символа'),
  middleName: yup.string(),
  email: yup.string().required('Введите email').email('Неверный формат email'),
});

const ProfileScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      middleName: user?.middle_name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.middleName,
        email: data.email,
      }).unwrap();
      Alert.alert('Успешно', 'Профиль обновлён');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось обновить профиль');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const profileFields = [
    { label: 'Телефон', value: user?.phone || '+7 XXX XXX XX XX', icon: 'call-outline', editable: false },
    { label: 'ИИН', value: user?.iin || '••••••••••••', icon: 'card-outline', editable: false },
    { label: 'Дата регистрации', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—', icon: 'calendar-outline', editable: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Профиль</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              name={user ? `${user.first_name} ${user.last_name}` : 'User'}
              size={100}
            />
            {isEditing && (
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>
            {user ? `${user.first_name} ${user.last_name}` : 'Пользователь'}
          </Text>
          <Text style={styles.userPhone}>{user?.phone || '+7 XXX XXX XX XX'}</Text>
        </View>

        {/* Editable Fields */}
        {isEditing ? (
          <Card style={styles.editCard}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Фамилия"
                  value={value}
                  onChangeText={onChange}
                  error={errors.lastName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Имя"
                  value={value}
                  onChangeText={onChange}
                  error={errors.firstName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="middleName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Отчество"
                  value={value}
                  onChangeText={onChange}
                  error={errors.middleName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />
            <Button
              title="Сохранить"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              style={styles.saveButton}
            />
          </Card>
        ) : (
          <>
            {/* Personal Info Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Личные данные</Text>
              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Фамилия</Text>
                  <Text style={styles.infoValue}>{user?.last_name || '—'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Имя</Text>
                  <Text style={styles.infoValue}>{user?.first_name || '—'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Отчество</Text>
                  <Text style={styles.infoValue}>{user?.middle_name || '—'}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || '—'}</Text>
                </View>
              </Card>
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Дополнительная информация</Text>
              <Card style={styles.infoCard}>
                {profileFields.map((field, index) => (
                  <View
                    key={field.label}
                    style={[styles.infoRow, index === profileFields.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.infoLeft}>
                      <Ionicons name={field.icon} size={20} color={colors.textSecondary} />
                      <Text style={styles.infoLabel}>{field.label}</Text>
                    </View>
                    <Text style={styles.infoValue}>{field.value}</Text>
                  </View>
                ))}
              </Card>
            </View>

            {/* Documents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Документы</Text>
              <Card style={styles.documentsCard}>
                <TouchableOpacity style={styles.documentItem}>
                  <View style={styles.documentIcon}>
                    <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>Удостоверение личности</Text>
                    <Text style={styles.documentStatus}>Верифицировано</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </TouchableOpacity>
              </Card>
            </View>
          </>
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  cancelText: { ...typography.body2, color: colors.error },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg },
  avatarContainer: { position: 'relative' },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md },
  userPhone: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  editCard: { marginHorizontal: spacing.lg },
  saveButton: { marginTop: spacing.md },
  infoCard: { marginHorizontal: spacing.lg },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel: { ...typography.body2, color: colors.textSecondary },
  infoValue: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  documentsCard: { marginHorizontal: spacing.lg },
  documentItem: { flexDirection: 'row', alignItems: 'center' },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  documentInfo: { flex: 1 },
  documentTitle: { ...typography.body2, fontWeight: '500', color: colors.textPrimary },
  documentStatus: { ...typography.caption, color: colors.success },
});

export default ProfileScreen;
