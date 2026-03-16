import React, { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, FileJson, Calendar, Filter, AlertCircle } from 'lucide-react';
import { exportToExcel, exportToPDF, exportToCSV } from '../utils/exportUtils';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const ExportData = ({ expenses, income, wallets, savingsGoals, setExpenses, setIncome }) => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [exportType, setExportType] = useState('all');
  const [format, setFormat] = useState('excel');
  const [importData, setImportData] = useState(null);
  const [showImportPreview, setShowImportPreview] = useState(false);

  const filterByDateRange = (data) => {
    if (!dateRange.start && !dateRange.end) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  const prepareData = () => {
    let data = [];

    switch (exportType) {
      case 'expenses':
        data = filterByDateRange(expenses).map(e => ({
          Date: new Date(e.date).toLocaleDateString(),
          Category: e.category,
          Description: e.description || '',
          Amount: e.amount,
          'Payment Method': e.paymentMethod,
          Wallet: wallets.find(w => w.id === e.walletId)?.name || '',
        }));
        break;

      case 'income':
        data = filterByDateRange(income).map(i => ({
          Date: new Date(i.date).toLocaleDateString(),
          Source: i.source,
          Description: i.description || '',
          Amount: i.amount,
          Recurring: i.isRecurring ? 'Yes' : 'No',
        }));
        break;

      case 'wallets':
        data = wallets.map(w => ({
          Name: w.name,
          Type: w.type,
          Balance: w.balance,
          Icon: w.icon,
        }));
        break;

      case 'goals':
        data = savingsGoals.map(g => ({
          Name: g.name,
          'Target Amount': g.target,
          'Saved Amount': g.saved,
          Progress: `${g.progress?.toFixed(1)}%`,
          Deadline: g.deadline ? new Date(g.deadline).toLocaleDateString() : 'No deadline',
        }));
        break;

      case 'all':
      default:
        // Combine all data with type identifiers
        data = [
          ...expenses.map(e => ({
            Type: 'Expense',
            Date: new Date(e.date).toLocaleDateString(),
            Category: e.category,
            Description: e.description || '',
            Amount: -e.amount,
            'Payment Method': e.paymentMethod,
          })),
          ...income.map(i => ({
            Type: 'Income',
            Date: new Date(i.date).toLocaleDateString(),
            Category: i.source,
            Description: i.description || '',
            Amount: i.amount,
            'Payment Method': '-',
          })),
        ].sort((a, b) => new Date(b.Date) - new Date(a.Date));
        break;
    }

    return data;
  };

  const handleExport = () => {
    const data = prepareData();
    
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const filename = `${exportType}_${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'excel':
          exportToExcel(data, filename);
          toast.success('Excel file downloaded successfully');
          break;
        case 'pdf':
          exportToPDF(data, filename);
          toast.success('PDF file downloaded successfully');
          break;
        case 'csv':
          exportToCSV(data, filename);
          toast.success('CSV file downloaded successfully');
          break;
        default:
          toast.error('Invalid format selected');
      }
    } catch (error) {
      toast.error('Error exporting data');
      console.error(error);
    }
  };

  // NEW: Import functionality
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setImportData(jsonData);
        setShowImportPreview(true);
      } catch (error) {
        toast.error('Error reading file. Please make sure it\'s a valid Excel or CSV file.');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const processImportedData = () => {
    if (!importData || importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    try {
      const newExpenses = [];
      const newIncome = [];

      importData.forEach((row, index) => {
        // Try to detect if it's an expense or income record
        const type = (row.Type || row.type || '').toLowerCase();
        const amount = parseFloat(row.Amount || row.amount || 0);
        const date = row.Date || row.date || new Date().toISOString().split('T')[0];
        const category = row.Category || row.category || 'other';
        const description = row.Description || row.description || '';
        const paymentMethod = row['Payment Method'] || row.paymentMethod || 'cash';
        const source = row.Source || row.source || category;

        if (type.includes('expense') || amount < 0) {
          // It's an expense
          newExpenses.push({
            id: Date.now() + index,
            amount: Math.abs(amount),
            category: category.toLowerCase(),
            date: new Date(date).toISOString(),
            description,
            paymentMethod: paymentMethod.toLowerCase(),
            walletId: wallets[0]?.id || '1', // Default to first wallet
          });
        } else if (type.includes('income') || amount > 0) {
          // It's an income
          newIncome.push({
            id: Date.now() + index,
            amount: Math.abs(amount),
            source: source.toLowerCase(),
            date: new Date(date).toISOString(),
            description,
            isRecurring: false,
          });
        }
      });

      // Update state
      if (newExpenses.length > 0) {
        setExpenses([...newExpenses, ...expenses]);
      }
      if (newIncome.length > 0) {
        setIncome([...newIncome, ...income]);
      }

      toast.success(`Successfully imported ${newExpenses.length} expenses and ${newIncome.length} income records!`);
      setShowImportPreview(false);
      setImportData(null);
      
      // Clear the file input
      document.getElementById('file-import').value = '';
    } catch (error) {
      toast.error('Error processing imported data');
      console.error(error);
    }
  };

  // Download template for import
  const downloadTemplate = () => {
    const template = [
      {
        Type: 'Expense',
        Date: new Date().toLocaleDateString(),
        Category: 'Food',
        Description: 'Lunch',
        Amount: 250,
        'Payment Method': 'cash'
      },
      {
        Type: 'Expense',
        Date: new Date().toLocaleDateString(),
        Category: 'Travel',
        Description: 'Uber',
        Amount: 350,
        'Payment Method': 'upi'
      },
      {
        Type: 'Income',
        Date: new Date().toLocaleDateString(),
        Source: 'Salary',
        Description: 'Monthly salary',
        Amount: 50000,
        'Payment Method': 'bank'
      },
      {
        Type: 'Income',
        Date: new Date().toLocaleDateString(),
        Source: 'Freelance',
        Description: 'Website project',
        Amount: 10000,
        'Payment Method': 'upi'
      }
    ];

    exportToExcel(template, 'import_template');
    toast.success('Template downloaded successfully');
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{netBalance.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {expenses.length + income.length}
          </p>
        </div>
      </div>

      {/* Import Section */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import Data
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Excel/CSV File
              </label>
              <input
                id="file-import"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFile}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: .xlsx, .xls, .csv
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* Import Preview Modal */}
          {showImportPreview && importData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="premium-card p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Preview Import Data
                </h3>
                
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Found {importData.length} records to import</p>
                    <p>Please review the data below. The system will automatically detect expense and income records.</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {Object.keys(importData[0] || {}).map(key => (
                          <th key={key} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-4 py-2 text-gray-900 dark:text-white">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 10 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Showing 10 of {importData.length} records
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={processImportedData}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Import {importData.length} Records
                  </button>
                  <button
                    onClick={() => {
                      setShowImportPreview(false);
                      setImportData(null);
                      document.getElementById('file-import').value = '';
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Options
        </h3>

        <div className="space-y-6">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Select Data to Export
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'all', label: 'All Data', icon: '📊' },
                { id: 'expenses', label: 'Expenses', icon: '💸' },
                { id: 'income', label: 'Income', icon: '💰' },
                { id: 'wallets', label: 'Wallets', icon: '👛' },
                { id: 'goals', label: 'Savings Goals', icon: '🎯' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setExportType(option.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${exportType === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl block mb-2">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  placeholder="Start Date"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Export Format
            </label>
            <div className="flex space-x-4">
              {[
                { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-5 h-5" />, color: 'green' },
                { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" />, color: 'red' },
                { id: 'csv', label: 'CSV', icon: <FileJson className="w-5 h-5" />, color: 'blue' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setFormat(option.id)}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all
                    ${format === option.id
                      ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview ({prepareData().length} records)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {prepareData().length > 0 && Object.keys(prepareData()[0]).map(key => (
                  <th key={key} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prepareData().slice(0, 5).map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-2 text-gray-900 dark:text-white">
                      {typeof value === 'number' && !value.toString().includes('/') 
                        ? `₹${value.toLocaleString()}` 
                        : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {prepareData().length > 5 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Showing 5 of {prepareData().length} records
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportData;