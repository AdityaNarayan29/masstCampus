/**
 * Validation utility functions
 */

export const isEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const isPinCode = (pinCode: string): boolean => {
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pinCode);
};

export const isAadhaar = (aadhaar: string): boolean => {
  const cleaned = aadhaar.replace(/\s/g, '');
  return /^[2-9][0-9]{11}$/.test(cleaned);
};

export const isPAN = (pan: string): boolean => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.toUpperCase());
};
