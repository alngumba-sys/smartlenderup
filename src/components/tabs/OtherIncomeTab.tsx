import { useState } from 'react';
import { Plus, Upload, Eye, Edit, Trash2, X, DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface OtherIncome {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  description: string;
  reference: string;
  recordedBy: string;
  status: 'received' | 'pending' | 'cancelled';
}

export function OtherIncomeTab() {
  const { currentTheme, isDark } = useTheme();
  const [activeView, setActiveView] = useState<'list' | 'add' | 'upload'>('list');
  const [selectedIncome, setSelectedIncome] = useState<OtherIncome | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Dummy data for other income
  const [incomeRecords] = useState<OtherIncome[]>([
    {
      id: 'OI001',
      date: '2025-12-10',
      source: 'Investment Returns',
      category: 'Investment Income',
      amount: 125000,
      description: 'Quarterly returns from treasury bonds',
      reference: 'INV-2025-Q4',
      recordedBy: 'Grace Mwangi',
      status: 'received'
    },
    {
      id: 'OI002',
      date: '2025-12-08',
      source: 'Consulting Services',
      category: 'Service Income',
      amount: 75000,
      description: 'Financial advisory services to SME',
      reference: 'CONS-045',
      recordedBy: 'James Ochieng',
      status: 'received'
    },
    {
      id: 'OI003',
      date: '2025-12-05',
      source: 'Grant Funding',
      category: 'Grant Income',
      amount: 500000,
      description: 'USAID microfinance support grant',
      reference: 'GRANT-2025-12',
      recordedBy: 'Grace Mwangi',
      status: 'received'
    },
    {
      id: 'OI004',
      date: '2025-12-01',
      source: 'Asset Sale',
      category: 'Asset Disposal',
      amount: 85000,
      description: 'Sale of old office equipment',
      reference: 'AS-2025-011',
      recordedBy: 'Peter Kimani',
      status: 'received'
    },
    {
      id: 'OI005',
      date: '2025-11-28',
      source: 'Training Services',
      category: 'Service Income',
      amount: 45000,
      description: 'Financial literacy training workshop',
      reference: 'TRN-112',
      recordedBy: 'James Ochieng',
      status: 'received'
    },
    {
      id: 'OI006',
      date: '2025-11-25',
      source: 'Partnership Income',
      category: 'Partnership',
      amount: 200000,
      description: 'Revenue sharing from M-Pesa partnership',
      reference: 'PART-SAF-11',
      recordedBy: 'Grace Mwangi',
      status: 'received'
    }
  ]);

  const categories = ['Investment Income', 'Service Income', 'Grant Income', 'Asset Disposal', 'Partnership', 'Other'];

  const filteredIncome = filterCategory === 'all' 
    ? incomeRecords 
    : incomeRecords.filter(inc => inc.category === filterCategory);

  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);

  const handleViewDetails = (income: OtherIncome) => {
    setSelectedIncome(income);
    setShowModal(true);
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg border transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Other Income</p>
              <p className="text-2xl mt-1" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }}>
                KES {totalIncome.toLocaleString()}
              </p>
            </div>
            <DollarSign className="size-8" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }} />
          </div>
        </div>

        <div className={`p-6 rounded-lg border transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Records</p>
              <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filteredIncome.length}
              </p>
            </div>
            <FileText className="size-8" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }} />
          </div>
        </div>

        <div className={`p-6 rounded-lg border transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Income</p>
              <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                KES {Math.round(totalIncome / filteredIncome.length).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="size-8" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterCategory === 'all'
                ? 'text-white'
                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={filterCategory === 'all' ? {
              backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary
            } : {}}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterCategory === cat
                  ? 'text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={filterCategory === cat ? {
                backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary
              } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Income Records Table */}
      <div className={`rounded-lg border overflow-hidden transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Source</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reference</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredIncome.map((income) => (
                <tr 
                  key={income.id}
                  onClick={() => handleViewDetails(income)}
                  className={`cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(income.date).toLocaleDateString('en-KE')}
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {income.source}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {income.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    KES {income.amount.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {income.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      income.status === 'received' ? 'bg-green-100 text-green-800' :
                      income.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {income.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(income);
                        }}
                        className={`p-1 rounded hover:bg-opacity-10 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Eye className="size-4" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAddForm = () => (
    <div className={`max-w-2xl mx-auto p-6 rounded-lg border transition-colors ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Other Income</h3>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
            <input
              type="date"
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Income Source</label>
          <input
            type="text"
            placeholder="e.g., Investment Returns, Consulting Services"
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount (KES)</label>
          <input
            type="number"
            placeholder="0.00"
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reference Number</label>
          <input
            type="text"
            placeholder="e.g., INV-2025-Q4"
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea
            rows={3}
            placeholder="Enter income description"
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }}
          >
            Add Income
          </button>
        </div>
      </form>
    </div>
  );

  const renderUploadView = () => (
    <div className={`max-w-2xl mx-auto p-6 rounded-lg border transition-colors ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload Other Income - CSV File</h3>
      
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDark ? 'border-gray-600' : 'border-gray-300'
      }`}>
        <Upload className="size-12 mx-auto mb-4" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }} />
        <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Drop CSV file here or click to browse</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>CSV file should include: Date, Source, Category, Amount, Reference, Description</p>
        <input type="file" accept=".csv" className="hidden" />
      </div>

      <div className="mt-6 space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            <strong>CSV Format:</strong> Ensure your CSV file contains the following columns: Date, Source, Category, Amount, Reference, Description
          </p>
        </div>

        <button
          onClick={() => setActiveView('list')}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Back to List
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={`text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Other Income</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage non-interest income sources
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'list'
                ? 'text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
            style={activeView === 'list' ? {
              backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary
            } : {}}
          >
            <Eye className="size-4" />
            View
          </button>
          <button
            onClick={() => setActiveView('add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'add'
                ? 'text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
            style={activeView === 'add' ? {
              backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary
            } : {}}
          >
            <Plus className="size-4" />
            Add
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'upload'
                ? 'text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
            style={activeView === 'upload' ? {
              backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary
            } : {}}
          >
            <Upload className="size-4" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'list' && renderListView()}
      {activeView === 'add' && renderAddForm()}
      {activeView === 'upload' && renderUploadView()}

      {/* Detail Modal */}
      {showModal && selectedIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Income Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Income ID</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.id}</p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>
                    {new Date(selectedIncome.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Source</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.source}</p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.category}</p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount</label>
                  <p className="text-xl" style={{ color: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }}>
                    KES {selectedIncome.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Reference</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.reference}</p>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedIncome.status === 'received' ? 'bg-green-100 text-green-800' :
                    selectedIncome.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedIncome.status}
                  </span>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Recorded By</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.recordedBy}</p>
                </div>
              </div>

              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedIncome.description}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: isDark ? currentTheme.darkColors.primary : currentTheme.colors.primary }}
                >
                  <Edit className="size-4 inline mr-2" />
                  Edit
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Trash2 className="size-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
