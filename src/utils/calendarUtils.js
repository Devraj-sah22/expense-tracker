/**
 * Nepali to English date conversion utilities
 * Simplified version - In production, use a proper library like 'nepali-date-converter'
 */

// Nepali months with their names and typical days
const nepaliMonths = [
  { name: 'Baisakh', days: 31 },
  { name: 'Jestha', days: 31 },
  { name: 'Ashadh', days: 32 },
  { name: 'Shrawan', days: 32 },
  { name: 'Bhadra', days: 31 },
  { name: 'Ashwin', days: 31 },
  { name: 'Kartik', days: 30 },
  { name: 'Mangsir', days: 29 },
  { name: 'Poush', days: 30 },
  { name: 'Magh', days: 29 },
  { name: 'Falgun', days: 30 },
  { name: 'Chaitra', days: 30 }
];

// Export getNepaliMonth function
export const getNepaliMonth = (monthIndex) => {
  const months = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  return months[monthIndex] || '';
};

// Export getNepaliYear function
export const getNepaliYear = (englishDate) => {
  const date = new Date(englishDate);
  const year = date.getFullYear();
  // Simplified conversion (add 57 years for BS)
  return year + 57;
};

// Simplified conversion (for demo purposes)
export const convertToNepali = (englishDate) => {
  const date = new Date(englishDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Simplified conversion (example: add 57 years for BS)
  // This is NOT accurate - use proper library in production
  const nepaliYear = year + 57;
  const nepaliMonth = month + 1; // 1-based month
  const nepaliDay = day;

  return {
    year: nepaliYear,
    month: nepaliMonth,
    day: nepaliDay,
    monthName: getNepaliMonth(month)
  };
};

export const convertToEnglish = (nepaliYear, nepaliMonth, nepaliDay) => {
  // Simplified conversion
  const englishYear = nepaliYear - 57;
  return new Date(englishYear, nepaliMonth - 1, nepaliDay);
};

export const getNepaliMonthName = (monthIndex) => {
  const months = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  return months[monthIndex] || '';
};

export const getNepaliMonthDays = (year, month) => {
  // This varies by year - simplified version
  return nepaliMonths[month]?.days || 30;
};

export const isLeapYear = (year) => {
  // Gregorian leap year
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Default export for any unnamed imports
export default {
  getNepaliMonth,
  getNepaliYear,
  convertToNepali,
  convertToEnglish,
  getNepaliMonthName,
  getNepaliMonthDays,
  isLeapYear
};