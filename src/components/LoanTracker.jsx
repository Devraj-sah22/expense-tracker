import React, { useState } from 'react';
import { Plus, CreditCard, Calendar, DollarSign, Edit2, Trash2, Building, Percent, Home, Car, Briefcase, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LoanTracker = ({ loans, setLoans }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    lenderName: '',
    loanType: 'personal',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    tenureType: 'months',
    startDate: new Date().toISOString().split('T')[0],
    emiAmount: '',
    paidAmount: '0',
    status: 'active',
    notes: '',
  });

  const loanTypes = [
    { id: 'personal', name: 'Personal Loan', icon: '💳', iconComp: CreditCard },
    { id: 'home', name: 'Home Loan', icon: '🏠', iconComp: Home },
    { id: 'car', name: 'Car Loan', icon: '🚗', iconComp: Car },
    { id: 'education', name: 'Education Loan', icon: '📚', iconComp: GraduationCap },
    { id: 'business', name: 'Business Loan', icon: '💼', iconComp: Briefcase },
    { id: 'other', name: 'Other', icon: '💰', iconComp: DollarSign },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.lenderName || !formData.principalAmount) {
      toast.error('Please fill in required fields');
      return;
    }

    const principal = parseFloat(formData.principalAmount) || 0;
    if (principal <= 0) {
      toast.error('Please enter a valid principal amount');
      return;
    }

    const paid = parseFloat(formData.paidAmount) || 0;
    const remaining = principal - paid;

    const newLoan = {
      id: editingLoan?.id || Date.now().toString(),
      lenderName: formData.lenderName,
      loanType: formData.loanType,
      principalAmount: principal,
      interestRate: parseFloat(formData.interestRate) || 0,
      tenure: formData.tenure || '',
      tenureType: formData.tenureType,
      startDate: new Date(formData.startDate).toISOString(),
      emiAmount: parseFloat(formData.emiAmount) || 0,
      paidAmount: paid,
      remainingAmount: Math.max(remaining, 0),
      progress: principal > 0 ? (paid / principal) * 100 : 0,
      status: remaining <= 0 ? 'closed' : formData.status,
      notes: formData.notes || '',
      createdAt: new Date().toISOString(),
    };

    if (editingLoan) {
      setLoans(loans.map(l => l.id === editingLoan.id ? newLoan : l));
      toast.success('Loan record updated successfully');
    } else {
      setLoans([newLoan, ...loans]);
      toast.success('Loan record added successfully');
    }

    setShowAddModal(false);
    setEditingLoan(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      lenderName: '',
      loanType: 'personal',
      principalAmount: '',
      interestRate: '',
      tenure: '',
      tenureType: 'months',
      startDate: new Date().toISOString().split('T')[0],
      emiAmount: '',
      paidAmount: '0',
      status: 'active',
      notes: '',
    });
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData({
      lenderName: loan.lenderName || '',
      loanType: loan.loanType || 'personal',
      principalAmount: loan.principalAmount?.toString() || '',
      interestRate: loan.interestRate?.toString() || '',
      tenure: loan.tenure?.toString() || '',
      tenureType: loan.tenureType || 'months',
      startDate: loan.startDate ? loan.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      emiAmount: loan.emiAmount?.toString() || '',
      paidAmount: loan.paidAmount?.toString() || '0',
      status: loan.status || 'active',
      notes: loan.notes || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this loan record?')) {
      setLoans(loans.filter(l => l.id !== id));
      toast.success('Loan record deleted');
    }
  };

  const handlePayment = (id, amount) => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoans(loans.map(loan => {
      if (loan.id === id) {
        const currentPaid = loan.paidAmount || 0;
        const principal = loan.principalAmount || 0;
        const newPaid = currentPaid + paymentAmount;
        const newRemaining = Math.max(principal - newPaid, 0);
        const newStatus = newRemaining <= 0 ? 'closed' : loan.status;
        
        toast.success(`Payment of ₹${paymentAmount.toLocaleString()} recorded`);
        
        return {
          ...loan,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          progress: principal > 0 ? (newPaid / principal) * 100 : 0,
        };
      }
      return loan;
    }));
  };

  // Safe calculations with fallbacks
  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  const totalPrincipal = loans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
  const totalPaid = loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Tracker</h2>
        <button
          onClick={() => {
            setEditingLoan(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <p className="text-sm opacity-90">Total Principal</p>
          <p className="text-3xl font-bold mt-2">₹{totalPrincipal.toLocaleString()}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-green-500 to-teal-500 text-white">
          <p className="text-sm opacity-90">Total Paid</p>
          <p className="text-3xl font-bold mt-2">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <p className="text-sm opacity-90">Remaining</p>
          <p className="text-3xl font-bold mt-2">₹{totalRemaining.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{loans.filter(l => l.status === 'active').length} active loans</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'active', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              filter === status
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {status} ({loans.filter(l => status === 'all' ? true : l.status === status).length})
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingLoan ? 'Edit Loan' : 'Add New Loan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Lender/Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lenderName}
                    onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                    placeholder="e.g., SBI, HDFC, Friend name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {loanTypes.map(type => {
                      const Icon = type.iconComp;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, loanType: type.id })}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                            formData.loanType === type.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Principal Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Percent className="w-4 h-4 inline mr-2" />
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="e.g., 10.5"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenure
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                      placeholder="10"
                      min="1"
                      className="w-2/3 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <select
                      value={formData.tenureType}
                      onChange={(e) => setFormData({ ...formData, tenureType: e.target.value })}
                      className="w-1/3 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    EMI Amount
                  </label>
                  <input
                    type="number"
                    value={formData.emiAmount}
                    onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Already Paid
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                >
                  {editingLoan ? 'Update' : 'Add'} Loan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLoan(null);
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

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No loan records found</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const loanType = loanTypes.find(t => t.id === loan.loanType) || loanTypes[5];
            const Icon = loanType.iconComp;
            
            // Safe values with fallbacks
            const principalAmount = loan.principalAmount || 0;
            const paidAmount = loan.paidAmount || 0;
            const remainingAmount = loan.remainingAmount || 0;
            const progress = principalAmount > 0 ? (paidAmount / principalAmount) * 100 : 0;
            const emiAmount = loan.emiAmount || 0;
            
            return (
              <div key={loan.id} className="premium-card p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      loan.status === 'active'
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{loan.lenderName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{loanType.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Started: {loan.startDate ? format(new Date(loan.startDate), 'MMM d, yyyy') : 'N/A'}</span>
                        {loan.interestRate > 0 && (
                          <span>Interest: {loan.interestRate}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {loan.status === 'active' && (
                      <button
                        onClick={() => {
                          const amount = prompt('Enter payment amount:', '1000');
                          if (amount) handlePayment(loan.id, amount);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        Add Payment
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(loan)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Principal</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{principalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="text-lg font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="text-lg font-bold text-orange-600">₹{remainingAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {emiAmount > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    EMI: ₹{emiAmount.toLocaleString()}/month
                  </div>
                )}

                {loan.notes && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                    📝 {loan.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LoanTracker;