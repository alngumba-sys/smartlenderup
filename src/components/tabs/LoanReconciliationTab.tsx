import { useState } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle, XCircle, Filter, Search, Plus, Trash2, Settings, Eye, MessageSquare, Calendar, User, ChevronDown, ChevronUp, X } from 'lucide-react';
import { loans, clients } from '../../data/dummyData';
import { useTheme } from '../../contexts/ThemeContext';

interface ReconciliationField {
  id: string;
  label: string;
  platformKey: string;
  bankKey: string;
  enabled: boolean;
  type: 'text' | 'number' | 'date' | 'currency';
}

interface BankRecord {
  loanId: string;
  clientName: string;
  clientId: string;
  principalAmount: number;
  disbursementDate: string;
  outstandingBalance: number;
  status: string;
  interestRate?: number;
  term?: number;
  [key: string]: any;
}

interface ReconciliationResult {
  loanId: string;
  status: 'matched' | 'discrepancy' | 'missing-platform' | 'missing-bank';
  discrepancies: {
    field: string;
    platformValue: any;
    bankValue: any;
  }[];
  notes?: string;
}

interface ReconciliationSession {
  id: string;
  date: string;
  performedBy: string;
  recordsProcessed: number;
  matched: number;
  discrepancies: number;
  missingInPlatform: number;
  missingInBank: number;
  status: 'completed' | 'in-progress' | 'failed';
}

