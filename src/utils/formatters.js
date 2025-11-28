import { CURRENCY_SYMBOLS, DATE_FORMATS } from '../constants';

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (KZT, USD, EUR, RUB)
 * @param {boolean} showSign - Show + or - sign
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount, currency = 'KZT', showSign = false) => {
  if (amount === null || amount === undefined) return '—';
  
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const sign = showSign ? (amount >= 0 ? '+' : '-') : (amount < 0 ? '-' : '');
  
  return `${sign}${formatted} ${symbol}`;
};

/**
 * Format currency amount without symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('ru-RU').format(amount);
};

/**
 * Format phone number to display format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as +7 XXX XXX XX XX
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  
  return phone;
};

/**
 * Mask phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Masked phone number
 */
export const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 11) {
    return `+7 ${digits.slice(1, 4)} *** ** ${digits.slice(9)}`;
  }
  return phone;
};

/**
 * Format card number with spaces
 * @param {string} cardNumber - Card number
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cardNumber;
};

/**
 * Mask card number for display
 * @param {string} cardNumber - Card number
 * @returns {string} Masked card number
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length >= 16) {
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  }
  return cardNumber;
};

/**
 * Format account number
 * @param {string} accountNumber - Account number
 * @returns {string} Formatted account number
 */
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  return accountNumber.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Mask account number for display
 * @param {string} accountNumber - Account number
 * @returns {string} Masked account number
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  return `•••• ${accountNumber.slice(-4)}`;
};

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time', 'datetime'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  
  switch (format) {
    case 'relative':
      if (isToday) return `Сегодня, ${timeStr}`;
      if (isYesterday) return `Вчера, ${timeStr}`;
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    
    case 'short':
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    case 'long':
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    
    case 'time':
      return timeStr;
    
    case 'datetime':
      return `${d.toLocaleDateString('ru-RU')} ${timeStr}`;
    
    case 'month':
      return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    
    default:
      return d.toLocaleDateString('ru-RU');
  }
};

/**
 * Format relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default {
  formatAmount,
  formatNumber,
  formatPhone,
  maskPhone,
  formatCardNumber,
  maskCardNumber,
  formatAccountNumber,
  maskAccountNumber,
  formatDate,
  formatRelativeTime,
  formatPercentage,
  truncateText,
  getInitials,
};
