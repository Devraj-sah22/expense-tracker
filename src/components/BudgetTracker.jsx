import React, { useState } from 'react';
import { Target, AlertCircle, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BudgetTracker = ({ expenses, budgets, setBudgets }) => {
  const [editing, setEditing] = useState(null);
  const [newBudget, setNewBudget] = useState({});

  const calculateSpent = (period) => {
    const now = new Date();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        switch (period) {
          case 'daily':
            return expenseDate.toDateString() === now.toDateString();
          case 'weekly':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return expenseDate >= weekAgo;
          case 'monthly':
            return expenseDate.getMonth() === now.getMonth() && 
                   expenseDate.getFullYear() === now.getFullYear();
          default:
            return false;
        }
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleEdit = (period) => {
    setEditing(period);
    setNewBudget({ ...budgets });
  };

  const handleSave = () => {
    setBudgets(newBudget);
    setEditing(null);
    toast.success('Budget updated successfully!');
  };

  const dailySpent = calculateSpent('daily');
  const weeklySpent = calculateSpent('weekly');
  const monthlySpent = calculateSpent('monthly');

  const budgetItems = [
    {
      period: 'Daily',
      key: 'daily',
      budget: budgets.daily,
      spent: dailySpent,
      icon: '📅',
      color: 'blue',
    },
    {
      period: 'Weekly',
      key: 'weekly',
      budget: budgets.weekly,
      spent: weeklySpent,
      icon: '📊',
      color: 'purple',
    },
    {
      period: 'Monthly',
      key: 'monthly',
      budget: budgets.monthly,
      spent: monthlySpent,
      icon: '📈',
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Tracker</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgetItems.map((item) => {
          const percentage = (item.spent / item.budget) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage >= 80 && percentage <= 100;

          return (
            <div key={item.period} className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.period} Budget
                  </h3>
                </div>
                <button
                  onClick={() => handleEdit(item.key)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {editing === item.key ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={newBudget[item.key]}
                    onChange={(e) => setNewBudget({ ...newBudget, [item.key]: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Budget</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{item.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spent</span>
                      <span className={`font-semibold ${
                        isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        ₹{item.spent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                      <span className={`font-semibold ${
                        item.budget - item.spent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{(item.budget - item.spent).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? 'bg-red-500'
                            : isNearLimit
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {(isOverBudget || isNearLimit) && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      isOverBudget
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {isOverBudget
                            ? `${item.period} budget exceeded!`
                            : `You've used ${percentage.toFixed(0)}% of your ${item.period.toLowerCase()} budget`}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetTracker;