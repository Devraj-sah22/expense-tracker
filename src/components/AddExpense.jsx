import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Tag, FileText, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'from-orange-400 to-red-400' },
  { id: 'travel', name: 'Travel', icon: '🚗', color: 'from-blue-400 to-cyan-400' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'from-pink-400 to-rose-400' },
  { id: 'bills', name: 'Bills', icon: '📄', color: 'from-purple-400 to-indigo-400' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'from-yellow-400 to-amber-400' },
  { id: 'health', name: 'Health', icon: '🏥', color: 'from-green-400 to-emerald-400' },
  { id: 'education', name: 'Education', icon: '📚', color: 'from-indigo-400 to-blue-400' },
  { id: 'other', name: 'Other', icon: '📦', color: 'from-gray-400 to-slate-400' },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: '💰' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'upi', name: 'UPI', icon: '📱' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
];

const AddExpense = ({ onAddExpense, wallets }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'cash',
    //walletId: wallets[0]?.id || '',
    walletId: wallets.length > 0 ? wallets[0].id : '',
    isRecurring: false,
    recurringInterval: 'monthly',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.walletId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedWallet = wallets.find(w => w.id === formData.walletId);
    if (selectedWallet && selectedWallet.balance < parseFloat(formData.amount)) {
      toast.error('Insufficient balance in selected wallet');
      return;
    }

    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    toast.success('Expense added successfully!');
    navigate('/expenses');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="premium-card p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Add New Expense
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${formData.category === cat.id
                      ? `border-transparent bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.icon} {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wallet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wallet className="w-4 h-4 inline mr-2" />
              Select Wallet *
            </label>
            {/* <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            > 
            */}
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >

              <option value="">Select Wallet</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.icon} {wallet.name} (₹{wallet.balance})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Recurring Expense Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isRecurring"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This is a recurring expense
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recurring Interval
              </label>
              <select
                name="recurringInterval"
                value={formData.recurringInterval}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 gradient-bg text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;