import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, OTPInput } from "../../components";
import {
  useVerifyOtpMutation,
  useVerify2FAMutation,
  useSendOtpMutation,
} from "../../api";
import { authService } from "../../services";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { colors, spacing, typography } from "../../theme/colors";

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phone, type, userId } = route.params;
  const dispatch = useDispatch();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAMutation();
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (code) => {
    try {
      let result;

      if (type === "2fa") {
        result = await verify2FA({ userId, code }).unwrap();
      } else {
        result = await verifyOtp({ phone, code }).unwrap();
      }

      if (result.success) {
        if (result.data?.accessToken) {
          await authService.saveTokens(
            result.data.accessToken,
            result.data.refreshToken
          );
          await authService.saveUserData(result.data.user);
          dispatch(setUser(result.data.user));
        } else {
          // Registration verification successful
          Alert.alert(
            "Успешно",
            "Регистрация завершена. Теперь вы можете войти.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        }
      }
    } catch (error) {
      Alert.alert("Ошибка", error.data?.message || "Неверный код");
      setOtp("");
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp({ phone, type: "sms" }).unwrap();
      setTimer(60);
      setCanResend(false);
      Alert.alert("Успешно", "Код отправлен повторно");
    } catch (error) {
      Alert.alert("Ошибка", error.data?.message || "Не удалось отправить код");
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(
      /(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/,
      "$1 $2 *** ** $5"
    );
  };

  const isLoading = isVerifyingOtp || isVerifying2FA;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={40}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Введите код</Text>
        <Text style={styles.subtitle}>
          Код отправлен на номер{"\n"}
          <Text style={styles.phone}>{formatPhone(phone)}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={() => {}}
            autoFocus
          />
        </View>

        {/* Timer / Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isSending}>
              <Text style={styles.resendText}>
                {isSending ? "Отправка..." : "Отправить код повторно"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Отправить повторно через {formatTimer(timer)}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <Button
          title="Подтвердить"
          onPress={() => handleVerify(otp)}
          loading={isLoading}
          disabled={otp.length < 6}
          fullWidth
          style={styles.verifyButton}
        />

        {/* Change Number */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.changeNumberButton}
        >
          <Text style={styles.changeNumberText}>Изменить номер телефона</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    alignSelf: "flex-start",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  phone: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  otpContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timerText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  resendText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: "600",
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
  changeNumberButton: {
    alignItems: "center",
    padding: spacing.sm,
  },
  changeNumberText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

export default OTPVerificationScreen;
