import React, { createContext, useContext, useState, useEffect } from 'react';
import { convertToNepali, getNepaliMonth, getNepaliYear } from '../utils/calendarUtils';
import toast from 'react-hot-toast';

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const [calendarSystem, setCalendarSystem] = useState(() => {
    const saved = localStorage.getItem('calendarSystem');
    return saved || 'international'; // 'international' or 'bikram-sambat'
  });

  const [activeYear, setActiveYear] = useState(() => {
    const saved = localStorage.getItem('activeYear');
    return saved ? parseInt(saved) : new Date().getFullYear();
  });

  const [activeMonth, setActiveMonth] = useState(() => {
    const saved = localStorage.getItem('activeMonth');
    return saved ? parseInt(saved) : new Date().getMonth();
  });

  // International months (Gregorian)
  const internationalMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const internationalShortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Bikram Sambat months (Nepali)
  const bikramSambatMonths = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  const bikramSambatShortMonths = [
    'Bai', 'Jes', 'Ash', 'Shr', 'Bhd', 'Ash',
    'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Chai'
  ];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('calendarSystem', calendarSystem);
  }, [calendarSystem]);

  useEffect(() => {
    localStorage.setItem('activeYear', activeYear.toString());
  }, [activeYear]);

  useEffect(() => {
    localStorage.setItem('activeMonth', activeMonth.toString());
  }, [activeMonth]);

  // Get month name based on calendar system
  const getMonthName = (monthIndex, short = false) => {
    if (calendarSystem === 'bikram-sambat') {
      return short ? bikramSambatShortMonths[monthIndex] : bikramSambatMonths[monthIndex];
    }
    return short ? internationalShortMonths[monthIndex] : internationalMonths[monthIndex];
  };

  // Get all months
  const getMonths = (short = false) => {
    if (calendarSystem === 'bikram-sambat') {
      return short ? bikramSambatShortMonths : bikramSambatMonths;
    }
    return short ? internationalShortMonths : internationalMonths;
  };

  // Format date according to calendar system
  const formatDate = (date, format = 'full') => {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (calendarSystem === 'bikram-sambat') {
      const nepaliDate = convertToNepali(d);
      if (format === 'full') {
        return `${nepaliDate.day} ${getMonthName(nepaliDate.month - 1)} ${nepaliDate.year}`;
      } else if (format === 'short') {
        return `${nepaliDate.day} ${getMonthName(nepaliDate.month - 1, true)} ${nepaliDate.year}`;
      } else if (format === 'numeric') {
        return `${nepaliDate.year}-${String(nepaliDate.month).padStart(2, '0')}-${String(nepaliDate.day).padStart(2, '0')}`;
      }
    }
    
    // International format
    if (format === 'full') {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (format === 'short') {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } else if (format === 'numeric') {
      return d.toISOString().split('T')[0];
    }
    
    return d.toLocaleDateString();
  };

  // Get available years (last 10 years to next 5 years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Switch calendar system
  const switchCalendar = (system) => {
    setCalendarSystem(system);
    toast.success(`Calendar switched to ${system === 'bikram-sambat' ? 'Bikram Sambat' : 'International'}`);
  };

  // Set active year/month
  const setActivePeriod = (year, month) => {
    setActiveYear(year);
    setActiveMonth(month);
  };

  const value = {
    calendarSystem,
    activeYear,
    activeMonth,
    internationalMonths,
    bikramSambatMonths,
    getMonthName,
    getMonths,
    formatDate,
    getAvailableYears,
    switchCalendar,
    setActivePeriod,
    setActiveYear,
    setActiveMonth,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};