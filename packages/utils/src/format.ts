/**
 * Formatting utility functions
 */

export const formatCurrency = (amount: number, currency: string = 'INR', locale: string = 'en-IN'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num: number, locale: string = 'en-IN'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatPhone = (phone: string, countryCode: string = '+91'): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const truncate = (str: string, length: number = 50, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str: string): string => {
  return str.split(' ').map(capitalize).join(' ');
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
