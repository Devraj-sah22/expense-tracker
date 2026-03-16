import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, eachDayOfInterval } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const Charts = ({ expenses = [] }) => {
  // Ensure expenses is an array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Category-wise spending data
  const categoryData = useMemo(() => {
    const categories = {};
    safeExpenses.forEach(expense => {
      if (expense && expense.amount) {
        const category = expense.category || 'other';
        categories[category] = (categories[category] || 0) + (expense.amount || 0);
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value || 0,
    }));
  }, [safeExpenses]);

  // Monthly spending trend
  const monthlyData = useMemo(() => {
    const monthly = {};
    safeExpenses.forEach(expense => {
      if (expense && expense.date && expense.amount) {
        try {
          const month = format(new Date(expense.date), 'MMM yyyy');
          monthly[month] = (monthly[month] || 0) + (expense.amount || 0);
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    });
    
    return Object.entries(monthly)
      .map(([month, amount]) => ({ month, amount: amount || 0 }))
      .sort((a, b) => {
        try {
          return new Date(a.month) - new Date(b.month);
        } catch {
          return 0;
        }
      });
  }, [safeExpenses]);

  // Weekly spending data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekDays = eachDayOfInterval({ start: weekStart, end: today });
    
    return weekDays.map(day => {
      const dayExpenses = safeExpenses.filter(expense => {
        if (!expense || !expense.date) return false;
        try {
          return format(new Date(expense.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        } catch {
          return false;
        }
      });
      const total = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      
      return {
        day: format(day, 'EEE'),
        amount: total || 0,
      };
    });
  }, [safeExpenses]);

  // Calculate statistics with safe values
  const totalExpenses = safeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const averageDaily = safeExpenses.length > 0 ? totalExpenses / 30 : 0;
  const highestSpending = safeExpenses.length > 0
    ? Math.max(...safeExpenses.map(e => e.amount || 0))
    : 0;

  // Custom tooltip style
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value || 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-900 dark:text-white font-semibold">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            ₹{value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics Dashboard
      </h2>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily Spending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{averageDaily.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Highest Spending Day</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{highestSpending.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {safeExpenses.length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Category Distribution */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h3>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart - Monthly Trend */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Spending Trend
          </h3>
          <div className="h-80">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Weekly Spending */}
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Spending Breakdown
          </h3>
          <div className="h-80">
            {weeklyData.length > 0 && weeklyData.some(d => d.amount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;