import * as yup from 'yup';
import { PHONE_REGEX, EMAIL_REGEX, IIN_REGEX, PASSWORD_MIN_LENGTH, PIN_LENGTH, OTP_LENGTH } from '../constants';

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return PHONE_REGEX.test(phone);
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
};

/**
 * Validate IIN (Individual Identification Number - Kazakhstan)
 * @param {string} iin - IIN to validate
 * @returns {boolean} Is valid IIN
 */
export const isValidIIN = (iin) => {
  if (!iin) return false;
  return IIN_REGEX.test(iin);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ isValid: boolean, strength: number, errors: string[] }}
 */
export const validatePassword = (password) => {
  const errors = [];
  let strength = 0;
  
  if (!password) {
    return { isValid: false, strength: 0, errors: ['Пароль обязателен'] };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Минимум ${PASSWORD_MIN_LENGTH} символов`);
  } else {
    strength += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Добавьте строчную букву');
  } else {
    strength += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Добавьте заглавную букву');
  } else {
    strength += 1;
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Добавьте цифру');
  } else {
    strength += 1;
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength += 1;
  }
  
  return {
    isValid: errors.length === 0,
    strength: Math.min(5, strength),
    errors,
  };
};

/**
 * Get password strength label
 * @param {number} strength - Strength value (0-5)
 * @returns {string} Strength label
 */
export const getPasswordStrengthLabel = (strength) => {
  const labels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный', 'Отличный'];
  return labels[Math.min(5, Math.max(0, strength))];
};

/**
 * Get password strength color
 * @param {number} strength - Strength value (0-5)
 * @returns {string} Color hex
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981', '#10B981'];
  return colors[Math.min(5, Math.max(0, strength))];
};

/**
 * Validate PIN code
 * @param {string} pin - PIN to validate
 * @returns {boolean} Is valid PIN
 */
export const isValidPIN = (pin) => {
  if (!pin) return false;
  return /^\d{6}$/.test(pin);
};

/**
 * Validate OTP code
 * @param {string} otp - OTP to validate
 * @returns {boolean} Is valid OTP
 */
export const isValidOTP = (otp) => {
  if (!otp) return false;
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp);
};

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Is valid card number
 */
export const isValidCardNumber = (cardNumber) => {
  if (!cardNumber) return false;
  
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate expiry date
 * @param {string} expiry - Expiry date in MM/YY format
 * @returns {boolean} Is valid and not expired
 */
export const isValidExpiry = (expiry) => {
  if (!expiry) return false;
  
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const expiryDate = new Date(year, month, 0);
  
  return expiryDate > now;
};

/**
 * Validate CVV
 * @param {string} cvv - CVV to validate
 * @returns {boolean} Is valid CVV
 */
export const isValidCVV = (cvv) => {
  if (!cvv) return false;
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validate amount
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateAmount = (amount, min = 1, max = Infinity) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return { isValid: false, error: 'Введите сумму' };
  }
  
  if (amount < min) {
    return { isValid: false, error: `Минимальная сумма: ${min}` };
  }
  
  if (amount > max) {
    return { isValid: false, error: `Максимальная сумма: ${max}` };
  }
  
  return { isValid: true };
};

// Yup schemas for form validation
export const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Введите номер телефона')
    .matches(PHONE_REGEX, 'Неверный формат номера'),
  password: yup
    .string()
    .required('Введите пароль')
    .min(PASSWORD_MIN_LENGTH, `Минимум ${PASSWORD_MIN_LENGTH} символов`),
});

export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Введите имя')
    .min(2, 'Минимум 2 символа'),
  lastName: yup
    .string()
    .required('Введите фамилию')
    .min(2, 'Минимум 2 символа'),
  middleName: yup
    .string(),
  phone: yup
    .string()
    .required('Введите номер телефона')
    .matches(PHONE_REGEX, 'Неверный формат номера'),
  email: yup
    .string()
    .required('Введите email')
    .email('Неверный формат email'),
  password: yup
    .string()
    .required('Введите пароль')
    .min(PASSWORD_MIN_LENGTH, `Минимум ${PASSWORD_MIN_LENGTH} символов`)
    .matches(/[A-Z]/, 'Добавьте заглавную букву')
    .matches(/[0-9]/, 'Добавьте цифру'),
  confirmPassword: yup
    .string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
});

export const transferSchema = yup.object().shape({
  recipientPhone: yup
    .string()
    .required('Введите номер получателя')
    .matches(PHONE_REGEX, 'Неверный формат номера'),
  amount: yup
    .number()
    .required('Введите сумму')
    .min(1, 'Минимальная сумма: 1')
    .max(10000000, 'Максимальная сумма: 10 000 000'),
  message: yup
    .string()
    .max(140, 'Максимум 140 символов'),
});

export default {
  isValidPhone,
  isValidEmail,
  isValidIIN,
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  isValidPIN,
  isValidOTP,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  validateAmount,
  loginSchema,
  registerSchema,
  transferSchema,
};
