import React, { createContext, useContext, useState, useEffect } from "react";
import NepaliDate from "nepali-date-converter";

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [calendarType, setCalendarType] = useState(
    localStorage.getItem("calendarType") || "AD"
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    localStorage.setItem("calendarType", calendarType);
  }, [calendarType]);

  const getBSDate = (date) => {
    const nep = new NepaliDate(date);
    return {
      year: nep.getYear(),
      month: nep.getMonth(),
      day: nep.getDate(),
      formatted: nep.format("YYYY-MM-DD"),
    };
  };

  const getADDate = (y, m, d) => {
    return new NepaliDate(y, m, d).toJsDate();
  };

  return (
    <DateContext.Provider
      value={{
        calendarType,
        setCalendarType,
        selectedDate,
        setSelectedDate,
        getBSDate,
        getADDate,
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);