import { Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle, Smartphone } from 'lucide-react';
import { clients } from '../../data/dummyData';

interface ClientSavingsTabProps {
  clientId: string;
}

export function ClientSavingsTab({ clientId }: ClientSavingsTabProps) {
  const client = clients.find(c => c.id === clientId);

  if (!client) return <div className="p-6">Client not found</div>;

  const savingsAccount = {
    accountNumber: `SAV-${client.id.replace('CL-', '')}`,
    balance: 25000,
    interestRate: 5.0,
    openDate: client.joinDate,
    lastTransaction: '2025-11-28'
  };

  const transactions = [
    { id: 'TXN-001', date: '2025-11-28', type: 'Deposit', amount: 5000, method: 'M-Pesa', balance: 25000, transactionId: 'P8YU45TRE' },
    { id: 'TXN-002', date: '2025-11-15', type: 'Deposit', amount: 3000, method: 'M-Pesa', balance: 20000, transactionId: 'P7HG34WQA' },
    { id: 'TXN-003', date: '2025-11-01', type: 'Interest', amount: 85, method: 'Auto', balance: 17000, transactionId: 'INT-NOV25' },
    { id: 'TXN-004', date: '2025-10-28', type: 'Deposit', amount: 4000, method: 'M-Pesa', balance: 16915, transactionId: 'P9KL56MNB' },
    { id: 'TXN-005', date: '2025-10-20', type: 'Withdrawal', amount: -2000, method: 'Bank Transfer', balance: 12915, transactionId: 'W5RT89PLK' },
    { id: 'TXN-006', date: '2025-10-10', type: 'Deposit', amount: 5000, method: 'M-Pesa', balance: 14915, transactionId: 'P4DF67GHJ' },
    { id: 'TXN-007', date: '2025-10-01', type: 'Interest', amount: 75, method: 'Auto', balance: 9915, transactionId: 'INT-OCT25' },
    { id: 'TXN-008', date: '2025-09-25', type: 'Deposit', amount: 3500, method: 'M-Pesa', balance: 9840, transactionId: 'P2QW89YUI' },
  ];

  // Calculate interest earned
  const interestEarned = transactions
    .filter(t => t.type === 'Interest')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">My Savings</h2>
        <p className="text-gray-600">Manage your savings account and transactions</p>
      </div>

      {/* Savings Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 md:p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="size-8" />
          <div>
            <p className="text-purple-100 text-sm">Savings Account</p>
            <p className="text-white text-xl">{savingsAccount.accountNumber}</p>
          </div>
        </div>
        <div className="mb-2">
          <p className="text-purple-100 text-sm">Total Balance</p>
          <p className="text-white text-4xl">KES {savingsAccount.balance.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 text-purple-100">
          <TrendingUp className="size-4" />
          <span className="text-sm">Interest Rate: {savingsAccount.interestRate}% per annum</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Interest Earned (YTD)</p>
              <p className="text-gray-900 text-2xl mt-1">KES {interestEarned.toLocaleString()}</p>
            </div>
            <TrendingUp className="size-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Account Open Since</p>
              <p className="text-gray-900 text-xl mt-1">{savingsAccount.openDate}</p>
            </div>
            <Wallet className="size-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Last Transaction</p>
              <p className="text-gray-900 text-xl mt-1">{savingsAccount.lastTransaction}</p>
            </div>
            <ArrowUpCircle className="size-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Deposit Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Smartphone className="size-5 text-emerald-600" />
            <h3 className="text-gray-900">How to Deposit via M-Pesa</h3>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-2 text-sm text-gray-700">
          <p>1. Go to M-Pesa menu on your phone</p>
          <p>2. Select Lipa na M-Pesa, then Paybill</p>
          <p>3. Enter Business Number: <strong className="text-emerald-700">400200</strong></p>
          <p>4. Enter Account Number: <strong className="text-emerald-700">{savingsAccount.accountNumber}</strong></p>
          <p>5. Enter the amount you want to deposit</p>
          <p>6. Enter your M-Pesa PIN and confirm</p>
          <p className="pt-2 text-emerald-700">Your savings will be updated within minutes!</p>
        </div>
      </div>

      {/* Withdrawal Request */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-gray-900">Request Withdrawal</h3>
        </div>
        <div className="p-4 md:p-6">
          <p className="text-gray-600 text-sm mb-4">
            To withdraw from your savings account, please submit a request. Withdrawals are processed within 1 business day.
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Withdrawal Amount (KES)</label>
              <input
                type="number"
                max={savingsAccount.balance}
                placeholder="Enter amount..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-gray-600 text-xs mt-1">
                Available balance: KES {savingsAccount.balance.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Withdrawal Method</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select method...</option>
                <option value="mpesa">M-Pesa to {client.phone}</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash Pickup at Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Reason for Withdrawal</label>
              <textarea
                rows={2}
                placeholder="Optional..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <ArrowDownCircle className="size-5" />
              Submit Withdrawal Request
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-gray-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-gray-700">Type</th>
                <th className="px-4 py-3 text-right text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-gray-700">Method</th>
                <th className="px-4 py-3 text-left text-gray-700">Transaction ID</th>
                <th className="px-4 py-3 text-right text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{txn.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {txn.type === 'Deposit' && <ArrowUpCircle className="size-4 text-emerald-600" />}
                      {txn.type === 'Withdrawal' && <ArrowDownCircle className="size-4 text-red-600" />}
                      {txn.type === 'Interest' && <TrendingUp className="size-4 text-blue-600" />}
                      <span className={`${
                        txn.type === 'Deposit' ? 'text-emerald-700' :
                        txn.type === 'Withdrawal' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right ${
                    txn.amount > 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{txn.method}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">{txn.transactionId}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{txn.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interest Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-blue-900 mb-2">Interest Calculation</h4>
        <p className="text-blue-800 text-sm mb-3">
          Your savings earn {savingsAccount.interestRate}% interest per year, calculated and credited monthly on your account balance.
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Annual Interest Rate:</span>
            <span className="text-blue-900">{savingsAccount.interestRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Monthly Interest Rate:</span>
            <span className="text-blue-900">{(savingsAccount.interestRate / 12).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Estimated Monthly Earnings:</span>
            <span className="text-blue-900">
              KES {Math.round(savingsAccount.balance * (savingsAccount.interestRate / 100 / 12)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
