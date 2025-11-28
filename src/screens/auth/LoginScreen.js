import React, { useState, useEffect } from 'react';
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
import { Logo, Button, FormInput } from '../../components';
import { useAuth, useBiometric } from '../../hooks';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const schema = yup.object().shape({
  phone: yup
    .string()
    .required('Введите номер телефона')
    .matches(/^\+7[0-9]{10}$/, 'Неверный формат номера'),
  password: yup
    .string()
    .required('Введите пароль')
    .min(8, 'Минимум 8 символов'),
});

const LoginScreen = ({ navigation }) => {
  const { login, loginWithBiometric, getSavedPhone, isLoading } = useAuth();
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, biometricType } = useBiometric();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: '+7',
      password: '',
    },
  });

  useEffect(() => {
    loadSavedPhone();
  }, []);

  const loadSavedPhone = async () => {
    const savedPhone = await getSavedPhone();
    if (savedPhone) {
      setValue('phone', savedPhone);
      setRememberMe(true);
    }
  };

  const onSubmit = async (data) => {
    const result = await login(data.phone, data.password, rememberMe);
    
    if (result.success) {
      // Navigation handled by RootNavigator
    } else if (result.requires2FA) {
      navigation.navigate('OTPVerification', {
        userId: result.userId,
        type: '2fa',
        phone: data.phone,
      });
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось войти');
    }
  };

  const handleBiometricLogin = async () => {
    const result = await loginWithBiometric();
    
    if (!result.success) {
      Alert.alert('Ошибка', result.error || 'Не удалось войти');
    }
  };

  const formatPhone = (text) => {
    // Keep only digits and + at start
    let formatted = text.replace(/[^\d+]/g, '');
    
    // Ensure starts with +7
    if (!formatted.startsWith('+7')) {
      formatted = '+7' + formatted.replace(/^\+?7?/, '');
    }
    
    // Limit length
    if (formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    }
    
    return formatted;
  };

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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Вход в приложение</Text>
          <Text style={styles.subtitle}>
            Введите ваши данные для входа
          </Text>

          {/* Form */}
          <View style={styles.form}>
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
                  leftIcon={<Ionicons name="call-outline" size={20} color={colors.gray400} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Пароль"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Введите пароль"
                  secureTextEntry
                  error={errors.password?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} />}
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Запомнить меня</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPassword}>Забыли пароль?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="Войти"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Biometric Login */}
            {biometricAvailable && biometricEnabled && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>или</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title={`Войти с ${biometricType}`}
                  variant="outline"
                  onPress={handleBiometricLogin}
                  fullWidth
                  icon={
                    <Ionicons
                      name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                      size={20}
                      color={colors.primary}
                    />
                  }
                />
              </>
            )}
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Нет аккаунта? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Зарегистрироваться</Text>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  forgotPassword: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    ...typography.body2,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  registerText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
