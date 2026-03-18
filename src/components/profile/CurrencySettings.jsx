import React, { useState, useEffect } from 'react';
import { Search, Check, Globe, DollarSign, Euro, PoundSterling, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', flag: '🇳🇵' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'රු', flag: '🇱🇰' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', flag: '🇧🇹' },
];

const CurrencySettings = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved ? JSON.parse(saved) : { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' };
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCurrency = (currency) => {
    setSelectedCurrency(currency);
    toast.success(`Currency changed to ${currency.code} (${currency.symbol})`);
  };

  const handleAddCustom = () => {
    if (customCode.trim()) {
      const newCurrency = {
        code: customCode.toUpperCase(),
        name: customCode.toUpperCase(),
        symbol: customCode.toUpperCase(),
        flag: '🏳️',
        custom: true
      };
      setSelectedCurrency(newCurrency);
      setShowCustom(false);
      setCustomCode('');
      toast.success(`Custom currency ${customCode.toUpperCase()} added`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Currency</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This currency will be used throughout the app for all financial figures.
        </p>
      </div>

      {/* Selected Currency Display */}
      <div className="premium-card p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Current Currency</p>
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-4xl">{selectedCurrency.flag}</span>
              <div>
                <p className="text-2xl font-bold">{selectedCurrency.code}</p>
                <p className="text-sm opacity-90">{selectedCurrency.name}</p>
              </div>
            </div>
          </div>
          <div className="text-6xl font-bold opacity-50">{selectedCurrency.symbol}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search currency..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
        {filteredCurrencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => handleSelectCurrency(currency)}
            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selectedCurrency.code === currency.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currency.flag}</span>
              <div className="text-left">
                <p className={`font-semibold ${
                  selectedCurrency.code === currency.code ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {currency.code}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currency.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                {currency.symbol}
              </span>
              {selectedCurrency.code === currency.code && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Currency Option */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Enter custom currency code
          </button>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="Enter currency code (e.g., BTC)"
              maxLength="5"
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCurrency.symbol} 1,234.56
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500">Large amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCurrency.symbol} 1,000,000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;