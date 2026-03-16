import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Moon, Sun, Bell, Shield, Globe, Database, 
  RefreshCw, Download, Upload, Trash2, User,
  Mail, Lock, Smartphone, CreditCard, Languages
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    budget: true,
    weekly: false,
  });

  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      toast.success('All data cleared. Refreshing page...');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleExportBackup = () => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      wallets: JSON.parse(localStorage.getItem('wallets') || '[]'),
      income: JSON.parse(localStorage.getItem('income') || '[]'),
      savingsGoals: JSON.parse(localStorage.getItem('savingsGoals') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '{}'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully');
  };

  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.expenses) localStorage.setItem('expenses', JSON.stringify(data.expenses));
        if (data.wallets) localStorage.setItem('wallets', JSON.stringify(data.wallets));
        if (data.income) localStorage.setItem('income', JSON.stringify(data.income));
        if (data.savingsGoals) localStorage.setItem('savingsGoals', JSON.stringify(data.savingsGoals));
        if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));

        toast.success('Data imported successfully. Refreshing page...');
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      {/* Appearance */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Sun className="w-5 h-5 mr-2" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { id: 'email', label: 'Email Notifications', icon: Mail },
            { id: 'push', label: 'Push Notifications', icon: Smartphone },
            { id: 'budget', label: 'Budget Alerts', icon: Bell },
            { id: 'weekly', label: 'Weekly Summary', icon: RefreshCw },
          ].map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [id]: !notifications[id] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[id] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="JPY">Japanese Yen (¥)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Languages className="w-4 h-4 inline mr-2" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Backup</span>
            </button>
            
            <label className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security
        </h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Change PIN</span>
            </div>
            <span className="text-sm text-gray-400">Not set</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Biometric Login</span>
            </div>
            <span className="text-sm text-gray-400">Disabled</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>Expense Tracker v1.0.0</p>
          <p>A premium expense tracking application with advanced features</p>
          <p className="text-sm mt-4">© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;