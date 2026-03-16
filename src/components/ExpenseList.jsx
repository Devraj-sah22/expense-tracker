import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = {
  food: { name: 'Food', icon: '🍔', color: 'orange' },
  travel: { name: 'Travel', icon: '🚗', color: 'blue' },
  shopping: { name: 'Shopping', icon: '🛍️', color: 'pink' },
  bills: { name: 'Bills', icon: '📄', color: 'purple' },
  entertainment: { name: 'Entertainment', icon: '🎬', color: 'yellow' },
  health: { name: 'Health', icon: '🏥', color: 'green' },
  education: { name: 'Education', icon: '📚', color: 'indigo' },
  other: { name: 'Other', icon: '📦', color: 'gray' },
};

const ExpenseList = ({ expenses, onDelete, onEdit, wallets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [editingExpense, setEditingExpense] = useState(null);

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.amount.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesWallet = filterWallet === 'all' || expense.walletId === filterWallet;
      return matchesSearch && matchesCategory && matchesWallet;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDelete(id);
      toast.success('Expense deleted successfully');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    onEdit(editingExpense.id, editingExpense);
    setEditingExpense(null);
    toast.success('Expense updated successfully');
  };

  const getCategoryInfo = (categoryId) => {
    return categories[categoryId] || categories.other;
  };

  const getWalletInfo = (walletId) => {
    return wallets.find(w => w.id === walletId) || { icon: '💰', name: 'Unknown' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Expense History
        </h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([id, cat]) => (
                <option key={id} value={id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Wallets</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>{wallet.icon} {wallet.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-4 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="premium-card overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const category = getCategoryInfo(expense.category);
              const wallet = getWalletInfo(expense.walletId);
              
              return (
                <div key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {editingExpense?.id === expense.id ? (
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      <input
                        type="number"
                        value={editingExpense.amount}
                        onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        required
                      />
                      <textarea
                        value={editingExpense.description || ''}
                        onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingExpense(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {expense.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {format(new Date(expense.date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {wallet.icon} {wallet.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ₹{expense.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="premium-card p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;