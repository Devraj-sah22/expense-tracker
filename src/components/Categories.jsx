import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Palette, Save, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultCategories = [
  { id: '1', name: 'Food', icon: '🍔', color: '#f97316', type: 'expense', isDefault: true, budget: 5000 },
  { id: '2', name: 'Travel', icon: '🚗', color: '#06b6d4', type: 'expense', isDefault: true, budget: 3000 },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true, budget: 4000 },
  { id: '4', name: 'Bills', icon: '📄', color: '#8b5cf6', type: 'expense', isDefault: true, budget: 8000 },
  { id: '5', name: 'Health', icon: '🏥', color: '#ef4444', type: 'expense', isDefault: true, budget: 3000 },
  { id: '6', name: 'Entertainment', icon: '🎬', color: '#eab308', type: 'expense', isDefault: true, budget: 2000 },
  { id: '7', name: 'Others', icon: '📦', color: '#6b7280', type: 'expense', isDefault: true, budget: 1000 },
  { id: '8', name: 'Salary', icon: '💼', color: '#10b981', type: 'income', isDefault: true, budget: 0 },
  { id: '9', name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income', isDefault: true, budget: 0 },
  { id: '10', name: 'Investment', icon: '📈', color: '#f59e0b', type: 'income', isDefault: true, budget: 0 },
];

const iconOptions = [
  { icon: '🍔', name: 'Burger' },
  { icon: '🚗', name: 'Car' },
  { icon: '🛍️', name: 'Shopping' },
  { icon: '📄', name: 'Document' },
  { icon: '🎬', name: 'Movie' },
  { icon: '🏥', name: 'Hospital' },
  { icon: '📚', name: 'Books' },
  { icon: '💼', name: 'Briefcase' },
  { icon: '💻', name: 'Laptop' },
  { icon: '📈', name: 'Chart' },
  { icon: '🏠', name: 'House' },
  { icon: '⚡', name: 'Electricity' },
  { icon: '🎮', name: 'Gaming' },
  { icon: '☕', name: 'Coffee' },
  { icon: '🍕', name: 'Pizza' },
  { icon: '✈️', name: 'Airplane' },
  { icon: '🏋️', name: 'Gym' },
  { icon: '📱', name: 'Phone' },
  { icon: '💊', name: 'Medicine' },
  { icon: '🎓', name: 'Graduation' },
  { icon: '🐶', name: 'Pet' },
  { icon: '💇', name: 'Haircut' },
  { icon: '🎁', name: 'Gift' },
  { icon: '📦', name: 'Package' },
];

const colorOptions = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Green', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#059669' },
];

