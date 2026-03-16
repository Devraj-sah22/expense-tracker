import React, { useState } from 'react';
import { Plus, TrendingUp, Edit2, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const incomeSources = [
  { id: 'salary', name: 'Salary', icon: '💼', color: 'blue' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: 'purple' },
  { id: 'business', name: 'Business', icon: '🏢', color: 'green' },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'yellow' },
  { id: 'rental', name: 'Rental', icon: '🏠', color: 'orange' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: 'pink' },
  { id: 'other', name: 'Other', icon: '💰', color: 'gray' },
];

const IncomeTracker = ({ income, setIncome, expenses }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'salary',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringInterval: 'monthly',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newIncome = {
      id: editingIncome?.id || Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };

    if (editingIncome) {
      setIncome(income.map(i => i.id === editingIncome.id ? newIncome : i));
      toast.success('Income updated successfully');
    } else {
      setIncome([newIncome, ...income]);
      toast.success('Income added successfully');
    }

    setShowAddForm(false);
    setEditingIncome(null);
    setFormData({
      amount: '',
      source: 'salary',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      recurringInterval: 'monthly',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      setIncome(income.filter(i => i.id !== id));
      toast.success('Income deleted successfully');
    }
  };

  const handleEdit = (incomeItem) => {
    setEditingIncome(incomeItem);
    setFormData({
      amount: incomeItem.amount,
      source: incomeItem.source,
      date: incomeItem.date.split('T')[0],
      description: incomeItem.description || '',
      isRecurring: incomeItem.isRecurring || false,
      recurringInterval: incomeItem.recurringInterval || 'monthly',
    });
    setShowAddForm(true);
  };

  // Calculate totals
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Group income by month
  const monthlyIncome = income.reduce((acc, item) => {
    const month = format(new Date(item.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += item.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income Tracker</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingIncome(null);
            setFormData({
              amount: '',
              source: 'salary',
              date: new Date().toISOString().split('T')[0],
              description: '',
              isRecurring: false,
              recurringInterval: 'monthly',
            });
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card bg-gradient-to-br from-green-500 to-teal-500 text-white">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-3xl font-bold mt-2">₹{totalIncome.toLocaleString()}</p>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <p className="text-sm opacity-90">Total Expenses</p>
          <p className="text-3xl font-bold mt-2">₹{totalExpenses.toLocaleString()}</p>
        </div>
        
        <div className={`stat-card ${
          savings >= 0 
            ? 'bg-gradient-to-br from-emerald-500 to-green-500' 
            : 'bg-gradient-to-br from-red-500 to-pink-500'
        } text-white`}>
          <p className="text-sm opacity-90">Net Savings</p>
          <p className="text-3xl font-bold mt-2">₹{savings.toLocaleString()}</p>
          <p className="text-xs opacity-90 mt-1">Savings Rate: {savingsRate}%</p>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Income Source *
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {incomeSources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.icon} {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Add any additional details..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This is recurring income
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recurring Interval
                  </label>
                  <select
                    value={formData.recurringInterval}
                    onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  {editingIncome ? 'Update' : 'Add'} Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingIncome(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="premium-card overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-6 pb-0">
          Income History
        </h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {income.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No income records found</p>
            </div>
          ) : (
            income.map((item) => {
              const source = incomeSources.find(s => s.id === item.source) || incomeSources[6];
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 flex items-center justify-center text-2xl">
                        {source.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {source.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {format(new Date(item.date), 'MMM d, yyyy')}
                          </span>
                          {item.isRecurring && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-purple-500">
                                Recurring ({item.recurringInterval})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        +₹{item.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Income Breakdown
        </h3>
        <div className="space-y-3">
          {Object.entries(monthlyIncome).map(([month, amount]) => (
            <div key={month} className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{month}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ₹{amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;