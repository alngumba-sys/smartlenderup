import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface InvestorTransactionsModalProps {
  onClose: () => void;
}

export function InvestorTransactionsModal({ onClose }: InvestorTransactionsModalProps) {
  const { isDark } = useTheme();

  const transactions = [
    { id: 'TXN-001', date: '2024-12-15', investor: 'Sarah Kimani', type: 'Investment', amount: 500000, description: 'Investment in Loan LN-00123' },
    { id: 'TXN-002', date: '2024-12-10', investor: 'David Ochieng', type: 'Return', amount: 42000, description: 'ROI from Loan LN-00124' },
    { id: 'TXN-003', date: '2024-12-05', investor: 'Grace Muthoni', type: 'Investment', amount: 750000, description: 'Investment in Loan LN-00125' },
    { id: 'TXN-004', date: '2024-12-01', investor: 'Sarah Kimani', type: 'Return', amount: 75000, description: 'ROI from Loan LN-00120' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto ${isDark ? 'dark' : ''}`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900 dark:text-white">Investor Transactions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="size-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Investor</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Description</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{txn.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{txn.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{txn.investor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {txn.type === 'Investment' ? (
                          <ArrowUpRight className="size-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ArrowDownLeft className="size-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span className={`text-sm ${
                          txn.type === 'Investment' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {txn.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{txn.description}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">KES {txn.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
