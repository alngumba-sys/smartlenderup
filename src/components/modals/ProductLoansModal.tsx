import React, { useState } from 'react';
import { X, Users, TrendingUp, DollarSign, Calendar, Search, FileText, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductLoansModalProps {
  product: {
    id: string;
    name: string;
    productCode: string;
  };
  onClose: () => void;
}

export function ProductLoansModal({ product, onClose }: ProductLoansModalProps) {
  const { isDark } = useTheme();
  const { loans, clients } = useData();
  const { currentOrganization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get currency symbol based on organization currency
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ZAR': 'R',
      'NGN': '₦',
      'TZS': 'TSh',
      'UGX': 'USh',
      'RWF': 'FRw',
      'ETB': 'Br',
      'GHS': 'GH₵',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'MWK': 'MK'
    };
    return symbols[currency] || currency;
  };

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} 0`;
    }
    
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} ${formatted}`;
  };

  // Filter loans by product
  const productLoans = loans.filter(loan => {
    const loanProductId = loan.productId || loan.product_id || loan.loanProductId || loan.loan_product_id;
    return loanProductId === product.id;
  });

  // Apply status filter first
  const statusFilteredLoans = productLoans.filter(loan => {
    if (statusFilter === 'all') return true;
    const status = (loan.status || '').toLowerCase();
    
    if (statusFilter === 'active') {
      return status === 'active' || status === 'disbursed';
    } else if (statusFilter === 'completed') {
      return status === 'completed' || status === 'paid';
    } else if (statusFilter === 'pending') {
      return status === 'pending';
    } else if (statusFilter === 'defaulted') {
      return status === 'defaulted';
    }
    
    return true;
  });

  // Then apply search filter
  const filteredLoans = statusFilteredLoans.filter(loan => {
    if (!searchTerm) return true;
    
    const client = clients.find(c => c.id === (loan.clientId || loan.client_id));
    const clientName = loan.clientName || client?.name || '';
    const search = searchTerm.toLowerCase();
    
    return (
      loan.loanNumber?.toLowerCase().includes(search) ||
      loan.loan_number?.toLowerCase().includes(search) ||
      clientName.toLowerCase().includes(search) ||
      client?.phone?.toLowerCase().includes(search) ||
      client?.clientNumber?.toLowerCase().includes(search) ||
      client?.client_number?.toLowerCase().includes(search)
    );
  });

  // Get client name helper - prioritize loan.clientName
  const getClientName = (loan: any) => {
    // First try the clientName from the loan object (from Supabase joins)
    if (loan.clientName) return loan.clientName;
    if (loan.client_name) return loan.client_name;
    
    // Fallback to finding the client in the clients array
    const client = clients.find(c => c.id === (loan.clientId || loan.client_id));
    return client?.name || 'Unknown Client';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    
    if (normalizedStatus === 'active' || normalizedStatus === 'approved') {
      return isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700';
    } else if (normalizedStatus === 'disbursed') {
      return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
    } else if (normalizedStatus === 'completed' || normalizedStatus === 'paid') {
      return isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700';
    } else if (normalizedStatus === 'defaulted' || normalizedStatus === 'overdue') {
      return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
    } else if (normalizedStatus === 'pending') {
      return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
    }
    
    return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
  };

  // Calculate summary statistics based on filtered loans (statusFilteredLoans)
  const totalDisbursed = statusFilteredLoans.reduce((sum, loan) => {
    // Only count disbursed loans
    const status = (loan.status || '').toLowerCase();
    if (status === 'disbursed' || status === 'active' || status === 'completed' || status === 'paid' || status === 'defaulted') {
      const amount = loan.principalAmount || loan.principal_amount || loan.amount || 0;
      return sum + amount;
    }
    return sum;
  }, 0);

  const totalOutstanding = statusFilteredLoans.reduce((sum, loan) => {
    // Only count active/disbursed loans with balances
    const status = (loan.status || '').toLowerCase();
    if (status === 'active' || status === 'disbursed') {
      const balance = loan.balance || loan.outstandingBalance || 0;
      return sum + balance;
    }
    return sum;
  }, 0);

  const activeLoans = statusFilteredLoans.filter(loan => {
    const status = (loan.status || '').toLowerCase();
    return status === 'active' || status === 'disbursed';
  }).length;

  // Calculate PAR Rate (Portfolio at Risk)
  // PAR is the percentage of loans that are overdue
  const calculatePARRate = () => {
    const activeLoansWithBalance = statusFilteredLoans.filter(loan => {
      const status = (loan.status || '').toLowerCase();
      return (status === 'active' || status === 'disbursed') && (loan.balance || loan.outstandingBalance || 0) > 0;
    });

    if (activeLoansWithBalance.length === 0) return 0;

    const overdueBalance = activeLoansWithBalance.reduce((sum, loan) => {
      // Check if loan has overdue installments
      const nextPaymentDate = loan.nextPaymentDate || loan.next_payment_date;
      const daysOverdue = loan.daysOverdue || loan.days_overdue || 0;
      
      // Consider overdue if daysOverdue > 0 or if next payment date is in the past
      const isOverdue = daysOverdue > 0 || (nextPaymentDate && new Date(nextPaymentDate) < new Date());
      
      if (isOverdue) {
        const balance = loan.balance || loan.outstandingBalance || 0;
        return sum + balance;
      }
      return sum;
    }, 0);

    const totalActiveBalance = activeLoansWithBalance.reduce((sum, loan) => {
      const balance = loan.balance || loan.outstandingBalance || 0;
      return sum + balance;
    }, 0);

    if (totalActiveBalance === 0) return 0;
    return (overdueBalance / totalActiveBalance) * 100;
  };

  const parRate = calculatePARRate();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between flex-shrink-0`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {product.productCode}
              </span>
            </div>
            <h2
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {product.name} - Loans
            </h2>
            <p
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}
            >
              {filteredLoans.length} loan{filteredLoans.length !== 1 ? 's' : ''} issued
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className={`size-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Loans</p>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeLoans}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className={`size-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Disbursed</p>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalDisbursed)}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={`size-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Outstanding</p>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalOutstanding)}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={`size-4 ${parRate > 5 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>PAR Rate</p>
              </div>
              <p className={`text-2xl font-bold ${parRate > 5 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>
                {parRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar and Filter */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by client name, loan number, phone..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`pl-10 pr-4 py-2.5 rounded-lg border appearance-none cursor-pointer min-w-[160px] ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="all">All Loans</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="defaulted">Defaulted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <FileText
                className={`size-12 mx-auto mb-3 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}
              />
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {searchTerm
                  ? 'No loans found matching your search'
                  : 'No loans issued for this product yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Loan #
                    </th>
                    <th
                      className={`text-left py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Client
                    </th>
                    <th
                      className={`text-right py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Principal
                    </th>
                    <th
                      className={`text-right py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Balance
                    </th>
                    <th
                      className={`text-center py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Term
                    </th>
                    <th
                      className={`text-left py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Disbursed
                    </th>
                    <th
                      className={`text-center py-3 px-3 text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => {
                    const loanNumber = loan.loanNumber || loan.loan_number || 'N/A';
                    const principal = loan.principalAmount || loan.principal_amount || loan.amount || 0;
                    const balance = loan.balance || loan.outstandingBalance || 0;
                    const term = loan.loanTerm || loan.loan_term_months || loan.term || 0;
                    const disbursementDate = loan.disbursementDate || loan.disbursement_date || 'N/A';
                    const status = loan.status || 'pending';
                    
                    return (
                      <tr
                        key={loan.id}
                        className={`border-b ${
                          isDark ? 'border-gray-700/50' : 'border-gray-100'
                        } hover:${
                          isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                        } transition-colors`}
                      >
                        <td
                          className={`py-3 px-3 text-sm font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {loanNumber}
                        </td>
                        <td
                          className={`py-3 px-3 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {getClientName(loan)}
                        </td>
                        <td
                          className={`py-3 px-3 text-sm text-right font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(principal)}
                        </td>
                        <td
                          className={`py-3 px-3 text-sm text-right font-medium ${
                            isDark ? 'text-orange-400' : 'text-orange-600'
                          }`}
                        >
                          {formatCurrency(balance)}
                        </td>
                        <td
                          className={`py-3 px-3 text-sm text-center ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {term} mo
                        </td>
                        <td
                          className={`py-3 px-3 text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {disbursementDate !== 'N/A'
                            ? new Date(disbursementDate).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
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

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-end flex-shrink-0`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}