export function LoanReconciliationTab() {
  const { isDark } = useTheme();
  const [view, setView] = useState<'upload' | 'reconcile' | 'history'>('upload');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file');
  const [bankRecords, setBankRecords] = useState<BankRecord[]>([]);
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedResult, setSelectedResult] = useState<ReconciliationResult | null>(null);
  const [noteText, setNoteText] = useState('');
  
  const [reconciliationFields, setReconciliationFields] = useState<ReconciliationField[]>([
    { id: 'loanId', label: 'Loan ID', platformKey: 'id', bankKey: 'loanId', enabled: true, type: 'text' },
    { id: 'clientName', label: 'Client Name', platformKey: 'clientName', bankKey: 'clientName', enabled: true, type: 'text' },
    { id: 'clientId', label: 'Client ID', platformKey: 'clientId', bankKey: 'clientId', enabled: true, type: 'text' },
    { id: 'principalAmount', label: 'Principal Amount', platformKey: 'principalAmount', bankKey: 'principalAmount', enabled: true, type: 'currency' },
    { id: 'disbursementDate', label: 'Disbursement Date', platformKey: 'disbursementDate', bankKey: 'disbursementDate', enabled: true, type: 'date' },
    { id: 'outstandingBalance', label: 'Outstanding Balance', platformKey: 'outstandingBalance', bankKey: 'outstandingBalance', enabled: true, type: 'currency' },
    { id: 'status', label: 'Loan Status', platformKey: 'status', bankKey: 'status', enabled: true, type: 'text' },
  ]);

  // Mock reconciliation history
  const reconciliationHistory: ReconciliationSession[] = [];

  // Sample bank data for demonstration
  const sampleBankData: BankRecord[] = [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate file parsing
      setTimeout(() => {
        setBankRecords(sampleBankData);
        alert(`File "${file.name}" uploaded successfully. ${sampleBankData.length} records loaded.`);
      }, 1000);
    }
  };

  const handleLoadSampleData = () => {
    setBankRecords(sampleBankData);
    alert(`${sampleBankData.length} sample bank records loaded successfully.`);
  };

  const performReconciliation = () => {
    const results: ReconciliationResult[] = [];
    const enabledFields = reconciliationFields.filter(f => f.enabled);
    
    // Get platform loans with client names
    const platformLoans = loans.map(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      return {
        ...loan,
        clientName: client?.name || 'Unknown'
      };
    });

    // Check each bank record
    bankRecords.forEach(bankRecord => {
      const platformLoan = platformLoans.find(pl => pl.id === bankRecord.loanId);
      
      if (!platformLoan) {
        // Missing in platform
        results.push({
          loanId: bankRecord.loanId,
          status: 'missing-platform',
          discrepancies: []
        });
      } else {
        // Check for discrepancies
        const discrepancies: any[] = [];
        
        enabledFields.forEach(field => {
          let platformValue = (platformLoan as any)[field.platformKey];
          let bankValue = bankRecord[field.bankKey];
          
          // Normalize values for comparison
          if (field.type === 'currency' || field.type === 'number') {
            platformValue = Number(platformValue);
            bankValue = Number(bankValue);
          }
          
          if (field.type === 'text') {
            platformValue = String(platformValue).toLowerCase().trim();
            bankValue = String(bankValue).toLowerCase().trim();
          }
          
          if (platformValue !== bankValue) {
            discrepancies.push({
              field: field.label,
              platformValue: (platformLoan as any)[field.platformKey],
              bankValue: bankRecord[field.bankKey]
            });
          }
        });
        
        results.push({
          loanId: bankRecord.loanId,
          status: discrepancies.length > 0 ? 'discrepancy' : 'matched',
          discrepancies
        });
      }
    });
    
    // Check for loans in platform but not in bank records
    platformLoans.forEach(platformLoan => {
      const inBank = bankRecords.find(br => br.loanId === platformLoan.id);
      if (!inBank) {
        results.push({
          loanId: platformLoan.id,
          status: 'missing-bank',
          discrepancies: []
        });
      }
    });
    
    setReconciliationResults(results);
    setView('reconcile');
  };

  const toggleFieldEnabled = (fieldId: string) => {
    setReconciliationFields(fields =>
      fields.map(f => f.id === fieldId ? { ...f, enabled: !f.enabled } : f)
    );
  };

  const addCustomField = () => {
    const newField: ReconciliationField = {
      id: `custom-${Date.now()}`,
      label: 'New Field',
      platformKey: '',
      bankKey: '',
      enabled: true,
      type: 'text'
    };
    setReconciliationFields([...reconciliationFields, newField]);
  };

  const removeField = (fieldId: string) => {
    setReconciliationFields(fields => fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<ReconciliationField>) => {
    setReconciliationFields(fields =>
      fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    );
  };

  const toggleRowExpanded = (loanId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(loanId)) {
      newExpanded.delete(loanId);
    } else {
      newExpanded.add(loanId);
    }
    setExpandedRows(newExpanded);
  };

  const saveNote = () => {
    if (selectedResult && noteText.trim()) {
      setReconciliationResults(results =>
        results.map(r =>
          r.loanId === selectedResult.loanId
            ? { ...r, notes: noteText }
            : r
        )
      );
      setSelectedResult(null);
      setNoteText('');
    }
  };

  const exportToExcel = () => {
    alert('Exporting reconciliation report to Excel...');
  };

  const exportToPDF = () => {
    alert('Exporting reconciliation report to PDF...');
  };

  // Filter and search results
  const filteredResults = reconciliationResults.filter(result => {
    if (filterStatus !== 'all' && result.status !== filterStatus) return false;
    if (searchTerm && !result.loanId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const summary = {
    total: reconciliationResults.length,
    matched: reconciliationResults.filter(r => r.status === 'matched').length,
    discrepancies: reconciliationResults.filter(r => r.status === 'discrepancy').length,
    missingPlatform: reconciliationResults.filter(r => r.status === 'missing-platform').length,
    missingBank: reconciliationResults.filter(r => r.status === 'missing-bank').length
  };

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Loan Reconciliation</h2>
        <p className="text-gray-600">Reconcile platform loans with bank records</p>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setView('upload')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            view === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="size-4" />
            Upload Bank Data
          </div>
        </button>
        <button
          onClick={() => setView('reconcile')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            view === 'reconcile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            Reconciliation Results
            {reconciliationResults.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {reconciliationResults.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            view === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            History
          </div>
        </button>
      </div>

      {/* Upload View */}
      {view === 'upload' && (
        <div className="space-y-6">
          {/* Upload Method Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Select Upload Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setUploadMethod('file')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  uploadMethod === 'file'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className="size-8 mx-auto mb-3 text-blue-600" />
                <h4 className="text-gray-900 mb-1">File Upload</h4>
                <p className="text-gray-600 text-sm">Upload CSV, Excel, or PDF</p>
              </button>
              <button
                onClick={() => setUploadMethod('manual')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  uploadMethod === 'manual'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="size-8 mx-auto mb-3 text-blue-600" />
                <h4 className="text-gray-900 mb-1">Manual Entry</h4>
                <p className="text-gray-600 text-sm">Enter records manually</p>
              </button>
            </div>

            {/* File Upload Section */}
            {uploadMethod === 'file' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="size-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-900 mb-2">Drop your file here or click to browse</p>
                  <p className="text-gray-600 text-sm mb-4">Supports CSV, Excel (.xlsx, .xls), and PDF files</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <p className="text-gray-900 mt-4">Selected: {selectedFile.name}</p>
                  )}
                </div>

                {/* Sample Data Button */}
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                
                <button
                  onClick={handleLoadSampleData}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Load Sample Bank Data (for demo)
                </button>
              </div>
            )}

            {/* Manual Entry Section */}
            {uploadMethod === 'manual' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 text-sm mb-1">Manual Entry Mode</p>
                      <p className="text-gray-600 text-sm">
                        Enter bank records one by one. All enabled reconciliation fields will be required.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {reconciliationFields.filter(f => f.enabled).map(field => (
                    <div key={field.id}>
                      <label className="text-gray-700 text-sm mb-1 block">{field.label}</label>
                      <input
                        type={field.type === 'date' ? 'date' : 'text'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Record
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Clear Form
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bank Records Preview */}
          {bankRecords.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900">Bank Records Loaded</h3>
                  <p className="text-gray-600 text-sm">{bankRecords.length} records ready for reconciliation</p>
                </div>
                <button
                  onClick={() => setBankRecords([])}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="size-4" />
                  Clear All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 text-sm">Loan ID</th>
                      <th className="text-left py-3 px-4 text-gray-600 text-sm">Client Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 text-sm">Client ID</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm">Principal</th>
                      <th className="text-left py-3 px-4 text-gray-600 text-sm">Disbursement</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm">Outstanding</th>
                      <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankRecords.slice(0, 5).map((record, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{record.loanId}</td>
                        <td className="py-3 px-4 text-gray-900">{record.clientName}</td>
                        <td className="py-3 px-4 text-gray-900">{record.clientId}</td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          KES {record.principalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{record.disbursementDate}</td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          KES {record.outstandingBalance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            record.status === 'Paid Off' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bankRecords.length > 5 && (
                  <p className="text-gray-600 text-sm text-center py-3">
                    ... and {bankRecords.length - 5} more records
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Field Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-900">Field Configuration</h3>
                <p className="text-gray-600 text-sm">Select fields to compare during reconciliation</p>
              </div>
              <button
                onClick={() => setShowFieldConfig(!showFieldConfig)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="size-4" />
                {showFieldConfig ? 'Hide' : 'Configure Fields'}
              </button>
            </div>

            {showFieldConfig && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {reconciliationFields.map(field => (
                    <div
                      key={field.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={() => toggleFieldEnabled(field.id)}
                        className="size-4 text-blue-600"
                      />
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Field Label"
                        />
                        <input
                          type="text"
                          value={field.platformKey}
                          onChange={(e) => updateField(field.id, { platformKey: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Platform Key"
                        />
                        <input
                          type="text"
                          value={field.bankKey}
                          onChange={(e) => updateField(field.id, { bankKey: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Bank Key"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      {!['loanId', 'clientName', 'clientId'].includes(field.id) && (
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCustomField}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Custom Field
                </button>
              </div>
            )}
          </div>

          {/* Reconcile Button */}
          {bankRecords.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={performReconciliation}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg"
              >
                <CheckCircle className="size-5" />
                Start Reconciliation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reconciliation Results View */}
      {view === 'reconcile' && (
        <div className="space-y-6">
          {reconciliationResults.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <Eye className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-900 mb-2">No Reconciliation Results Yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload bank data and run a reconciliation to see results here
                </p>
                <button
                  onClick={() => setView('upload')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Upload
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-600 text-sm mb-1">Total Records</p>
              <p className="text-gray-900 text-2xl">{summary.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-400">
              <p className="text-gray-600 text-sm mb-1">Matched</p>
              <p className="text-emerald-700 text-2xl">{summary.matched}</p>
              <p className="text-gray-500 text-xs">
                {summary.total > 0 ? ((summary.matched / summary.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
              <p className="text-gray-600 text-sm mb-1">Discrepancies</p>
              <p className="text-amber-700 text-2xl">{summary.discrepancies}</p>
              <p className="text-gray-500 text-xs">Require attention</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-400">
              <p className="text-gray-600 text-sm mb-1">Missing in Platform</p>
              <p className="text-red-700 text-2xl">{summary.missingPlatform}</p>
              <p className="text-gray-500 text-xs">In bank only</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-600 text-sm mb-1">Missing in Bank</p>
              <p className="text-purple-700 text-2xl">{summary.missingBank}</p>
              <p className="text-gray-500 text-xs">In platform only</p>
            </div>
          </div>

          {/* Filters and Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search loan ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="matched">Matched</option>
                  <option value="discrepancy">Discrepancies</option>
                  <option value="missing-platform">Missing in Platform</option>
                  <option value="missing-bank">Missing in Bank</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToExcel}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 text-sm"
                >
                  <Download className="size-3.5" />
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1.5 text-sm"
                >
                  <Download className="size-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm w-12"></th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Loan ID</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Discrepancies</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Notes</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => {
                    const isExpanded = expandedRows.has(result.loanId);
                    const platformLoan = loans.find(l => l.id === result.loanId);
                    const bankRecord = bankRecords.find(b => b.loanId === result.loanId);
                    const client = platformLoan ? clients.find(c => c.id === platformLoan.clientId) : null;

                    return (
                      <>
                        <tr key={result.loanId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {result.discrepancies.length > 0 && (
                              <button
                                onClick={() => toggleRowExpanded(result.loanId)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-900">{result.loanId}</td>
                          <td className="py-3 px-4">
                            {result.status === 'matched' && (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle className="size-4" />
                                Matched
                              </span>
                            )}
                            {result.status === 'discrepancy' && (
                              <span className="flex items-center gap-1 text-amber-700">
                                <AlertTriangle className="size-4" />
                                Discrepancy
                              </span>
                            )}
                            {result.status === 'missing-platform' && (
                              <span className="flex items-center gap-1 text-red-700">
                                <XCircle className="size-4" />
                                Missing in Platform
                              </span>
                            )}
                            {result.status === 'missing-bank' && (
                              <span className="flex items-center gap-1 text-purple-700">
                                <XCircle className="size-4" />
                                Missing in Bank
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {result.discrepancies.length > 0 ? (
                              <span className="text-amber-700">
                                {result.discrepancies.length} field{result.discrepancies.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {result.notes ? (
                              <span className="text-gray-600 text-sm truncate max-w-xs block">
                                {result.notes}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">No notes</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedResult(result);
                                setNoteText(result.notes || '');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Add/Edit Note"
                            >
                              <MessageSquare className="size-4" />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row - Show Discrepancies */}
                        {isExpanded && result.discrepancies.length > 0 && (
                          <tr>
                            <td colSpan={6} className="bg-amber-50 border-b border-gray-100">
                              <div className="p-4">
                                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                                  <AlertTriangle className="size-4 text-amber-600" />
                                  Discrepancy Details
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-2">Field</p>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-2">Platform Value</p>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-2">Bank Value</p>
                                  </div>
                                </div>
                                {result.discrepancies.map((disc, idx) => (
                                  <div key={idx} className="grid grid-cols-3 gap-4 mt-2">
                                    <div className="bg-white p-3 rounded border border-amber-200">
                                      <p className="text-gray-900">{disc.field}</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                      <p className="text-gray-900">
                                        {typeof disc.platformValue === 'number' && disc.field.includes('Amount')
                                          ? `KES ${disc.platformValue.toLocaleString()}`
                                          : disc.platformValue}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                      <p className="text-gray-900">
                                        {typeof disc.bankValue === 'number' && disc.field.includes('Amount')
                                          ? `KES ${disc.bankValue.toLocaleString()}`
                                          : disc.bankValue}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>

              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found</p>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Reconciliation History</h3>
            <p className="text-gray-600 text-sm mb-6">
              View past reconciliation sessions and audit trail
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-gray-600 text-xs">Session ID</th>
                    <th className="text-left py-2 px-3 text-gray-600 text-xs">Date & Time</th>
                    <th className="text-left py-2 px-3 text-gray-600 text-xs">Performed By</th>
                    <th className="text-right py-2 px-3 text-gray-600 text-xs">Records</th>
                    <th className="text-right py-2 px-3 text-gray-600 text-xs">Matched</th>
                    <th className="text-right py-2 px-3 text-gray-600 text-xs">Discrepancies</th>
                    <th className="text-right py-2 px-3 text-gray-600 text-xs">Missing (P)</th>
                    <th className="text-right py-2 px-3 text-gray-600 text-xs">Missing (B)</th>
                    <th className="text-left py-2 px-3 text-gray-600 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationHistory.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-blue-600 text-xs">{session.id}</td>
                      <td className="py-2 px-3 text-gray-900 text-xs">{session.date}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-gray-400" />
                          <span className="text-gray-900 text-xs">{session.performedBy}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-900 text-right text-xs">{session.recordsProcessed}</td>
                      <td className="py-2 px-3 text-emerald-700 text-right text-xs">{session.matched}</td>
                      <td className="py-2 px-3 text-amber-700 text-right text-xs">{session.discrepancies}</td>
                      <td className="py-2 px-3 text-red-700 text-right text-xs">{session.missingInPlatform}</td>
                      <td className="py-2 px-3 text-purple-700 text-right text-xs">{session.missingInBank}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          session.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : session.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {selectedResult && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Add/Edit Note</h3>
                <button
                  onClick={() => {
                    setSelectedResult(null);
                    setNoteText('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Loan ID</label>
                  <input
                    type="text"
                    value={selectedResult.loanId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Note</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reconciliation notes, action items, or comments..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveNote}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResult(null);
                      setNoteText('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}