import React, { useState } from 'react';
import { Download, Trash2, FileSpreadsheet, FileJson, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, exportToJSON } from '../../utils/exportUtils';

const YearDataManagement = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteOptions, setDeleteOptions] = useState({
    expenses: true,
    income: false,
    bank: false,
    lend: false,
    loan: false,
    saving: false,
    forMe: true,
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

  const handleExport = (format) => {
    // Mock data - In production, filter by selectedYear
    const data = {
      year: selectedYear,
      expenses: [],
      income: [],
      banks: [],
      lends: [],
      loans: [],
      savings: [],
    };

    if (format === 'excel') {
      exportToExcel(data, `financial_data_${selectedYear}`);
      toast.success(`Data for ${selectedYear} exported as Excel`);
    } else if (format === 'json') {
      exportToJSON(data, `financial_data_${selectedYear}`);
      toast.success(`Data for ${selectedYear} exported as JSON`);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      toast.error('Please confirm deletion by checking the confirmation box');
      return;
    }

    const selectedPages = Object.entries(deleteOptions)
      .filter(([_, selected]) => selected)
      .map(([page]) => page);

    if (selectedPages.length === 0) {
      toast.error('Select at least one page to delete');
      return;
    }

    // In production, delete actual data
    toast.success(`Deleted ${selectedPages.join(', ')} data for ${selectedYear}`);
    setConfirmDelete(false);
  };

  const toggleAll = () => {
    const allSelected = Object.values(deleteOptions).every(v => v);
    const newState = {};
    Object.keys(deleteOptions).forEach(key => {
      newState[key] = !allSelected;
    });
    setDeleteOptions(newState);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Year Data Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Export or permanently delete your data for <span className="font-bold text-blue-600">{selectedYear}</span>.
          Deletions respect the selected year and cannot be undone.
        </p>
      </div>

      {/* Year Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleExport('excel')}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <FileSpreadsheet className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export {selectedYear} as Excel</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Download all data in Excel format</p>
        </button>

        <button
          onClick={() => handleExport('json')}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
        >
          <FileJson className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export {selectedYear} as JSON</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Download for backup or migration</p>
        </button>
      </div>

      {/* Delete Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-red-600 dark:text-red-400 mb-4 flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          DELETE DATA
        </h4>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select which data to delete for <span className="font-bold">{selectedYear}</span>:
          </p>

          {/* Select All */}
          <button
            onClick={toggleAll}
            className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            {Object.values(deleteOptions).every(v => v) ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All Pages</span>
          </button>

          {/* Delete Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(deleteOptions).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setDeleteOptions({ ...deleteOptions, [key]: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{key}</span>
              </label>
            ))}
          </div>

          {/* Confirm Delete */}
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                className="w-4 h-4 mt-1 text-red-600 rounded"
              />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  I understand that this action cannot be undone
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  All selected data for {selectedYear} will be permanently deleted
                </p>
              </div>
            </label>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={!confirmDelete}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete All {selectedYear} Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default YearDataManagement;