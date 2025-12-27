import { useState } from 'react';
import { Building2, Wallet, Smartphone, Plus, Edit2, Trash2, Eye, EyeOff, ArrowDownCircle, Calendar, FileText, Search, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { BankAccountModal, BankAccountFormData } from '../modals/BankAccountModal';
import { BankAccount, FundingTransaction } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface BankAccountsSectionProps {
  fundingTransactions?: FundingTransaction[];
  filteredAccounts?: BankAccount[];
  showAddButton?: boolean;
}

export function BankAccountsSection({ fundingTransactions = [], filteredAccounts, showAddButton = true }: BankAccountsSectionProps) {
  const { bankAccounts: allBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useData();
  const currencyCode = getCurrencyCode();
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>(undefined);
  const [showBalances, setShowBalances] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  // Use filtered accounts if provided, otherwise use all accounts
  const bankAccounts = filteredAccounts || allBankAccounts;

  const handleSubmit = (data: BankAccountFormData) => {
    if (editingAccount) {
      updateBankAccount(editingAccount.id, data);
    } else {
      addBankAccount(data);
    }
    setEditingAccount(undefined);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      deleteBankAccount(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(undefined);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Bank': return Building2;
      case 'Cash': return Wallet;
      case 'Mobile Money': return Smartphone;
      default: return Building2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBalance = bankAccounts
    .filter(acc => acc.status === 'Active')
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Get unique sources and payment methods for filters
  const uniqueSources = Array.from(new Set(fundingTransactions.map(t => t.source)));
  const uniquePaymentMethods = Array.from(new Set(fundingTransactions.map(t => t.paymentMethod).filter(Boolean)));

  // Filter transactions
  const filteredTransactions = fundingTransactions
    .filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.shareholderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bankAccounts.find(acc => acc.id === transaction.bankAccountId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = filterSource === 'all' || transaction.source === filterSource;
      const matchesPaymentMethod = filterPaymentMethod === 'all' || transaction.paymentMethod === filterPaymentMethod;
      
      return matchesSearch && matchesSource && matchesPaymentMethod;
    })
    .slice()
    .reverse(); // Show most recent first

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900">Accounts</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your business accounts and mobile money
          </p>
        </div>
        {showAddButton && (
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            Add Account
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#2d5a4a] to-[#1e4435] rounded-lg p-4 text-white border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#e8d1c9] text-sm">Total Balance</span>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="text-emerald-100 hover:text-white transition-colors"
            >
              {showBalances ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
          </div>
          <p className="text-2xl font-bold">
            {showBalances ? `${currencyCode} ${totalBalance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}` : '••••••'}
          </p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="size-4 text-blue-600" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bank Accounts</span>
          </div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {bankAccounts.filter(acc => acc.accountType === 'Bank' && acc.status === 'Active').length}
          </p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="size-4 text-green-600" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cash Accounts</span>
          </div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {bankAccounts.filter(acc => acc.accountType === 'Cash' && acc.status === 'Active').length}
          </p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="size-4 text-purple-600" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mobile Money</span>
          </div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {bankAccounts.filter(acc => acc.accountType === 'Mobile Money' && acc.status === 'Active').length}
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by account, reference, description, or shareholder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ec7347] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-600" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ec7347] focus:border-transparent"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ec7347] focus:border-transparent"
              >
                <option value="all">All Methods</option>
                {uniquePaymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transaction Statement */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownCircle className="size-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-gray-900 mb-1">No Transactions</h4>
            <p className="text-sm text-gray-600">No funding transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Account</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Details</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Funded By</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Source</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Payment Method</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Reference</th>
                  <th className="px-4 py-3 text-right text-xs text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => {
                  const account = bankAccounts.find(acc => acc.id === transaction.bankAccountId);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="size-3.5 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('en-KE', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{account?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {account?.accountType === 'Bank' && (
                            <>
                              <p className="text-gray-900 font-medium">{account.bankName || 'N/A'}</p>
                              <p className="text-xs text-gray-600">
                                {account.accountNumber || 'No account number'}
                                {account.branch && ` • ${account.branch}`}
                              </p>
                            </>
                          )}
                          {account?.accountType === 'Mobile Money' && account.accountNumber && (
                            <p className="text-gray-900">{account.accountNumber}</p>
                          )}
                          {account?.accountType === 'Cash' && (
                            <p className="text-gray-500 text-xs">Physical Cash</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {transaction.shareholderName ? (
                          <div>
                            <p className="text-sm font-medium text-blue-600">{transaction.shareholderName}</p>
                            <p className="text-xs text-gray-500">Shareholder</p>
                          </div>
                        ) : transaction.depositorName ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.depositorName}</p>
                            <p className="text-xs text-gray-500">{transaction.paymentMethod || 'External'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-900">—</p>
                            <p className="text-xs text-gray-500">External</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{transaction.source}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{transaction.paymentMethod || 'N/A'}</p>
                          {transaction.mpesaDetails && (
                            <p className="text-xs text-gray-500">{transaction.mpesaDetails.transactionCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <FileText className="size-3.5 text-gray-400" />
                          <span className="text-gray-900">{transaction.reference}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold ${transaction.transactionType === 'Debit' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {transaction.transactionType === 'Debit' ? '-' : '+'}{transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BankAccountModal
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editAccount={editingAccount}
        />
      )}
    </div>
  );
}