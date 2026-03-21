import React, { createContext, useContext, useState, useEffect } from 'react';
//import { getNepaliMonth, getNepaliYear } from '../utils/calendarUtils';
import NepaliDate from 'nepali-date-converter';
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
    //return saved ? parseInt(saved) : new Date().getFullYear();
    return saved
      ? parseInt(saved)
      : (calendarSystem === 'bikram-sambat'
        ? new Date().getFullYear() + 56
        : new Date().getFullYear());
  });
  // const [activeYear, setActiveYear] = useState(() => {
  //   const saved = localStorage.getItem('activeYear');

  //   if (saved) return parseInt(saved);

  //   //const nep = new NepaliDate(new Date());
  //   return calendarSystem === 'bikram-sambat'
  //     ? nep.getYear()
  //     : new Date().getFullYear();
  // });

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
  const getMonthName = (monthIndex, calendarType, short = false) => {
    if (calendarType === 'bikram-sambat') {
      return short
        ? bikramSambatShortMonths[monthIndex]
        : bikramSambatMonths[monthIndex];
    }

    return short
      ? internationalShortMonths[monthIndex]
      : internationalMonths[monthIndex];
  };
  //const getMonthName = (monthIndex, short = false) => {
  // const getMonthName = (monthIndex, calendarType, short = false) => {
  //   if (calendarSystem === 'bikram-sambat') {
  //     return short ? bikramSambatShortMonths[monthIndex] : bikramSambatMonths[monthIndex];
  //   }
  //   return short ? internationalShortMonths[monthIndex] : internationalMonths[monthIndex];
  // };

  // Get all months
  const getMonths = (short = false) => {
    if (calendarSystem === 'bikram-sambat') {
      return short ? bikramSambatShortMonths : bikramSambatMonths;
    }
    return short ? internationalShortMonths : internationalMonths;
  };

  // Format date according to calendar system
  // const formatDate = (date, format = 'full') => {
  //   if (!date) return '';

  //   const d = new Date(date);

  //   if (calendarSystem === 'bikram-sambat') {
  //     // const nepaliDate = convertToNepali(d);
  //     const nep = new NepaliDate(d);
  //     const nepaliDate = {
  //       year: nep.getYear(),
  //       month: nep.getMonth() + 1,
  //       day: nep.getDate(),
  //     };
  //     if (format === 'full') {
  //       return `${nepaliDate.day} ${getMonthName(nepaliDate.month - 1)} ${nepaliDate.year}`;
  //     } else if (format === 'short') {
  //       return `${nepaliDate.day} ${getMonthName(nepaliDate.month - 1, true)} ${nepaliDate.year}`;
  //     } else if (format === 'numeric') {
  //       return `${nepaliDate.year}-${String(nepaliDate.month).padStart(2, '0')}-${String(nepaliDate.day).padStart(2, '0')}`;
  //     }
  //   }

  //   // International format
  //   if (format === 'full') {
  //     return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  //   } else if (format === 'short') {
  //     return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  //   } else if (format === 'numeric') {
  //     return d.toISOString().split('T')[0];
  //   }

  //   return d.toLocaleDateString();
  // };
  const formatDate = (date, calendarType, format = 'full') => {
    if (!date) return '';

    // 🟣 Bikram Sambat → show as-is
    if (calendarType === 'bikram-sambat') {
      //const [year, month, day] = date.split('-');
      //const [year, month, day] = date.split('-').map(Number);
      const adDate = new Date(date);
      const nep = new NepaliDate(adDate);

      const year = nep.getYear();
      const month = nep.getMonth() + 1;
      const day = nep.getDate();

      if (format === 'full') {
        return `${day} ${getMonthName(month - 1, calendarType)} ${year}`;
      }

      if (format === 'short') {
        //return `${day} ${getMonthName(month - 1, true)} ${year}`;
        return `${day} ${getMonthName(month - 1, calendarType, true)} ${year}`;
      }

      return `${year}-${month}-${day}`;
    }

    // 🌍 International
    const d = new Date(date);

    if (format === 'full') {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (format === 'short') {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return d.toISOString().split('T')[0];
  };
  // // ✅ ADD THIS FUNCTION HERE
  // const convertToAD = (bsDateString) => {
  //   const [year, month, day] = bsDateString.split('-').map(Number);
  //   const nep = new NepaliDate(year, month - 1, day);
  //   return nep.toJsDate();
  // };
  // // Get today's date based on calendar system
  // const getToday = () => {
  //   if (calendarSystem === 'bikram-sambat') {
  //     return new NepaliDate().toJsDate();
  //   }
  //   return new Date();
  // };

  // Get available years (last 10 years to next 5 years)
  // const getAvailableYears = () => {
  //   let currentYear;

  //   if (calendarSystem === 'bikram-sambat') {
  //     //const nep = new NepaliDate(new Date());
  //     currentYear = nep.getYear(); // ✅ BS year
  //   } else {
  //     currentYear = new Date().getFullYear(); // ✅ AD year
  //   }

  //   const years = [];
  //   for (let i = currentYear - 50; i <= currentYear + 50; i++) {
  //     years.push(i);
  //   }

  //   return years;
  // };
  const getAvailableYears = () => {
    //const currentYear = new Date().getFullYear();
    const currentYear =
      calendarSystem === 'bikram-sambat'
        ? new Date().getFullYear() + 56
        : new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  // Switch calendar system
  const switchCalendar = (system) => {
    setCalendarSystem(system);

    let newYear;

    if (system === 'bikram-sambat') {
      const today = new Date();
      newYear = today.getFullYear() + 56; // approx BS conversion
    } else {
      newYear = new Date().getFullYear();
    }

    setActiveYear(newYear);

    toast.success(
      `Calendar switched to ${system === 'bikram-sambat' ? 'Bikram Sambat' : 'International'
      }`
    );
  };

  // if (system === 'bikram-sambat') {
  //   //const nep = new NepaliDate(new Date());
  //   newYear = nep.getYear();
  // } else {
  //   newYear = new Date().getFullYear();
  // }
  //setActiveYear(new Date().getFullYear()); // simple & safe
  //setActiveYear(newYear); // ✅ IMPORTANT FIX

  //toast.success(`Calendar switched to ${system === 'bikram-sambat' ? 'Bikram Sambat' : 'International'}`);
  //};
  // const switchCalendar = (system) => {
  //   setCalendarSystem(system);
  //   toast.success(`Calendar switched to ${system === 'bikram-sambat' ? 'Bikram Sambat' : 'International'}`);
  // };

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
    //getToday, // ✅ ADD THIS LINE
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};