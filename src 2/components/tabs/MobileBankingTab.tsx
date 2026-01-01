import { Smartphone, TrendingUp, AlertCircle, CheckCircle, Clock, Filter, Download, RefreshCw, DollarSign, User, Phone } from 'lucide-react';
import { useState } from 'react';
import { ViewToggle } from '../ViewToggle';

interface MobileTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan_repayment' | 'loan_disbursement';
  mpesaRef: string;
  clientId: string;
  clientName: string;
  phoneNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  timestamp: string;
  relatedLoanId?: string;
  failureReason?: string;
}

export function MobileBankingTab() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  const mobileTransactions: MobileTransaction[] = [];

  const filteredTransactions = mobileTransactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const stats = {
    totalToday: mobileTransactions.filter(t => t.timestamp.startsWith('2024-12-08')).length,
    totalVolume: mobileTransactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0),
    completedRate: (mobileTransactions.filter(t => t.status === 'completed').length / mobileTransactions.length * 100).toFixed(1),
    pendingCount: mobileTransactions.filter(t => t.status === 'pending').length,
    failedCount: mobileTransactions.filter(t => t.status === 'failed').length
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      deposit: 'bg-blue-100 text-blue-800',
      withdrawal: 'bg-amber-100 text-amber-800',
      loan_repayment: 'bg-emerald-100 text-emerald-800',
      loan_disbursement: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      loan_repayment: 'Loan Repayment',
      loan_disbursement: 'Loan Disbursement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      failed: 'bg-red-100 text-red-800',
      reversed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="size-5 text-amber-600" />;
      case 'failed':
      case 'reversed':
        return <AlertCircle className="size-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Mobile Banking (M-Pesa Integration)</h2>
          <p className="text-gray-600">Real-time mobile money transactions and management</p>
        </div>
        <div className="flex gap-2">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
            <RefreshCw className="size-4" />
            Sync M-Pesa
          </button>
          <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm">
            <Download className="size-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-gray-900 text-2xl">{mobileTransactions.length}</p>
            </div>
            <Smartphone className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today</p>
              <p className="text-gray-900 text-2xl">{stats.totalToday}</p>
            </div>
            <TrendingUp className="size-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Volume</p>
              <p className="text-gray-900 text-xl">KES {(stats.totalVolume / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="size-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-900 text-sm">Pending</p>
              <p className="text-amber-900 text-2xl">{stats.pendingCount}</p>
            </div>
            <Clock className="size-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-900 text-sm">Failed</p>
              <p className="text-red-900 text-2xl">{stats.failedCount}</p>
            </div>
            <AlertCircle className="size-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600" />
            <span className="text-gray-700 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="loan_repayment">Loan Repayments</option>
              <option value="loan_disbursement">Loan Disbursements</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Status</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Client</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Type</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">M-Pesa Ref</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Phone</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Timestamp</th>
                  <th className="text-right p-2.5 text-gray-700 text-xs">Amount</th>
                  <th className="text-left p-2.5 text-gray-700 text-xs">Loan ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx.id === selectedTransaction ? null : tx.id)}
                    className={`cursor-pointer transition-colors ${
                      tx.status === 'failed' || tx.status === 'reversed' ? 'bg-red-50 hover:bg-red-100' :
                      tx.status === 'pending' ? 'bg-amber-50 hover:bg-amber-100' :
                      'hover:bg-gray-50'
                    } ${selectedTransaction === tx.id ? 'ring-2 ring-inset ring-emerald-500' : ''}`}
                  >
                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(tx.status)}
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="text-xs text-gray-900">{tx.clientName}</div>
                      <div className="text-xs text-gray-500">{tx.clientId}</div>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${getTypeBadge(tx.type)}`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="p-2.5 text-xs text-gray-900">{tx.mpesaRef}</td>
                    <td className="p-2.5 text-xs text-gray-600">{tx.phoneNumber}</td>
                    <td className="p-2.5 text-xs text-gray-600">{tx.timestamp}</td>
                    <td className={`p-2.5 text-right text-xs ${
                      tx.status === 'completed' ? 'text-emerald-700' :
                      tx.status === 'pending' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      KES {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-xs text-gray-600">{tx.relatedLoanId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx.id === selectedTransaction ? null : tx.id)}
              className={`bg-white rounded-lg border cursor-pointer transition-all ${
                tx.status === 'failed' || tx.status === 'reversed' ? 'border-red-200 bg-red-50' :
                tx.status === 'pending' ? 'border-amber-200 bg-amber-50' :
                'border-gray-200 hover:border-emerald-300'
              } ${selectedTransaction === tx.id ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(tx.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{tx.clientName}</h3>
                          <span className="text-gray-500 text-sm">({tx.clientId})</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(tx.type)}`}>
                            {getTypeLabel(tx.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>M-Pesa Ref: {tx.mpesaRef}</span>
                          <span>{tx.phoneNumber}</span>
                          <span>{tx.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-xl ${
                          tx.status === 'completed' ? 'text-emerald-700' :
                          tx.status === 'pending' ? 'text-amber-700' :
                          'text-red-700'
                        }`}>
                          KES {tx.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {tx.failureReason && (
                      <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
                        <AlertCircle className="size-4" />
                        <span>{tx.failureReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTransaction === tx.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Transaction ID</p>
                        <p className="text-gray-900">{tx.id}</p>
                      </div>
                      {tx.relatedLoanId && (
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Related Loan</p>
                          <p className="text-gray-900">{tx.relatedLoanId}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        View Receipt
                      </button>
                      <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                        View Client
                      </button>
                      {tx.relatedLoanId && (
                        <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                          View Loan
                        </button>
                      )}
                      {tx.status === 'pending' && (
                        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                          Confirm Transaction
                        </button>
                      )}
                      {(tx.status === 'failed' || tx.status === 'reversed') && (
                        <button className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700">
                          Retry Transaction
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Smartphone className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No transactions match your filters</p>
        </div>
      )}
    </div>
  );
}