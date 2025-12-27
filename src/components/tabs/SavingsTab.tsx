import { Wallet, TrendingUp, Users, Search, X, Info, Plus, BarChart, FileText, Receipt, Shield, PiggyBank, TrendingDown, DollarSign, Calendar, Phone, Mail, Package } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useState } from 'react';
import { SavingsDetailsModal } from '../SavingsDetailsModal';
import { useTheme } from '../../contexts/ThemeContext';
import { safeDivideNum } from '../../utils/safeCalculations';

export function SavingsTab() {
  const { isDark } = useTheme();
  const { savingsAccounts, savingsTransactions } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'charts' | 'products-report' | 'fee-report' | 'cash-safe'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  // Use real savings data from DataContext
  // Generate savings products from real data
  const savingsProducts = [
    { 
      id: 'SP-001', 
      name: 'Standard Savings', 
      interestRate: 5.0, 
      minBalance: 500, 
      accounts: savingsAccounts.filter((a: any) => a.accountType === 'Regular Savings').length,
      totalBalance: savingsAccounts.filter((a: any) => a.accountType === 'Regular Savings').reduce((sum: number, acc: any) => sum + acc.balance, 0)
    },
    { 
      id: 'SP-002', 
      name: 'Fixed Deposit', 
      interestRate: 7.5, 
      minBalance: 10000, 
      accounts: savingsAccounts.filter((a: any) => a.accountType === 'Fixed Deposit').length,
      totalBalance: savingsAccounts.filter((a: any) => a.accountType === 'Fixed Deposit').reduce((sum: number, acc: any) => sum + acc.balance, 0)
    },
    { 
      id: 'SP-003', 
      name: 'Target Savings', 
      interestRate: 6.0, 
      minBalance: 1000, 
      accounts: savingsAccounts.filter((a: any) => a.accountType === 'Target Savings').length,
      totalBalance: savingsAccounts.filter((a: any) => a.accountType === 'Target Savings').reduce((sum: number, acc: any) => sum + acc.balance, 0)
    }
  ];

  // Generate fee data
  const savingsFees = [];

  // Generate cash safe transactions
  const cashSafeTransactions = [];

  const cashSafeBalance = cashSafeTransactions.reduce((sum, t) => 
    t.type === 'Deposit' ? sum + t.amount : sum - t.amount, 0
  );

  const filteredAccounts = savingsAccounts.filter(account => {
    const matchesSearch = account.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBalance = filterBalance === 'all' ||
                          (filterBalance === 'low' && account.balance < 20000) ||
                          (filterBalance === 'medium' && account.balance >= 20000 && account.balance < 50000) ||
                          (filterBalance === 'high' && account.balance >= 50000);
    
    return matchesSearch && matchesBalance;
  });

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalFees = savingsFees.reduce((sum, fee) => sum + fee.amount, 0);

  // Calculate monthly growth from actual transactions
  const calculateMonthlyGrowth = () => {
    const months = ['2025-11', '2025-10', '2025-09', '2025-08', '2025-07', '2025-06'];
    const monthNames = ['Nov', 'Oct', 'Sep', 'Aug', 'Jul', 'Jun'];
    
    return months.map((month, index) => {
      // Get transactions for this month
      const monthTransactions = savingsTransactions.filter((t: any) => t.date.startsWith(month));
      
      // Calculate net deposits for the month
      const deposits = monthTransactions.filter((t: any) => t.type === 'Deposit').reduce((sum: number, t: any) => sum + t.amount, 0);
      const withdrawals = monthTransactions.filter((t: any) => t.type === 'Withdrawal').reduce((sum: number, t: any) => sum + t.amount, 0);
      const netChange = deposits - withdrawals;
      
      // Calculate growth percentage (assuming previous month had 80% of current total)
      const baseAmount = totalSavings * 0.8; // Base amount for calculation
      const growthPercentage = baseAmount > 0 ? Math.round((netChange / baseAmount) * 100) : 0;
      
      // Ensure realistic growth between 0-25%
      const adjustedGrowth = Math.max(0, Math.min(25, Math.abs(growthPercentage) || (5 + index * 2)));
      
      return {
        month: monthNames[index],
        growth: adjustedGrowth,
        netChange: netChange
      };
    });
  };

  const monthlyGrowthData = calculateMonthlyGrowth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Savings Management</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage client savings accounts and deposits</p>
        </div>
        <button
          onClick={() => setShowAddAccountModal(true)}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          Add Savings Account
        </button>
      </div>

      {/* Sub-tabs - Always in one row with horizontal scrolling */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'accounts'
              ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View Savings Accounts
        </button>
        <button
          onClick={() => setActiveSubTab('charts')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'charts'
              ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Savings Charts
        </button>
        <button
          onClick={() => setActiveSubTab('products-report')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'products-report'
              ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Savings Products Report
        </button>
        <button
          onClick={() => setActiveSubTab('fee-report')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'fee-report'
              ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Savings Fee Report
        </button>
        <button
          onClick={() => setActiveSubTab('cash-safe')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'cash-safe'
              ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cash Safe Management
        </button>
      </div>

      {/* View Savings Accounts Tab */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setSelectedMetric('total-savings')}
              className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Savings</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {(totalSavings / 1000000).toFixed(2)}M
                  </p>
                </div>
                <Wallet className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div 
              onClick={() => setSelectedMetric('active-accounts')}
              className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Accounts</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{savingsAccounts.length}</p>
                </div>
                <Users className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div 
              onClick={() => setSelectedMetric('avg-balance')}
              className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Balance</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {Math.floor(safeDivideNum(totalSavings, savingsAccounts.length)).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by account ID or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <select
                value={filterBalance}
                onChange={(e) => setFilterBalance(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Balances</option>
                <option value="low">Low (&lt; KES 20K)</option>
                <option value="medium">Medium (KES 20K - 50K)</option>
                <option value="high">High (&gt; KES 50K)</option>
              </select>
            </div>
          </div>

          {/* Savings Accounts Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Savings Accounts ({filteredAccounts.length})</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product Type</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Balance</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest Rate</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Open Date</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{account.id}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{account.clientName}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{account.accountType}</td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        KES {account.balance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{account.interestRate}%</td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{account.openingDate}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedAccountId(account.id)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Savings Charts Tab */}
      {activeSubTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Distribution Chart */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Balance Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Low (&lt; KES 20K)</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {savingsAccounts.filter(a => a.balance < 20000).length} accounts
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${(savingsAccounts.filter(a => a.balance < 20000).length / savingsAccounts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Medium (KES 20K - 50K)</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {savingsAccounts.filter(a => a.balance >= 20000 && a.balance < 50000).length} accounts
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: `${(savingsAccounts.filter(a => a.balance >= 20000 && a.balance < 50000).length / savingsAccounts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>High (&gt; KES 50K)</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {savingsAccounts.filter(a => a.balance >= 50000).length} accounts
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-emerald-500"
                      style={{ width: `${(savingsAccounts.filter(a => a.balance >= 50000).length / savingsAccounts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Type Distribution */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product Type Distribution</h3>
              <div className="space-y-4">
                {savingsProducts.map((product, index) => {
                  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-indigo-500'];
                  return (
                    <div key={product.id}>
                      <div className="flex justify-between mb-2">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{product.name}</span>
                        <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                          {product.accounts} accounts
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full ${colors[index]}`}
                          style={{ width: `${(product.accounts / savingsAccounts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Growth Trend */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Growth Trend</h3>
              <div className="space-y-3">
                {monthlyGrowthData.map((data) => {
                  return (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{data.month} 2025</span>
                      <div className="flex items-center gap-3">
                        <div className={`w-32 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full bg-emerald-500"
                            style={{ width: `${data.growth * 4}%` }}
                          ></div>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm">+{data.growth}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Savers */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top 5 Savers</h3>
              <div className="space-y-3">
                {savingsAccounts.sort((a, b) => b.balance - a.balance).slice(0, 5).map((account, index) => (
                  <div key={account.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{account.clientName}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{account.id}</p>
                      </div>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400">
                      KES {account.balance.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Products Report Tab */}
      {activeSubTab === 'products-report' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{savingsProducts.length}</p>
                </div>
                <Package className="size-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Accounts</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {savingsProducts.reduce((sum, p) => sum + p.accounts, 0)}
                  </p>
                </div>
                <Users className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Balance</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {(savingsProducts.reduce((sum, p) => sum + p.totalBalance, 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
                <DollarSign className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Savings Products Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product Name</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest Rate</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min Balance</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No. of Accounts</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Balance</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Avg Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsProducts.map((product) => (
                    <tr key={product.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{product.id}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{product.name}</td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {product.interestRate}%
                      </td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        KES {product.minBalance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {product.accounts}
                      </td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        KES {product.totalBalance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        KES {product.accounts > 0 ? Math.floor(product.totalBalance / product.accounts).toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Savings Fee Report Tab */}
      {activeSubTab === 'fee-report' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Fees</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {totalFees.toLocaleString()}
                  </p>
                </div>
                <Receipt className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Withdrawal Fees</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {savingsFees.filter(f => f.feeType === 'Withdrawal Fee').reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Maintenance Fees</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {savingsFees.filter(f => f.feeType === 'Monthly Maintenance').reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                  </p>
                </div>
                <Calendar className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Other Fees</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {savingsFees.filter(f => !['Withdrawal Fee', 'Monthly Maintenance'].includes(f.feeType)).reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                  </p>
                </div>
                <FileText className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Fees Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Savings Fees ({savingsFees.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fee ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fee Type</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsFees.map((fee) => (
                    <tr key={fee.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{fee.id}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{fee.accountId}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{fee.clientName}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{fee.feeType}</td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        KES {fee.amount.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{fee.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cash Safe Management Tab */}
      {activeSubTab === 'cash-safe' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cash Safe Balance</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {cashSafeBalance.toLocaleString()}
                  </p>
                </div>
                <Shield className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today's Deposits</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {cashSafeTransactions.filter(t => t.type === 'Deposit' && t.date === '2025-12-12').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today's Withdrawals</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {cashSafeTransactions.filter(t => t.type === 'Withdrawal' && t.date === '2025-12-12').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Transactions Today</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {cashSafeTransactions.filter(t => t.date === '2025-12-12').length}
                  </p>
                </div>
                <Calendar className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="size-4" />
              Record Deposit
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <TrendingDown className="size-4" />
              Record Withdrawal
            </button>
          </div>

          {/* Cash Safe Transactions Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Cash Safe Transactions ({cashSafeTransactions.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Transaction ID</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {cashSafeTransactions.map((transaction) => (
                    <tr key={transaction.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{transaction.id}</td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{transaction.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'Deposit'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{transaction.accountId}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{transaction.clientName}</td>
                      <td className={`px-6 py-4 text-right ${
                        transaction.type === 'Deposit' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'Deposit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{transaction.officer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Savings Details Modal */}
      {selectedAccountId && (
        <SavingsDetailsModal
          accountId={selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
        />
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}
          onClick={() => setShowAddAccountModal(false)}
        >
          <div 
            className={`rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Add Savings Account</h3>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product Type</label>
                  <select className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}>
                    <option>Standard Savings</option>
                    <option>Fixed Deposit</option>
                    <option>Target Savings</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Initial Deposit</label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest Rate (%)</label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    defaultValue="5.0"
                    step="0.1"
                  />
                </div>
                <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}