import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Building, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  Edit2, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const BankStatements = ({ banks, setBanks, transactions, setTransactions }) => {
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bankFormData, setBankFormData] = useState({
    name: '',
    accountNumber: '',
    accountType: 'savings',
    branch: '',
    ifscCode: '',
    balance: '',
    currency: 'INR',
    openingDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [transactionFormData, setTransactionFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'debit',
    category: 'others',
    reference: '',
    notes: '',
  });

  const accountTypes = [
    { id: 'savings', name: 'Savings Account', icon: '🏦' },
    { id: 'current', name: 'Current Account', icon: '💼' },
    { id: 'salary', name: 'Salary Account', icon: '💰' },
    { id: 'fixed', name: 'Fixed Deposit', icon: '📈' },
    { id: 'credit', name: 'Credit Card', icon: '💳' },
    { id: 'loan', name: 'Loan Account', icon: '📉' },
  ];

  const transactionCategories = [
    { id: 'salary', name: 'Salary', icon: '💰' },
    { id: 'food', name: 'Food & Dining', icon: '🍔' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'bills', name: 'Bills & Utilities', icon: '📄' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Healthcare', icon: '🏥' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'transfer', name: 'Transfer', icon: '🔄' },
    { id: 'others', name: 'Others', icon: '📦' },
  ];

  const [localBanks, setLocalBanks] = useState(() => {
    if (banks && banks.length > 0) {
      return banks;
    }
    const saved = localStorage.getItem('banks');
    return saved ? JSON.parse(saved) : [];
  });

  const [localTransactions, setLocalTransactions] = useState(() => {
    if (transactions && transactions.length > 0) {
      return transactions;
    }
    const saved = localStorage.getItem('bankTransactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (setBanks) {
      setBanks(localBanks);
    }
    localStorage.setItem('banks', JSON.stringify(localBanks));
  }, [localBanks, setBanks]);

  useEffect(() => {
    if (setTransactions) {
      setTransactions(localTransactions);
    }
    localStorage.setItem('bankTransactions', JSON.stringify(localTransactions));
  }, [localTransactions, setTransactions]);

  const handleBankSubmit = (e) => {
    e.preventDefault();
    
    if (!bankFormData.name || !bankFormData.accountNumber || !bankFormData.balance) {
      toast.error('Please fill in required fields');
      return;
    }

    const newBank = {
      id: editingBank?.id || Date.now().toString(),
      ...bankFormData,
      balance: parseFloat(bankFormData.balance) || 0,
      createdAt: new Date().toISOString(),
    };

    if (editingBank) {
      setLocalBanks(localBanks.map(b => b.id === editingBank.id ? newBank : b));
      toast.success('Bank account updated successfully');
    } else {
      setLocalBanks([...localBanks, newBank]);
      toast.success('Bank account added successfully');
    }

    setShowAddBankModal(false);
    setEditingBank(null);
    resetBankForm();
  };

  const resetBankForm = () => {
    setBankFormData({
      name: '',
      accountNumber: '',
      accountType: 'savings',
      branch: '',
      ifscCode: '',
      balance: '',
      currency: 'INR',
      openingDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setBankFormData({
      name: bank.name || '',
      accountNumber: bank.accountNumber || '',
      accountType: bank.accountType || 'savings',
      branch: bank.branch || '',
      ifscCode: bank.ifscCode || '',
      balance: bank.balance?.toString() || '',
      currency: bank.currency || 'INR',
      openingDate: bank.openingDate ? bank.openingDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: bank.notes || '',
    });
    setShowAddBankModal(true);
  };

  const handleDeleteBank = (id) => {
    const hasTransactions = localTransactions.some(t => t.bankId === id);
    if (hasTransactions) {
      toast.error('Cannot delete bank with existing transactions');
      return;
    }

    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setLocalBanks(localBanks.filter(b => b.id !== id));
      toast.success('Bank account deleted');
    }
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedBank || !transactionFormData.description || !transactionFormData.amount) {
      toast.error('Please fill in required fields');
      return;
    }

    const amount = parseFloat(transactionFormData.amount) || 0;
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newTransaction = {
      id: editingTransaction?.id || Date.now().toString(),
      bankId: selectedBank.id,
      ...transactionFormData,
      amount: amount,
      type: transactionFormData.type,
      date: new Date(transactionFormData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };

    const balanceChange = transactionFormData.type === 'credit' ? amount : -amount;
    setLocalBanks(localBanks.map(bank => {
      if (bank.id === selectedBank.id) {
        return {
          ...bank,
          balance: (bank.balance || 0) + balanceChange
        };
      }
      return bank;
    }));

    if (editingTransaction) {
      setLocalTransactions(localTransactions.map(t => t.id === editingTransaction.id ? newTransaction : t));
      toast.success('Transaction updated successfully');
    } else {
      setLocalTransactions([newTransaction, ...localTransactions]);
      toast.success('Transaction added successfully');
    }

    setShowAddTransactionModal(false);
    setEditingTransaction(null);
    resetTransactionForm();
  };

  const resetTransactionForm = () => {
    setTransactionFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'debit',
      category: 'others',
      reference: '',
      notes: '',
    });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      date: transaction.date.split('T')[0],
      description: transaction.description || '',
      amount: transaction.amount?.toString() || '',
      type: transaction.type || 'debit',
      category: transaction.category || 'others',
      reference: transaction.reference || '',
      notes: transaction.notes || '',
    });
    setSelectedBank(localBanks.find(b => b.id === transaction.bankId));
    setShowAddTransactionModal(true);
  };

  const handleDeleteTransaction = (id) => {
    const transaction = localTransactions.find(t => t.id === id);
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      if (transaction) {
        const balanceChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
        setLocalBanks(localBanks.map(bank => {
          if (bank.id === transaction.bankId) {
            return {
              ...bank,
              balance: (bank.balance || 0) + balanceChange
            };
          }
          return bank;
        }));
      }
      setLocalTransactions(localTransactions.filter(t => t.id !== id));
      toast.success('Transaction deleted');
    }
  };

  const getBankTransactions = (bankId) => {
    return localTransactions
      .filter(t => t.bankId === bankId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getMonthlyTransactions = (bankId) => {
    const [year, month] = selectedMonth.split('-');
    return localTransactions
      .filter(t => {
        if (t.bankId !== bankId) return false;
        const txDate = new Date(t.date);
        return txDate.getFullYear() === parseInt(year) && 
               txDate.getMonth() === parseInt(month) - 1;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getMonthlySummary = (bankId) => {
    const monthlyTxs = getMonthlyTransactions(bankId);
    const credits = monthlyTxs.filter(t => t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0);
    const debits = monthlyTxs.filter(t => t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0);
    return { credits, debits, net: credits - debits };
  };

  const exportStatement = (bank) => {
    const transactions = getBankTransactions(bank.id);
    const data = transactions.map(t => ({
      Date: format(new Date(t.date), 'dd/MM/yyyy'),
      Description: t.description,
      'Credit (INR)': t.type === 'credit' ? t.amount : '',
      'Debit (INR)': t.type === 'debit' ? t.amount : '',
      Balance: '',
      Category: t.category,
      Reference: t.reference || '',
      Notes: t.notes || '',
    }));

    let balance = bank.balance || 0;
    const dataWithBalance = data.reverse().map(t => {
      if (t['Credit (INR)']) {
        balance -= parseFloat(t['Credit (INR)']);
      } else if (t['Debit (INR)']) {
        balance += parseFloat(t['Debit (INR)']);
      }
      return { ...t, Balance: balance.toFixed(2) };
    }).reverse();

    const worksheet = XLSX.utils.json_to_sheet(dataWithBalance);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, `${bank.name}_statement_${selectedMonth}.xlsx`);
    toast.success('Statement exported successfully');
  };

  const importTransactions = (bank, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedTransactions = jsonData.map((row, index) => ({
          id: Date.now() + index,
          bankId: bank.id,
          date: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString(),
          description: row.Description || row.description || '',
          amount: parseFloat(row.Amount || row.amount || 0) || 0,
          type: (row.Type || row.type || 'debit').toLowerCase(),
          category: row.Category || row.category || 'others',
          reference: row.Reference || row.reference || '',
          notes: row.Notes || row.notes || '',
          createdAt: new Date().toISOString(),
        }));

        const totalChange = importedTransactions.reduce((sum, t) => {
          return sum + (t.type === 'credit' ? t.amount : -t.amount);
        }, 0);

        setLocalBanks(localBanks.map(b => {
          if (b.id === bank.id) {
            return { ...b, balance: (b.balance || 0) + totalChange };
          }
          return b;
        }));

        setLocalTransactions([...importedTransactions, ...localTransactions]);
        toast.success(`Imported ${importedTransactions.length} transactions`);
      } catch (error) {
        toast.error('Error importing file');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Statements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage bank accounts and track transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Building className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingBank(null);
              resetBankForm();
              setShowAddBankModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {new Date().getFullYear()}
        </h3>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Banks Grid/List */}
      {localBanks.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No banks added yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add your first bank or account to start tracking transactions and statements.
          </p>
          <button
            onClick={() => {
              setEditingBank(null);
              resetBankForm();
              setShowAddBankModal(true);
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Bank</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {localBanks.map((bank) => {
            const bankTransactions = getBankTransactions(bank.id);
            const monthlySummary = getMonthlySummary(bank.id);
            const accountType = accountTypes.find(t => t.id === bank.accountType) || accountTypes[0];

            return (
              <div key={bank.id} className="premium-card overflow-hidden hover:shadow-xl transition-all">
                {/* Bank Header */}
                <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                        {accountType.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{bank.name}</h3>
                        <p className="text-sm opacity-90">XXXX XXXX XXXX {bank.accountNumber?.slice(-4) || '****'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditBank(bank)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Edit Bank"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBank(bank.id)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Delete Bank"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm opacity-90">Current Balance</p>
                    <p className="text-3xl font-bold">₹{(bank.balance || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Monthly Summary */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                      <p className="text-sm font-semibold text-green-600">+₹{monthlySummary.credits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Debits</p>
                      <p className="text-sm font-semibold text-red-600">-₹{monthlySummary.debits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
                      <p className={`text-sm font-semibold ${
                        monthlySummary.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{monthlySummary.net.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBank(bank);
                          resetTransactionForm();
                          setShowAddTransactionModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Add Transaction"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <label className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer" title="Import">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              importTransactions(bank, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() => exportStatement(bank)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="Export Statement"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {bankTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'credit' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        }`}>
                          {tx.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                          <p className="text-xs text-gray-500">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {bankTransactions.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No transactions yet
                    </p>
                  )}
                </div>

                {/* View All Link */}
                {bankTransactions.length > 5 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all {bankTransactions.length} transactions
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
            </h3>
            
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankFormData.name}
                    onChange={(e) => setBankFormData({ ...bankFormData, name: e.target.value })}
                    placeholder="e.g., State Bank of India, HDFC Bank"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={bankFormData.accountType}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    {accountTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={bankFormData.branch}
                    onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })}
                    placeholder="Branch name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={bankFormData.ifscCode}
                    onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value })}
                    placeholder="IFSC code"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    value={bankFormData.balance}
                    onChange={(e) => setBankFormData({ ...bankFormData, balance: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    value={bankFormData.openingDate}
                    onChange={(e) => setBankFormData({ ...bankFormData, openingDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={bankFormData.currency}
                    onChange={(e) => setBankFormData({ ...bankFormData, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={bankFormData.notes}
                    onChange={(e) => setBankFormData({ ...bankFormData, notes: e.target.value })}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {editingBank ? 'Update' : 'Add'} Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBankModal(false);
                    setEditingBank(null);
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

      {/* Add Transaction Modal */}
      {showAddTransactionModal && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'} - {selectedBank.name}
            </h3>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={transactionFormData.date}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="credit"
                        checked={transactionFormData.type === 'credit'}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-green-600">Credit +</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="debit"
                        checked={transactionFormData.type === 'debit'}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-red-600">Debit -</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={transactionFormData.amount}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={transactionFormData.category}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    {transactionCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={transactionFormData.description}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                    placeholder="e.g., Salary, Grocery shopping, Bill payment"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference/Cheque No.
                  </label>
                  <input
                    type="text"
                    value={transactionFormData.reference}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, reference: e.target.value })}
                    placeholder="Reference number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={transactionFormData.notes}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, notes: e.target.value })}
                    placeholder="Additional notes"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTransactionModal(false);
                    setEditingTransaction(null);
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
    </div>
  );
};

export default BankStatements;