const Categories = ({ categories, setCategories, expenses }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showDefault, setShowDefault] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    iconName: 'Package',
    color: '#3b82f6',
    type: 'expense',
    budget: '',
    isDefault: false,
  });

  const [localCategories, setLocalCategories] = useState(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    if (setCategories) {
      setCategories(localCategories);
    }
    localStorage.setItem('categories', JSON.stringify(localCategories));
  }, [localCategories, setCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter category name');
      return;
    }

    const newCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      icon: formData.icon,
      iconName: formData.iconName,
      color: formData.color,
      type: formData.type,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      isDefault: editingCategory ? editingCategory.isDefault : false,
    };

    if (editingCategory) {
      setLocalCategories(localCategories.map(c => 
        c.id === editingCategory.id ? newCategory : c
      ));
      toast.success('Category updated successfully');
    } else {
      setLocalCategories([...localCategories, newCategory]);
      toast.success('Category added successfully');
    }

    setShowModal(false);
    setEditingCategory(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📦',
      iconName: 'Package',
      color: '#3b82f6',
      type: 'expense',
      budget: '',
      isDefault: false,
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '📦',
      iconName: category.iconName || 'Package',
      color: category.color || '#3b82f6',
      type: category.type || 'expense',
      budget: category.budget || '',
      isDefault: category.isDefault || false,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const category = localCategories.find(c => c.id === id);
    
    if (category?.isDefault) {
      toast.error('Default categories cannot be deleted');
      return;
    }

    // Check if category is being used in expenses
    const isUsed = expenses?.some(e => e.category === id || e.category === category?.name);
    
    if (isUsed) {
      toast.error('Cannot delete category that is in use');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      setLocalCategories(localCategories.filter(c => c.id !== id));
      toast.success('Category deleted');
    }
  };

  const filteredCategories = localCategories.filter(cat => {
    if (filterType === 'all') return true;
    if (filterType === 'default') return cat.isDefault;
    if (filterType === 'custom') return !cat.isDefault;
    return cat.type === filterType;
  });

  const getCategorySpending = (categoryId, categoryName) => {
    return expenses?.filter(e => 
      e.category === categoryId || e.category?.toLowerCase() === categoryName?.toLowerCase()
    ).reduce((sum, e) => sum + e.amount, 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {localCategories.length} categories total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', icon: '📊' },
          { id: 'expense', label: 'Expense', icon: '💸' },
          { id: 'income', label: 'Income', icon: '💰' },
          { id: 'default', label: 'Default', icon: '⭐' },
          { id: 'custom', label: 'Custom', icon: '✨' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id)}
            className={`px-4 py-2 rounded-xl capitalize transition-all flex items-center space-x-2 ${
              filterType === type.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {localCategories.filter(c => {
                if (type.id === 'all') return true;
                if (type.id === 'default') return c.isDefault;
                if (type.id === 'custom') return !c.isDefault;
                return c.type === type.id;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries, Rent, Salary"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Expense 💸</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span>Income 💰</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className="relative group"
                      title={color.name}
                    >
                      <div
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {iconOptions.map(item => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.icon, iconName: item.name })}
                      className="relative group"
                      title={item.name}
                    >
                      <div
                        className={`w-10 h-10 text-2xl rounded-lg border-2 flex items-center justify-center ${
                          formData.icon === item.icon
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Budget (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              )}

              {editingCategory?.isDefault && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    This is a default category. Some properties cannot be changed.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
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

      {/* Default Categories Section */}
      {filterType === 'all' && (
        <div className="premium-card p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="text-yellow-500 mr-2">⭐</span> Default Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {localCategories.filter(c => c.isDefault).map(category => (
              <div
                key={category.id}
                className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }}></span>
                    {category.color} Default
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const spending = getCategorySpending(category.id, category.name);
          const budgetProgress = category.budget > 0 ? (spending / category.budget) * 100 : 0;
          
          return (
            <div
              key={category.id}
              className="premium-card p-4 hover:shadow-xl transition-all relative overflow-hidden"
            >
              {category.isDefault && (
                <div className="absolute top-2 right-2 text-yellow-500" title="Default Category">
                  ⭐
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center"
                        style={{ backgroundColor: category.color + '20', color: category.color }}>
                        <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }}></span>
                        {category.iconName || category.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        category.type === 'expense' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {category.type}
                      </span>
                    </div>
                  </div>
                </div>
                {!category.isDefault && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {category.type === 'expense' && category.budget > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Spent / Budget</span>
                    <span className="font-medium">
                      ₹{spending} / ₹{category.budget}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(budgetProgress, 100)}%`,
                        backgroundColor: budgetProgress > 100 ? '#ef4444' : category.color
                      }}
                    />
                  </div>
                  {budgetProgress > 100 && (
                    <p className="text-xs text-red-600 mt-1">Budget exceeded by ₹{(spending - category.budget).toLocaleString()}!</p>
                  )}
                </div>
              )}

              {category.type === 'expense' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total spent: ₹{spending.toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="premium-card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
            <p className="text-xl font-bold text-blue-600">{localCategories.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expense Categories</p>
            <p className="text-xl font-bold text-red-600">
              {localCategories.filter(c => c.type === 'expense').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Income Categories</p>
            <p className="text-xl font-bold text-green-600">
              {localCategories.filter(c => c.type === 'income').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Default Categories</p>
            <p className="text-xl font-bold text-yellow-600">
              {localCategories.filter(c => c.isDefault).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;