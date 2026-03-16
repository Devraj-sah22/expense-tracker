import React, { useState } from 'react';
import { Plus, Target, Edit2, Trash2, TrendingUp, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const SavingsGoals = ({ goals, setGoals }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    saved: '',
    deadline: '',
    icon: '🎯',
    category: 'general',
  });

  const goalIcons = {
    general: '🎯',
    laptop: '💻',
    vacation: '✈️',
    car: '🚗',
    house: '🏠',
    education: '📚',
    emergency: '🆘',
    retirement: '👴',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target || !formData.saved) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetAmount = parseFloat(formData.target);
    const savedAmount = parseFloat(formData.saved);

    if (savedAmount > targetAmount) {
      toast.error('Saved amount cannot exceed target amount');
      return;
    }

    const newGoal = {
      id: editingGoal?.id || Date.now().toString(),
      ...formData,
      target: targetAmount,
      saved: savedAmount,
      progress: (savedAmount / targetAmount) * 100,
      createdAt: new Date().toISOString(),
    };

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? newGoal : g));
      toast.success('Goal updated successfully');
    } else {
      setGoals([...goals, newGoal]);
      toast.success('New savings goal created!');
    }

    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      target: '',
      saved: '',
      deadline: '',
      icon: '🎯',
      category: 'general',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Goal deleted successfully');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target: goal.target,
      saved: goal.saved,
      deadline: goal.deadline || '',
      icon: goal.icon || '🎯',
      category: goal.category || 'general',
    });
    setShowAddForm(true);
  };

  const handleAddSavings = (goalId, amount) => {
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newSaved = goal.saved + newAmount;
        if (newSaved > goal.target) {
          toast.error('Cannot exceed target amount');
          return goal;
        }
        const updatedGoal = {
          ...goal,
          saved: newSaved,
          progress: (newSaved / goal.target) * 100,
        };

        if (newSaved >= goal.target) {
          toast.success(`🎉 Congratulations! You've reached your goal: ${goal.name}`);
        } else {
          toast.success(`Added ₹${newAmount} to ${goal.name}`);
        }

        return updatedGoal;
      }
      return goal;
    }));
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingGoal(null);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Overall Progress */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h3>
          </div>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Saved: ₹{totalSaved.toLocaleString()}</span>
          <span>Target: ₹{totalTarget.toLocaleString()}</span>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Laptop, Vacation, Emergency Fund"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    category: e.target.value,
                    icon: goalIcons[e.target.value] 
                  })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="general">General 🎯</option>
                  <option value="laptop">Laptop 💻</option>
                  <option value="vacation">Vacation ✈️</option>
                  <option value="car">Car 🚗</option>
                  <option value="house">House 🏠</option>
                  <option value="education">Education 📚</option>
                  <option value="emergency">Emergency Fund 🆘</option>
                  <option value="retirement">Retirement 👴</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Already Saved (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.saved}
                    onChange={(e) => setFormData({ ...formData, saved: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                >
                  {editingGoal ? 'Update' : 'Create'} Goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGoal(null);
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

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 premium-card p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No savings goals yet</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Create your first savings goal to start tracking!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="premium-card p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-3xl">
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.category?.charAt(0).toUpperCase() + goal.category?.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {goal.progress?.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{goal.saved?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{goal.target?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {goal.deadline && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Quick Add Savings */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const amount = prompt('Enter amount to add:', '1000');
                      if (amount) {
                        handleAddSavings(goal.id, amount);
                      }
                    }}
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Add Savings
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;