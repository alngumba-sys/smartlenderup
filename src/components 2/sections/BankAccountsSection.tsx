import { useState, useEffect } from 'react';
import { Building2, Wallet, Smartphone, Plus, Edit2, Trash2, Eye, EyeOff, ArrowDownCircle, Calendar, FileText, Search, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { BankAccountModal, BankAccountFormData } from '../modals/BankAccountModal';
import { BankAccount, FundingTransaction } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

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
  const [selectedAccountTab, setSelectedAccountTab] = useState<string>('all'); // 'all' or account.id

  // Use filtered accounts if provided, otherwise use all accounts
  const bankAccounts = filteredAccounts || allBankAccounts;
  
  // Helper function to check if account is active (case-insensitive)
  const isActiveAccount = (account: BankAccount) => {
    return account.status?.toLowerCase() === 'active';
  };
  
  // Get active accounts
  const activeAccounts = bankAccounts.filter(isActiveAccount);
  
  // 🔍 DEBUG: Log bank accounts on every render
  useEffect(() => {
    console.log('🏦 BankAccountsSection rendered');
    console.log('  Total accounts:', bankAccounts.length);
    console.log('  Active accounts:', activeAccounts.length);
    
    if (bankAccounts.length > 0) {
      console.log('  First account:', bankAccounts[0]);
    }
    
    // Expose to window for debugging
    (window as any).__bankAccountsDebug = {
      allAccounts: bankAccounts,
      active: activeAccounts
    };
  }, [bankAccounts, activeAccounts]);

  const handleSubmit = async (data: BankAccountFormData) => {
    // Check Supabase connection FIRST (only for new accounts)
    if (!editingAccount) {
      const isConnected = await ensureSupabaseConnection('add bank account');
      if (!isConnected) {
        return; // Block the operation if offline
      }
    }

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

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Get unique sources and payment methods for filters
  const uniqueSources = Array.from(new Set(fundingTransactions.map(t => t.source)));
  const uniquePaymentMethods = Array.from(new Set(fundingTransactions.map(t => t.paymentMethod).filter(Boolean)));

  // Filter transactions based on selected account tab
  const filteredTransactions = fundingTransactions
    .filter(transaction => {
      // Filter by selected account tab
      const matchesAccountTab = selectedAccountTab === 'all' || transaction.bankAccountId === selectedAccountTab;
      
      const matchesSearch = searchTerm === '' || 
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.shareholderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bankAccounts.find(acc => acc.id === transaction.bankAccountId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = filterSource === 'all' || transaction.source === filterSource;
      const matchesPaymentMethod = filterPaymentMethod === 'all' || transaction.paymentMethod === filterPaymentMethod;
      
      return matchesAccountTab && matchesSearch && matchesSource && matchesPaymentMethod;
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
        <div className="flex items-center gap-2">
          {/* DEBUG BUTTON */}
          <button
            onClick={() => {
              console.clear();
              console.log('');
              console.log('═════════════════════════════════════════════════════════════');
              console.log('🔍 BANK ACCOUNTS DEBUG REPORT');
              console.log('═════════════════════════════════════════════════════════════');
              console.log('');
              console.log('📊 FILTERED ACCOUNTS (passed as prop):');
              console.log('   Count:', filteredAccounts?.length || 'UNDEFINED/NULL');
              console.log('   Data:', filteredAccounts);
              console.log('');
              console.log('📊 ALL BANK ACCOUNTS (from context):');
              console.log('   Count:', allBankAccounts.length);
              console.log('   Data:', allBankAccounts);
              console.log('');
              console.log('���� CURRENT bankAccounts (used in component):');
              console.log('   Count:', bankAccounts.length);
              console.log('   Data:', bankAccounts);
              console.log('');
              console.log('📊 ACCOUNT STATUS VALUES:');
              bankAccounts.forEach((acc, idx) => {
                console.log(`   [${idx}] ${acc.name}: status="${acc.status}" (type: ${typeof acc.status})`);
              });
              console.log('');
              console.log('📊 ACTIVE ACCOUNTS (status === "Active"):');
              const active = bankAccounts.filter(acc => acc.status === 'Active');
              console.log('   Count:', active.length);
              console.log('   Data:', active);
              console.log('');
              console.log('📊 WINDOW DEBUG (from useEffect):');
              console.log('   Available:', !!(window as any).__bankAccountsDebug);
              console.log('   Data:', (window as any).__bankAccountsDebug);
              console.log('');
              console.log('═════════════════════════════════════════════════════════════');
              
              // Build status report
              const statusReport = bankAccounts.map((acc, idx) => 
                `${idx + 1}. ${acc.name}: status="${acc.status}"`
              ).join('\n');
              
              // Also show a toast
              alert(`DEBUG REPORT:\n\nFiltered Accounts: ${filteredAccounts?.length || 'UNDEFINED'}\nAll Accounts: ${allBankAccounts.length}\nCurrent Accounts: ${bankAccounts.length}\nActive Accounts: ${bankAccounts.filter(acc => acc.status === 'Active').length}\n\n--- STATUS VALUES ---\n${statusReport}\n\nCheck console for full details!`);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-bold border-2 border-purple-400"
          >
            🔍 DEBUG ACCOUNTS
          </button>
          
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
        {/* Account Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-0 px-4 overflow-x-auto">
            {/* All Accounts Tab */}
            <button
              onClick={() => setSelectedAccountTab('all')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedAccountTab === 'all'
                  ? 'border-[#ec7347] text-[#ec7347]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All Accounts
            </button>
            
            {/* Individual Account Tabs */}
            {activeAccounts.map((account) => {
              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountTab(account.id)}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    selectedAccountTab === account.id
                      ? 'border-[#ec7347] text-[#ec7347]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {account.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Account Content */}
        {activeAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="size-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-gray-900 mb-1">No Accounts</h4>
            <p className="text-sm text-gray-600">Click "Add Account" to create your first bank account</p>
          </div>
        ) : (
          <div className="p-4">
            {selectedAccountTab === 'all' ? (
              /* Show all accounts as cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAccounts.map((account) => {
                  const Icon = getAccountIcon(account.accountType);
                  return (
                    <div
                      key={account.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{account.name}</h5>
                            <p className="text-xs text-gray-500">{account.accountType}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(account.status)}`}>
                          {account.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {account.accountType === 'Bank' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Bank:</span>
                              <span className="text-gray-900 font-medium">{account.bankName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Account #:</span>
                              <span className="text-gray-900 font-mono">{account.accountNumber}</span>
                            </div>
                            {account.branch && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Branch:</span>
                                <span className="text-gray-900">{account.branch}</span>
                              </div>
                            )}
                          </>
                        )}
                        {account.accountType === 'Mobile Money' && account.phoneNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-900 font-mono">{account.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600">Balance</span>
                          {showBalances ? (
                            <Eye className="size-3 text-gray-400" />
                          ) : (
                            <EyeOff className="size-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {showBalances 
                            ? `${currencyCode} ${account.balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
                            : '••••••'
                          }
                        </p>
                      </div>
                      
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(account)}
                          className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit2 className="size-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Show selected account details */
              (() => {
                const selectedAccount = activeAccounts.find(acc => acc.id === selectedAccountTab);
                if (!selectedAccount) return null;
                
                const Icon = getAccountIcon(selectedAccount.accountType);
                const accountTransactions = fundingTransactions.filter(t => t.bankAccountId === selectedAccount.id).reverse();
                
                return (
                  <div className="space-y-4">
                    {/* Account Details Card */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Icon className="size-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{selectedAccount.name}</h4>
                            <p className="text-sm text-gray-600">{selectedAccount.accountType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(selectedAccount)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="size-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(selectedAccount.id)}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedAccount.accountType === 'Bank' && (
                          <>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Bank Name</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedAccount.bankName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Account Number</p>
                              <p className="text-sm font-mono text-gray-900">{selectedAccount.accountNumber}</p>
                            </div>
                            {selectedAccount.branch && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Branch</p>
                                <p className="text-sm text-gray-900">{selectedAccount.branch}</p>
                              </div>
                            )}
                          </>
                        )}
                        {selectedAccount.accountType === 'Mobile Money' && selectedAccount.phoneNumber && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                            <p className="text-sm font-mono text-gray-900">{selectedAccount.phoneNumber}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current Balance</p>
                          <p className="text-xl font-bold text-gray-900">
                            {showBalances 
                              ? `${currencyCode} ${selectedAccount.balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
                              : '••••••'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Transactions */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h5 className="font-semibold text-gray-900">Transactions ({accountTransactions.length})</h5>
                      </div>
                      {accountTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="size-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No transactions for this account</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Funded By</th>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Source</th>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Payment Method</th>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Reference</th>
                                <th className="px-4 py-3 text-right text-xs text-gray-600">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {accountTransactions.map((transaction, index) => (
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Transaction Statement */}
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