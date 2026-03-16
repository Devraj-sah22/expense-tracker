import React, { useState } from 'react';
import { Plus, Users, User, Phone, Mail, Calendar, DollarSign, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LendTracker = ({ lends, setLends }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLend, setEditingLend] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, repaid
  const [formData, setFormData] = useState({
    personName: '',
    personPhone: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    status: 'pending',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.personName || !formData.amount) {
      toast.error('Please fill in required fields');
      return;
    }

    const newLend = {
      id: editingLend?.id || Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString(),
    };

    if (editingLend) {
      setLends(lends.map(l => l.id === editingLend.id ? newLend : l));
      toast.success('Lend record updated successfully');
    } else {
      setLends([newLend, ...lends]);
      toast.success('Lend record added successfully');
    }

    setShowAddModal(false);
    setEditingLend(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      personName: '',
      personPhone: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: '',
      status: 'pending',
      notes: '',
    });
  };

  const handleEdit = (lend) => {
    setEditingLend(lend);
    setFormData({
      personName: lend.personName,
      personPhone: lend.personPhone || '',
      amount: lend.amount,
      date: lend.date.split('T')[0],
      dueDate: lend.dueDate ? lend.dueDate.split('T')[0] : '',
      description: lend.description || '',
      status: lend.status,
      notes: lend.notes || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lend record?')) {
      setLends(lends.filter(l => l.id !== id));
      toast.success('Lend record deleted');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setLends(lends.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    ));
    toast.success(`Marked as ${newStatus}`);
  };

  const filteredLends = lends.filter(lend => {
    if (filter === 'all') return true;
    return lend.status === filter;
  });

  const totalLent = lends.reduce((sum, l) => sum + l.amount, 0);
  const totalPending = lends.filter(l => l.status === 'pending').reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = lends.filter(l => l.status === 'repaid').reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lend Tracker</h2>
        <button
          onClick={() => {
            setEditingLend(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Lend Record</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <p className="text-sm opacity-90">Total Lent</p>
          <p className="text-3xl font-bold mt-2">₹{totalLent.toLocaleString()}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-2">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <p className="text-sm opacity-90">Repaid</p>
          <p className="text-3xl font-bold mt-2">₹{totalRepaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'pending', 'repaid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {status} ({lends.filter(l => status === 'all' ? true : l.status === status).length})
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingLend ? 'Edit Lend Record' : 'Add New Lend Record'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Person Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.personPhone}
                    onChange={(e) => setFormData({ ...formData, personPhone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Amount *
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
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Lend Date *
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
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                    <option value="pending">Pending</option>
                    <option value="repaid">Repaid</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this for?"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
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
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {editingLend ? 'Update' : 'Add'} Record
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLend(null);
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

      {/* Lend Records List */}
      <div className="premium-card overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLends.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No lend records found</p>
            </div>
          ) : (
            filteredLends.map((lend) => (
              <div key={lend.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      lend.status === 'repaid' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      👤
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{lend.personName}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        {lend.personPhone && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" /> {lend.personPhone}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(lend.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {lend.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lend.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{lend.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {lend.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(lend.id, 'repaid')}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                            title="Mark as repaid"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(lend)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(lend.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Repaid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {lend.dueDate && lend.status === 'pending' && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Due: {format(new Date(lend.dueDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LendTracker;