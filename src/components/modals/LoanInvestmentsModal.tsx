import { X, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoanInvestmentsModalProps {
  onClose: () => void;
}

export function LoanInvestmentsModal({ onClose }: LoanInvestmentsModalProps) {
  const { isDark } = useTheme();

  const investments = [
    { id: 'INV-L-001', investorName: 'Sarah Kimani', loanId: 'LN-00123', clientName: 'Peter Mutua', amount: 500000, returns: 75000, status: 'Active' },
    { id: 'INV-L-002', investorName: 'David Ochieng', loanId: 'LN-00124', clientName: 'James Kamau', amount: 300000, returns: 42000, status: 'Active' },
    { id: 'INV-L-003', investorName: 'Grace Muthoni', loanId: 'LN-00125', clientName: 'James Kamau', amount: 750000, returns: 112500, status: 'Active' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto ${isDark ? 'dark' : ''}`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="size-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl text-gray-900 dark:text-white">All Loan Investments</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="size-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Investment ID</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Investor</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Loan ID</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Client</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">Returns</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{inv.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{inv.investorName}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{inv.loanId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{inv.clientName}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">KES {inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600 dark:text-emerald-400">KES {inv.returns.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
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