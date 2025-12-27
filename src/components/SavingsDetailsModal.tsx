import { X, Wallet, TrendingUp, Calendar, DollarSign, ArrowDownCircle, ArrowUpCircle, User, Phone } from 'lucide-react';
import { clients } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface SavingsDetailsModalProps {
  accountId: string;
  onClose: () => void;
}

interface SavingsAccount {
  id: string;
  clientId: string;
  clientName: string;
  balance: number;
  interestRate: number;
  openDate: string;
  lastTransaction: string;
}

interface SavingsTransaction {
  id: string;
  date: string;
  type: 'Deposit' | 'Withdrawal' | 'Interest';
  amount: number;
  balance: number;
  reference: string;
  method: string;
}

export function SavingsDetailsModal({ accountId, onClose }: SavingsDetailsModalProps) {
  const { isDark } = useTheme();
  // Find the account data
  const accountIndex = parseInt(accountId.split('-')[1]) - 1;
  const client = clients[accountIndex];
  
  if (!client) {
    return null;
  }

  const account: SavingsAccount = {
    id: accountId,
    clientId: client.id,
    clientName: client.name,
    balance: Math.floor(Math.random() * 100000 + 5000),
    interestRate: 5,
    openDate: client.joinDate,
    lastTransaction: '2025-11-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  };

  // Generate sample transactions
  const transactions: SavingsTransaction[] = [
    { id: 'TXN-001', date: '2024-12-08', type: 'Deposit', amount: 5000, balance: account.balance, reference: 'SKJO8H9K2L', method: 'M-Pesa' },
    { id: 'TXN-002', date: '2024-12-05', type: 'Withdrawal', amount: 3000, balance: account.balance - 5000, reference: 'Cash', method: 'Cash' },
    { id: 'TXN-003', date: '2024-12-01', type: 'Interest', amount: 208, balance: account.balance - 2000, reference: 'Monthly Interest', method: 'Auto' },
    { id: 'TXN-004', date: '2024-11-28', type: 'Deposit', amount: 10000, balance: account.balance - 2208, reference: 'TKLO9M3N4P', method: 'M-Pesa' },
    { id: 'TXN-005', date: '2024-11-25', type: 'Deposit', amount: 7500, balance: account.balance - 12208, reference: 'PLMN6K7H8J', method: 'M-Pesa' },
    { id: 'TXN-006', date: '2024-11-20', type: 'Withdrawal', amount: 5000, balance: account.balance - 19708, reference: 'Cash', method: 'Cash' },
    { id: 'TXN-007', date: '2024-11-15', type: 'Deposit', amount: 8000, balance: account.balance - 14708, reference: 'MNOP2Q3R4S', method: 'M-Pesa' },
    { id: 'TXN-008', date: '2024-11-10', type: 'Deposit', amount: 6000, balance: account.balance - 22708, reference: 'QRST5U6V7W', method: 'M-Pesa' },
    { id: 'TXN-009', date: '2024-11-05', type: 'Withdrawal', amount: 4000, balance: account.balance - 28708, reference: 'Cash', method: 'Cash' },
    { id: 'TXN-010', date: '2024-11-01', type: 'Interest', amount: 195, balance: account.balance - 24708, reference: 'Monthly Interest', method: 'Auto' },
  ];

  const totalDeposits = transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);
  const totalInterest = transactions.filter(t => t.type === 'Interest').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className={`rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Sticky Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${isDark ? 'border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50' : 'border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={isDark ? 'text-white mb-1' : 'text-gray-900 mb-1'}>Savings Account Details</h2>
              <div className="flex items-center gap-3 text-sm mt-2">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{account.id}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>|</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{account.clientName}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>|</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Opened: {account.openDate}</span>
              </div>
            </div>
            <button onClick={onClose} className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}>
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <Wallet className="size-5 text-purple-600 dark:text-purple-400" />
                <span className={`text-2xl ${isDark ? 'text-white' : 'text-purple-900'}`}>KES {account.balance.toLocaleString()}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>Current Balance</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <ArrowDownCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span className={`text-xl ${isDark ? 'text-white' : 'text-emerald-900'}`}>KES {totalDeposits.toLocaleString()}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>Total Deposits</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{transactions.filter(t => t.type === 'Deposit').length} transactions</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <ArrowUpCircle className="size-5 text-red-600 dark:text-red-400" />
                <span className={`text-xl ${isDark ? 'text-white' : 'text-red-900'}`}>KES {totalWithdrawals.toLocaleString()}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-900'}`}>Total Withdrawals</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>{transactions.filter(t => t.type === 'Withdrawal').length} transactions</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
                <span className={`text-xl ${isDark ? 'text-white' : 'text-blue-900'}`}>{account.interestRate}%</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Interest Rate</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Earned: KES {totalInterest.toLocaleString()}</p>
            </div>
          </div>

          {/* Client Information */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Holder Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Client Name</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone Number</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Member Since</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{client.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Transaction History</h3>
              <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                New Transaction
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-gray-600' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                    <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                    <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                    <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Balance</th>
                    <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reference</th>
                    <th className={`px-4 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className={`border-t ${isDark ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{txn.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {txn.type === 'Deposit' ? (
                            <ArrowDownCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : txn.type === 'Withdrawal' ? (
                            <ArrowUpCircle className="size-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <DollarSign className="size-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <span className={`${
                            txn.type === 'Deposit' ? (isDark ? 'text-emerald-400' : 'text-emerald-900') :
                            txn.type === 'Withdrawal' ? (isDark ? 'text-red-400' : 'text-red-900') :
                            (isDark ? 'text-blue-400' : 'text-blue-900')
                          }`}>
                            {txn.type}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right ${
                        txn.type === 'Deposit' ? (isDark ? 'text-emerald-400' : 'text-emerald-900') :
                        txn.type === 'Withdrawal' ? (isDark ? 'text-red-400' : 'text-red-900') :
                        (isDark ? 'text-blue-400' : 'text-blue-900')
                      }`}>
                        {txn.type === 'Withdrawal' ? '-' : '+'}KES {txn.amount.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        KES {txn.balance.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{txn.reference}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          txn.method === 'M-Pesa' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          txn.method === 'Cash' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {txn.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex justify-between ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Make Deposit
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Make Withdrawal
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Download Statement
            </button>
          </div>
          <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}