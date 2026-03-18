import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCalendar } from '../../context/CalendarContext';
import CalendarSettings from './CalendarSettings';
import YearDataManagement from './YearDataManagement';
import CurrencySettings from './CurrencySettings';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Moon,
  Sun,
  Fingerprint,
  Shield,
  Bell,
  Globe,
  Download,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  CreditCard,
  Wallet,
  TrendingUp,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, signOut, biometricEnabled, enableBiometric, disableBiometric } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { calendarSystem, switchCalendar, activeYear, formatDate } = useCalendar();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedPhone, setEditedPhone] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, calendar, data, currency

  const handleSaveProfile = () => {
    updateProfile({ name: editedName, phone: editedPhone });
    setIsEditing(false);
    toast.success('Profile updated');
  };

  // Mock data for statistics
  const stats = [
    { label: 'Total Expenses', value: '₹2,082', icon: Wallet, change: '+12%' },
    { label: 'This Month', value: '₹0', icon: TrendingUp, change: '0%' },
    { label: 'Total Income', value: '₹0', icon: CreditCard, change: '0%' },
    { label: 'Bank Balance', value: '₹0', icon: PieChart, change: '0%' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="premium-card p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-white/80 flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </p>
              <p className="text-white/60 text-sm mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Profile Tabs */}
      <div className="premium-card overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'currency', label: 'Currency', icon: Globe },
            { id: 'data', label: 'Data Management', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.name || '');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      {user?.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      {user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl capitalize">
                    {user?.provider || 'Email'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Preferences</h4>
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
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
              
              <div className="premium-card p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Fingerprint className="w-12 h-12" />
                    <div>
                      <h4 className="text-lg font-semibold">Biometric Login</h4>
                      <p className="text-white/80 text-sm mt-1">
                        Use fingerprint or face recognition to sign in quickly and securely.
                        Works with all login methods (email, Google, Microsoft, etc.).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={biometricEnabled ? disableBiometric : enableBiometric}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      biometricEnabled
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {biometricEnabled ? 'Disable Biometric' : 'Enable Biometric'}
                  </button>
                </div>
                {biometricEnabled && (
                  <p className="mt-4 text-sm text-white/80 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Biometric login is enabled. You can now sign in with your fingerprint or face.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Enable 2FA
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Login History</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Review recent login attempts
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && <CalendarSettings />}

          {/* Currency Tab */}
          {activeTab === 'currency' && <CurrencySettings />}

          {/* Data Management Tab */}
          {activeTab === 'data' && <YearDataManagement />}
        </div>
      </div>
    </div>
  );
};

export default Profile;