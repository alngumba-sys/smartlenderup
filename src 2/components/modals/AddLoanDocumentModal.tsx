import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';

interface AddLoanDocumentModalProps {
  onClose: () => void;
  loanId: string;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

export function AddLoanDocumentModal({ onClose, loanId }: AddLoanDocumentModalProps) {
  const { isDark } = useTheme();
  const { addLoanDocument } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    type: 'ID Copy',
    fileName: '',
    fileSize: 0,
    file: null as File | null,
    expiryDate: '',
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 3MB limit. Current size: ${formatFileSize(file.size)}`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `File type not allowed. Accepted formats: PDF, JPG, PNG, DOC, DOCX`;
    }

    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      return `Invalid file type. Accepted formats: PDF, JPG, PNG, DOC, DOCX`;
    }

    return null;
  };

  const handleFileChange = (file: File) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setFormData({
      ...formData,
      file,
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    // In a real app, you would upload the file to a server/storage
    // For now, we'll just create a document record
    const newDocument = {
      id: `DOC${Date.now()}`,
      loanId: loanId,
      type: formData.type,
      fileName: formData.fileName,
      fileSize: formatFileSize(formData.fileSize),
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Loan Officer', // Would come from auth context in real app
      status: 'Pending',
      expiryDate: formData.expiryDate || undefined,
    };

    addLoanDocument(newDocument);
    toast.success(`Document "${formData.fileName}" uploaded successfully`);
    console.log('Uploading document:', newDocument);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="size-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-gray-900 dark:text-white">Upload Loan Document</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm bg-[#111120] text-white"
                required
              >
                <option value="ID Copy">ID Copy</option>
                <option value="KRA Pin">KRA Pin Certificate</option>
                <option value="Passport Photo">Passport Photo</option>
                <option value="Bank Statement">Bank Statement</option>
                <option value="Payslip">Payslip</option>
                <option value="Business Permit">Business Permit</option>
                <option value="Title Deed">Title Deed</option>
                <option value="Logbook">Vehicle Logbook</option>
                <option value="Insurance Certificate">Insurance Certificate</option>
                <option value="Guarantor Form">Guarantor Form</option>
                <option value="Loan Agreement">Loan Agreement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Select File <span className="text-red-500">*</span>
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : error
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
              >
                <Upload className={`size-12 mx-auto mb-3 ${
                  error ? 'text-red-400' : 'text-gray-400'
                }`} />
                
                {formData.file ? (
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400 mb-1">
                      ✓ {formData.fileName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatFileSize(formData.fileSize)}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      Accepted: PDF, JPG, PNG, DOC, DOCX
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Maximum file size: 3MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="size-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Expiry Date (for documents that expire) */}
            {['ID Copy', 'KRA Pin', 'Business Permit', 'Insurance Certificate', 'Logbook'].includes(formData.type) && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Expiry Date (if applicable)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm bg-[#111120] text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* File Size Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <p className="mb-1">
                    <strong>File Upload Guidelines:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Maximum file size: <strong>3MB</strong></li>
                    <li>Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                    <li>Ensure documents are clear and readable</li>
                    <li>For scanned documents, use at least 300 DPI</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.file || !!error}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}