import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Button, FormInput, Logo, OTPInput } from '../../components';
import { useForgotPasswordMutation, useResetPasswordMutation, useSendOtpMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { isValidPhone } from '../../utils/validators';

const phoneSchema = yup.object({
  phone: yup
    .string()
    .required('Введите номер телефона')
    .test('valid-phone', 'Неверный формат телефона', isValidPhone),
});

const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .required('Введите новый пароль')
    .min(8, 'Минимум 8 символов'),
  confirmPassword: yup
    .string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('newPassword')], 'Пароли не совпадают'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const phoneForm = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleSendOtp = async (data) => {
    try {
      await forgotPassword({ phone: data.phone }).unwrap();
      setPhone(data.phone);
      setStep(2);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось отправить код');
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert('Ошибка', 'Введите 6-значный код');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (data) => {
    try {
      await resetPassword({
        phone,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();

      Alert.alert('Успешно', 'Пароль успешно изменён', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось сбросить пароль');
    }
  };

  const handleResendOtp = async () => {
    try {
      await forgotPassword({ phone }).unwrap();
      Alert.alert('Успешно', 'Код отправлен повторно');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить код');
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.title}>Восстановление пароля</Text>
      <Text style={styles.subtitle}>
        Введите номер телефона, привязанный к вашему аккаунту
      </Text>

      <Controller
        control={phoneForm.control}
        name="phone"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormInput
            label="Номер телефона"
            placeholder="+7 (XXX) XXX-XX-XX"
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
            error={error?.message}
            leftIcon={<Ionicons name="call-outline" size={20} color={colors.gray400} />}
          />
        )}
      />

      <Button
        title="Получить код"
        onPress={phoneForm.handleSubmit(handleSendOtp)}
        loading={isSending}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.title}>Введите код</Text>
      <Text style={styles.subtitle}>
        Мы отправили SMS с кодом на номер {phone}
      </Text>

      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
      />

      <Button
        title="Подтвердить"
        onPress={handleVerifyOtp}
        fullWidth
        style={styles.button}
        disabled={otp.length !== 6}
      />

      <TouchableOpacity style={styles.resendContainer} onPress={handleResendOtp}>
        <Text style={styles.resendText}>Отправить код повторно</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.title}>Новый пароль</Text>
      <Text style={styles.subtitle}>
        Придумайте надёжный пароль для вашего аккаунта
      </Text>

      <Controller
        control={passwordForm.control}
        name="newPassword"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormInput
            label="Новый пароль"
            placeholder="Минимум 8 символов"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={error?.message}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} />}
          />
        )}
      />

      <Controller
        control={passwordForm.control}
        name="confirmPassword"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormInput
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={error?.message}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} />}
          />
        )}
      />

      <Button
        title="Сохранить пароль"
        onPress={passwordForm.handleSubmit(handleResetPassword)}
        loading={isResetting}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.progressStep, s <= step && styles.progressStepActive]}
            />
          ))}
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={60} />
        </View>

        {/* Content */}
        <Card style={styles.card}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </Card>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Вернуться ко входу</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  progressContainer: {
    flexDirection: 'row',
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: { marginTop: spacing.md },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    ...typography.body2,
    color: colors.primary,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  loginText: {
    ...typography.body2,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
