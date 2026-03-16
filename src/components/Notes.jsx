import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Pin, Tag, Calendar, Search, X, Bell, Star, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Notes = ({ notes, setNotes }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal',
    isPinned: false,
    reminder: '',
    color: 'blue',
    tags: '',
  });

  const categories = [
    { id: 'personal', name: 'Personal', icon: '👤', color: 'blue' },
    { id: 'financial', name: 'Financial', icon: '💰', color: 'green' },
    { id: 'idea', name: 'Ideas', icon: '💡', color: 'yellow' },
    { id: 'reminder', name: 'Reminders', icon: '⏰', color: 'orange' },
    { id: 'goal', name: 'Goals', icon: '🎯', color: 'purple' },
  ];

  const colors = [
    { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
    { id: 'green', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
    { id: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
    { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
    { id: 'pink', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300' },
  ];

  const [localNotes, setLocalNotes] = useState(() => {
    if (notes && notes.length > 0) {
      return notes;
    }
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Welcome to Notes',
        content: 'Use this space to jot down important financial reminders, goals, or ideas.',
        category: 'personal',
        isPinned: true,
        color: 'blue',
        tags: ['welcome', 'guide'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Monthly Budget Review',
        content: 'Remember to review your monthly budget on the last day of each month.',
        category: 'financial',
        isPinned: false,
        color: 'green',
        tags: ['budget', 'reminder'],
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    if (setNotes) {
      setNotes(localNotes);
    }
    localStorage.setItem('notes', JSON.stringify(localNotes));
  }, [localNotes, setNotes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in required fields');
      return;
    }

    const newNote = {
      id: editingNote?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      isPinned: formData.isPinned,
      color: formData.color,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      reminder: formData.reminder || null,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingNote) {
      setLocalNotes(localNotes.map(n => n.id === editingNote.id ? newNote : n));
      toast.success('Note updated successfully');
    } else {
      setLocalNotes([newNote, ...localNotes]);
      toast.success('Note added successfully');
    }

    setShowModal(false);
    setEditingNote(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'personal',
      isPinned: false,
      reminder: '',
      color: 'blue',
      tags: '',
    });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'personal',
      isPinned: note.isPinned || false,
      reminder: note.reminder ? note.reminder.split('T')[0] : '',
      color: note.color || 'blue',
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : note.tags || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setLocalNotes(localNotes.filter(n => n.id !== id));
      toast.success('Note deleted');
    }
  };

  const togglePin = (id) => {
    setLocalNotes(localNotes.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    ));
    toast.success('Note pin toggled');
  };

  const filteredNotes = localNotes
    .filter(note => {
      if (searchTerm) {
        return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (Array.isArray(note.tags) && note.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      }
      return true;
    })
    .sort((a, b) => {
      if (filter === 'pinned') {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {localNotes.length} total notes • {pinnedNotes.length} pinned
          </p>
        </div>
        <button
          onClick={() => {
            setEditingNote(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search notes by title, content, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'All Notes', icon: '📝' },
          { id: 'pinned', label: 'Pinned', icon: '📌' },
          { id: 'recent', label: 'Recent', icon: '🕒' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`px-4 py-2 rounded-xl capitalize transition-all flex items-center space-x-2 ${
              filter === type.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="4"
                  placeholder="Write your note here..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color Theme
                  </label>
                  <div className="flex space-x-2">
                    {colors.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        className={`w-8 h-8 rounded-full ${
                          formData.color === color.id ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                        }`}
                        style={{ backgroundColor: color.id === 'blue' ? '#3b82f6' : 
                                                color.id === 'green' ? '#10b981' :
                                                color.id === 'yellow' ? '#f59e0b' :
                                                color.id === 'purple' ? '#8b5cf6' : '#ec4899' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., important, idea, todo"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bell className="w-4 h-4 inline mr-2" />
                    Reminder (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pin this note
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                >
                  {editingNote ? 'Update' : 'Save'} Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNote(null);
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

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Pin className="w-5 h-5 mr-2 text-purple-500" />
            Pinned Notes ({pinnedNotes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map(note => {
              const colorTheme = colors.find(c => c.id === note.color) || colors[0];
              const category = categories.find(c => c.id === note.category) || categories[0];
              
              return (
                <div
                  key={note.id}
                  className={`premium-card p-4 ${colorTheme.bg} border-l-4 ${colorTheme.border} hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Pin className="w-4 h-4 text-purple-500 fill-current" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => togglePin(note.id)}
                        className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                        title="Unpin"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                    {note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(note.tags) && note.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{category.icon} {category.name}</span>
                      {note.reminder && (
                        <span className="flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          {format(new Date(note.reminder), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            All Notes ({otherNotes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map(note => {
              const colorTheme = colors.find(c => c.id === note.color) || colors[0];
              const category = categories.find(c => c.id === note.category) || categories[0];
              
              return (
                <div
                  key={note.id}
                  className={`premium-card p-4 ${colorTheme.bg} hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => togglePin(note.id)}
                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                        title="Pin note"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                    {note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(note.tags) && note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{category.icon} {category.name}</span>
                      {note.reminder && (
                        <span className="flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          {format(new Date(note.reminder), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredNotes.length === 0 && (
        <div className="premium-card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notes found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Create your first note to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notes;