import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PieChart,
  Target,
  Wallet,
  TrendingUp,
  PiggyBank,
  Download,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Users,
  CreditCard,
  Tag,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
  { name: 'Income', path: '/income', icon: TrendingUp },
  { name: 'Lend', path: '/lend', icon: Users },
  { name: 'Loan', path: '/loan', icon: CreditCard },
  { name: 'Savings', path: '/savings', icon: PiggyBank },
  { name: 'Wallets', path: '/wallets', icon: Wallet },
  { name: 'Categories', path: '/categories', icon: Tag },
  { name: 'Budget', path: '/budget', icon: Target },
  { name: 'Analytics', path: '/charts', icon: PieChart },
  { name: 'Export', path: '/export', icon: Download },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Layout = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="glass-effect h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExpenseTracker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Premium Finance Manager</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Theme toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="glass-effect sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex-1 lg:flex-none">
              {/* Empty for now */}
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick actions can go here */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;