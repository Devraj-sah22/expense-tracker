import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileSpreadsheet, FileJson, FileText, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToExcel, exportToPDF, exportToCSV } from '../utils/exportUtils';
import toast from 'react-hot-toast';

const ImportExport = ({ 
  data, 
  onImport, 
  moduleName, 
  fields, 
  templateData,
  fileName = 'data'
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle file import
  const handleFileImport = (event) => {
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
        setImportPreview(jsonData.slice(0, 5));
        setShowImportModal(true);
      } catch (error) {
        toast.error('Error reading file. Please make sure it\'s a valid Excel or CSV file.');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Process imported data
  const processImport = () => {
    if (!importData || importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    try {
      onImport(importData);
      toast.success(`Successfully imported ${importData.length} records to ${moduleName}`);
      setShowImportModal(false);
      setImportData(null);
      setImportPreview([]);
      document.getElementById(`file-import-${moduleName}`).value = '';
    } catch (error) {
      toast.error('Error processing imported data');
      console.error(error);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = templateData || [fields.reduce((acc, field) => {
      acc[field.label] = field.example || '';
      return acc;
    }, {})];
    
    exportToExcel(template, `${moduleName.toLowerCase()}_template`);
    toast.success('Template downloaded successfully');
    setShowExportDropdown(false); // Close dropdown after action
  };

  // Export data
  const handleExport = (format) => {
    if (!data || data.length === 0) {
      toast.error(`No ${moduleName} data to export`);
      setShowExportDropdown(false);
      return;
    }

    const exportData = data.map(item => {
      const row = {};
      fields.forEach(field => {
        if (field.value) {
          row[field.label] = field.value(item);
        } else if (field.key) {
          row[field.label] = item[field.key] || '';
        }
      });
      return row;
    });

    const filename = `${moduleName.toLowerCase()}_${fileName}_${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'excel':
          exportToExcel(exportData, filename);
          toast.success(`${moduleName} exported as Excel`);
          break;
        case 'pdf':
          exportToPDF(exportData, filename);
          toast.success(`${moduleName} exported as PDF`);
          break;
        case 'csv':
          exportToCSV(exportData, filename);
          toast.success(`${moduleName} exported as CSV`);
          break;
        default:
          toast.error('Invalid format selected');
      }
    } catch (error) {
      toast.error(`Error exporting ${moduleName}`);
      console.error(error);
    }
    setShowExportDropdown(false); // Close dropdown after action
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  return (
    <>
      {/* Import/Export Buttons */}
      <div className="flex items-center space-x-2">
        {/* Import Button */}
        <label className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer" title={`Import ${moduleName}`}>
          <Upload className="w-4 h-4" />
          <input
            id={`file-import-${moduleName}`}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileImport}
          />
        </label>

        {/* Export Dropdown - Fixed */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={toggleDropdown}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title={`Export ${moduleName}`}
          >
            <Download className="w-4 h-4" />
          </button>
          
          {/* Dropdown Menu - Now controlled by state */}
          {showExportDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2"
            >
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Export as
              </div>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>PDF Document</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileJson className="w-4 h-4 text-blue-600" />
                <span>CSV (Comma separated)</span>
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Templates
              </div>
              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <Download className="w-4 h-4 text-purple-600" />
                <span>Download Template</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import Preview Modal - Keep as is */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Import {moduleName}
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Found {importData?.length} records to import</p>
                <p>Please review the preview below. The data will be added to your existing {moduleName}.</p>
              </div>
            </div>

            {/* Preview Table */}
            {importPreview.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {Object.keys(importPreview[0] || {}).map(key => (
                        <th key={key} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, index) => (
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
                {importData.length > 5 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Showing 5 of {importData.length} records
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={processImport}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Import {importData?.length} Records
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExport;