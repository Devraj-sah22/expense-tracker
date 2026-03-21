import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Calendar, ChevronDown, Check, Sun, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import NepaliDate from 'nepali-date-converter';
const CalendarSettings = () => {
  const {
    calendarSystem,
    activeYear,
    activeMonth,
    setActiveYear,
    setActiveMonth,
    switchCalendar,
    getMonths,
    getAvailableYears,
    formatDate
  } = useCalendar();

  const [selectedYear, setSelectedYear] = useState(activeYear);
  const [selectedMonth, setSelectedMonth] = useState(activeMonth);

  const months = getMonths();
  const availableYears = getAvailableYears();

  const handleApply = () => {
    setActiveYear(selectedYear);
    setActiveMonth(selectedMonth);
    toast.success('Calendar period updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar System</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose how month names are displayed across Dashboard, Expenses and Income.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* International Calendar Option */}
          <button
            onClick={() => switchCalendar('international')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${calendarSystem === 'international'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className={`w-5 h-5 ${calendarSystem === 'international' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <h4 className={`font-semibold ${calendarSystem === 'international' ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                    International
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gregorian (Jan – Dec)
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {/* Today: {formatDate(new Date(), 'full')} */}
                  Today: {formatDate(
                    new Date().toISOString().split('T')[0],
                    calendarSystem,
                    'full'
                  )}
                </p>
              </div>
              {calendarSystem === 'international' && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </button>

          {/* Bikram Sambat Calendar Option */}
          <button
            onClick={() => switchCalendar('bikram-sambat')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${calendarSystem === 'bikram-sambat'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sun className={`w-5 h-5 ${calendarSystem === 'bikram-sambat' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <h4 className={`font-semibold ${calendarSystem === 'bikram-sambat' ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}>
                    Bikram Sambat
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nepali (Baisakh – Chaitra)
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {/* Today: {formatDate(new Date(), 'full')} */}
                  Today: {formatDate(
                    new Date().toISOString().split('T')[0],
                    calendarSystem,
                    'full'
                  )}
                </p>
              </div>
              {calendarSystem === 'bikram-sambat' && (
                <Check className="w-5 h-5 text-purple-600" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Active Year/Month Selection */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Active Period</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          All pages will default to showing data for this year and month. You can still change the period on any page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          Apply Period
        </button>

        {/* Quick Year Selector */}
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Year Select</h5>
          <div className="flex flex-wrap gap-2">
            {/* {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map(year => ( */}
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition-colors ${selectedYear === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current display: <span className="font-medium text-gray-900 dark:text-white">
              {/* {months[selectedMonth]} {selectedYear} */}
              {/* {calendarSystem === 'bikram-sambat'
                ? `${months[selectedMonth]} ${new NepaliDate(new Date()).getYear()}`
                : `${months[selectedMonth]} ${selectedYear}`
              } */}
              {months[selectedMonth]} {selectedYear}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This is how dates will appear throughout the application
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettings;