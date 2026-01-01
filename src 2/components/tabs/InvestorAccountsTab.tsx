import { useState } from 'react';
import { Plus, Search, DollarSign, TrendingUp, Users, Briefcase, GitBranch } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { AddInvestorModal } from '../modals/AddInvestorModal';
import { InvestorDetailsModal } from '../modals/InvestorDetailsModal';
import { LoanInvestmentsModal } from '../modals/LoanInvestmentsModal';
import { InvestorTransactionsModal } from '../modals/InvestorTransactionsModal';

interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalInvested: number;
  currentValue: number;
  returns: number;
  roi: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  activeLoanInvestments: number;
  riskProfile: 'Moderate' | 'Conservative' | 'Aggressive';
  idNumber: string;
}

const investorsData: Investor[] = [];

export function InvestorAccountsTab() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddInvestorModal, setShowAddInvestorModal] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
  const [showLoanInvestments, setShowLoanInvestments] = useState(false);
  const [showInvestorTransactions, setShowInvestorTransactions] = useState(false);
  const [activeView, setActiveView] = useState<'accounts' | 'investments' | 'transactions' | 'approvals'>('accounts');

  // Filter investors
  const filteredInvestors = investorsData.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || investor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalInvested = filteredInvestors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const totalReturns = filteredInvestors.reduce((sum, inv) => sum + inv.returns, 0);
  const avgROI = filteredInvestors.reduce((sum, inv) => sum + inv.roi, 0) / (filteredInvestors.length || 1);
  const activeInvestments = filteredInvestors.reduce((sum, inv) => sum + inv.activeLoanInvestments, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800';
      case 'Inactive': return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      case 'Pending': return isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 ${isDark ? 'dark' : ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-900 dark:text-white">Investor Accounts</h2>
          <button
            onClick={() => setShowAddInvestorModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            Add Investor Account
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage investor accounts and track loan investments
        </p>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max justify-center">
          <button
            onClick={() => setActiveView('accounts')}
            className="relative px-4 py-2.5 whitespace-nowrap transition-all text-sm"
          >
            <span className={`transition-colors ${
              activeView === 'accounts'
                ? 'text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
              View All Investor Accounts
            </span>
            {activeView === 'accounts' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('investments');
              setShowLoanInvestments(true);
            }}
            className="relative px-4 py-2.5 whitespace-nowrap transition-all text-sm"
          >
            <span className={`transition-colors ${
              activeView === 'investments'
                ? 'text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
              View All Loan Investments
            </span>
            {activeView === 'investments' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('transactions');
              setShowInvestorTransactions(true);
            }}
            className="relative px-4 py-2.5 whitespace-nowrap transition-all text-sm"
          >
            <span className={`transition-colors ${
              activeView === 'transactions'
                ? 'text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
              View Investor Transactions
            </span>
            {activeView === 'transactions' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveView('approvals')}
            className="relative px-4 py-2.5 whitespace-nowrap transition-all text-sm"
          >
            <span className={`transition-colors ${
              activeView === 'approvals'
                ? 'text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
              Approve Loan Investments
            </span>
            {activeView === 'approvals' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
            <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">KES {totalInvested.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{filteredInvestors.length} investors</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Returns</p>
            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl text-emerald-600 dark:text-emerald-400">KES {totalReturns.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">To date</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average ROI</p>
            <Briefcase className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">{avgROI.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Return on investment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Investments</p>
            <Users className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">{activeInvestments}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loan investments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'accounts' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Investor ID</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Total Invested</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Returns</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">ROI</th>
                <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Investments</th>
                <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvestors.map((investor) => (
                <tr
                  key={investor.id}
                  onClick={() => setSelectedInvestorId(investor.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{investor.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{investor.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{investor.email}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">KES {investor.totalInvested.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-emerald-600 dark:text-emerald-400">KES {investor.returns.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600 dark:text-purple-400">{investor.roi}%</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{investor.activeLoanInvestments}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getStatusColor(investor.status)}`}>
                      {investor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === 'approvals' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <GitBranch className="size-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 dark:text-white mb-2">Loan Investment Approvals</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Review and approve pending loan investment requests from investors
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <GitBranch className="size-4 mr-2" />
            No pending approvals
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddInvestorModal && (
        <AddInvestorModal onClose={() => setShowAddInvestorModal(false)} />
      )}
      {selectedInvestorId && (
        <InvestorDetailsModal
          investorId={selectedInvestorId}
          onClose={() => setSelectedInvestorId(null)}
        />
      )}
      {showLoanInvestments && (
        <LoanInvestmentsModal onClose={() => {
          setShowLoanInvestments(false);
          setActiveView('accounts');
        }} />
      )}
      {showInvestorTransactions && (
        <InvestorTransactionsModal onClose={() => {
          setShowInvestorTransactions(false);
          setActiveView('accounts');
        }} />
      )}
    </div>
  );
}