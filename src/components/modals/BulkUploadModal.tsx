import { X, Upload, FileText, Download, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface BulkUploadModalProps {
  type?: 'loans' | 'repayments';
  isOpen?: boolean;
  onClose: () => void;
}

export function BulkUploadModal({ type = 'loans', isOpen = true, onClose }: BulkUploadModalProps) {
  const { isDark } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    // Simulate upload and validation
    setTimeout(() => {
      // Mock validation results
      const mockResults = {
        total: 15,
        successful: 12,
        failed: 3,
        errors: [
          { row: 3, error: 'Invalid client ID: CL999 not found' },
          { row: 7, error: 'Amount exceeds product maximum limit' },
          { row: 11, error: 'Missing required field: National ID' }
        ],
        warnings: [
          { row: 5, warning: 'Client already has an active loan' },
          { row: 9, warning: 'Duplicate phone number detected' }
        ]
      };

      setUploadResult(mockResults);
      setUploading(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    // In production, this would download an actual CSV template
    const template = type === 'loans'
      ? 'Client ID,Product ID,Amount,Disbursement Date,Tenor Months,Loan Officer\\nCL001,PROD-001,50000,2025-01-15,6,Victor Muthama'
      : 'Loan ID,Amount,Payment Date,Payment Method,Transaction ID\\nABC-L00001,5000,2025-01-15,M-Pesa,PXY123456';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Upload className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">
                Bulk Upload {type === 'loans' ? 'Loans' : 'Repayments'}
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="mb-2">
                  <strong>Instructions for Bulk Upload</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Download the CSV template below</li>
                  <li>Fill in the template with your data (do not modify column headers)</li>
                  <li>Save the file and upload it here</li>
                  <li>Review validation results and fix any errors</li>
                  <li>Confirm to process successful records</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="w-full px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400"
            >
              <Download className="size-5" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-2">
              Upload CSV File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="size-8 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    CSV files only (Max 5MB)
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              {!file && (
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm cursor-pointer inline-block"
                >
                  Choose File
                </label>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {uploadResult && (
            <div className="mb-6 space-y-4">
              <h4 className="text-gray-900">Validation Results</h4>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl text-gray-900">{uploadResult.total}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <p className="text-xs text-emerald-600 mb-1">Successful</p>
                  <p className="text-2xl text-emerald-900">{uploadResult.successful}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-xs text-red-600 mb-1">Failed</p>
                  <p className="text-2xl text-red-900">{uploadResult.failed}</p>
                </div>
              </div>

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="size-5 text-red-600" />
                    <h5 className="text-red-900">Errors ({uploadResult.errors.length})</h5>
                  </div>
                  <div className="space-y-1">
                    {uploadResult.errors.map((err: any, idx: number) => (
                      <p key={idx} className="text-sm text-red-800">
                        Row {err.row}: {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {uploadResult.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="size-5 text-amber-600" />
                    <h5 className="text-amber-900">Warnings ({uploadResult.warnings.length})</h5>
                  </div>
                  <div className="space-y-1">
                    {uploadResult.warnings.map((warn: any, idx: number) => (
                      <p key={idx} className="text-sm text-amber-800">
                        Row {warn.row}: {warn.warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadResult.failed === 0 && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-600" />
                  <p className="text-sm text-emerald-900">
                    All records validated successfully! Click "Process Upload" to continue.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Field Mapping Guide */}
          {type === 'loans' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-gray-900 mb-3">Required Fields for Loans</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">• Client ID (e.g., CL001)</p>
                  <p className="text-gray-600">• Product ID (e.g., PROD-001)</p>
                  <p className="text-gray-600">• Amount (number)</p>
                </div>
                <div>
                  <p className="text-gray-600">• Disbursement Date (YYYY-MM-DD)</p>
                  <p className="text-gray-600">• Tenor Months (number)</p>
                  <p className="text-gray-600">• Loan Officer (name)</p>
                </div>
              </div>
            </div>
          )}

          {type === 'repayments' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-gray-900 mb-3">Required Fields for Repayments</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">• Loan ID (e.g., ABC-L00001)</p>
                  <p className="text-gray-600">• Amount (number)</p>
                  <p className="text-gray-600">• Payment Date (YYYY-MM-DD)</p>
                </div>
                <div>
                  <p className="text-gray-600">• Payment Method (M-Pesa/Cash/Bank)</p>
                  <p className="text-gray-600">• Transaction ID (optional)</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {!uploadResult ? (
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Validate File
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log('Processing bulk upload...');
                  onClose();
                }}
                disabled={uploadResult.failed > 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Process Upload ({uploadResult.successful} records)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}