import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, CreditCard, Landmark, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const walletIcons = {
  cash: '💰',
  bank: '🏦',
  upi: '📱',
  card: '💳',
};

const MultiWallet = ({ wallets, setWallets }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    type: 'cash',
    icon: '💰',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.balance) {
      toast.error('Please fill in all fields');
      return;
    }

    const newWallet = {
      id: editingWallet?.id || Date.now().toString(),
      ...formData,
      balance: parseFloat(formData.balance),
      icon: walletIcons[formData.type],
    };

    if (editingWallet) {
      setWallets(wallets.map(w => w.id === editingWallet.id ? newWallet : w));
      toast.success('Wallet updated successfully');
    } else {
      setWallets([...wallets, newWallet]);
      toast.success('Wallet added successfully');
    }

    setShowAddForm(false);
    setEditingWallet(null);
    setFormData({ name: '', balance: '', type: 'cash', icon: '💰' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      setWallets(wallets.filter(w => w.id !== id));
      toast.success('Wallet deleted successfully');
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      balance: wallet.balance,
      type: Object.keys(walletIcons).find(key => walletIcons[key] === wallet.icon) || 'cash',
      icon: wallet.icon,
    });
    setShowAddForm(true);
  };

  const getWalletIcon = (type) => {
    switch(type) {
      case 'cash': return <Wallet className="w-5 h-5" />;
      case 'bank': return <Landmark className="w-5 h-5" />;
      case 'upi': return <Smartphone className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallets</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingWallet(null);
            setFormData({ name: '', balance: '', type: 'cash', icon: '💰' });
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Wallet</span>
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="premium-card p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <p className="text-sm opacity-90">Total Balance</p>
        <p className="text-4xl font-bold mt-2">₹{totalBalance.toLocaleString()}</p>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Savings Account"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Balance (₹)
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wallet Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {editingWallet ? 'Update' : 'Add'} Wallet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingWallet(null);
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

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="premium-card p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl">
                  {wallet.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{wallet.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {wallet.type?.charAt(0).toUpperCase() + wallet.type?.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(wallet)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{wallet.balance.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                {getWalletIcon(wallet.type)}
                <span>{wallet.type?.charAt(0).toUpperCase() + wallet.type?.slice(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiWallet;