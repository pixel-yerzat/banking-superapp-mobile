import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormInput } from '../../components';
import { useRegisterMutation } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const step1Schema = yup.object().shape({
  lastName: yup.string().required('Введите фамилию'),
  firstName: yup.string().required('Введите имя'),
  middleName: yup.string(),
});

const step2Schema = yup.object().shape({
  phone: yup
    .string()
    .required('Введите номер телефона')
    .matches(/^\+7[0-9]{10}$/, 'Неверный формат номера'),
  email: yup.string().email('Неверный email'),
});

const step3Schema = yup.object().shape({
  password: yup
    .string()
    .required('Введите пароль')
    .min(8, 'Минимум 8 символов')
    .matches(/[A-Z]/, 'Должна быть заглавная буква')
    .matches(/[0-9]/, 'Должна быть цифра'),
  confirmPassword: yup
    .string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
  agreeTerms: yup.boolean().oneOf([true], 'Необходимо согласие'),
  agreePrivacy: yup.boolean().oneOf([true], 'Необходимо согласие'),
});

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [register, { isLoading }] = useRegisterMutation();

  const getCurrentSchema = () => {
    switch (step) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      default:
        return step1Schema;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(getCurrentSchema()),
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '+7',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      agreePrivacy: false,
    },
  });

  const onNextStep = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const onPrevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    const allData = { ...formData, ...data };
    
    try {
      const result = await register({
        phone: allData.phone,
        email: allData.email || undefined,
        password: allData.password,
        confirm_password: allData.confirmPassword,
        first_name: allData.firstName,
        last_name: allData.lastName,
        middle_name: allData.middleName || undefined,
      }).unwrap();

      if (result.success) {
        navigation.navigate('OTPVerification', {
          phone: allData.phone,
          type: 'registration',
        });
      }
    } catch (error) {
      Alert.alert('Ошибка', error.data?.message || 'Ошибка регистрации');
    }
  };

  const formatPhone = (text) => {
    let formatted = text.replace(/[^\d+]/g, '');
    if (!formatted.startsWith('+7')) {
      formatted = '+7' + formatted.replace(/^\+?7?/, '');
    }
    if (formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    }
    return formatted;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Основные данные</Text>
      <Text style={styles.stepSubtitle}>Введите ваше имя</Text>

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Фамилия"
            value={value}
            onChangeText={onChange}
            placeholder="Введите фамилию"
            error={errors.lastName?.message}
            required
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
            placeholder="Введите имя"
            error={errors.firstName?.message}
            required
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
            placeholder="Введите отчество (необязательно)"
          />
        )}
      />

      <Button
        title="Далее"
        onPress={handleSubmit(onNextStep)}
        fullWidth
        style={styles.nextButton}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Контактные данные</Text>
      <Text style={styles.stepSubtitle}>Как с вами связаться</Text>

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Номер телефона"
            value={value}
            onChangeText={(text) => onChange(formatPhone(text))}
            placeholder="+7 (XXX) XXX-XX-XX"
            keyboardType="phone-pad"
            error={errors.phone?.message}
            required
            leftIcon={<Ionicons name="call-outline" size={20} color={colors.gray400} />}
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
            placeholder="example@mail.com"
            keyboardType="email-address"
            error={errors.email?.message}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.gray400} />}
          />
        )}
      />

      <View style={styles.buttonRow}>
        <Button
          title="Назад"
          variant="outline"
          onPress={onPrevStep}
          style={styles.backButton}
        />
        <Button
          title="Далее"
          onPress={handleSubmit(onNextStep)}
          style={styles.nextButtonHalf}
        />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Безопасность</Text>
      <Text style={styles.stepSubtitle}>Создайте надёжный пароль</Text>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <>
            <FormInput
              label="Пароль"
              value={value}
              onChangeText={onChange}
              placeholder="Минимум 8 символов"
              secureTextEntry
              error={errors.password?.message}
              required
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} />}
            />
            {value.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        i <= getPasswordStrength(value) && styles.strengthBarActive,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.strengthText}>
                  {getPasswordStrength(value) < 3 ? 'Слабый' : getPasswordStrength(value) < 5 ? 'Средний' : 'Надёжный'}
                </Text>
              </View>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Подтвердите пароль"
            value={value}
            onChangeText={onChange}
            placeholder="Повторите пароль"
            secureTextEntry
            error={errors.confirmPassword?.message}
            required
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} />}
          />
        )}
      />

      <Controller
        control={control}
        name="agreeTerms"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <Text style={styles.checkboxText}>
              Я согласен с{' '}
              <Text style={styles.link}>условиями использования</Text>
            </Text>
          </TouchableOpacity>
        )}
      />
      {errors.agreeTerms && (
        <Text style={styles.checkboxError}>{errors.agreeTerms.message}</Text>
      )}

      <Controller
        control={control}
        name="agreePrivacy"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <Text style={styles.checkboxText}>
              Я согласен на{' '}
              <Text style={styles.link}>обработку персональных данных</Text>
            </Text>
          </TouchableOpacity>
        )}
      />
      {errors.agreePrivacy && (
        <Text style={styles.checkboxError}>{errors.agreePrivacy.message}</Text>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="Назад"
          variant="outline"
          onPress={onPrevStep}
          style={styles.backButton}
        />
        <Button
          title="Зарегистрироваться"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.nextButtonHalf}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backIcon}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Регистрация</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressStep,
                  i <= step && styles.progressStepActive,
                ]}
              />
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backIcon: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  form: {
    flex: 1,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  nextButton: {
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButtonHalf: {
    flex: 2,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: colors.success,
  },
  strengthText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.gray300,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  checkboxError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
    marginLeft: 28,
  },
  link: {
    color: colors.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
