/**
 * Date utility functions
 */

export const formatDate = (date: Date | string, locale: string = 'en-IN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string, locale: string = 'en-IN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getMonthName = (month: number, locale: string = 'en-IN'): string => {
  const date = new Date(2000, month, 1);
  return date.toLocaleString(locale, { month: 'long' });
};

export const getAcademicYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Academic year starts in April (month 3)
  if (month < 3) {
    return `${year - 1}-${year}`;
  }
  return `${year}-${year + 1}`;
};
