// API Configuration
export const API_BASE_URL = "http://192.168.43.82:5000/api/v1";
export const SOCKET_URL = "ws://192.168.43.82:5000";

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  BIOMETRIC_ENABLED: "biometricEnabled",
  PIN_ENABLED: "pinEnabled",
  PIN_CODE: "pinCode",
  DEVICE_ID: "deviceId",
  ONBOARDING_COMPLETED: "onboardingCompleted",
  REMEMBER_ME: "rememberMe",
  SAVED_PHONE: "savedPhone",
  THEME: "theme",
  LANGUAGE: "language",
};

// Account Types
export const ACCOUNT_TYPES = {
  CHECKING: "checking",
  SAVINGS: "savings",
  DEPOSIT: "deposit",
  CREDIT: "credit",
};

export const ACCOUNT_TYPE_LABELS = {
  checking: "Текущий счёт",
  savings: "Сберегательный",
  deposit: "Депозит",
  credit: "Кредитный",
};

// Card Types
export const CARD_TYPES = {
  DEBIT: "debit",
  CREDIT: "credit",
  VIRTUAL: "virtual",
};

export const CARD_TYPE_LABELS = {
  debit: "Дебетовая",
  credit: "Кредитная",
  virtual: "Виртуальная",
};

// Payment Systems
export const PAYMENT_SYSTEMS = {
  VISA: "visa",
  MASTERCARD: "mastercard",
  MIR: "mir",
  UNIONPAY: "unionpay",
};

// Transaction Types
export const TRANSACTION_TYPES = {
  TRANSFER: "transfer",
  PAYMENT: "payment",
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
};

export const TRANSACTION_TYPE_LABELS = {
  transfer: "Перевод",
  payment: "Оплата",
  deposit: "Пополнение",
  withdrawal: "Снятие",
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const TRANSACTION_STATUS_LABELS = {
  pending: "В обработке",
  completed: "Выполнено",
  failed: "Ошибка",
  cancelled: "Отменено",
};

// Currencies
export const CURRENCIES = {
  KZT: "KZT",
  USD: "USD",
  EUR: "EUR",
  RUB: "RUB",
};

export const CURRENCY_SYMBOLS = {
  KZT: "₸",
  USD: "$",
  EUR: "€",
  RUB: "₽",
};

// Loan Types
export const LOAN_TYPES = {
  CONSUMER: "consumer",
  MORTGAGE: "mortgage",
  CAR: "car",
  BUSINESS: "business",
};

export const LOAN_TYPE_LABELS = {
  consumer: "Потребительский",
  mortgage: "Ипотека",
  car: "Автокредит",
  business: "Бизнес-кредит",
};

// Deposit Types
export const DEPOSIT_TYPES = {
  FIXED: "fixed",
  FLEXIBLE: "flexible",
  SAVINGS: "savings",
};

export const DEPOSIT_TYPE_LABELS = {
  fixed: "Срочный",
  flexible: "Гибкий",
  savings: "Накопительный",
};

// Provider Categories
export const PROVIDER_CATEGORIES = {
  UTILITIES: "utilities",
  MOBILE: "mobile",
  INTERNET: "internet",
  TV: "tv",
  INSURANCE: "insurance",
  EDUCATION: "education",
  TRANSPORT: "transport",
  OTHER: "other",
};

export const PROVIDER_CATEGORY_LABELS = {
  utilities: "Коммунальные услуги",
  mobile: "Мобильная связь",
  internet: "Интернет",
  tv: "Телевидение",
  insurance: "Страхование",
  education: "Образование",
  transport: "Транспорт",
  other: "Прочее",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  TRANSACTION: "transaction",
  SECURITY: "security",
  MARKETING: "marketing",
  SYSTEM: "system",
};

export const NOTIFICATION_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

// Status
export const STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
  CLOSED: "closed",
  PENDING: "pending",
  EXPIRED: "expired",
  LOST: "lost",
};

export const STATUS_LABELS = {
  active: "Активен",
  blocked: "Заблокирован",
  closed: "Закрыт",
  pending: "На рассмотрении",
  expired: "Истёк",
  lost: "Утерян",
};

// Validation patterns
export const VALIDATION = {
  PHONE_REGEX: /^\+7[0-9]{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  IIN_REGEX: /^[0-9]{12}$/,
  PASSWORD_MIN_LENGTH: 8,
  PIN_LENGTH: 6,
  OTP_LENGTH: 6,
};

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
};

// Quick amounts for transfers
export const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, 100000];

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "dd.MM.yyyy",
  DISPLAY_TIME: "dd.MM.yyyy HH:mm",
  API: "yyyy-MM-dd",
  TIME: "HH:mm",
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  STORAGE_KEYS,
  ACCOUNT_TYPES,
  CARD_TYPES,
  TRANSACTION_TYPES,
  CURRENCIES,
  LOAN_TYPES,
  DEPOSIT_TYPES,
  PROVIDER_CATEGORIES,
  NOTIFICATION_TYPES,
  STATUS,
  VALIDATION,
};
