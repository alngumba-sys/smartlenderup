import { X, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface UploadExpensesModalProps {
  onClose: () => void;
}

export function UploadExpensesModal({ onClose }: UploadExpensesModalProps) {
  const { isDark } = useTheme();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ['Date', 'Payee Name', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference Number'];
    const sampleRow = ['2024-12-15', 'ABC Suppliers', 'Office Supplies', 'Office stationery purchase', '15000', 'M-Pesa', 'REF-001'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'dark' : ''}`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="size-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl text-gray-900 dark:text-white">Upload Expenses - CSV File</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="size-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm text-blue-900 dark:text-blue-200 mb-2">Upload Instructions</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Download the CSV template below</li>
                  <li>Fill in your expense data following the template format</li>
                  <li>Upload the completed CSV file</li>
                  <li>Required columns: Date, Payee Name, Category, Description, Amount, Payment Method, Reference Number</li>
                  <li>Date format: YYYY-MM-DD (e.g., 2024-12-15)</li>
                  <li>Amount: Numbers only, no currency symbols</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="mb-6">
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Download className="size-5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Upload CSV File</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="size-12 text-gray-400 mx-auto mb-3" />
                {file ? (
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">File selected:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Click to browse or drag and drop your CSV file here
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Supported format: .csv (Max size: 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Sample Data Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-3">CSV Format Example:</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Payee Name</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Description</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Payment Method</th>
                    <th className="text-left p-2 text-gray-600 dark:text-gray-400">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="p-2 text-gray-900 dark:text-white">2024-12-15</td>
                    <td className="p-2 text-gray-900 dark:text-white">ABC Suppliers</td>
                    <td className="p-2 text-gray-900 dark:text-white">Office Supplies</td>
                    <td className="p-2 text-gray-900 dark:text-white">Stationery</td>
                    <td className="p-2 text-gray-900 dark:text-white">15000</td>
                    <td className="p-2 text-gray-900 dark:text-white">M-Pesa</td>
                    <td className="p-2 text-gray-900 dark:text-white">REF-001</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              disabled={!file}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                file 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Upload className="size-4" />
              Upload & Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
